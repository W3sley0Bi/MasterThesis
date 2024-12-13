import * as vscode from "vscode";
import N3, {Parser} from 'n3';


// Define interfaces for nodes and edges
interface GraphNode {
    id: string;
    label: string;
}

interface GraphEdge {
    source: string;
    target: string;
    label: string;
}


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


// TODO: or if you have a document in memory run it

export const getRDFContent = async() =>{

    let filePath = getRDFFromFocusFile()
    //@ts-ignore
    let document = await vscode.workspace.openTextDocument(filePath);
    const content = document.getText();
    
    const parser = new N3.Parser();
    const results = parser.parse(content)

    return results

}

// Parse RDF content and create a graph
