// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import jsonToTsInterface from './JsonToInterface';
import autoFillContent from './autoFillContent';
// This method is called when your extension is activated
import { Uri } from 'vscode';


export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('easyCode.json-to-ts-interface', jsonToTsInterface);

	let crud = vscode.commands.registerCommand('easyCode.to-CRUD', (uri: Uri) => autoFillContent(uri, 'crud'));
	let searchForm = vscode.commands.registerCommand('easyCode.to-search-form', (uri: Uri) => autoFillContent(uri, 'searchForm'));
	let table = vscode.commands.registerCommand('easyCode.to-table', (uri: Uri) => autoFillContent(uri, 'table'));
	let editForm = vscode.commands.registerCommand('easyCode.to-edit-form', (uri: Uri) => autoFillContent(uri, 'editForm'));
	let description = vscode.commands.registerCommand('easyCode.to-description', (uri: Uri) => autoFillContent(uri, 'description'));
	context.subscriptions.push(disposable);
	context.subscriptions.push(crud);
	context.subscriptions.push(searchForm);
	context.subscriptions.push(table);
	context.subscriptions.push(editForm);
	context.subscriptions.push(description);
}
// This method is called when your extension is deactivated
export function deactivate() { }
