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
import { initWorkspaceConfig, initVSNotesConfig } from './util';

export class TreeDataProvider {
	notes: { title: string; content: string;}[]=[];
	constructor() {
		const vsnotesConfig = initWorkspaceConfig();
		if (vsnotesConfig.workspacePath) {
			initVSNotesConfig(vsnotesConfig);
		}
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