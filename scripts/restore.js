// Restaure une sauvegarde faite avec npm run backup
//   npm run restore                     -> la plus récente
//   npm run restore -- 2026-10-27_03-00 -> une sauvegarde précise
// Attention : ça écrase les données actuelles des deux bases
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const BACKUP_DIR = 'backups';

// envoie le fichier à la commande lancée dans le conteneur
function restoreFromFile(command, file) {
  const input = fs.openSync(file, 'r');
  const result = spawnSync('docker', command, { stdio: [input, 'pipe', 'pipe'] });
  fs.closeSync(input);
  if (result.status !== 0) {
    throw new Error(`${command.join(' ')} a échoué : ${result.stderr}`);
  }
}

const backups = fs.existsSync(BACKUP_DIR) ? fs.readdirSync(BACKUP_DIR).sort() : [];
const name = process.argv[2] || backups[backups.length - 1];
if (!name || !backups.includes(name)) {
  console.error(`Sauvegarde introuvable. Disponibles : ${backups.join(', ') || 'aucune'}`);
  process.exit(1);
}
const folder = path.join(BACKUP_DIR, name);

// --clean : supprime et recrée les tables avant de les remplir
restoreFromFile(
  ['exec', '-i', 'maets-postgres', 'pg_restore', '-U', process.env.DB_USER, '-d', process.env.DB_NAME, '--clean', '--if-exists', '--no-owner'],
  path.join(folder, 'postgres.dump'),
);

// --drop : vide les collections avant de les remplir
restoreFromFile(
  ['exec', '-i', 'maets-mongo', 'mongorestore', '--archive', '--gzip', '--drop', '--quiet'],
  path.join(folder, 'mongo.archive.gz'),
);

console.log(`Sauvegarde ${name} restaurée`);
