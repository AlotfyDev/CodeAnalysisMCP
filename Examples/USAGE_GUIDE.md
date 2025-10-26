# Codebase Analysis Tool - Usage Guide

This guide shows various ways to use the Codebase Analysis MCP Server to analyze your codebase and generate comprehensive reports.

## 🚀 Quick Start

### Method 1: Using the Demo Script
```bash
cd Examples
node demo.js
```

### Method 2: Direct Engine Usage
```javascript
import { CodeAnalysisEngine } from '../build/index.js';

const engine = new CodeAnalysisEngine('./path/to/your/codebase');
const result = await engine.analyzeCodebase(['**/*.{js,py,cpp,ts}']);
console.log('Analysis complete:', result);
```

### Method 3: Using MCP Protocol
```bash
# Start the MCP server
node build/index.js

# Then use any MCP client to call the tools:
# - analyze_codebase
# - find_security_vulnerabilities
# - assess_code_quality
```

## 📋 Available Tools

### 1. `analyze_codebase`
**Complete codebase analysis**
```javascript
// Parameters
{
  codebase_path: "./src",
  include_patterns: ["**/*.{js,ts,py,cpp}"],
  exclude_patterns: ["node_modules/**", ".git/**"]
}
```

### 2. `find_security_vulnerabilities`
**Security-focused scanning**
```javascript
// Parameters
{
  codebase_path: "./src",
  severity_filter: ["high", "critical"]
}
```

### 3. `assess_code_quality`
**Quality metrics for specific files**
```javascript
// Parameters
{
  file_paths: ["src/main.js", "src/utils.js"]
}
```

## 🎯 Use Cases

### Security Audit
```javascript
const engine = new CodeAnalysisEngine('./my-project');
const result = await engine.analyzeCodebase(['**/*.{js,py,cpp}']);
const criticalVulns = result.vulnerabilities.filter(v => v.severity === 'critical');
console.log('Critical security issues:', criticalVulns);
```

### Code Quality Assessment
```javascript
const engine = new CodeAnalysisEngine('./my-project');
const result = await engine.analyzeCodebase(['src/**/*.js']);
console.log('Quality Score:', result.qualityMetrics.maintainabilityIndex);
console.log('Technical Debt:', result.qualityMetrics.technicalDebtHours, 'hours');
```

### Architecture Analysis
```javascript
const engine = new CodeAnalysisEngine('./my-project');
const result = await engine.analyzeCodebase(['**/*.{js,ts}']);
console.log('Total Entities:', result.entities.length);
console.log('Relationships:', result.relationships.length);
```

## 📊 Understanding the Output

### Report Types Generated

1. **JSON Reports** (Machine-readable)
   - `entity_inventory.json` - All discovered code entities
   - `security_assessment.json` - Vulnerability details
   - `quality_assessment.json` - Quality metrics
   - `architecture_relationships.json` - Code relationships

2. **HTML Dashboard** (Human-readable)
   - `analysis_dashboard.html` - Visual summary with charts

3. **Individual File Reports**
   - `[filename]_analysis.json` - Per-file detailed analysis

### Key Metrics Explained

#### Security Metrics
- **SQL Injection**: String concatenation in database queries
- **XSS**: Unsafe DOM manipulation with user input
- **Secret Exposure**: Hardcoded passwords, API keys, tokens
- **Insecure Random**: Weak random number generation

#### Quality Metrics
- **Cyclomatic Complexity**: Number of independent code paths
- **Maintainability Index**: 0-171 score (higher = better)
- **Technical Debt**: Estimated hours to fix code smells
- **Code Duplication**: Percentage of duplicated code

## 🔧 Configuration Options

### File Pattern Examples
```javascript
// Include specific file types
include_patterns: [
  "**/*.js",           // All JavaScript files
  "**/*.ts",           // All TypeScript files
  "src/**/*.py",        // Python files in src/
  "!**/test/**"        // Exclude test directories
]

// Exclude unwanted files
exclude_patterns: [
  "node_modules/**",   // Dependencies
  ".git/**",           // Git files
  "**/*.test.js",      // Test files
  "**/*.spec.js"       // Spec files
]
```

### Security Filter Examples
```javascript
// Focus on high-severity issues only
severity_filter: ["high", "critical"]

// All severity levels
severity_filter: ["low", "medium", "high", "critical"]
```

## 📈 Best Practices

### For Large Codebases
1. **Start Small**: Analyze one directory at a time
2. **Use Excludes**: Filter out generated/test files
3. **Focus on Critical Areas**: Prioritize security-sensitive code
4. **Regular Scanning**: Set up automated analysis

### For Security Audits
1. **Enable All Checks**: Don't filter severity levels initially
2. **Review All Findings**: Even low-severity issues matter
3. **Check Recommendations**: Each finding includes fix guidance
4. **Verify Fixes**: Re-run analysis after remediation

### For Quality Improvement
1. **Track Metrics Over Time**: Monitor quality trends
2. **Set Thresholds**: Define acceptable quality levels
3. **Address Technical Debt**: Prioritize high-debt areas
4. **Reduce Duplication**: Extract common code patterns

## 🚨 Common Issues and Solutions

### Issue: Analysis Too Slow
**Solution**: Use `include_patterns` to limit scope
```javascript
// Instead of analyzing everything
include_patterns: ["src/**/*.js"]  // Only JS files in src/
```

### Issue: Too Many False Positives
**Solution**: Use `exclude_patterns` for generated/test code
```javascript
exclude_patterns: ["dist/**", "build/**", "**/*.test.js"]
```

### Issue: Missing Reports
**Solution**: Check that output directory exists and is writable
```javascript
// Reports are saved to: D:\CodeAnalysisReports\
// Ensure this directory exists and has write permissions
```

## 📚 Advanced Usage

### Custom Analysis Pipeline
```javascript
import { CodeAnalysisEngine } from '../build/index.js';

class CustomAnalyzer {
  async analyzeProject(projectPath) {
    const engine = new CodeAnalysisEngine(projectPath);

    // Phase 1: Quick security scan
    console.log('🔍 Phase 1: Security scan...');
    const allFiles = await this.findAllSourceFiles(projectPath);
    const securityResult = await engine.analyzeCodebase(allFiles);

    // Phase 2: Deep quality analysis (only if security is good)
    if (securityResult.vulnerabilities.filter(v => v.severity === 'critical').length === 0) {
      console.log('📊 Phase 2: Quality analysis...');
      const qualityResult = await engine.analyzeCodebase(allFiles);
      return { security: securityResult, quality: qualityResult };
    }

    return { security: securityResult };
  }
}
```

### Integration with CI/CD
```bash
#!/bin/bash
# Example CI/CD integration

# Run security analysis
node -e "
import('./build/index.js').then(async m => {
  const engine = new m.CodeAnalysisEngine('./src');
  const result = await engine.analyzeCodebase(['**/*.{js,ts}']);
  const criticalIssues = result.vulnerabilities.filter(v => v.severity === 'critical');
  if (criticalIssues.length > 0) {
    console.error('❌ Critical security issues found:', criticalIssues.length);
    process.exit(1);
  }
  console.log('✅ Security check passed');
});
"
```

---

**Need Help?** Check the `sample-analysis-output/` folder for real examples of all report types!