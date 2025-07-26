#!/usr/bin/env node
// Deployment script for production builds

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Deployment configuration
const DEPLOY_CONFIG = {
  buildDir: 'dist',
  backupDir: 'backups',
  deploymentLog: 'deployment.log',
  environments: {
    staging: {
      name: 'staging',
      url: 'https://staging.wellheadequipment.com',
      branch: 'develop',
      requireTests: true,
      requirePerformanceCheck: true
    },
    production: {
      name: 'production',
      url: 'https://wellheadequipment.com',
      branch: 'main',
      requireTests: true,
      requirePerformanceCheck: true,
      requireManualApproval: true
    }
  }
};

class Deployer {
  constructor(environment = 'staging') {
    this.environment = environment;
    this.config = DEPLOY_CONFIG.environments[environment];
    this.startTime = new Date();
    
    if (!this.config) {
      throw new Error(`Unknown environment: ${environment}`);
    }
    
    console.log(`🚀 Starting deployment to ${this.config.name}...`);
    this.log(`Deployment started for ${this.config.name} environment`);
  }

  async deploy() {
    try {
      await this.preDeploymentChecks();
      await this.runTests();
      await this.buildApplication();
      await this.runPerformanceChecks();
      await this.createBackup();
      await this.deployToEnvironment();
      await this.postDeploymentValidation();
      await this.notifySuccess();
      
      console.log('🎉 Deployment completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      await this.rollback();
      await this.notifyFailure(error);
      return false;
    }
  }

  async preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check Git status
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim()) {
        throw new Error('Working directory is not clean. Commit or stash changes.');
      }
    } catch (error) {
      throw new Error('Git status check failed: ' + error.message);
    }
    
    // Check current branch
    try {
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      if (currentBranch !== this.config.branch) {
        throw new Error(`Expected branch ${this.config.branch}, but on ${currentBranch}`);
      }
    } catch (error) {
      throw new Error('Branch check failed: ' + error.message);
    }
    
    // Check for required environment variables
    const requiredEnvVars = [
      'VITE_API_BASE_URL',
      'VITE_SITE_URL'
    ];
    
    const envFile = `.env.${this.environment}`;
    if (!fs.existsSync(envFile)) {
      throw new Error(`Environment file ${envFile} not found`);
    }
    
    // Verify Node.js and npm versions
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      
      console.log(`  Node.js: ${nodeVersion}`);
      console.log(`  npm: ${npmVersion}`);
      
      this.log(`Node.js version: ${nodeVersion}, npm version: ${npmVersion}`);
    } catch (error) {
      throw new Error('Failed to check Node.js/npm versions');
    }
    
    console.log('✅ Pre-deployment checks passed\n');
  }

  async runTests() {
    if (!this.config.requireTests) {
      console.log('⏭️  Skipping tests (not required for this environment)\n');
      return;
    }
    
    console.log('🧪 Running test suite...');
    
    try {
      // Run unit tests
      console.log('  Running unit tests...');
      execSync('npm run test:ci', { stdio: 'inherit' });
      
      // Run E2E tests
      console.log('  Running E2E tests...');
      execSync('npm run test:e2e', { stdio: 'inherit' });
      
      console.log('✅ All tests passed\n');
      this.log('All tests passed successfully');
    } catch (error) {
      throw new Error('Tests failed. Deployment aborted.');
    }
  }

  async buildApplication() {
    console.log('🔨 Building application...');
    
    try {
      // Clean previous build
      if (fs.existsSync(DEPLOY_CONFIG.buildDir)) {
        fs.rmSync(DEPLOY_CONFIG.buildDir, { recursive: true, force: true });
      }
      
      // Run optimized production build
      execSync('npm run build:production', { stdio: 'inherit' });
      
      // Verify build output
      if (!fs.existsSync(DEPLOY_CONFIG.buildDir)) {
        throw new Error('Build directory not created');
      }
      
      const buildFiles = fs.readdirSync(DEPLOY_CONFIG.buildDir);
      if (buildFiles.length === 0) {
        throw new Error('Build directory is empty');
      }
      
      console.log('✅ Application built successfully\n');
      this.log('Application build completed');
    } catch (error) {
      throw new Error('Build failed: ' + error.message);
    }
  }

  async runPerformanceChecks() {
    if (!this.config.requirePerformanceCheck) {
      console.log('⏭️  Skipping performance checks (not required for this environment)\n');
      return;
    }
    
    console.log('📊 Running performance checks...');
    
    try {
      // Start preview server for testing
      const previewProcess = execSync('npm run preview &', { stdio: 'pipe' });
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Run performance monitoring
      execSync('npm run build:performance', { stdio: 'inherit' });
      
      // Kill preview server
      try {
        execSync('pkill -f "vite preview"', { stdio: 'ignore' });
      } catch (error) {
        // Ignore errors when killing process
      }
      
      console.log('✅ Performance checks passed\n');
      this.log('Performance checks completed successfully');
    } catch (error) {
      throw new Error('Performance checks failed: ' + error.message);
    }
  }

  async createBackup() {
    console.log('💾 Creating backup...');
    
    try {
      // Create backup directory if it doesn't exist
      if (!fs.existsSync(DEPLOY_CONFIG.backupDir)) {
        fs.mkdirSync(DEPLOY_CONFIG.backupDir, { recursive: true });
      }
      
      // Create backup with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${this.environment}-${timestamp}`;
      const backupPath = path.join(DEPLOY_CONFIG.backupDir, backupName);
      
      // Copy current build to backup (if exists)
      if (fs.existsSync(DEPLOY_CONFIG.buildDir)) {
        execSync(`cp -r ${DEPLOY_CONFIG.buildDir} ${backupPath}`, { stdio: 'pipe' });
        console.log(`  Backup created: ${backupPath}`);
        this.log(`Backup created: ${backupPath}`);
      }
      
      // Clean old backups (keep last 5)
      const backups = fs.readdirSync(DEPLOY_CONFIG.backupDir)
        .filter(name => name.startsWith(`backup-${this.environment}-`))
        .sort()
        .reverse();
      
      if (backups.length > 5) {
        const oldBackups = backups.slice(5);
        oldBackups.forEach(backup => {
          const backupPath = path.join(DEPLOY_CONFIG.backupDir, backup);
          fs.rmSync(backupPath, { recursive: true, force: true });
          console.log(`  Removed old backup: ${backup}`);
        });
      }
      
      console.log('✅ Backup completed\n');
    } catch (error) {
      console.warn('⚠️  Backup failed (continuing deployment):', error.message);
    }
  }

  async deployToEnvironment() {
    console.log(`🚀 Deploying to ${this.config.name}...`);
    
    if (this.config.requireManualApproval) {
      console.log('⏸️  Manual approval required for production deployment.');
      console.log('   Please review the build and confirm deployment.');
      
      // In a real scenario, this would integrate with a deployment system
      // For now, we'll simulate the approval
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const approved = await new Promise(resolve => {
        rl.question('Proceed with deployment? (y/N): ', answer => {
          rl.close();
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
      });
      
      if (!approved) {
        throw new Error('Deployment cancelled by user');
      }
    }
    
    try {
      // This is where you would integrate with your hosting provider
      // Examples for different platforms:
      
      if (process.env.DEPLOY_TARGET === 'netlify') {
        await this.deployToNetlify();
      } else if (process.env.DEPLOY_TARGET === 'vercel') {
        await this.deployToVercel();
      } else if (process.env.DEPLOY_TARGET === 'aws') {
        await this.deployToAWS();
      } else if (process.env.DEPLOY_TARGET === 'azure') {
        await this.deployToAzure();
      } else {
        // Default: copy to deployment directory
        await this.deployToDirectory();
      }
      
      console.log('✅ Deployment completed\n');
      this.log(`Deployment to ${this.config.name} completed successfully`);
    } catch (error) {
      throw new Error('Deployment failed: ' + error.message);
    }
  }

  async deployToNetlify() {
    console.log('  Deploying to Netlify...');
    
    // Check if Netlify CLI is available
    try {
      execSync('netlify --version', { stdio: 'ignore' });
    } catch (error) {
      throw new Error('Netlify CLI not found. Install with: npm install -g netlify-cli');
    }
    
    // Deploy to Netlify
    const deployCmd = this.environment === 'production' 
      ? 'netlify deploy --prod --dir=dist'
      : 'netlify deploy --dir=dist';
    
    execSync(deployCmd, { stdio: 'inherit' });
  }

  async deployToVercel() {
    console.log('  Deploying to Vercel...');
    
    // Check if Vercel CLI is available
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch (error) {
      throw new Error('Vercel CLI not found. Install with: npm install -g vercel');
    }
    
    // Deploy to Vercel
    const deployCmd = this.environment === 'production' 
      ? 'vercel --prod'
      : 'vercel';
    
    execSync(deployCmd, { stdio: 'inherit' });
  }

  async deployToAWS() {
    console.log('  Deploying to AWS S3...');
    
    // This would use AWS CLI or SDK
    // Example implementation would sync to S3 bucket
    const bucketName = process.env.AWS_S3_BUCKET;
    if (!bucketName) {
      throw new Error('AWS_S3_BUCKET environment variable not set');
    }
    
    execSync(`aws s3 sync ${DEPLOY_CONFIG.buildDir} s3://${bucketName} --delete`, { stdio: 'inherit' });
    
    // Invalidate CloudFront cache if configured
    const distributionId = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID;
    if (distributionId) {
      execSync(`aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*"`, { stdio: 'inherit' });
    }
  }

  async deployToAzure() {
    console.log('  Deploying to Azure Static Web Apps...');
    
    // This would use Azure CLI
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP;
    const appName = process.env.AZURE_APP_NAME;
    
    if (!resourceGroup || !appName) {
      throw new Error('Azure configuration missing. Set AZURE_RESOURCE_GROUP and AZURE_APP_NAME');
    }
    
    execSync(`az staticwebapp deploy --name ${appName} --resource-group ${resourceGroup} --app-location ${DEPLOY_CONFIG.buildDir}`, { stdio: 'inherit' });
  }

  async deployToDirectory() {
    console.log('  Copying to deployment directory...');
    
    const deployDir = process.env.DEPLOY_DIRECTORY || '/var/www/html';
    
    if (!fs.existsSync(deployDir)) {
      throw new Error(`Deployment directory does not exist: ${deployDir}`);
    }
    
    // Copy build files to deployment directory
    execSync(`cp -r ${DEPLOY_CONFIG.buildDir}/* ${deployDir}/`, { stdio: 'pipe' });
  }

  async postDeploymentValidation() {
    console.log('🔍 Running post-deployment validation...');
    
    try {
      // Wait for deployment to propagate
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check if site is accessible
      const url = this.config.url;
      console.log(`  Checking ${url}...`);
      
      // Simple HTTP check (in production, you'd use a more robust health check)
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        console.log('  ✅ Site is accessible');
      } catch (error) {
        throw new Error(`Site health check failed: ${error.message}`);
      }
      
      // Check critical pages
      const criticalPages = ['/', '/about', '/products', '/services', '/contact'];
      for (const page of criticalPages) {
        try {
          const pageUrl = `${url}${page}`;
          const response = await fetch(pageUrl);
          if (!response.ok) {
            console.warn(`  ⚠️  Warning: ${page} returned ${response.status}`);
          } else {
            console.log(`  ✅ ${page} is accessible`);
          }
        } catch (error) {
          console.warn(`  ⚠️  Warning: Failed to check ${page}: ${error.message}`);
        }
      }
      
      console.log('✅ Post-deployment validation completed\n');
      this.log('Post-deployment validation completed successfully');
    } catch (error) {
      throw new Error('Post-deployment validation failed: ' + error.message);
    }
  }

  async rollback() {
    console.log('🔄 Attempting rollback...');
    
    try {
      // Find the most recent backup
      if (!fs.existsSync(DEPLOY_CONFIG.backupDir)) {
        console.log('  No backups available for rollback');
        return;
      }
      
      const backups = fs.readdirSync(DEPLOY_CONFIG.backupDir)
        .filter(name => name.startsWith(`backup-${this.environment}-`))
        .sort()
        .reverse();
      
      if (backups.length === 0) {
        console.log('  No backups available for rollback');
        return;
      }
      
      const latestBackup = backups[0];
      const backupPath = path.join(DEPLOY_CONFIG.backupDir, latestBackup);
      
      console.log(`  Rolling back to: ${latestBackup}`);
      
      // Restore from backup
      if (fs.existsSync(DEPLOY_CONFIG.buildDir)) {
        fs.rmSync(DEPLOY_CONFIG.buildDir, { recursive: true, force: true });
      }
      
      execSync(`cp -r ${backupPath} ${DEPLOY_CONFIG.buildDir}`, { stdio: 'pipe' });
      
      // Redeploy the backup
      await this.deployToEnvironment();
      
      console.log('✅ Rollback completed');
      this.log(`Rollback completed using backup: ${latestBackup}`);
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      this.log(`Rollback failed: ${error.message}`);
    }
  }

  async notifySuccess() {
    const duration = Math.round((new Date() - this.startTime) / 1000);
    const message = `✅ Deployment to ${this.config.name} completed successfully in ${duration}s`;
    
    console.log(message);
    this.log(message);
    
    // In production, you would send notifications via:
    // - Slack webhook
    // - Email
    // - Discord webhook
    // - Microsoft Teams
    // - etc.
  }

  async notifyFailure(error) {
    const duration = Math.round((new Date() - this.startTime) / 1000);
    const message = `❌ Deployment to ${this.config.name} failed after ${duration}s: ${error.message}`;
    
    console.error(message);
    this.log(message);
    
    // Send failure notifications
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(DEPLOY_CONFIG.deploymentLog, logEntry);
  }
}

// CLI interface
if (require.main === module) {
  const environment = process.argv[2] || 'staging';
  
  if (!DEPLOY_CONFIG.environments[environment]) {
    console.error(`❌ Unknown environment: ${environment}`);
    console.log('Available environments:', Object.keys(DEPLOY_CONFIG.environments).join(', '));
    process.exit(1);
  }
  
  const deployer = new Deployer(environment);
  
  deployer.deploy()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Deployment script error:', error);
      process.exit(1);
    });
}

module.exports = Deployer;