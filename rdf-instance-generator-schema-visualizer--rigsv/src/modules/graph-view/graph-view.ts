import * as vscode from "vscode";

const getWebviewContent = (): string => {
    return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Webview Example</title>
          </head>
          <body>
              <h1>Hello from Webview!</h1>
              <p>This is an HTML page displayed in a VS Code Webview.</p>
              <script>
                  console.log('Webview loaded!');
              </script>
          </body>
          </html>
      `;
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
    if(!defaultDebugMode) return

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

export const runGraph = vscode.commands.registerCommand(
    "extension.runGraph",
    async () => {
        vscode.window.showInformationMessage("Graph is loaded");

        let filePath = getRDFFromFocusFile()

        //debug mode
        debugRDF(filePath);

        let panel = vscode.window.createWebviewPanel(
            "placeholderRDFFileName",
            "placeholderRDFFileName",
            {
                preserveFocus: true,
                viewColumn: vscode.ViewColumn.Beside,
            }
        );

        panel.webview.html = getWebviewContent();
    }
);
