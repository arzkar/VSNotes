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
import {
  initWorkspaceConfig,
  initVSNotesConfig,
  getExtensionNotesPath,
  saveNoteContent,
} from "./util";
import { FileTreeDataProvider } from "./tree";
import path = require("path");

export function activate(context: vscode.ExtensionContext) {
  const vsnotesConfig = initWorkspaceConfig();
  if (vsnotesConfig.workspacePath) {
    initVSNotesConfig(vsnotesConfig);
  }

  const extensionNotesPath = getExtensionNotesPath();
  const rootPath = path.join(extensionNotesPath, vsnotesConfig.workspaceID);
  const fileDataProvider = new FileTreeDataProvider(rootPath);

  vscode.window.registerTreeDataProvider(
    "vsnotes-FileView",
    new FileTreeDataProvider(rootPath)
  );

  // Register a file system watcher to listen for file changes
  const watcher = vscode.workspace.createFileSystemWatcher(`${rootPath}/**/*`);
  watcher.onDidChange(() => {
    // Refresh the data in the FileTreeDataProvider when files are modified
    fileDataProvider.refresh();
  });

  let createNote = vscode.commands.registerCommand(
    "extension.createNote",
    () => {
      const newWorkspaceFolders = [{ uri: vscode.Uri.file(rootPath) }];
      vscode.workspace.updateWorkspaceFolders(0, null, ...newWorkspaceFolders);
      vscode.commands.executeCommand("workbench.action.files.newUntitledFile");
    }
  );

  let saveNote = vscode.commands.registerCommand(
    "extension.saveNote",
    async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        await vscode.commands.executeCommand("workbench.action.files.save");
        vscode.window.showInformationMessage("Note saved successfully.");
      }
    }
  );

  context.subscriptions.push(createNote, saveNote);
}

export function deactivate() {}
