import * as vscode from "vscode";
import {subscriptionsPushAll} from "./modules/commands"
export function activate(context: vscode.ExtensionContext) {

  console.log(
    'Congratulations, your extension "rdf-instance-generator-schema-visualizer--rigsv" is now active!'
  );

  subscriptionsPushAll(context)
  

}

// This method is called when your extension is deactivated
export function deactivate() {}
