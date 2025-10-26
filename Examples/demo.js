#!/usr/bin/env node

/**
 * Demonstration script showing how to use the Codebase Analysis Tool
 * This script shows the main capabilities and how to interpret results
 */

import { CodeAnalysisEngine } from '../build/index.js';
import fs from 'fs';
import path from 'path';

async function demonstrateAnalysis() {
    console.log('🚀 Codebase Analysis Tool Demonstration\n');

    try {
        // 1. Analyze the test codebase
        console.log('📊 Analyzing test codebase...');
        const engine = new CodeAnalysisEngine('../test/testdata');
        const result = await engine.analyzeCodebase([
            'test.js',
            'test.py',
            'test.cpp',
            'vulnerable.js',
            'quality_test.js'
        ]);

        // 2. Display summary
        console.log('\n📈 ANALYSIS SUMMARY');
        console.log('==================');
        console.log(`Files analyzed: ${result.entities.length > 0 ? '5' : '0'}`);
        console.log(`Entities found: ${result.entities.length}`);
        console.log(`Relationships mapped: ${result.relationships.length}`);
        console.log(`Security vulnerabilities: ${result.vulnerabilities.length}`);
        console.log(`Quality score: ${result.qualityMetrics.maintainabilityIndex.toFixed(1)}/171`);

        // 3. Show entity breakdown
        console.log('\n🏗️ ENTITY BREAKDOWN');
        console.log('===================');
        const entityTypes = result.entities.reduce((acc, entity) => {
            acc[entity.type] = (acc[entity.type] || 0) + 1;
            return acc;
        }, {});

        Object.entries(entityTypes).forEach(([type, count]) => {
            console.log(`${type}: ${count}`);
        });

        // 4. Show security findings
        if (result.vulnerabilities.length > 0) {
            console.log('\n🛡️ SECURITY FINDINGS');
            console.log('===================');
            const severityGroups = result.vulnerabilities.reduce((acc, vuln) => {
                acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
                return acc;
            }, {});

            Object.entries(severityGroups).forEach(([severity, count]) => {
                console.log(`${severity.toUpperCase()}: ${count} issues`);
            });

            // Show specific vulnerabilities
            console.log('\nDetailed vulnerabilities:');
            result.vulnerabilities.slice(0, 3).forEach((vuln, i) => {
                console.log(`  ${i + 1}. ${vuln.type} (${vuln.severity}) - Line ${vuln.location.line}`);
                console.log(`     ${vuln.description}`);
            });
        }

        // 5. Show quality recommendations
        console.log('\n📋 QUALITY RECOMMENDATIONS');
        console.log('==========================');
        if (result.qualityMetrics.cyclomaticComplexity > 10) {
            console.log('⚠️  High complexity detected - consider breaking down complex functions');
        }
        if (result.qualityMetrics.technicalDebtHours > 0) {
            console.log(`💰 Technical debt: ${result.qualityMetrics.technicalDebtHours.toFixed(1)} hours`);
        }
        if (result.qualityMetrics.duplicationPercentage > 5) {
            console.log(`📋 Code duplication: ${result.qualityMetrics.duplicationPercentage.toFixed(1)}%`);
        }

        // 6. Show where reports are saved
        console.log('\n📁 REPORTS GENERATED');
        console.log('===================');
        console.log('Reports have been saved to: D:\\CodeAnalysisReports\\');
        console.log('Open analysis_dashboard.html in your browser for visual dashboard');
        console.log('\n📄 Key report files:');
        console.log('  - executive_summary.json (high-level overview)');
        console.log('  - security_assessment.json (vulnerability details)');
        console.log('  - quality_assessment.json (code quality metrics)');
        console.log('  - entity_inventory.json (all discovered entities)');
        console.log('  - architecture_relationships.json (code relationships)');

        console.log('\n✅ Demonstration complete!');
        console.log('\n💡 Tip: Copy the sample-analysis-output folder to share these results');

    } catch (error) {
        console.error('❌ Error during demonstration:', error.message);
        process.exit(1);
    }
}

// Run demonstration if this file is executed directly
if (process.argv[1].endsWith('demo.js')) {
    demonstrateAnalysis().catch(console.error);
}

export { demonstrateAnalysis };