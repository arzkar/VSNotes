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

class VSNotesTreeDataProvider {
	notes: { title: string; content: string; }[];
	constructor() {
	  this.notes = [
		{ title: "Note 1", content: "This is the content of Note 1." },
		{ title: "Note 2", content: "This is the content of Note 2." },
		{ title: "Note 3", content: "This is the content of Note 3." },
	  ];
	}
  
	getTreeItem(note: any ) {
	  return {
		id: note.title,
		label: note.title,
		collapsibleState: vscode.TreeItemCollapsibleState.None,
		command: {
		  title: "Open Note",
		  command: "vsnotes.viewNote",
		  arguments: [note],
		},
	  };
	}
  
	getChildren() {
	  return Promise.resolve(this.notes);
	}
  }
  
export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider(
		"vsnotes-container",
		new VSNotesTreeDataProvider()
	  );
}

export function deactivate() {}
