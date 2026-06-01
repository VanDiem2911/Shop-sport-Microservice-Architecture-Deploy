// test-gateway-limit.js
const http = require('http');

// =========================================================================
// 1. Cấu hình địa chỉ IP / Tên miền VPS đã deploy của bạn ở đây
// =========================================================================
const VPS_HOST = 'http://13.229.205.238.nip.io/'; // Thay bằng IP của VPS
const PORT = '8080';          // Cổng của Gateway Service

// =========================================================================
// 2. CHỌN ENDPOINT BẠN MUỐN TEST:
//    - 'products' : Test API Sản phẩm (Giới hạn tối đa 300 request/s - scale cho 3000 users)
//    - 'ai'       : Test API Trợ lý ảo AI (Giới hạn tối đa 20 request/s)
// =========================================================================
const TEST_ENDPOINT = 'products'; // Đổi thành 'ai' nếu muốn test AI chatbot

// Tự động làm sạch hostname để tránh lỗi Node.js http request
let cleanHost = VPS_HOST.trim();
if (cleanHost.startsWith('http://')) {
  cleanHost = cleanHost.substring(7);
} else if (cleanHost.startsWith('https://')) {
  cleanHost = cleanHost.substring(8);
}
const slashIndex = cleanHost.indexOf('/');
if (slashIndex !== -1) {
  cleanHost = cleanHost.substring(0, slashIndex);
}
const colonIndex = cleanHost.indexOf(':');
if (colonIndex !== -1) {
  cleanHost = cleanHost.substring(0, colonIndex);
}

// Cấu hình tham số request tương ứng với endpoint được chọn
let path = '/api/v1/products';
let method = 'GET';
let postData = '';
let totalRequests = 1000; // Tăng lên 1000 request để đánh sập giỏ token 300 của Products

if (TEST_ENDPOINT === 'ai') {
  path = '/api/v1/ai/chat';
  method = 'POST';
  postData = JSON.stringify({ message: 'chào' });
  totalRequests = 50; // Gửi đồng thời 50 request để vượt ngưỡng 20 của AI
}

const headers = {};
if (method === 'POST') {
  headers['Content-Type'] = 'application/json';
  headers['Content-Length'] = Buffer.byteLength(postData);
}

const options = {
  hostname: cleanHost,
  port: PORT,
  path: path,
  method: method,
  headers: headers
};

let completed = 0;
const results = {};

console.log(`Bắt đầu test API: [${method}] ${path}`);
console.log(`Đang gửi đồng thời ${totalRequests} request đến ${cleanHost}:${PORT}...`);

for (let i = 0; i < totalRequests; i++) {
  const req = http.request(options, (res) => {
    const status = res.statusCode;
    results[status] = (results[status] || 0) + 1;
    
    completed++;
    if (completed === totalRequests) {
      printSummary();
    }
  });

  req.on('error', (e) => {
    results['ERROR'] = (results['ERROR'] || 0) + 1;
    completed++;
    if (completed === totalRequests) {
      printSummary();
    }
  });

  if (method === 'POST') {
    req.write(postData);
  }
  req.end();
}

function printSummary() {
  console.log('\n==================================================');
  console.log(`KẾT QUẢ ĐO TẢI RATE LIMITER (Endpoint: ${path}):`);
  console.log('==================================================');
  for (const [status, count] of Object.entries(results)) {
    if (status === '200') {
      console.log(`   - HTTP 200 (Thành công): ${count} requests`);
    } else if (status === '429') {
      console.log(`   - HTTP 429 (Bị chặn/Too Many Requests): ${count} requests`);
    } else {
      console.log(`   - HTTP ${status}: ${count} requests`);
    }
  }
  console.log('==================================================');
}
