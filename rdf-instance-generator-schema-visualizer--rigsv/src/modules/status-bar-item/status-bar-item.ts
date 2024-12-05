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
            label: "$(graph-scatter) Run RDF Graph",
            description: "Compile RDF and open Graph",
            command: "extension.runGraph",
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

