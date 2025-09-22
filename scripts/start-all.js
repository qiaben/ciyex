#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Cross-platform command detection
function getCommand(baseCommand) {
  if (os.platform() === 'win32') {
    switch (baseCommand) {
      case 'npm': return 'npm.cmd';
      case 'pnpm': return 'pnpm.cmd';
      case './gradlew': return 'gradlew.bat';
      default: return baseCommand;
    }
  }
  return baseCommand;
}

const services = [
  {
    name: 'Spring Boot Backend',
    command: getCommand('./gradlew'),
    args: ['bootRun'],
    cwd: path.join(__dirname, '..')
  },
  {
    name: 'EHR UI',
    command: getCommand('pnpm'),
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '..', 'ciyex-ehr-ui')
  },
  {
    name: 'Portal UI',
    command: getCommand('npm'),
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '..', 'ciyex-portal-ui'),
    env: { ...process.env, PORT: '3001' }
  },
  {
    name: 'Admin UI',
    command: getCommand('npm'),
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '..', 'ciyex-admin-ui'),
    env: { ...process.env, PORT: '3002' }
  }
];

console.log('Starting all services...\n');

const processes = [];

services.forEach(service => {
  console.log(`Starting ${service.name}...`);
  
  const proc = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: service.env || process.env,
    stdio: 'inherit'
  });

  proc.on('error', (err) => {
    console.error(`Failed to start ${service.name}:`, err);
  });

  proc.on('close', (code) => {
    console.log(`${service.name} exited with code ${code}`);
  });

  processes.push(proc);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down all services...');
  processes.forEach(proc => {
    proc.kill('SIGINT');
  });
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down all services...');
  processes.forEach(proc => {
    proc.kill('SIGTERM');
  });
  process.exit(0);
});
