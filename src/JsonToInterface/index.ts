import * as fs from 'fs';
import { commands, Uri } from 'vscode';
import JsonToTS, { paseInterface, getAllInterface } from '../JsonToTs';

export default function jsonToTsInterface(uri: Uri) {
  const { fsPath } = uri;
  const json = fs.readFileSync(fsPath, 'utf-8');
  const paths = fsPath.split('/');
  const relativePaths = paths[paths.length - 1];
  const { names, typeStructure } = JsonToTS(JSON.parse(json));
  const interfaces = paseInterface(names, typeStructure, 'interface');
  const filePath = `${fsPath}.ts`;
  const allInterface = getAllInterface(names, typeStructure);
  fs.writeFileSync(filePath, interfaces.join('\n\n'));
  const modalPath = `${fsPath.replace('.json', '')}Modal.ts`;

  let modals = paseInterface(names, typeStructure, 'modal').join('\n\n');
  modals = `import {${allInterface.join(' , ')}} from './${relativePaths}.ts';\n\n${modals}`;
  fs.writeFileSync(modalPath, modals);
  commands.executeCommand('vscode.open', Uri.file(filePath));
}
