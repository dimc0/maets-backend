// Crée le certificat HTTPS auto-signé dans certs/ (valable 1 an, pour localhost)
// À lancer avec : npm run cert
import fs from 'fs';
import { spawnSync } from 'child_process';

// Git installe OpenSSL mais ne l'ajoute pas au PATH : on regarde aussi dans son dossier
const candidates = [
  'openssl',
  'C:\\Program Files\\Git\\usr\\bin\\openssl.exe',
  'C:\\Program Files\\Git\\mingw64\\bin\\openssl.exe',
];
const openssl = candidates.find((path) => spawnSync(path, ['version']).status === 0);
if (!openssl) {
  console.error('OpenSSL introuvable : installer Git (https://git-scm.com/) ou OpenSSL');
  process.exit(1);
}

fs.mkdirSync('certs', { recursive: true });
const run = spawnSync(openssl, [
  'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '365',
  '-keyout', 'certs/key.pem', '-out', 'certs/cert.pem',
  '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1',
], { stdio: 'inherit' });
if (run.status !== 0) {
  process.exit(1);
}
console.log('Certificat créé : certs/cert.pem et certs/key.pem');
