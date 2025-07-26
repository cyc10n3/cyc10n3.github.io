#!/usr/bin/env node
// Performance monitoring and optimization script

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Performance thresholds
const PERFORMANCE_BUDGETS = {
  // Core Web Vitals
  LCP: 2500,      // Largest Contentful Paint (ms)
  FID: 100,       // First Input Delay (ms)
  CLS: 0.1,       // Cumulative Layout Shift
  
  // Loading Performance
  FCP: 1800,      // First Contentful Paint (ms)
  TTI: 3800,      // Time to Interactive (ms)
  TBT: 300,       // Total Blocking Time (ms)
  
  // Bundle Sizes (bytes)
  totalJS: 500 * 1024,      // 500KB
  totalCSS: 100 * 1024,     // 100KB
  totalImages: 2 * 1024 * 1024, // 2MB
  totalFonts: 200 * 1024,   // 200KB
  
  // Individual file sizes
  maxJSChunk: 250 * 1024,   // 250KB
  maxCSSFile: 50 * 1024,    // 50KB
  maxImageFile: 500 * 1024, // 500KB
  
  // Network
  requests: 50,             // Max HTTP requests
  
  // Accessibility
  accessibilityScore: 95,   // Lighthouse accessibility score
  
  // SEO
  seoScore: 90             // Lighthouse SEO score
};

class PerformanceMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      passed: true,
      scores: {},
      budgets: {},
      recommendations: [],
      errors: []
    };
  }

  async runAnalysis() {
    console.log('🔍 Running performance analysis...\n');
    
    try {
      await this.analyzeBundleSizes();
      await this.runLighthouseAudit();
      await this.checkWebVitals();
      await this.analyzeNetworkRequests();
      await this.generateRecommendations();
      
      this.saveResults();
      this.displayResults();
      
      return this.results.passed;
    } catch (error) {
      console.error('❌ Performance analysis failed:', error.message);
      this.results.errors.push(error.message);
      this.results.passed = false;
      return false;
    }
  }

  async analyzeBundleSizes() {
    console.log('📦 Analyzing bundle sizes...');
    
    const distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) {
      throw new Error('Build directory not found. Run build first.');
    }

    const analysis = this.getBundleAnalysis(distDir);
    
    // Check against budgets
    this.checkBudget('totalJS', analysis.totalJS, PERFORMANCE_BUDGETS.totalJS);
    this.checkBudget('totalCSS', analysis.totalCSS, PERFORMANCE_BUDGETS.totalCSS);
    this.checkBudget('totalImages', analysis.totalImages, PERFORMANCE_BUDGETS.totalImages);
    this.checkBudget('totalFonts', analysis.totalFonts, PERFORMANCE_BUDGETS.totalFonts);
    
    // Check individual file sizes
    analysis.largeFiles.forEach(file => {
      if (file.type === 'js' && file.size > PERFORMANCE_BUDGETS.maxJSChunk) {
        this.addRecommendation(`Large JS chunk: ${file.name} (${this.formatBytes(file.size)}). Consider code splitting.`);
      }
      if (file.type === 'css' && file.size > PERFORMANCE_BUDGETS.maxCSSFile) {
        this.addRecommendation(`Large CSS file: ${file.name} (${this.formatBytes(file.size)}). Consider splitting critical CSS.`);
      }
      if (file.type === 'image' && file.size > PERFORMANCE_BUDGETS.maxImageFile) {
        this.addRecommendation(`Large image: ${file.name} (${this.formatBytes(file.size)}). Consider optimization.`);
      }
    });

    this.results.bundleAnalysis = analysis;
    console.log('✅ Bundle analysis completed\n');
  }

  getBundleAnalysis(distDir) {
    const analysis = {
      totalJS: 0,
      totalCSS: 0,
      totalImages: 0,
      totalFonts: 0,
      totalFiles: 0,
      largeFiles: []
    };

    const getAllFiles = (dir) => {
      const files = [];
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      });
      
      return files;
    };

    const allFiles = getAllFiles(distDir);
    
    allFiles.forEach(filePath => {
      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const relativePath = path.relative(distDir, filePath);
      
      analysis.totalFiles++;
      
      if (['.js', '.mjs'].includes(ext)) {
        analysis.totalJS += stat.size;
        if (stat.size > 50 * 1024) { // Files larger than 50KB
          analysis.largeFiles.push({
            name: relativePath,
            size: stat.size,
            type: 'js'
          });
        }
      } else if (ext === '.css') {
        analysis.totalCSS += stat.size;
        if (stat.size > 20 * 1024) { // Files larger than 20KB
          analysis.largeFiles.push({
            name: relativePath,
            size: stat.size,
            type: 'css'
          });
        }
      } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
        analysis.totalImages += stat.size;
        if (stat.size > 100 * 1024) { // Files larger than 100KB
          analysis.largeFiles.push({
            name: relativePath,
            size: stat.size,
            type: 'image'
          });
        }
      } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
        analysis.totalFonts += stat.size;
        if (stat.size > 50 * 1024) { // Files larger than 50KB
          analysis.largeFiles.push({
            name: relativePath,
            size: stat.size,
            type: 'font'
          });
        }
      }
    });

    return analysis;
  }

  async runLighthouseAudit() {
    console.log('🏠 Running Lighthouse audit...');
    
    try {
      // Check if lighthouse is available
      execSync('lighthouse --version', { stdio: 'ignore' });
      
      // Run lighthouse audit
      const lighthouseCmd = `lighthouse http://localhost:4173 --output=json --output-path=lighthouse-report.json --chrome-flags="--headless" --quiet`;
      execSync(lighthouseCmd, { stdio: 'ignore' });
      
      // Parse results
      const reportPath = path.join(process.cwd(), 'lighthouse-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        
        this.results.lighthouse = {
          performance: Math.round(report.lhr.categories.performance.score * 100),
          accessibility: Math.round(report.lhr.categories.accessibility.score * 100),
          bestPractices: Math.round(report.lhr.categories['best-practices'].score * 100),
          seo: Math.round(report.lhr.categories.seo.score * 100),
          pwa: report.lhr.categories.pwa ? Math.round(report.lhr.categories.pwa.score * 100) : null
        };
        
        // Extract Core Web Vitals
        const audits = report.lhr.audits;
        this.results.webVitals = {
          LCP: audits['largest-contentful-paint']?.numericValue || 0,
          FID: audits['max-potential-fid']?.numericValue || 0,
          CLS: audits['cumulative-layout-shift']?.numericValue || 0,
          FCP: audits['first-contentful-paint']?.numericValue || 0,
          TTI: audits['interactive']?.numericValue || 0,
          TBT: audits['total-blocking-time']?.numericValue || 0
        };
        
        // Check against budgets
        this.checkBudget('LCP', this.results.webVitals.LCP, PERFORMANCE_BUDGETS.LCP);
        this.checkBudget('FID', this.results.webVitals.FID, PERFORMANCE_BUDGETS.FID);
        this.checkBudget('CLS', this.results.webVitals.CLS, PERFORMANCE_BUDGETS.CLS);
        this.checkBudget('accessibilityScore', this.results.lighthouse.accessibility, PERFORMANCE_BUDGETS.accessibilityScore);
        this.checkBudget('seoScore', this.results.lighthouse.seo, PERFORMANCE_BUDGETS.seoScore);
        
        // Clean up report file
        fs.unlinkSync(reportPath);
      }
      
      console.log('✅ Lighthouse audit completed\n');
    } catch (error) {
      console.log('⚠️  Lighthouse not available, skipping audit\n');
      this.addRecommendation('Install Lighthouse CLI for comprehensive performance auditing: npm install -g lighthouse');
    }
  }

  async checkWebVitals() {
    if (!this.results.webVitals) {
      console.log('⚠️  Web Vitals data not available from Lighthouse\n');
      return;
    }

    console.log('📊 Checking Core Web Vitals...');
    
    const vitals = this.results.webVitals;
    
    // Generate recommendations based on Web Vitals
    if (vitals.LCP > PERFORMANCE_BUDGETS.LCP) {
      this.addRecommendation(`LCP is ${Math.round(vitals.LCP)}ms. Optimize largest contentful paint by improving server response times, optimizing images, and removing render-blocking resources.`);
    }
    
    if (vitals.FID > PERFORMANCE_BUDGETS.FID) {
      this.addRecommendation(`FID is ${Math.round(vitals.FID)}ms. Reduce first input delay by minimizing JavaScript execution time and removing non-critical third-party scripts.`);
    }
    
    if (vitals.CLS > PERFORMANCE_BUDGETS.CLS) {
      this.addRecommendation(`CLS is ${vitals.CLS.toFixed(3)}. Reduce cumulative layout shift by setting dimensions on images and videos, and avoiding inserting content above existing content.`);
    }
    
    console.log('✅ Web Vitals check completed\n');
  }

  async analyzeNetworkRequests() {
    console.log('🌐 Analyzing network requests...');
    
    // This would typically require running the app and monitoring network requests
    // For now, we'll estimate based on build output
    const distDir = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distDir, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Count script and link tags
      const scriptTags = (indexContent.match(/<script[^>]*src=/g) || []).length;
      const linkTags = (indexContent.match(/<link[^>]*href=/g) || []).length;
      const estimatedRequests = scriptTags + linkTags + 1; // +1 for HTML
      
      this.checkBudget('requests', estimatedRequests, PERFORMANCE_BUDGETS.requests);
      
      if (estimatedRequests > PERFORMANCE_BUDGETS.requests) {
        this.addRecommendation(`Estimated ${estimatedRequests} HTTP requests. Consider bundling resources and using HTTP/2 server push.`);
      }
    }
    
    console.log('✅ Network analysis completed\n');
  }

  async generateRecommendations() {
    console.log('💡 Generating optimization recommendations...');
    
    const analysis = this.results.bundleAnalysis;
    
    // Bundle size recommendations
    if (analysis && analysis.totalJS > PERFORMANCE_BUDGETS.totalJS * 0.8) {
      this.addRecommendation('JavaScript bundle is approaching size limit. Consider implementing code splitting and lazy loading.');
    }
    
    if (analysis && analysis.totalCSS > PERFORMANCE_BUDGETS.totalCSS * 0.8) {
      this.addRecommendation('CSS bundle is approaching size limit. Consider extracting critical CSS and loading non-critical CSS asynchronously.');
    }
    
    // Performance score recommendations
    if (this.results.lighthouse) {
      const perf = this.results.lighthouse.performance;
      if (perf < 90) {
        this.addRecommendation(`Performance score is ${perf}/100. Focus on optimizing Core Web Vitals and reducing bundle sizes.`);
      }
      
      const a11y = this.results.lighthouse.accessibility;
      if (a11y < PERFORMANCE_BUDGETS.accessibilityScore) {
        this.addRecommendation(`Accessibility score is ${a11y}/100. Review and fix accessibility issues to improve user experience.`);
      }
    }
    
    console.log('✅ Recommendations generated\n');
  }

  checkBudget(metric, actual, budget) {
    const passed = metric === 'CLS' ? actual <= budget : 
                  ['accessibilityScore', 'seoScore'].includes(metric) ? actual >= budget :
                  actual <= budget;
    
    this.results.budgets[metric] = {
      actual,
      budget,
      passed,
      percentage: metric === 'CLS' ? (actual / budget * 100) :
                 ['accessibilityScore', 'seoScore'].includes(metric) ? (actual / budget * 100) :
                 (actual / budget * 100)
    };
    
    if (!passed) {
      this.results.passed = false;
    }
  }

  addRecommendation(message) {
    this.results.recommendations.push(message);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  saveResults() {
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Performance report saved to: ${reportPath}`);
  }

  displayResults() {
    console.log('\n📈 Performance Analysis Results:');
    console.log('=' .repeat(50));
    
    // Overall status
    const status = this.results.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`Overall Status: ${status}\n`);
    
    // Bundle sizes
    if (this.results.bundleAnalysis) {
      console.log('📦 Bundle Sizes:');
      const analysis = this.results.bundleAnalysis;
      console.log(`  JavaScript: ${this.formatBytes(analysis.totalJS)}`);
      console.log(`  CSS: ${this.formatBytes(analysis.totalCSS)}`);
      console.log(`  Images: ${this.formatBytes(analysis.totalImages)}`);
      console.log(`  Fonts: ${this.formatBytes(analysis.totalFonts)}`);
      console.log(`  Total Files: ${analysis.totalFiles}\n`);
    }
    
    // Lighthouse scores
    if (this.results.lighthouse) {
      console.log('🏠 Lighthouse Scores:');
      const lh = this.results.lighthouse;
      console.log(`  Performance: ${lh.performance}/100`);
      console.log(`  Accessibility: ${lh.accessibility}/100`);
      console.log(`  Best Practices: ${lh.bestPractices}/100`);
      console.log(`  SEO: ${lh.seo}/100`);
      if (lh.pwa) console.log(`  PWA: ${lh.pwa}/100`);
      console.log();
    }
    
    // Core Web Vitals
    if (this.results.webVitals) {
      console.log('📊 Core Web Vitals:');
      const vitals = this.results.webVitals;
      console.log(`  LCP: ${Math.round(vitals.LCP)}ms`);
      console.log(`  FID: ${Math.round(vitals.FID)}ms`);
      console.log(`  CLS: ${vitals.CLS.toFixed(3)}`);
      console.log(`  FCP: ${Math.round(vitals.FCP)}ms`);
      console.log(`  TTI: ${Math.round(vitals.TTI)}ms`);
      console.log(`  TBT: ${Math.round(vitals.TBT)}ms\n`);
    }
    
    // Budget status
    console.log('🎯 Performance Budget Status:');
    Object.entries(this.results.budgets).forEach(([metric, data]) => {
      const status = data.passed ? '✅' : '❌';
      const percentage = data.percentage.toFixed(1);
      console.log(`  ${status} ${metric}: ${percentage}% of budget`);
    });
    console.log();
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('💡 Optimization Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
      console.log();
    }
    
    // Errors
    if (this.results.errors.length > 0) {
      console.log('❌ Errors:');
      this.results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
      console.log();
    }
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  
  monitor.runAnalysis()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('Performance monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceMonitor;