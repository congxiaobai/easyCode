import * as vscode from 'vscode';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import * as ejs from 'ejs';
import { commands, Uri } from 'vscode';
import { capitalize } from '../JsonToTs/get-names';
const renderFileAsync = util.promisify(ejs.renderFile);
const writeFileAsync = util.promisify(fs.writeFile);
import {
  generateTableColumConfig,
  generateDescriptionFiled,
  generateEditFormFiled,
  generateCrudFormFiled,
  generateSearchFormFiled,
  deleteExt,
  generateObjectFakerData,
  generateArrayFakerData,
} from './utils';
const cmdMap = {
  crud: 'Crud.ejs',
  searchForm: 'SearchForm.ejs',
  table: 'Table.ejs',
  editForm: 'EditForm.ejs',
  description: 'Description.ejs',
};
const generateMap = {
  crud: generateCrudFormFiled,
  searchForm: generateSearchFormFiled,
  table: generateTableColumConfig,
  editForm: generateEditFormFiled,
  description: generateDescriptionFiled,
};
const generateMockMap = {
  crud: generateArrayFakerData,
  searchForm: () => ({}),
  table: generateArrayFakerData,
  editForm: generateObjectFakerData,
  description: generateObjectFakerData,
};

export default async function autoFillContent(uri: Uri, commandKey: string) {
  const { fsPath } = uri;
  const itemString = getInterfaceItems();
  if (!itemString) {
    vscode.window.showErrorMessage('未读取到字段,请保证语法规范');
    return;
  }
  let editor = vscode.window.activeTextEditor;
  let document = editor.document;
  const interfaceName = document.getText(editor.selection);
  const componentName =
    capitalize(interfaceName) + capitalize(commandKey) + 'Component';
  let dirName = path.join(path.dirname(fsPath), componentName);

  if (fs.existsSync(dirName)) {
    let count = 1;
    dirName += count;
    while (fs.existsSync(dirName)) {
      dirName += count;
      count++;
    }
  }
  const indexPath = dirName + '/index.tsx';
  const typePath = deleteExt(path.relative(dirName, fsPath), '.ts');
  fs.mkdirSync(dirName);
  const tokenMap = getTokenMap(itemString);
  // 写config 文件

  fillConfigContent(commandKey, tokenMap, dirName);
  // 写渲染层
  await fillContent(
    componentName,
    indexPath,
    commandKey,
    typePath,
    interfaceName,
  );
  // 写Mock数据
  await fillMock(tokenMap, dirName, commandKey);
}
const fillConfigContent = (
  commandKey: string,
  tokens: Map<string, string>,
  dirName: string,
) => {
  const config = generateMap[commandKey];
  const content = config(tokens);
  const fileName = dirName + '/utils.tsx';
  if (fs.existsSync(fileName)) {
    fs.appendFileSync(dirName + '/utils.tsx', content);
    return;
  }
  fs.writeFileSync(dirName + '/utils.tsx', content);
};

const fillMock = async (
  tokens: Map<string, string>,
  dirName: string,
  commandKey: string,
) => {
  const mock = generateMockMap[commandKey];
  try {
    const content = mock(tokens);
    const fileName = dirName + '/mock.ts';
    if (fs.existsSync(fileName)) {
      fs.appendFileSync(fileName, content);
      return;
    }
    fs.writeFileSync(fileName, content);
  } catch (err) {
    console.log({ err });
    vscode.window.showErrorMessage(err.message);
  }
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
    const tokens = subString.split(' ').filter((s) => s);
    const readText = lineString.substring(endNum);
    const lastTokens = lineString
      .substring(endNum)
      .split(' ')
      .filter((s) => s);
    const stack = [];
    let interfaceString = '';
    if (tokens[tokens.length - 1] === 'interface' && lastTokens[0] === '{') {
      let isEnd = false;
      Array.from(readText).forEach((s) => {
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
          Array.from(nextLine).forEach((s) => {
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
  } catch (err) {
    vscode.window.showErrorMessage(err.message);
  }
};

const getTokenMap = (itemString): Map<string, string> => {
  const tokenMap = new Map<string, string>();
  const tokens = itemString.split(';');
  tokens.forEach((item) => {
    if (!item) {
      return;
    }
    const items = item.split(':');
    if (items.length === 1) {
      tokenMap.set(items[0].replace('?', '').trim(), 'any');
    }
    if (items.length === 2) {
      tokenMap.set(items[0].replace('?', '').trim(), items[1].trim());
    }
  });
  return tokenMap;
};

const fillContent = async (
  componentName: string,
  newFsPath: string,
  commandKey: string,
  typePath: string,
  interfaceName: string,
) => {
  try {
    const templatePath = path.join(__dirname, cmdMap[commandKey]);
    const content = await renderFileAsync(templatePath, {
      name: componentName,
      typePath,
      interfaceName,
    });
    console.log({ content });
    await writeFileAsync(newFsPath, content);
    commands.executeCommand('vscode.open', Uri.file(newFsPath));
  } catch (err) {
    console.log({ err });
    vscode.window.showErrorMessage(err.message);
  }
};
