import fs from 'fs';
import https from 'https';
import app from './app.js';
import { env } from './config/env.js';
import { connectPostgres, sequelize } from './database/sequelize.js';
import { connectMongo, disconnectMongo } from './database/mongoose.js';

async function start() {
  try {
    await connectPostgres();
    await connectMongo();

    // HTTPS avec le certificat de "npm run cert"
    const certificate = {
      key: fs.readFileSync('certs/key.pem'),
      cert: fs.readFileSync('certs/cert.pem'),
    };
    const server = https.createServer(certificate, app);

    server.listen(env.port, () => {
      console.log(`Serveur lancé sur https://localhost:${env.port}`);
    });

    // coupe les connexions trop lentes ou abandonnées
    server.requestTimeout = 30000;
    server.headersTimeout = 10000;
    server.keepAliveTimeout = 5000;

    // Arrêt propre : on finit les requêtes en cours, puis on ferme les bases
    function shutdown() {
      server.close(async () => {
        await sequelize.close();
        await disconnectMongo();
        console.log('Serveur arrêté.');
        process.exit(0);
      });
    }
    process.on('SIGINT', shutdown); // Ctrl+C
    process.on('SIGTERM', shutdown); // arrêt envoyé par le serveur (systemd, Docker)
  } catch (error) {
    console.error('Impossible de démarrer :', error.message);
    process.exit(1);
  }
}

start();
