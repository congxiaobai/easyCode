// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import jsonToTsInterface from './JsonToInterface';
import autoFillContent from './autoFillContent';
// This method is called when your extension is activated


export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('easyCode.json-to-ts-interface', jsonToTsInterface
	);

	let disposable2 = vscode.commands.registerCommand('easyCode.interface-to-component', ()=>{
		let editor = vscode.window.activeTextEditor;
		let document = editor.document;
		let selection = editor.selection;	
		let text = document.getText(selection);
		document.
		debugger
	}
	);
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);


}
// This method is called when your extension is deactivated
export function deactivate() { }
