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
import { TreeDataProvider } from './tree';
import { constructNoteFilePath, saveNoteContent } from './util';
import { match } from 'assert';
  
export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider(
		"vsnotes-container",
		new TreeDataProvider()
	  );

	  let disposable = vscode.commands.registerCommand('extension.createNote', () => {
		vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
	  });
	
	  let saveDisposable = vscode.commands.registerCommand('extension.saveNote', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			if (!editor.document.fileName.startsWith("Untitled")) {
				saveNoteContent(editor.document, editor.document.fileName);
			}
			else {
				vscode.window.showInputBox({ prompt: 'Enter the note name:' }).then((noteName: string="untitled") => {
					if (noteName != "untitled") {
						const noteFile = noteName + ".md"
						saveNoteContent(editor.document, constructNoteFilePath(noteFile));
					}
				})

			}
		}
	  });
	
	  context.subscriptions.push(disposable, saveDisposable);
}

export function deactivate() {}
