#!/usr/bin/env node

/**
 * Aurora Database Setup Script
 * 
 * This script helps initialize the Aurora PostgreSQL database schema
 * for the FirstProdFolio project.
 * 
 * Usage:
 *   node scripts/setup-aurora.js
 * 
 * Prerequisites:
 *   - AWS CLI configured with appropriate credentials
 *   - Aurora DSQL cluster created
 *   - Environment variables set in .env.local
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(60) + colors.reset);
  console.log(colors.bright + colors.cyan + title + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(60) + colors.reset + '\n');
}

function checkEnvVariables() {
  logSection('📋 Checking Environment Variables');
  
  const requiredVars = [
    'AWS_REGION',
    'AWS_RESOURCE_ARN',
    'PGHOST',
    'PGUSER',
    'PGDATABASE',
  ];
  
  const missing = [];
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log(`✓ ${varName}: ${process.env[varName]}`, colors.green);
    } else {
      missing.push(varName);
      log(`✗ ${varName}: NOT SET`, colors.red);
    }
  }
  
  if (missing.length > 0) {
    log('\n⚠️  Missing required environment variables:', colors.yellow);
    log('Please set these variables in your .env.local file', colors.yellow);
    log('See .env.example for reference', colors.yellow);
    process.exit(1);
  }
  
  log('\n✅ All required environment variables are set', colors.green);
}

function checkAwsCli() {
  logSection('🔧 Checking AWS CLI');
  
  try {
    execSync('aws --version', { stdio: 'pipe' });
    log('✓ AWS CLI is installed', colors.green);
  } catch (error) {
    log('✗ AWS CLI is not installed', colors.red);
    log('Please install AWS CLI: https://aws.amazon.com/cli/', colors.yellow);
    process.exit(1);
  }
}

function displayInfo() {
  logSection('ℹ️  Aurora DSQL Setup Information');
  
  log('This script will help you initialize your Aurora DSQL database.', colors.cyan);
  log('\nWhat this script does:', colors.bright);
  log('  1. Validates your environment configuration');
  log('  2. Checks AWS CLI availability');
  log('  3. Provides instructions for manual schema initialization');
  log('\nNote: Schema initialization must be done via AWS Console or AWS CLI');
  log('due to Aurora DSQL authentication requirements.', colors.yellow);
}

function provideInstructions() {
  logSection('📝 Manual Setup Instructions');
  
  const schemaPath = path.join(__dirname, 'init-aurora-schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    log('✗ Schema file not found: ' + schemaPath, colors.red);
    process.exit(1);
  }
  
  log('To initialize your Aurora DSQL database, follow these steps:\n', colors.cyan);
  
  log('1️⃣  Option 1: Using AWS Console', colors.bright);
  log('   a. Open the Aurora DSQL Console');
  log('   b. Navigate to your cluster');
  log('   c. Use the Query Editor');
  log('   d. Copy and paste the contents of scripts/init-aurora-schema.sql');
  log('   e. Execute the SQL script\n');
  
  log('2️⃣  Option 2: Using psql (if configured with IAM auth)', colors.bright);
  log('   psql -h ' + process.env.PGHOST + ' \\');
  log('        -U ' + process.env.PGUSER + ' \\');
  log('        -d ' + process.env.PGDATABASE + ' \\');
  log('        -f scripts/init-aurora-schema.sql\n');
  
  log('3️⃣  Option 3: Using AWS Data API (if enabled)', colors.bright);
  log('   aws dsql execute-statement \\');
  log('       --cluster-arn "' + process.env.AWS_RESOURCE_ARN + '" \\');
  log('       --database "' + process.env.PGDATABASE + '" \\');
  log('       --statement "$(cat scripts/init-aurora-schema.sql)"\n');
  
  log('Schema file location:', colors.bright);
  log('  ' + schemaPath, colors.cyan);
  
  log('\n✅ After running the schema, your database will be ready!', colors.green);
}

function testConnection() {
  logSection('🔌 Testing Database Connection');
  
  log('To test your database connection:', colors.cyan);
  log('  1. Ensure all environment variables are set in Vercel');
  log('  2. Deploy your application to Vercel');
  log('  3. Check the function logs for [Aurora] messages');
  log('  4. Test the API endpoints\n');
  
  log('Test endpoints:', colors.bright);
  log('  GET /api/public/about');
  log('  GET /api/public/photos');
  log('  GET /api/public/videos\n');
}

function main() {
  console.clear();
  
  log(colors.bright + colors.blue);
  log('╔════════════════════════════════════════════════════════╗');
  log('║                                                        ║');
  log('║        Aurora DSQL Database Setup Script              ║');
  log('║        FirstProdFolio Project                          ║');
  log('║                                                        ║');
  log('╚════════════════════════════════════════════════════════╝');
  log(colors.reset);
  
  try {
    // Load environment variables from .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      log('✓ Loaded environment variables from .env.local\n', colors.green);
    } else {
      log('⚠️  .env.local not found. Using system environment variables only.\n', colors.yellow);
    }
    
    displayInfo();
    checkEnvVariables();
    checkAwsCli();
    provideInstructions();
    testConnection();
    
    logSection('✨ Setup Complete');
    log('Your environment is configured and ready!', colors.green);
    log('Follow the instructions above to initialize your database schema.', colors.cyan);
    log('\nFor detailed migration guide, see: AURORA_MIGRATION_GUIDE.md\n', colors.blue);
    
  } catch (error) {
    log('\n❌ Setup failed:', colors.red);
    log(error.message, colors.red);
    process.exit(1);
  }
}

main();
