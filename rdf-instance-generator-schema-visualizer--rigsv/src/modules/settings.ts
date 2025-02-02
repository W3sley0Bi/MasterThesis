import * as vscode from 'vscode';

export const openSettingsCommand = vscode.commands.registerCommand('extension.settings', () => {
    // Navigate to the settings UI with your extension's settings filtered
    vscode.commands.executeCommand('workbench.action.openSettings', '@ext:wesley-tuc-master-thesis.rdf-instance-generator-schema-visualizer--rigsv');
});


