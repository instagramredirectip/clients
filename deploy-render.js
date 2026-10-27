import https from 'https';

const RENDER_API_KEY = 'rnd_18PKQ1PuPaDOTLBkoY6fJspQGm6M';
const OWNER_ID = 'tea-d5g9m315pdvs73cggg6g';
const REPO_URL = 'https://github.com/instagramredirectip/clients';

const payload = JSON.stringify({
  type: 'static_site',
  name: 'atelier-valois-3d-rail',
  ownerId: OWNER_ID,
  repo: REPO_URL,
  branch: 'main',
  autoDeploy: 'yes',
  serviceDetails: {
    buildCommand: 'npm install && npm run build',
    publishPath: 'dist'
  }
});

const options = {
  hostname: 'api.render.com',
  path: '/v1/services',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RENDER_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Accept': 'application/json'
  }
};

console.log('Deploying to Render.io...');

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => (body += chunk));
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (res.statusCode === 201) {
        console.log('✅ Service created successfully on Render!');
        console.log('Service Name:', data.service.name);
        console.log('Live URL:', data.service.serviceDetails.url);
        console.log('Dashboard URL:', data.service.dashboardUrl);
      } else {
        console.error(`Status ${res.statusCode}:`, data.message || body);
      }
    } catch {
      console.log('Response:', body);
    }
  });
});

req.on('error', err => {
  console.error('Request failed:', err);
});

req.write(payload);
req.end();

