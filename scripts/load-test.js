// Test de charge avec JMeter (le plan est dans load-test/maets.jmx)
// Il faut que l'API tourne (npm start), puis : npm run load-test
// Ça fait un rapport HTML par palier dans load-test/reports/<joueurs>/index.html
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const PALIERS = [10, 50, 100]; // joueurs en même temps
const DURATION = 30; // en secondes, pour chaque palier
const REPORT_DIR = path.join('load-test', 'reports');

const jmeter = path.join(process.env.JMETER_HOME, 'bin', 'jmeter.bat');
if (!fs.existsSync(jmeter)) {
  console.error(`JMeter introuvable (${jmeter}), vérifie JMETER_HOME dans le .env`);
  process.exit(1);
}

// Le mot de passe passe par un fichier temporaire et pas par la ligne de commande :
// comme ça il n'apparaît pas dans la liste des processus.
// Les \ sont doublés car JMeter les lit comme des caractères spéciaux dans un .properties
fs.mkdirSync(REPORT_DIR, { recursive: true });
const secretFile = path.join(REPORT_DIR, 'secret.properties');
fs.writeFileSync(secretFile, `password=${process.env.SEED_USER_PASSWORD.replaceAll('\\', '\\\\')}\n`);

const summary = [];
for (const users of PALIERS) {
  const folder = path.join(REPORT_DIR, String(users));
  const results = path.join(REPORT_DIR, `${users}.jtl`);
  // JMeter veut un dossier de rapport qui n'existe pas encore
  fs.rmSync(folder, { recursive: true, force: true });
  fs.rmSync(results, { force: true });

  console.log(`Palier : ${users} joueurs pendant ${DURATION} s...`);
  // sous Windows, jmeter.bat ne se lance que via le shell
  const command = `"${jmeter}" -n -t load-test/maets.jmx -q ${secretFile} -l ${results} -j ${path.join(REPORT_DIR, 'jmeter.log')} -e -o ${folder}`
    + ` -Jusers=${users} -Jrampup=10 -Jduration=${DURATION} -Jport=${process.env.PORT || 3000}`;
  const run = spawnSync(command, { shell: true, stdio: 'inherit' });
  if (run.status !== 0) {
    fs.rmSync(secretFile);
    console.error(`JMeter a planté au palier ${users}`);
    process.exit(1);
  }

  // JMeter génère statistics.json en même temps que le rapport
  const stats = JSON.parse(fs.readFileSync(path.join(folder, 'statistics.json'), 'utf8'));
  for (const name of Object.keys(stats)) {
    const s = stats[name];
    summary.push({
      joueurs: users,
      requête: name,
      nombre: s.sampleCount,
      'req/s': Math.round(s.throughput),
      'moyenne (ms)': Math.round(s.meanResTime),
      'p95 (ms)': Math.round(s.pct2ResTime),
      'erreurs (%)': s.errorPct,
    });
  }
}

fs.rmSync(secretFile);
console.table(summary);
