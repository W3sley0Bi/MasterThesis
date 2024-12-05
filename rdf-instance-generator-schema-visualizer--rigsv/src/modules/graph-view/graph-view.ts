import * as vscode from "vscode";
import * as path from 'path';
import * as fs from 'fs';
import Graph from "graphology";
import Sigma from "sigma";

const getWebviewContent = (webview: vscode.Webview, context: vscode.ExtensionContext): string => {

      // Path to the HTML file
      const htmlPath = path.join(context.extensionPath, 'src', 'modules', 'graph-view', 'graph.html');
    
      // Read the HTML content
      let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
      // Replace resource paths (e.g., for scripts, styles)
      htmlContent = htmlContent.replace(
        /src="([^"]+)"/g,
        (match, src) => {
          const resourcePath = vscode.Uri.file(
            path.join(context.extensionPath, 'src', 'modules', 'graph-view', src)
          );
          const resourceUri = webview.asWebviewUri(resourcePath);
          return `src="${resourceUri}"`;
        }
      );
    
      return htmlContent;
};

// detect the focus document if it's RDF
const getRDFFromFocusFile = () => {
    const activeEditor = vscode.window.activeTextEditor;
    const filePath = activeEditor?.document.uri.path;
    if (filePath === undefined) return undefined;
    return filePath;
};

// or select a file in case no document is in memory
const getRDFFromFilePicker = async () => {
    const filePath = await vscode.window.showOpenDialog();
    if (filePath === undefined) return; // handle this better with conditions ans stuff
    return filePath[0].path;
};

//this is type vscode.Uri
const debugRDF = async (filePath: any) => {
    const config = vscode.workspace.getConfiguration("debugMode");
    const defaultDebugMode = config.get("defaultDebugMode");
    if (!defaultDebugMode) return;

    const document = await vscode.workspace.openTextDocument(filePath);
    const content = document.getText();

    const newDocument = await vscode.workspace.openTextDocument({
        language: "tll", // Set language (e.g., "javascript", "json")
        content: content,
    });

    await vscode.window.showTextDocument(newDocument, {
        viewColumn: vscode.ViewColumn.One,
    });
};

// or if you have a document in memory run it




export function runGraphTest(context: vscode.ExtensionContext) {

const runGraph = vscode.commands.registerCommand(
    "extension.runGraph",
    async () => {
        vscode.window.showInformationMessage("Graph is loaded");

        let filePath = getRDFFromFocusFile();

        //debug mode
        debugRDF(filePath);

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
                    vscode.Uri.file(path.join(context.extensionPath, 'src', 'modules', 'graph-view')),
                  ]
            }
        );

        panel.webview.html = getWebviewContent(panel.webview, context);
    }
);

context.subscriptions.push(runGraph);

}
