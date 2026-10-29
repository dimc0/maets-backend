# Maets – back-end

Maets, c'est une librairie de jeux vidéo. Ce dépôt contient le back-end du POC :

- un joueur crée un compte, se connecte et voit **sa librairie** de jeux ;
- il peut retirer un jeu de sa librairie et **enregistrer ses réglages** pour chaque jeu ;
- un **admin** gère le catalogue (ajouter, modifier, supprimer des jeux) et ajoute des jeux dans la librairie des joueurs (dans ce POC, tout est gratuit).

Les données sont réparties sur deux bases :

- **PostgreSQL** pour les comptes, les rôles, les éditeurs, les jeux et les librairies : ce sont des données bien structurées et liées entre elles ;
- **MongoDB** pour les réglages de chaque jeu, parce qu'ils n'ont pas la même forme d'un jeu à l'autre.

Le détail des choix (réglages du serveur, SQL ou NoSQL, sauvegardes, test de charge…) est dans l'annexe : [`docs/annexe.pdf`](docs/annexe.pdf).

---

## Sommaire

1. [Technologies](#1-technologies)
2. [Ce qu'il faut installer](#2-ce-quil-faut-installer)
3. [Installation](#3-installation)
4. [Lancer l'API](#4-lancer-lapi)
5. [Comptes de test](#5-comptes-de-test)
6. [Swagger](#6-swagger)
7. [Toutes les commandes](#7-toutes-les-commandes)
8. [Tests](#8-tests)
9. [Sauvegardes](#9-sauvegardes)

---

## 1. Technologies

| Outil | Version | Pour quoi faire |
|---|---|---|
| Node.js | 22.12 minimum | Faire tourner le serveur |
| Express | 5 | Les routes et les middlewares |
| PostgreSQL | 17 | La base relationnelle |
| Sequelize + sequelize-cli | 6 | Parler à PostgreSQL, migrations et seeders |
| MongoDB | 7 ou plus | La base de documents |
| Mongoose | 9 | Parler à MongoDB |
| jsonwebtoken, bcryptjs | 9, 3 | Les tokens JWT et le hachage des mots de passe |
| swagger-ui-express | 5 | La doc interactive de l'API |
| Faker | 10 | Les fausses données de test |
| Apache JMeter | 5.6.3 | Le test de charge (outil à part, cité dans le programme du module) |

**Pourquoi Express ?** C'est un POC : il faut une API qui marche vite, simple à faire évoluer et que n'importe qui dans l'équipe peut reprendre. Express est le framework Node le plus utilisé et le mieux documenté, il est léger (on n'ajoute que ce dont on a besoin) et il s'utilise sans souci avec Sequelize et Mongoose. Un framework plus lourd comme NestJS aurait ajouté beaucoup de structure pour pas grand-chose ici. Et depuis la version 5, Express renvoie tout seul les erreurs des fonctions `async` vers le gestionnaire d'erreurs, donc pas besoin de `try/catch` dans chaque contrôleur.

**Pourquoi Node 22.12 minimum ?** Les migrations et les seeders sont écrits avec `import` / `export`, et sequelize-cli ne sait les lire qu'à partir de Node 22.12. C'est aussi indiqué dans le `package.json` (`engines`).

---

## 2. Ce qu'il faut installer

Une seule fois par poste :

| Logiciel | Où le trouver | Remarque |
|---|---|---|
| **Visual Studio Code** | https://code.visualstudio.com/ | La config de l'équipe est fournie (voir plus bas) |
| **Node.js 22.12+** (LTS) | https://nodejs.org/ | Installe aussi `npm`. On vérifie avec `node -v` |
| **Git** | https://git-scm.com/ | Pour récupérer le projet. Il installe aussi OpenSSL, qui sert à créer le certificat HTTPS (`npm run cert` le trouve tout seul dans le dossier de Git) |
| **Java** et **JMeter 5.6.3** | https://www.java.com/ et https://jmeter.apache.org/download_jmeter.cgi | Seulement pour le test de charge (partie 8.2). Prendre `apache-jmeter-5.6.3.zip` dans *Binaries* et le dézipper, par exemple dans `C:\outils\` |

Pour les bases de données, il y a deux façons de faire :

- **Avec Docker (le plus simple)** : on installe juste **Docker Desktop** (https://www.docker.com/products/docker-desktop/) et une commande lance PostgreSQL et MongoDB, déjà configurés (étape 3.3 A).
- **Sans Docker** : on installe **PostgreSQL 17** (https://www.postgresql.org/download/, avec pgAdmin 4) et **MongoDB Community Server** (https://www.mongodb.com/try/download/community, en cochant « Install MongoD as a Service » et Compass). Voir l'étape 3.3 B.

### La config VS Code (dossier `.vscode/`)

Il suffit d'ouvrir le **dossier du projet** dans VS Code (*Fichier → Ouvrir le dossier*). Ces réglages ne s'appliquent qu'à ce projet, les réglages perso restent comme ils sont ailleurs.

- **`settings.json`** : thème sombre, icônes, indentation de 2 espaces, formatage à l'enregistrement, imports en `.js`, guillemets simples, terminal PowerShell. Rien à faire, c'est appliqué à l'ouverture.
- **`extensions.json`** : 9 extensions conseillées (français, icônes, `.env`, complétion des chemins et des paquets npm, PostgreSQL, MongoDB, client REST). VS Code propose de les installer à l'ouverture (sinon : onglet Extensions, filtre `@recommended`).
- **`launch.json`** : pour déboguer l'API ou les seeders. Onglet *Exécuter et déboguer* (`Ctrl+Maj+D`), choisir « Déboguer l'API », puis **F5**. On pose un point d'arrêt en cliquant à gauche d'un numéro de ligne.
- **`maets.code-snippets`** : des raccourcis de code. Dans un fichier `.js`, on tape `mctrl` (contrôleur), `mservice` (service), `mrepo` (repository), `mroute` (route protégée) ou `merr` (erreur), puis `Tab`.

On utilise le formateur intégré à VS Code, qui garde le style du projet. Prettier est déconseillé : sans config, il changerait les guillemets dans tout le code.

---

## 3. Installation

Toutes les commandes se tapent dans un terminal (PowerShell sous Windows), **à la racine du projet**. Le terminal intégré de VS Code (`Ctrl+ù`) s'ouvre directement au bon endroit.

> Sur un PC neuf, Windows PowerShell peut refuser `npm` avec le message « l'exécution de scripts est désactivée sur ce système ». Il suffit de lancer une fois `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, ou d'utiliser PowerShell 7 (https://aka.ms/powershell), qui n'a pas ce blocage.

### 3.1 Les dépendances

```powershell
npm install
```

Ça installe tout ce qui est dans `package.json` (dans `node_modules/`). Les versions exactes sont fixées par `package-lock.json`.

npm signale 2 vulnérabilités « moderate » : elles viennent du paquet `uuid` utilisé par Sequelize, dans une fonction que le projet n'utilise pas. Surtout, ne pas lancer `npm audit fix --force` : il remplacerait Sequelize 6 par la version 3 et casserait le projet.

### 3.2 Le fichier `.env`

```powershell
Copy-Item .env.example .env
```

Ensuite on ouvre `.env` et on remplace chaque `change-me` :

| Variable | À quoi elle sert |
|---|---|
| `PORT` | Le port de l'API (3000 par défaut) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` | La connexion à PostgreSQL |
| `MONGODB_URI` | L'adresse de MongoDB |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Le compte admin créé par les seeders |
| `SEED_USER_PASSWORD` | Le mot de passe commun des joueurs de démo |
| `JWT_SECRET` | La clé qui signe les tokens (une longue chaîne aléatoire) |
| `JMETER_HOME` | Le dossier de JMeter, seulement pour le test de charge (par exemple `C:\outils\apache-jmeter-5.6.3`) |

Pour générer un `JWT_SECRET` :

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> Le `.env` contient des secrets : il est dans le `.gitignore` et ne doit jamais être partagé.

### 3.3 A. Les bases avec Docker

Docker Desktop doit être lancé. Dans le `.env`, on met les ports des conteneurs :

```
DB_PORT=5433
MONGODB_URI=mongodb://127.0.0.1:27018/maets
```

Puis :

```powershell
docker compose up -d
```

La première fois, Docker télécharge les images. Ensuite il démarre les deux conteneurs décrits dans `docker-compose.yml` :

- `maets-postgres` (image `postgres:17-alpine`, port 5433) : la base et l'utilisateur sont créés tout seuls à partir de `DB_NAME`, `DB_USER` et `DB_PASS` ;
- `maets-mongo` (image `mongo:8`, port 27018) : la base `maets` est créée au premier enregistrement.

On a pris les ports 5433 et 27018 pour ne pas gêner un PostgreSQL ou un MongoDB déjà installé sur le poste. Les données sont gardées dans des volumes Docker (`pgdata`, `mongodata`), même quand on arrête les conteneurs.

| Commande | Ce qu'elle fait |
|---|---|
| `docker compose up -d` | Démarre les bases en arrière-plan |
| `docker compose ps` | Montre l'état des conteneurs (`healthy` = prêt) |
| `docker compose stop` | Arrête les bases (les données restent) |
| `docker compose logs -f` | Affiche les logs des bases |

Ensuite, on passe directement à l'étape 3.5.

### 3.3 B. Les bases installées sur le poste (sans Docker)

Avec le compte `postgres` (son mot de passe a été choisi à l'installation), on crée un utilisateur et une base rien que pour le projet. Le mot de passe doit être le même que `DB_PASS` :

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE USER maets WITH PASSWORD 'votre_mot_de_passe';" -c "CREATE DATABASE maets OWNER maets;"
```

On peut aussi le faire dans **pgAdmin 4** : clic droit sur *Login/Group Roles* → *Create* (nom `maets`, mot de passe, *Can login*), puis clic droit sur *Databases* → *Create* (nom `maets`, propriétaire `maets`).

L'utilisateur `maets` n'a des droits que sur sa base : l'application ne se connecte jamais avec le compte `postgres`. (Avec Docker, `maets` est l'administrateur du conteneur, mais ce conteneur ne contient que la base du projet.)

### 3.4 Vérifier MongoDB (seulement sans Docker)

Après l'installation, MongoDB tourne comme un service Windows. Dans **MongoDB Compass**, la connexion `mongodb://localhost:27017` doit marcher. La base `maets` sera créée au premier enregistrement.

### 3.5 Les tables et les données de test

```powershell
npm run db:migrate
```

Crée les 6 tables (à partir des migrations de `database/migrations/`).

```powershell
npm run db:seed
```

Ajoute les rôles, le compte admin et les données de démo (`database/seeders/`).

### 3.6 Le certificat HTTPS

```powershell
npm run cert
```

Crée un certificat **auto-signé** valable un an dans `certs/` (`cert.pem` et `key.pem`), avec OpenSSL. Le script ([`scripts/cert.js`](scripts/cert.js)) cherche OpenSSL dans le PATH, puis dans le dossier de Git, car Git l'installe sans l'ajouter au PATH. Sans ce certificat, l'API ne démarre pas.

> `certs/` contient une **clé privée** : il est dans le `.gitignore` et ne doit jamais être partagé. Chaque poste crée son propre certificat.

---

## 4. Lancer l'API

### En développement

```powershell
npm run dev
```

Le serveur redémarre tout seul à chaque modification. L'API répond **en HTTPS** sur https://localhost:3000/api (le HTTP simple ne marche pas).

Comme le certificat est auto-signé :
- dans le **navigateur**, la première fois, il y a un avertissement « connexion non privée » : *Paramètres avancés* puis *Continuer vers localhost* ;
- avec **PowerShell 7**, on ajoute `-SkipCertificateCheck` aux commandes `Invoke-RestMethod` (cette option n'existe pas dans Windows PowerShell 5.1 : utiliser `curl.exe`) ;
- avec **curl**, on ajoute `--cacert certs/cert.pem` (ou `-k`). Dans Windows PowerShell, il faut taper `curl.exe` : `curl` tout seul y est un raccourci vers `Invoke-WebRequest`.

En production, on prendrait un certificat d'une autorité reconnue (Let's Encrypt par exemple), et il n'y aurait plus d'avertissement.

### En production

```powershell
npm ci
```

Installe **exactement** les versions du `package-lock.json` (plus sûr que `npm install` sur un serveur).

```powershell
npm run db:migrate
```

On met dans `certs/` le certificat et la clé du serveur, puis :

```powershell
npm start
```

Lance le serveur, sans redémarrage automatique.

En production, on n'a besoin que des seeders des **rôles** et du **compte admin**, pas des données de démo :

```powershell
npx sequelize-cli db:seed --seed 20261026000001-roles.js
```

```powershell
npx sequelize-cli db:seed --seed 20261026000002-admin-user.js
```

Pour arrêter : `Ctrl+C`. Le serveur finit les requêtes en cours et ferme proprement les connexions aux bases.

---

## 5. Comptes de test

`npm run db:seed` crée :

| Compte | Email | Mot de passe | Rôles |
|---|---|---|---|
| Admin | valeur de `ADMIN_EMAIL` | valeur de `ADMIN_PASSWORD` | `user`, `admin` |
| 25 joueurs de démo | `joueur1@example.com` à `joueur25@example.com` | valeur de `SEED_USER_PASSWORD` | `user` |

Toutes les données de démo sont **inventées** par Faker. Les emails sont en `@example.com`, un domaine réservé aux exemples.

---

## 6. Swagger

Avec le serveur lancé, on ouvre **https://localhost:3000/api/docs** (accepter l'avertissement du certificat la première fois).

1. Ouvrir `POST /api/auth/login`, cliquer sur *Try it out*, mettre un email et un mot de passe, puis *Execute*.
2. Copier le `token` reçu.
3. Cliquer sur **Authorize** en haut et coller le token.
4. On peut alors tester toutes les routes protégées depuis la page.

La description complète de l'API est dans [`docs/openapi.json`](docs/openapi.json) (format OpenAPI 3).

---

## 7. Toutes les commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm install` | Installe les dépendances |
| `npm ci` | Installe les versions exactes du `package-lock.json` (production) |
| `npm run dev` | Lance l'API avec redémarrage automatique (développement) |
| `npm start` | Lance l'API (production) |
| `npm run db:migrate` | Crée les tables qui manquent |
| `npm run db:migrate:status` | Montre les migrations déjà passées ou non |
| `npm run db:migrate:undo` | Supprime toutes les tables |
| `npm run db:seed` | Ajoute les données de test |
| `npm run db:seed:undo` | Enlève les données de test |
| `npm run db:reset` | Repart de zéro : tables recréées et données de test remises |
| `npm run cert` | Crée le certificat HTTPS auto-signé dans `certs/` |
| `docker compose up -d` | Démarre PostgreSQL et MongoDB dans Docker |
| `docker compose stop` | Arrête les bases Docker (les données restent) |
| `npm run backup` | Sauvegarde les deux bases dans `backups/` (on garde les 7 dernières) |
| `npm run restore` | Restaure la dernière sauvegarde (ou celle qu'on donne en paramètre) |
| `npm run load-test` | Test de charge JMeter avec 10, 50 puis 100 joueurs (l'API doit tourner) |
| `npm test` | **Pas encore fait** : tests automatisés et rapport de couverture |

---

## 8. Tests

### 8.1 Tests automatisés

> **Pas encore fait** : tests automatisés (un test par route) et rapport de couverture, lancés avec `npm test`.

### 8.2 Test de charge (JMeter)

Il faut : Java et JMeter installés (partie 2), `JMETER_HOME` dans le `.env`, et les données de test (`npm run db:seed`).

Dans un premier terminal, on lance l'API :

```powershell
npm start
```

Dans un deuxième terminal :

```powershell
npm run load-test
```

Le script lance le plan [`load-test/maets.jmx`](load-test/maets.jmx) trois fois, avec **10, 50 puis 100 joueurs en même temps**, pendant 30 secondes à chaque fois (les joueurs arrivent petit à petit sur les 10 premières secondes). Chaque joueur virtuel :

1. se connecte une fois avec un compte de démo (`POST /api/auth/login`) et garde son token ;
2. puis enchaîne en boucle : la liste des jeux (`GET /api/games`), un jeu au hasard (`GET /api/games/:id`) et sa librairie avec son token (`GET /api/users/:userId/library`).

À la fin, on a :
- dans le terminal, un tableau avec le nombre de requêtes, les requêtes par seconde, le temps moyen, le p95 (95 % des requêtes vont plus vite que ce temps) et le taux d'erreurs ;
- dans `load-test/reports/<joueurs>/index.html`, le rapport complet de JMeter pour chaque palier, avec les graphiques.

Les résultats et leur analyse sont dans l'annexe (partie 5.3). On peut aussi ouvrir le plan dans l'interface de JMeter (`jmeter.bat`, puis *Fichier → Ouvrir*) pour le regarder ou le modifier.

> Le mot de passe des comptes de démo est lu dans le `.env` au lancement et passé à JMeter par un fichier temporaire, supprimé à la fin. Il n'est écrit ni dans le plan ni dans les rapports.

---

## 9. Sauvegardes

On sauvegarde les deux bases (celles de Docker) **dans la même commande**, l'une juste après l'autre, pour qu'elles restent cohérentes entre elles. Le plan complet et pourquoi on l'a fait comme ça sont dans l'annexe (partie 8).

### Sauvegarder

```powershell
npm run backup
```

Ça crée un dossier `backups/AAAA-MM-JJ_HH-MM/` avec :
- `postgres.dump` : toute la base PostgreSQL, compressée (fait avec `pg_dump`) ;
- `mongo.archive.gz` : toute la base MongoDB, en archive gzip (fait avec `mongodump`).

Les deux outils sont déjà dans les conteneurs. On garde seulement les **7 dernières sauvegardes**, les plus anciennes sont supprimées automatiquement.

> `backups/` contient les données des utilisateurs : il est exclu de Git et ne doit jamais être partagé.

### Restaurer

```powershell
npm run restore
```

Restaure la sauvegarde **la plus récente**. Pour en choisir une autre :

```powershell
npm run restore -- 2026-10-27_03-00
```

⚠️ Ça **remplace** les données actuelles des deux bases par celles de la sauvegarde.

### Sauvegarde automatique tous les jours à 3 h

On crée une tâche dans le Planificateur de tâches Windows (une seule fois), en mettant le bon chemin du projet :

```powershell
schtasks /Create /TN "Maets - sauvegarde quotidienne" /SC DAILY /ST 03:00 /TR "cmd /c \"cd /d C:\chemin\vers\backend && npm run backup\"" /F
```

| Commande | Ce qu'elle fait |
|---|---|
| `schtasks /Run /TN "Maets - sauvegarde quotidienne"` | Lance la sauvegarde tout de suite (pour tester) |
| `schtasks /Query /TN "Maets - sauvegarde quotidienne" /V /FO LIST` | Montre la prochaine exécution et le résultat de la dernière (`0` = OK) |
| `schtasks /Delete /TN "Maets - sauvegarde quotidienne" /F` | Supprime la tâche |

La tâche ne tourne que si le PC est allumé, branché sur secteur (par défaut, Windows ne lance pas les tâches planifiées sur batterie), la session ouverte et Docker Desktop lancé. Sur un serveur Linux, on ferait pareil avec une ligne `cron` : `0 3 * * * cd /chemin/vers/backend && npm run backup`.
