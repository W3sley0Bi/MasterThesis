import * as vscode from "vscode";

  export const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    10
  );

  statusBarItem.text = "$(gear) RIGSV Options ";
  statusBarItem.tooltip = "Open RIGSV Commands Options";
  statusBarItem.command = "extension.openMenu";
  statusBarItem.show();

  export const menuCommand = vscode.commands.registerCommand(
    "extension.openMenu",
    async () => {
      const selection = await vscode.window.showQuickPick(
        [
          {
            label: "$(graph-scatter) Generate RDF Graph",
            description: "Compile RDF and open Graph",
            command: "extension.viewGraph",
          },
          {
            label: "$(terminal-new) Generate RDF Graph & instances",
            description: "Compile RDF and open Graph with new instances",
            command: "extension.runGraph",
          },
          {
            label: "$(search-editor-label-icon) Generate RDF Graph & instances with props",
            description: "Compile RDF and open Graph with new instances and property search",
            command: "extension.searchProperty",
          },
          {
            label: "$(gear) Extension Settings",
            description: "Open Extension Settings file",
            command: "extension.settings",
          },
          {
            label: "$(trash) Quit",
            description: "Close all the extension components",
            // command: "",
          },
        ],
        {
          placeHolder: "Select a command",
        }
      );

      if (selection?.command) {
        vscode.commands.executeCommand(selection.command);
      }
    }
  );

