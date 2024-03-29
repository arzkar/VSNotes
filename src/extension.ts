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
  
export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider(
		"vsnotes-container",
		new TreeDataProvider()
	  );
}

export function deactivate() {}
