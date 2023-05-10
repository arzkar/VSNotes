// Copyright 2023 Arbaaz Laskar

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//   http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { VSNotesConfig } from './types';
import { insertOrUpdateDb } from './crud';

export function generateWorkspaceID(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}

function getExtensionNotesPath() {
    const extensionId: any | undefined = vscode.extensions.getExtension('arbaaz-laskar.vsnotes');
    const extensionNotesPath: string = path.join(vscode.env.appRoot, 'extensions', extensionId.id, "notes");
    return extensionNotesPath;
}

export function initWorkspaceConfig() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    let workspacePath = "";
    if (workspaceFolders && workspaceFolders.length > 0) {
        workspacePath = workspaceFolders[0].uri.fsPath;
    } else if (vscode.workspace.rootPath) {
        workspacePath = vscode.workspace.rootPath;
    }
    const workspaceConfigDir = path.join(workspacePath, ".vscode");
    const workspaceVSNotesConfig = path.join(workspaceConfigDir, "vsnotes-config.json");
    if (!fs.existsSync(workspaceConfigDir)) {
        fs.mkdirSync(workspaceConfigDir, { recursive: true });
    }
    if (!fs.existsSync(workspaceVSNotesConfig)) {
        console.log(`${workspaceVSNotesConfig} not found! Writing!`)
        const vsnotesConfig: VSNotesConfig = {
            workspacePath: workspacePath,
            workspaceID: generateWorkspaceID(16)
        };
        try {
            fs.writeFileSync(workspaceVSNotesConfig, JSON.stringify(vsnotesConfig, null, 2));
        } catch (err: any) {
            console.log(`Error writing ${workspaceVSNotesConfig}:` + err.message)
        }
        return vsnotesConfig;
    }
    else {
        console.log(`${workspaceVSNotesConfig} found! Reading!`)
        let localWorkspaceVSNotesConfig: VSNotesConfig = JSON.parse(fs.readFileSync(workspaceVSNotesConfig, 'utf-8'))
        if (localWorkspaceVSNotesConfig.workspacePath != workspacePath) {
            localWorkspaceVSNotesConfig.workspacePath = workspacePath
        }
        return localWorkspaceVSNotesConfig;
    }
}

export function initVSNotesConfig(vsnotesConfig: VSNotesConfig){
    const extensionNotesPath = getExtensionNotesPath()
    const dirList = [extensionNotesPath, path.join(extensionNotesPath, vsnotesConfig.workspaceID)];
    dirList.forEach((dir)=> {
        if (!fs.existsSync(dir)) {
            console.log(`${dir} not found! Writing!`)
          fs.mkdirSync(dir, { recursive: true });
        }
    });
    insertOrUpdateDb(vsnotesConfig, extensionNotesPath)
}

export function saveNoteContent(document: vscode.TextDocument, noteFilePath: string) {
    try {
        fs.writeFileSync(noteFilePath, Buffer.from(document.getText(), 'utf8'),{ flag: 'w' });
        document.save().then(() => {
            vscode.window.showInformationMessage('Note saved successfully.');
            vscode.commands.executeCommand('workbench.action.closeActiveEditor', { force: true });
            vscode.workspace.openTextDocument(noteFilePath).then((document) => {
                vscode.window.showTextDocument(document);
            });
        });
        // vscode.window.showInformationMessage('Note saved successfully.');
        // vscode.commands.executeCommand('workbench.action.closeActiveEditor', { force: true});
        // vscode.workspace.openTextDocument(noteFilePath).then((document) => {
        //     vscode.window.showTextDocument(document);
        // });
        // vscode.commands.executeCommand('workbench.action.files.save', { force: true });
        // vscode.commands.executeCommand('workbench.action.files.revert', { force: true });

    } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to save note: ${err.message}`);
    }
}

export function constructNoteFilePath(noteFile: string) {
    const vsnotesConfig = initWorkspaceConfig();
    const extensionNotesPath = getExtensionNotesPath()
    return path.join(extensionNotesPath, vsnotesConfig.workspaceID, noteFile);
}