import * as vscode from "vscode";
import mime from "mime-types";

// detect the focus document if it's RDF
const getRDFFromFocusFile = () => {
    const activeEditor = vscode.window.activeTextEditor;
    const filePath = activeEditor?.document.uri.path;
    if (filePath === undefined) {return undefined;};
    return filePath;
};

// or select a file in case no document is in memory
const getRDFFromFilePicker = async () => {
    const filePath = await vscode.window.showOpenDialog();
    if (filePath === undefined) {return;}; // handle this better with conditions ans stuff
    return filePath[0].path;
};

//this is type vscode.Uri
export const editRDF = async (data: string) => {

    const newDocument = await vscode.workspace.openTextDocument({
        content: data,
    });

    await vscode.window.showTextDocument(newDocument, {
        viewColumn: vscode.ViewColumn.One,
        preview: false,
    });
};


// TODO: or if you have a document in memory run it


function getFileName(filePath:any) {
    if (typeof require !== 'undefined') {
        const path = require('path');
        return path.basename(filePath);
    }
    
    return filePath.split('/').pop().split('\\').pop();
}


export const getRDFContent = async() =>{

    let filePath = getRDFFromFocusFile();
    //@ts-ignore

    
    let document = await vscode.workspace.openTextDocument(filePath);
    
    const content = document.getText();

    let fileName = getFileName(filePath);

    return {content: content, fileName : fileName, mime: mime.lookup(fileName)};

};

// Parse RDF content and create a graph
