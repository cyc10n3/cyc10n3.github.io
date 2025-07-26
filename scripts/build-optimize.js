#!/usr/bin/env node
// Build optimization script for production builds

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { gzipSync } = require('zlib');

console.log('🚀 Starting production build optimization...\n');

// Build configuration
const BUILD_CONFIG = {
  distDir: 'dist',
  assetsDir: 'dist/assets',
  reportFile: 'build-report.json',
  maxChunkSize: 1024 * 1024, // 1MB
  maxAssetSize: 512 * 1024,  // 512KB
  compressionThreshold: 1024 // 1KB
};

// Utility functions
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileSize = (filePath) => {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
};

const getGzipSize = (filePath) => {
  try {
    const content = fs.readFileSync(filePath);
    return gzipSync(content).length;
  } catch (error) {
    return 0;
  }
};

// Clean previous build
const cleanBuild = () => {
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync(BUILD_CONFIG.distDir)) {
    fs.rmSync(BUILD_CONFIG.distDir, { recursive: true, force: true });
  }
  console.log('✅ Build directory cleaned\n');
};

// Run the build
const runBuild = () => {
  console.log('🔨 Running production build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
};

// Analyze build output
const analyzeBuild = () => {
  console.log('📊 Analyzing build output...\n');
  
  const analysis = {
    timestamp: new Date().toISOString(),
    totalSize: 0,
    totalGzipSize: 0,
    files: [],
    chunks: [],
    assets: [],
    warnings: [],
    recommendations: []
  };

  // Recursively get all files
  const getAllFiles = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  };

  const allFiles = getAllFiles(BUILD_CONFIG.distDir);
  
  allFiles.forEach(filePath => {
    const relativePath = path.relative(BUILD_CONFIG.distDir, filePath);
    const size = getFileSize(filePath);
    const gzipSize = getGzipSize(filePath);
    const ext = path.extname(filePath);
    
    const fileInfo = {
      path: relativePath,
      size,
      gzipSize,
      compression: size > 0 ? ((size - gzipSize) / size * 100).toFixed(1) : 0,
      type: getFileType(ext)
    };
    
    analysis.files.push(fileInfo);
    analysis.totalSize += size;
    analysis.totalGzipSize += gzipSize;
    
    // Categorize files
    if (relativePath.includes('assets/js/') && ext === '.js') {
      analysis.chunks.push(fileInfo);
      
      // Check chunk size warnings
      if (size > BUILD_CONFIG.maxChunkSize) {
        analysis.warnings.push({
          type: 'large-chunk',
          file: relativePath,
          size: formatBytes(size),
          message: `Chunk size exceeds ${formatBytes(BUILD_CONFIG.maxChunkSize)}`
        });
      }
    } else if (relativePath.includes('assets/')) {
      analysis.assets.push(fileInfo);
      
      // Check asset size warnings
      if (size > BUILD_CONFIG.maxAssetSize && !['js', 'css'].includes(ext.slice(1))) {
        analysis.warnings.push({
          type: 'large-asset',
          file: relativePath,
          size: formatBytes(size),
          message: `Asset size exceeds ${formatBytes(BUILD_CONFIG.maxAssetSize)}`
        });
      }
    }
  });

  // Generate recommendations
  generateRecommendations(analysis);
  
  // Display results
  displayAnalysis(analysis);
  
  // Save report
  fs.writeFileSync(
    BUILD_CONFIG.reportFile,
    JSON.stringify(analysis, null, 2)
  );
  
  return analysis;
};

const getFileType = (ext) => {
  const types = {
    '.js': 'JavaScript',
    '.css': 'CSS',
    '.html': 'HTML',
    '.png': 'Image',
    '.jpg': 'Image',
    '.jpeg': 'Image',
    '.svg': 'Image',
    '.webp': 'Image',
    '.avif': 'Image',
    '.woff': 'Font',
    '.woff2': 'Font',
    '.ttf': 'Font',
    '.eot': 'Font'
  };
  return types[ext] || 'Other';
};

const generateRecommendations = (analysis) => {
  // Check for optimization opportunities
  const jsFiles = analysis.chunks.filter(f => f.path.endsWith('.js'));
  const cssFiles = analysis.files.filter(f => f.path.endsWith('.css'));
  const imageFiles = analysis.assets.filter(f => f.type === 'Image');
  
  // JavaScript recommendations
  const totalJsSize = jsFiles.reduce((sum, f) => sum + f.size, 0);
  if (totalJsSize > 500 * 1024) {
    analysis.recommendations.push({
      type: 'js-optimization',
      message: `Total JavaScript size is ${formatBytes(totalJsSize)}. Consider code splitting or removing unused dependencies.`
    });
  }
  
  // CSS recommendations
  const totalCssSize = cssFiles.reduce((sum, f) => sum + f.size, 0);
  if (totalCssSize > 100 * 1024) {
    analysis.recommendations.push({
      type: 'css-optimization',
      message: `Total CSS size is ${formatBytes(totalCssSize)}. Consider removing unused CSS or splitting critical CSS.`
    });
  }
  
  // Image recommendations
  const unoptimizedImages = imageFiles.filter(f => 
    !f.path.includes('.webp') && !f.path.includes('.avif') && f.size > 50 * 1024
  );
  
  if (unoptimizedImages.length > 0) {
    analysis.recommendations.push({
      type: 'image-optimization',
      message: `${unoptimizedImages.length} images could be optimized with modern formats (WebP/AVIF).`
    });
  }
  
  // Compression recommendations
  const poorlyCompressed = analysis.files.filter(f => 
    f.size > BUILD_CONFIG.compressionThreshold && parseFloat(f.compression) < 20
  );
  
  if (poorlyCompressed.length > 0) {
    analysis.recommendations.push({
      type: 'compression',
      message: `${poorlyCompressed.length} files have poor compression ratios. Consider enabling gzip/brotli compression.`
    });
  }
};

