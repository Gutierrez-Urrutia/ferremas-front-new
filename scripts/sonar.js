const { spawnSync } = require('node:child_process');

const token = process.env.SONAR_TOKEN;
const hostUrl = process.env.SONAR_HOST_URL || 'http://localhost:9000';

if (!token) {
  console.error('SONAR_TOKEN no está definido. Exporta el token antes de ejecutar pnpm run sonar.');
  process.exit(1);
}

async function validateToken() {
  const validateUrl = new URL('/api/authentication/validate', hostUrl);
  const response = await fetch(validateUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.valid === true;
}

validateToken()
  .then((isValid) => {
    if (!isValid) {
      console.error(`El token definido en SONAR_TOKEN no es válido para ${hostUrl}. Genera un token nuevo en tu SonarQube local y vuelve a ejecutar pnpm run sonar.`);
      process.exit(1);
    }

    const result = spawnSync('sonar-scanner', [], {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    if (result.error) {
      console.error(result.error.message);
      process.exit(1);
    }

    process.exit(result.status ?? 1);
  })
  .catch((error) => {
    console.error(`No se pudo validar el token contra ${hostUrl}: ${error.message}`);
    process.exit(1);
  });
