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
import { initWorkspaceConfig, initVSNotesConfig, getExtensionNotesPath, saveNoteContent } from './util';
import { FileTreeDataProvider } from './tree';
import path = require('path');

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

	let disposable = vscode.commands.registerCommand('extension.createNote', () => {
		const newWorkspaceFolders = [{ uri: vscode.Uri.file(rootPath) }];
		vscode.workspace.updateWorkspaceFolders(0, null, ...newWorkspaceFolders);
		vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
	});

	
	// let saveDisposable = vscode.commands.registerCommand('extension.saveNote', () => {
	// 	const editor = vscode.window.activeTextEditor;
	// 	console.log("editor",editor);
	// 	if (editor) {
	// 		if (!editor.document.fileName.startsWith("Untitled")) {
	// 			saveNoteContent(editor.document, editor.document.fileName);
	// 		}
	// 		else {
	// 			vscode.window.showInputBox({ prompt: 'Enter the note name:' }).then((noteName: string="untitled") => {
	// 				if (noteName != "untitled") {
	// 					const noteFile = noteName + ".md";
	// 					saveNoteContent(editor.document, noteFile);
	// 				}
	// 			});

	// 		}
	// 	}
	//   });
	
	let saveDisposable = vscode.commands.registerCommand('extension.saveNote', async () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			const filePath = activeEditor.document.uri.fsPath;
			const newFilePath = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(rootPath) });

			if (newFilePath) {
				const newFilePathStr = newFilePath.fsPath;
				await vscode.workspace.fs.writeFile(vscode.Uri.file(newFilePathStr), Buffer.from(activeEditor.document.getText()));
				activeEditor.document.save().then(() => {
					vscode.window.showInformationMessage('Note saved successfully.');
					vscode.commands.executeCommand('workbench.action.closeActiveEditor', { force: true });
					vscode.workspace.openTextDocument(newFilePathStr).then((document) => {
						vscode.window.showTextDocument(document);
					});
					vscode.commands.executeCommand('workbench.action.files.revert', { force: true });
				});
			}
		}
	});

	context.subscriptions.push(disposable, saveDisposable);

	// let saveDisposable = vscode.workspace.onWillSaveTextDocument((event) => {
	// 	const activeEditor = vscode.window.activeTextEditor;
	// 	if (activeEditor && event.document.uri.scheme === 'file') {
	// 		event.waitUntil(
	// 			new Promise<void>((resolve) => {
	// 				const filePath = activeEditor.document.uri.fsPath;
    //                 const newWorkspaceFolders = [{ uri: vscode.Uri.file(rootPath) }];
    //                 vscode.workspace.updateWorkspaceFolders(0, 1, ...newWorkspaceFolders);
    //                 resolve();
	// 			})
	// 		);
	// 	}
	// });

}

export function deactivate() { }
