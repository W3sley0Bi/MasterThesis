import * as vscode from "vscode";
import { statusBarItem, menuCommand } from "./status-bar-item/status-bar-item";
import { openSettingsCommand } from "./settings";

export const subscriptionsPushAll = (context: vscode.ExtensionContext) => {

    context.subscriptions.push(statusBarItem);

    context.subscriptions.push(menuCommand);

    context.subscriptions.push(openSettingsCommand);

}; 