const displayAnalysis = (analysis) => {
  console.log('📈 Build Analysis Results:');
  console.log('=' .repeat(50));
  console.log(`Total Size: ${formatBytes(analysis.totalSize)}`);
  console.log(`Gzipped Size: ${formatBytes(analysis.totalGzipSize)}`);
  console.log(`Compression: ${((analysis.totalSize - analysis.totalGzipSize) / analysis.totalSize * 100).toFixed(1)}%`);
  console.log(`Files: ${analysis.files.length}`);
  console.log();

  // Display chunks
  if (analysis.chunks.length > 0) {
    console.log('📦 JavaScript Chunks:');
    analysis.chunks
      .sort((a, b) => b.size - a.size)
      .forEach(chunk => {
        const status = chunk.size > BUILD_CONFIG.maxChunkSize ? '⚠️ ' : '✅ ';
        console.log(`  ${status}${chunk.path}: ${formatBytes(chunk.size)} (${formatBytes(chunk.gzipSize)} gzipped)`);
      });
    console.log();
  }

  // Display large assets
  const largeAssets = analysis.assets
    .filter(asset => asset.size > 100 * 1024)
    .sort((a, b) => b.size - a.size);
    
  if (largeAssets.length > 0) {
    console.log('📁 Large Assets:');
    largeAssets.forEach(asset => {
      const status = asset.size > BUILD_CONFIG.maxAssetSize ? '⚠️ ' : '✅ ';
      console.log(`  ${status}${asset.path}: ${formatBytes(asset.size)} (${asset.type})`);
    });
    console.log();
  }

  // Display warnings
  if (analysis.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    analysis.warnings.forEach(warning => {
      console.log(`  • ${warning.message} (${warning.file})`);
    });
    console.log();
  }

  // Display recommendations
  if (analysis.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    analysis.recommendations.forEach(rec => {
      console.log(`  • ${rec.message}`);
    });
    console.log();
  }

  console.log(`📄 Detailed report saved to: ${BUILD_CONFIG.reportFile}`);
};

// Generate performance budget report
const checkPerformanceBudget = (analysis) => {
  console.log('🎯 Checking Performance Budget...\n');
  
  const budget = {
    totalSize: 2 * 1024 * 1024,    // 2MB total
    jsSize: 500 * 1024,           // 500KB JS
    cssSize: 100 * 1024,          // 100KB CSS
    imageSize: 1 * 1024 * 1024,   // 1MB images
    fontSize: 200 * 1024          // 200KB fonts
  };

  const actual = {
    totalSize: analysis.totalSize,
    jsSize: analysis.chunks.reduce((sum, f) => sum + f.size, 0),
    cssSize: analysis.files.filter(f => f.path.endsWith('.css')).reduce((sum, f) => sum + f.size, 0),
    imageSize: analysis.assets.filter(f => f.type === 'Image').reduce((sum, f) => sum + f.size, 0),
    fontSize: analysis.assets.filter(f => f.type === 'Font').reduce((sum, f) => sum + f.size, 0)
  };

  let budgetPassed = true;

  Object.keys(budget).forEach(key => {
    const budgetValue = budget[key];
    const actualValue = actual[key];
    const percentage = (actualValue / budgetValue * 100).toFixed(1);
    const status = actualValue <= budgetValue ? '✅' : '❌';
    
    if (actualValue > budgetValue) {
      budgetPassed = false;
    }
    
    console.log(`${status} ${key}: ${formatBytes(actualValue)} / ${formatBytes(budgetValue)} (${percentage}%)`);
  });

  console.log();
  
  if (budgetPassed) {
    console.log('🎉 All performance budgets passed!');
  } else {
    console.log('⚠️  Some performance budgets exceeded. Consider optimization.');
  }
  
  return budgetPassed;
};

// Main execution
const main = () => {
  try {
    cleanBuild();
    runBuild();
    const analysis = analyzeBuild();
    const budgetPassed = checkPerformanceBudget(analysis);
    
    console.log('\n🏁 Build optimization completed!');
    
    if (!budgetPassed) {
      console.log('⚠️  Performance budget warnings detected.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Build optimization failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  analyzeBuild,
  checkPerformanceBudget,
  BUILD_CONFIG
};