// Unified runner to start both Backend and Frontend with a single command
const { spawn } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log('  Starting Campus Lost & Found Portal (Full Stack)      ');
console.log('========================================================');
console.log('  Backend API  : http://localhost:5000');
console.log('  Frontend Web : http://localhost:5173');
console.log('========================================================\n');

// 1. Launch Backend (Express + MongoDB)
const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// 2. Launch Frontend (React + Vite)
const client = spawn('node', ['node_modules/vite/bin/vite.js'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

// Handle graceful shutdown on Ctrl + C
process.on('SIGINT', () => {
  console.log('\nShutting down Campus Lost & Found servers...');
  server.kill();
  client.kill();
  process.exit(0);
});
