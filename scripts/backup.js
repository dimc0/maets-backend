// npm run backup : sauvegarde les deux bases (Docker) dans backups/AAAA-MM-JJ_HH-MM/
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const BACKUP_DIR = 'backups';
const KEEP = 7; // une par jour, donc une semaine

// lance la commande dans le conteneur et écrit ce qu'elle sort dans un fichier
function dumpToFile(command, file) {
  const output = fs.openSync(file, 'w');
  const result = spawnSync('docker', command, { stdio: ['ignore', output, 'pipe'] });
  fs.closeSync(output);
  if (result.status !== 0) {
    throw new Error(`${command.join(' ')} a échoué : ${result.stderr}`);
  }
  return fs.statSync(file).size;
}

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const name = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
const folder = path.join(BACKUP_DIR, name);
fs.mkdirSync(folder, { recursive: true });

// Les deux bases l'une après l'autre, dans le même dossier, pour qu'elles restent cohérentes
// (la base Mongo porte le même nom que DB_NAME)
const pgSize = dumpToFile(
  ['exec', 'maets-postgres', 'pg_dump', '-U', process.env.DB_USER, '-d', process.env.DB_NAME, '--format=custom'],
  path.join(folder, 'postgres.dump'),
);
const mongoSize = dumpToFile(
  ['exec', 'maets-mongo', 'mongodump', `--db=${process.env.DB_NAME}`, '--archive', '--gzip', '--quiet'],
  path.join(folder, 'mongo.archive.gz'),
);
console.log(`Sauvegarde OK : ${folder} (Postgres ${pgSize} octets, Mongo ${mongoSize} octets)`);

// On ne garde que les KEEP plus récentes
const all = fs.readdirSync(BACKUP_DIR).sort(); // les noms sont des dates, l'ordre alphabétique suffit
for (const old of all.slice(0, Math.max(0, all.length - KEEP))) {
  fs.rmSync(path.join(BACKUP_DIR, old), { recursive: true });
  console.log(`Supprimée (trop ancienne) : ${old}`);
}
