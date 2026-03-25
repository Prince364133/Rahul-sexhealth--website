const http = require('http');

const data = JSON.stringify({
  name: "Final Verification Order",
  phone: "9123456780",
  location: "45 Test Lane, Mumbai",
  pincode: "400001",
  consent: true,
  page_source: "offer",
  browser: "Mozilla/5.0 Node Test",
  platform: "Win32",
  screen_resolution: "1920x1080",
  language: "en-US",
  timezone: "Asia/Kolkata",
  referrer: "http://localhost:4200",
  pack_name: "2 Months Course",
  pack_price: "1499"
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/leads',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', body);
  });
});

req.on('error', e => console.error('ERROR:', e.message));
req.write(data);
req.end();
