import * as vscode from "vscode";
import { envConfig } from "../../utils/envConfig";
import { getRDFContent, editRDF } from "../rdf-rw/rdf-rw";
import { runInThisContext } from "vm";
import { console } from "inspector";

let rdfDataForEditig = "";

const spinner = `<!-- From Uiverse.io by adamgiebl --> 
    <style> 

    /* From Uiverse.io by adamgiebl */ 
.spinner {
  width: 80px;
  height: 80px;
  --clr: rgb(127, 207, 255);
  --clr-alpha: rgb(127, 207, 255, .1);
  animation: spinner 2s infinite linear;
  transform-style: preserve-3d;
}

.spinner > div {
  background-color: var(--clr-alpha);
  height: 100%;
  position: absolute;
  width: 100%;
  border: 5px solid var(--clr);
}

.spinner div:nth-of-type(1) {
  transform: translateZ(-40px) rotateY(180deg);
}

.spinner div:nth-of-type(2) {
  transform: rotateY(-270deg) translateX(50%);
  transform-origin: top right;
}

.spinner div:nth-of-type(3) {
  transform: rotateY(270deg) translateX(-50%);
  transform-origin: center left;
}

.spinner div:nth-of-type(4) {
  transform: rotateX(90deg) translateY(-50%);
  transform-origin: top center;
}

.spinner div:nth-of-type(5) {
  transform: rotateX(-90deg) translateY(50%);
  transform-origin: bottom center;
}

.spinner div:nth-of-type(6) {
  transform: translateZ(40px);
}

@keyframes spinner {
  0% {
    transform: rotate(0deg) rotateX(0deg) rotateY(0deg);
  }

  50% {
    transform: rotate(180deg) rotateX(180deg) rotateY(180deg);
  }

  100% {
    transform: rotate(360deg) rotateX(360deg) rotateY(360deg);
  }
}
    
    </style>
<div class="spinner">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>
`;
export const sendRDFContent = async (
  edit: boolean = false,
  searchProperty: boolean = false,
  nOfInstances: number = 0
) => {
  let rdf = await getRDFContent();

  if (rdf && rdf.mime) {
    const file = new File([rdf.content], rdf.fileName, { type: rdf.mime });

    const formData = new FormData();
    formData.append("fileUpload", file);

    const response = await fetch(
      `${envConfig.serviceEndpoint}?edit=${edit}&property_search=${searchProperty}&n=${nOfInstances}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const res = await response.json();
    rdfDataForEditig = res.rdfData;
    return res.content;
  } else {
    //TODO: handle this better
    return "No RDF content found";
  }
};

async function getWebviewContent(
  webview: vscode.Webview,
  url: string,
  edit: boolean = false,
  nOfInstances: number = 0,
  searchProperty: boolean = false
): Promise<string> {
  try {
    let rawHtml = await sendRDFContent(edit, searchProperty, nOfInstances);
    console.log(edit, searchProperty);
    // Define absolute URLs for the backend-served scripts.
    const visualizerScriptUrl = `${envConfig.serviceEndpoint}/visualizer/visualizer.js`;
    const uploaderScriptUrl = `${envConfig.serviceEndpoint}/uploader/uploader.js`;

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
  frame-src blob:;
  img-src ${webview.cspSource} data: http: blob:;
  script-src ${webview.cspSource} 'unsafe-inline' 'unsafe-eval' https://unpkg.com ${envConfig.serviceEndpoint};
  style-src ${webview.cspSource} 'unsafe-inline' ${envConfig.serviceEndpoint};
  font-src ${webview.cspSource} https://unpkg.com ${envConfig.serviceEndpoint};
  connect-src ${webview.cspSource} https://unpkg.com ${envConfig.serviceEndpoint};
`.replace(/\n/g, "");


    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>RDF Visualizer Demo</title>
        <meta http-equiv="Content-Security-Policy" content="${csp}">
      </head>
        <body>
          </br>
          <button id="editButton">Edit</button>
          <button id="exportGraph">Export graph</button>
          ${rawHtml}
          <script>
            const vscode = acquireVsCodeApi();
            document.addEventListener("DOMContentLoaded", function () {

              document.getElementById("editButton").addEventListener("click", async () => {
                vscode.postMessage({ command: "editRDF" });
              });

              document.getElementById("exportGraph").addEventListener("click", async () => {
                function findCanvasElement() {
                  const elements = document.querySelectorAll("*");
                  for (const el of elements) {
                    if (el.shadowRoot) {
                      const canvas = el.shadowRoot.querySelector("canvas");
                      if (canvas) return canvas;
                    }
                  }
                  return null;
                }

                const canvas = findCanvasElement();
                if (!canvas) {
                  console.error("Canvas not found");
                  return;
                }


                const imgData = canvas.toDataURL("image/png");

                
                vscode.postMessage({
                  command: "exportGraph",
                  imgData: imgData
                });
              });
            });
          </script>



        </body>
      </html>
    `;
  } catch (error) {
    console.error("Error fetching HTML:", error);
    return `<h1>Error loading content</h1><p>${error}</p>`;
  }
}

async function inputBox(n: number) {
  // TODO: continue from here
  let numberOfInstances = await vscode.window.showInputBox({
    placeHolder: `${n}`,
    prompt: "Enter the number of instances you want to generate",
  });
  if (numberOfInstances === undefined) {
    vscode.window.showErrorMessage("No number of instances provided");
    return;
  } else if (parseInt(numberOfInstances) > n) {
    vscode.window.showErrorMessage(
      `number is too big. select a value between 1 and ${n}`
    );
    return inputBox(n);
  }

  return parseInt(numberOfInstances);
}


function exportGraph(panel :any ){
  panel.webview.onDidReceiveMessage(async (message: any) => {
    if (message.command === "exportGraph" && message.imgData) {
      // Show a Save dialog.
      const uri = await vscode.window.showSaveDialog({
        saveLabel: "Save Image",
        filters: { "Image Files": ["png"] },
      });
      if (!uri) {
        vscode.window.showWarningMessage("Save cancelled");
        return;
      }
      
      // Remove the prefix from the data URL and decode the base64 string.
      const base64Data = message.imgData.replace(/^data:image\/png;base64,/, "");
      // Buffer.from returns a Buffer which is a Uint8Array.
      const fileData = Buffer.from(base64Data, "base64");
      
      try {
        await vscode.workspace.fs.writeFile(uri, fileData);
        vscode.window.showInformationMessage("Image saved successfully!");
      } catch (error) {
        vscode.window.showErrorMessage("Error saving file: " + error);
      }
    }
  });
}

export function openWebView(context: vscode.ExtensionContext) {
  const viewGraph = vscode.commands.registerCommand(
    "extension.viewGraph",
    async () => {
      vscode.window.showInformationMessage("Graph view is loaded");

      let panel = vscode.window.createWebviewPanel(
        "rdfVisualizer",
        "RDF Visualizer",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: false,
        }
      );

      if (envConfig.serviceEndpoint) {
        const htmlContent = await getWebviewContent(
          panel.webview,
          envConfig.serviceEndpoint,
          true
        );
        panel.webview.html = htmlContent;
      }

      panel.webview.onDidReceiveMessage(
        async (message) => {
          if (message.command === "editRDF") {
            vscode.commands.executeCommand("extension.editRDF");
          }
        },
        undefined,
        context.subscriptions
      );
      exportGraph(panel)
    }
  );
  const runGraph = vscode.commands.registerCommand(
    "extension.runGraph",
    async () => {
      let nOfInstances = await inputBox(10);
      if (!nOfInstances) return;
      vscode.window.showInformationMessage("Graph is loaded");

      let panel = vscode.window.createWebviewPanel(
        "rdfGeneratorVisualizer",
        "RDF Generator Visualizer",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: false,
        }
      );

      if (envConfig.serviceEndpoint) {
        const htmlContent = await getWebviewContent(
          panel.webview,
          envConfig.serviceEndpoint,
          false,
          nOfInstances
        );
        panel.webview.html = htmlContent;
      }

      panel.webview.onDidReceiveMessage(
        async (message) => {
          if (message.command === "editRDF") {
            vscode.commands.executeCommand("extension.editRDF");
          }
        },
        undefined,
        context.subscriptions
      );

      exportGraph(panel)

    }
  );

  const searchProperty = vscode.commands.registerCommand(
    "extension.searchProperty",
    async () => {
      let nOfInstances = await inputBox(3);
      if (!nOfInstances) return;
      vscode.window.showInformationMessage("Graph is loaded");

      let panel = vscode.window.createWebviewPanel(
        "rdfGeneratorVisualizer",
        "RDF Generator Visualizer",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: false,
        }
      );

      if (envConfig.serviceEndpoint) {
        panel.webview.html = spinner;
        const htmlContent = await getWebviewContent(
          panel.webview,
          envConfig.serviceEndpoint,
          false,
          nOfInstances,
          true
        );
        panel.webview.html = htmlContent;
      }

      panel.webview.onDidReceiveMessage(
        async (message) => {
          if (message.command === "editRDF") {
            vscode.commands.executeCommand("extension.editRDF");
          }
        },
        undefined,
        context.subscriptions
      );
      exportGraph(panel)
    }
  );

  const editRDFCommand = vscode.commands.registerCommand(
    "extension.editRDF",
    () => {
      vscode.window.showInformationMessage("Edit RDF Command Triggered!");
      editRDF(rdfDataForEditig);
    }
  );


  context.subscriptions.push(
    runGraph,
    viewGraph,
    editRDFCommand,
    searchProperty,
  );
}
