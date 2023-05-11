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
import * as vscode from 'vscode';

class FileItem {
  constructor(public readonly name: string, public readonly filePath: string) {}
}

export class FileTreeDataProvider implements vscode.TreeDataProvider<FileItem> {
  private fileItems: FileItem[] = [];
  private rootPath: string;
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined> = new vscode.EventEmitter<FileItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private timer: NodeJS.Timer | undefined;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.startDirectoryScan();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    treeItem.command = {
      command: 'extension.openFile',
      title: 'Open File',
      arguments: [element.filePath],
    };
    return treeItem;
  }

  async getChildren(element?: FileItem): Promise<FileItem[]> {
    const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(this.rootPath));
    const fileItems: FileItem[] = [];
    for (const [name, type] of files) {
      if (type === vscode.FileType.File) {
        const filePath = vscode.Uri.joinPath(vscode.Uri.file(this.rootPath), name).fsPath;
        fileItems.push(new FileItem(name, filePath));
      }
    }
    return fileItems;
  }

  private startDirectoryScan(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.checkForDeletedFiles();
    }, 2000); // Adjust the interval as needed
  }

  private async checkForDeletedFiles(): Promise<void> {
    const existingFiles = new Set<string>();
    const fileItems = await this.getChildren();
    for (const fileItem of fileItems) {
      existingFiles.add(fileItem.filePath);
    }

    // Compare existing files with the stored file list
    // Remove any missing files from the tree view and trigger a refresh
    // This assumes you have a property `fileItems` in your `FileTreeDataProvider` class
    this.fileItems = this.fileItems.filter((item) => existingFiles.has(item.filePath));
    this.refresh();
  }

  dispose(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
