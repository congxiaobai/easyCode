import * as vscode from 'vscode';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import * as ejs from 'ejs';
import { Uri } from 'vscode';
import * as camelCase from 'lodash.camelcase';
const renderFileAsync = util.promisify(ejs.renderFile);
const writeFileAsync = util.promisify(fs.writeFile);
export default async function autoFillContent(uri: Uri) {
    const { fsPath } = uri;
    const itemString = getInterfaceItems();
    if (!itemString) {
        vscode.window.showErrorMessage('未读取到字段,请保证语法规范');
        return;
    }
    let editor = vscode.window.activeTextEditor;
    let document = editor.document;
    const interfaceName = document.getText(editor.selection);
    let dirName = path.join(path.dirname(fsPath), camelCase(interfaceName) + 'Component');

    if (fs.existsSync(dirName)) {
        let count = 1;
        dirName += count;
        while (fs.existsSync(dirName)) {
            dirName += count;
            count++;
        }
    }
    fs.mkdirSync(dirName);
    const tokenMap = getTokenMap(itemString);
    await fillContent(dirName);

    // await filContent(fsPath);
};


const getInterfaceItems = (): string | void => {
    try {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        let document = editor.document;
        let selection = editor.selection;

        const line = selection.anchor.line;
        const startNum = selection.start.character;
        const endNum = selection.end.character;
        const lineString = document.lineAt(line).text;
        const subString = lineString.substring(0, startNum);
        const tokens = subString.split(' ').filter(s => s);
        const readText = lineString.substring(endNum);
        const lastTokens = lineString.substring(endNum).split(' ').filter(s => s);
        const stack = [];
        let interfaceString = '';
        if (tokens[tokens.length - 1] === 'interface' && lastTokens[0] === '{') {
            let isEnd = false;
            Array.from(readText).forEach(s => {
                if (isEnd) {
                    return;
                }
                interfaceString = interfaceString + s;
                if (s === '{') {
                    stack.push('{');
                }
                if (s === '}') {
                    stack.pop();
                    if (stack.length === 0) {
                        isEnd = true;
                    }
                }
            });
            if (!isEnd) {
                for (let i = line + 1; i <= document.lineCount; i++) {
                    const nextLine = document.lineAt(i).text;
                    Array.from(nextLine).forEach(s => {
                        if (isEnd) {
                            return;
                        }
                        interfaceString = interfaceString + s;
                        if (s === '{') {
                            stack.push('{');
                        }
                        if (s === '}') {
                            stack.pop();
                            if (stack.length === 0) {
                                isEnd = true;
                            }
                        }
                    });
                    if (isEnd) {
                        break;
                    }

                }
            }
            if (!interfaceString || interfaceString.length === 0) {
                vscode.window.showErrorMessage('未匹配到数据');
            }
            const realText = interfaceString.trim();
            const items = realText.substring(1, realText.length - 1);
            return items;
        }
        vscode.window.showErrorMessage('仅支持Interface数据');
    }
    catch (err) {
        vscode.window.showErrorMessage(err);
    }
};

const getTokenMap = (itemString): Map<string, string> => {
    const tokenMap = new Map<string, string>();
    const tokens = itemString.split(';');
    tokens.forEach(item => {
        if (!item) {
            return;
        }
        const itemString = item.trim()
        const items = itemString.substring(0, itemString.length - 1).split(':');
        if (items.length === 1) {
            tokenMap.set(item[0].trim(), 'any');
        }
        if (items.length === 2) {
            tokenMap.set(item[0].trim(), item[0].trim());
        }
    });
    return tokenMap;
};

const fillContent = async (dir: string) => {
    try {
        const templatePath = path.join(__dirname, `AddFor.ejs`);
        const content = await renderFileAsync(templatePath, { dir });
        console.log({ content });
    }
    catch (err) {
        vscode.window.showErrorMessage(err)
    }
};