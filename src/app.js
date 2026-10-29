import fs from 'fs';
import express from 'express';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Pas de listen() ici, c'est server.js qui démarre (les tests pourront importer l'app)
const app = express();

app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: '100kb' }));

// Sans corps JSON, req.body est undefined et les services planteraient.
// Avec un objet vide, ils renvoient juste un 400
app.use((req, res, next) => {
  if (req.body === undefined) {
    req.body = {};
  }
  next();
});

// Swagger : https://localhost:3000/api/docs
const openapi = JSON.parse(fs.readFileSync('docs/openapi.json', 'utf8'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.use('/api', routes);

// à laisser après les routes
app.use(notFound);
app.use(errorHandler);

export default app;
