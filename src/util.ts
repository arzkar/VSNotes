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
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as vscode from "vscode";

import { VSNotesConfig } from "./types";
import { insertOrUpdateDb } from "./crud";

export function generateWorkspaceID(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
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
  const workspaceVSNotesConfig = path.join(
    workspaceConfigDir,
    "vsnotes-config.json"
  );
  if (!fs.existsSync(workspaceConfigDir)) {
    fs.mkdirSync(workspaceConfigDir, { recursive: true });
  }
  if (!fs.existsSync(workspaceVSNotesConfig)) {
    console.log(`${workspaceVSNotesConfig} not found! Writing!`);
    const vsnotesConfig: VSNotesConfig = {
      workspacePath: workspacePath,
      workspaceID: generateWorkspaceID(16),
    };
    try {
      fs.writeFileSync(
        workspaceVSNotesConfig,
        JSON.stringify(vsnotesConfig, null, 2)
      );
    } catch (err: any) {
      console.log(`Error writing ${workspaceVSNotesConfig}:` + err.message);
    }
    return vsnotesConfig;
  } else {
    console.log(`${workspaceVSNotesConfig} found! Reading!`);
    let localWorkspaceVSNotesConfig: VSNotesConfig = JSON.parse(
      fs.readFileSync(workspaceVSNotesConfig, "utf-8")
    );
    if (localWorkspaceVSNotesConfig.workspacePath != workspacePath) {
      localWorkspaceVSNotesConfig.workspacePath = workspacePath;
    }
    return localWorkspaceVSNotesConfig;
  }
}

export function initVSNotesConfig(vsnotesConfig: VSNotesConfig) {
  const extensionNotesPath = path.join(os.homedir(), ".vsnotes");
  const dirList = [
    extensionNotesPath,
    path.join(extensionNotesPath, vsnotesConfig.workspaceID),
  ];
  dirList.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      console.log(`${dir} not found! Writing!`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  insertOrUpdateDb(vsnotesConfig, extensionNotesPath);
}

export function saveNoteContent(
  document: vscode.TextDocument,
  noteFileName: string
) {
  const extensionNotesPath = path.join(os.homedir(), ".vsnotes");
  const noteFilePath = path.join(extensionNotesPath, noteFileName);

  try {
    fs.writeFileSync(noteFilePath, document.getText(), { flag: "w" });
    vscode.window.showInformationMessage("Note saved successfully.");
  } catch (error: any) {
    vscode.window.showErrorMessage(`Error saving note: ${error.message}`);
  }
}

export function readFilesInDirectory(directory: string): string[] {
  const files: string[] = [];

  const fileNames = fs.readdirSync(directory);
  for (const fileName of fileNames) {
    const filePath = path.join(directory, fileName);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isFile()) {
      files.push(filePath);
    }
  }

  return files;
}
