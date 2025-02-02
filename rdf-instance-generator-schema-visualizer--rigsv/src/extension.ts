import * as vscode from "vscode";
import {subscriptionsPushAll} from "./modules/commands";
import { openWebView } from "./modules/graph-view/graph-view";
export function activate(context: vscode.ExtensionContext) {


  console.log(
    'Congratulations, your extension "rdf-instance-generator-schema-visualizer--rigsv" is now active!'
  );

  openWebView(context);
  subscriptionsPushAll(context);
  

}

// This method is called when your extension is deactivated
export function deactivate() {}
