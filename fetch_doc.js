const https = require('https');
const options = {
  hostname: 'fra.cloud.appwrite.io',
  path: '/v1/databases/69d8e2130010bd3fbf52/collections/stylists/documents',
  method: 'GET',
  headers: { 'X-Appwrite-Project': '699b4bcc001dba9897a1' }
};
const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data).documents.map(d => ({ name: d.businessName, img: d.image }) )));
});
req.on('error', e => console.error(e));
req.end();
