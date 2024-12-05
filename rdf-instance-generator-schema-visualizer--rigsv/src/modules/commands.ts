import * as vscode from "vscode"
// import { runGraph } from "./graph-view/graph-view"
import { statusBarItem, menuCommand } from "./status-bar-item/status-bar-item";
import { openSettingsCommand } from "./settings";

export const subscriptionsPushAll = (context: vscode.ExtensionContext) => {

    context.subscriptions.push(statusBarItem);

    context.subscriptions.push(menuCommand);

    // context.subscriptions.push(runGraph);

    context.subscriptions.push(openSettingsCommand);

} 
