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
import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";

import {
  initWorkspaceConfig,
  initVSNotesConfig,
  saveNoteContent,
  readFilesInDirectory,
} from "./util";
import { FileTreeDataProvider } from "./tree";

export function activate(context: vscode.ExtensionContext) {
  const vsnotesConfig = initWorkspaceConfig();
  if (vsnotesConfig.workspacePath) {
    initVSNotesConfig(vsnotesConfig);
  }

  const extensionNotesPath = path.join(os.homedir(), ".vsnotes");
  const workspaceNotesPath = path.join(
    extensionNotesPath,
    vsnotesConfig.workspaceID
  );
  const fileDataProvider = new FileTreeDataProvider(
    extensionNotesPath,
    vsnotesConfig.workspaceID
  );

  vscode.window.registerTreeDataProvider("vsnotes-FileView", fileDataProvider);

  vscode.workspace.onDidSaveTextDocument((document) => {
    let savedFiles: string[] = readFilesInDirectory(workspaceNotesPath);
    const noteFilePath = path.normalize(document.uri.fsPath);
    const isMatch = savedFiles.some((savedFilePath) => {
      return savedFilePath.toLowerCase() === noteFilePath.toLowerCase();
    });
    console.log("isMatch", isMatch);

    if (!isMatch) {
      // If new file is created, refresh the tree
      fileDataProvider.refresh();
    }
    const newNoteUri = vscode.Uri.file(noteFilePath);
    vscode.commands.executeCommand("vscode.open", newNoteUri);
  });

  let createNote = vscode.commands.registerCommand(
    "extension.createNote",
    () => {
      vscode.commands.executeCommand("workbench.action.files.newUntitledFile");
    }
  );

  let saveNote = vscode.commands.registerCommand(
    "extension.saveNote",
    async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        await activeEditor.document.save();
        const noteFileName = path.basename(activeEditor.document.fileName);
        const noteFilePath = path.join(workspaceNotesPath, noteFileName);

        const noteUri = vscode.Uri.file(noteFilePath);

        // Update the document's URI in the editor
        await vscode.commands.executeCommand(
          "workbench.action.files.save",
          noteUri
        );

        // Get the new filename
        const newFileName = path.basename(noteUri.fsPath);

        vscode.window.showInformationMessage(`Note saved!`);
      }
    }
  );

  let openNote = vscode.commands.registerCommand(
    "extension.openFile",
    async (filePath: string) => {
      const fileUri = vscode.Uri.file(filePath);
      const document = await vscode.workspace.openTextDocument(fileUri);
      vscode.window.showTextDocument(document);
    }
  );

  context.subscriptions.push(createNote, saveNote, openNote);
}

export function deactivate() {}
