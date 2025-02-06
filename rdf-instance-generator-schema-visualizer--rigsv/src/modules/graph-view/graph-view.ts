import * as vscode from "vscode";

import {getRDFContent} from "../rdf-rw/rdf-rw";



export const sendRDFContent = async () => {
  let rdf  = await getRDFContent();

  console.log(rdf)
  if(rdf && rdf.mime) {
    const file = new File([rdf.content], rdf.fileName, { type: rdf.mime });

  const formData = new FormData();
  formData.append("fileUpload", file);

  const response = await fetch("http://localhost:8000/", {
      method: "POST",
      body: formData
  });

  const result = await response.text();
  return result;

}else{
  //TODO: handle this better
  return "No RDF content found";
}

};


async function getWebviewContent(webview: vscode.Webview, url: string): Promise<string> {
  try {

    let rawHtml = await sendRDFContent();

    // Define absolute URLs for the backend-served scripts.
    const visualizerScriptUrl = "http://localhost:8000/visualizer/visualizer.js";
    const uploaderScriptUrl = "http://localhost:8000/uploader/uploader.js";

    // Replace script src attributes for your backend files with the absolute URLs.
    rawHtml = rawHtml.replace(
      /src=["']\/?visualizer\/visualizer\.js["']/g,
      `src="${visualizerScriptUrl}"`
    );
    rawHtml = rawHtml.replace(
      /src=["']\/?uploader\/uploader\.js["']/g,
      `src="${uploaderScriptUrl}"`
    );

    // Update the CSP to allow scripts, styles, fonts, and connections from:
    // - Your WebView’s own source
    // - The CDN (https://unpkg.com)
    // - Your backend (http://localhost:8000)
    const csp = `
      default-src 'none';
      img-src ${webview.cspSource} http:;
      script-src ${webview.cspSource} 'unsafe-inline' 'unsafe-eval' https://unpkg.com http://localhost:8000;
      style-src ${webview.cspSource} 'unsafe-inline' https://unpkg.com http://localhost:8000;
      font-src ${webview.cspSource} https://unpkg.com http://localhost:8000;
      connect-src ${webview.cspSource} https://unpkg.com http://localhost:8000;
    `.replace(/\n/g, ''); // Remove newlines to ensure a valid meta tag.

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>RDF Visualizer Demo</title>
        <meta http-equiv="Content-Security-Policy" content="${csp}">
      </head>
      <body>
        ${rawHtml}
      </body>
      </html>
    `;
  } catch (error) {
    console.error("Error fetching HTML:", error);
    return `<h1>Error loading content</h1><p>${error}</p>`;
  }
}

export function openWebView(context: vscode.ExtensionContext) {
  const runGraph = vscode.commands.registerCommand("extension.runGraph", async () => {
    vscode.window.showInformationMessage("Graph is loaded");

    let panel = vscode.window.createWebviewPanel(
      "rdfVisualizer",
      "RDF Visualizer",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );
    const endpointUrl = "http://localhost:8000/";
    const htmlContent = await getWebviewContent(panel.webview, endpointUrl);
    panel.webview.html = htmlContent;
  });

  context.subscriptions.push(runGraph);
}
