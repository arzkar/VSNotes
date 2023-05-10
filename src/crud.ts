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
import * as path from 'path';
import { VSNotesConfig } from "./types";
import * as sqlite3 from "sqlite3"

function createDbConn(extensionNotesPath: string) {
    const db_path = path.join(extensionNotesPath, "metadata.db");
    const db = new sqlite3.Database(db_path,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
      if (error) {
        return console.error(error.message);
      }
    });
    console.log(`Connected with db: ${db_path}`);
    return db;
  }

function createTableIfNotExists(db: sqlite3.Database) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS notesMetadata
    (
        workspaceID VARCHAR(50) PRIMARY KEY NOT NULL,
        workspacePath VARCHAR(50) NOT NULL
    );
    `)
}

export function insertOrUpdateDb(vsnotesConfig: VSNotesConfig, extensionNotesPath: string) {
    const db = createDbConn(extensionNotesPath)
    createTableIfNotExists(db)
    db.run(`
    REPLACE INTO notesMetadata (workspaceID, workspacePath) 
    VALUES (?, ?)
    `, [vsnotesConfig.workspaceID, vsnotesConfig.workspacePath], (error) => {
      if (error) {
        console.error(error.message);
      }
      console.log(`Modifying: ${vsnotesConfig.workspaceID}`);
    });
}

export function fetchDb(extensionNotesPath: string) {
    const db = createDbConn(extensionNotesPath)
    db.all(`SELECT * FROM notesMetadata`, [], (err, notesMetadata) => {
        if (err) {
          console.error(err.message);
        }
        return notesMetadata;
    });
}