import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getRDFContent } from "../rdf-interpreter/rdf-interpreter";
import forceAtlas2 from 'graphology-layout-forceatlas2';

const getWebviewContent = (
  webview: vscode.Webview,
  context: vscode.ExtensionContext
): string => {
  // Path to the HTML file
  const htmlPath = path.join(
    context.extensionPath,
    "src",
    "modules",
    "graph-view",
    "graph.html"
  );

  // Read the HTML content
  let htmlContent = fs.readFileSync(htmlPath, "utf8");

  // Replace resource paths (e.g., for scripts, styles)
  htmlContent = htmlContent.replace(/src="([^"]+)"/g, (match, src) => {
    const resourcePath = vscode.Uri.file(
      path.join(context.extensionPath, "src", "modules", "graph-view", src)
    );
    const resourceUri = webview.asWebviewUri(resourcePath);
    return `src="${resourceUri}"`;
  });

  return htmlContent;
};

export function openWebView(context: vscode.ExtensionContext) {
  const runGraph = vscode.commands.registerCommand(
    "extension.runGraph",
    async () => {
      vscode.window.showInformationMessage("Graph is loaded");

      let panel = vscode.window.createWebviewPanel(
        "placeholderRDFFileName",
        "placeholderRDFFileName",
        {
          preserveFocus: true,
          viewColumn: vscode.ViewColumn.Beside,
        },
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.file(
              path.join(context.extensionPath, "src", "modules", "graph-view")
            ),
          ],
        }
      );

      panel.webview.html = getWebviewContent(panel.webview, context);
      
      panel.webview.onDidReceiveMessage(async (message) => {
        try {
          if (message.command === "webviewReady") {
            const rdfContent = await getRDFContent();
            if (rdfContent) {
              panel.webview.postMessage({
                command: "setRDFContent",
                content: {rdfContent: rdfContent, forceAtlas2: forceAtlas2},
              });
            } else {
              vscode.window.showErrorMessage("No RDF content found");
            }
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Error loading RDF content: ${error}`);
        }
      });
    }
  );

  context.subscriptions.push(runGraph);
}
