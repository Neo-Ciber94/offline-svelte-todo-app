import PouchDB from 'pouchdb';
import PouchDBAdapterNodeWebSql from 'pouchdb-adapter-node-websql';
import path from 'node:path';

PouchDB.plugin(PouchDBAdapterNodeWebSql);

const dbFilename = path.join(process.cwd(), 'data', 'pouch.db');
export const serverPouchDb = new PouchDB(dbFilename, { adapter: 'websql' });
