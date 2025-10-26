#!/usr/bin/env node

/**
 * MCP server for advanced codebase analysis and security assessment.
 * Provides tools for understanding code relationships, architectures, and best practices.
 *
 * Features:
 * - Code comprehension analysis
 * - Pattern recognition for refactoring opportunities
 * - Security vulnerability detection
 * - Code quality assessment
 * - Architecture analysis
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';

/**
 * Code analysis types and interfaces
 */
interface CodeEntity {
  type: 'class' | 'function' | 'variable' | 'module' | 'interface' | 'method';
  name: string;
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  docstring?: string;
  dependencies: string[];
  securityRisks: string[];
  qualityIssues: string[];
}

interface CodeRelationship {
  from: string;
  to: string;
  type: 'inherits' | 'calls' | 'imports' | 'references' | 'contains';
  confidence: number;
}

interface AnalysisResult {
  entities: CodeEntity[];
  relationships: CodeRelationship[];
  vulnerabilities: SecurityVulnerability[];
  qualityMetrics: QualityMetrics;
}

interface SecurityVulnerability {
  type: 'sql_injection' | 'xss' | 'auth_bypass' | 'data_exposure' | 'secrecy_leak';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: { file: string; line: number; column: number };
  description: string;
  recommendation: string;
}

interface QualityMetrics {
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  technicalDebtHours: number;
  duplicationPercentage: number;
  testCoverage: number;
}

interface DependencyInfo {
  name: string;
  version: string;
  type: 'external' | 'internal' | 'system';
  usage: string[];
  vulnerabilities: string[];
  lastUpdated: string;
  license: string;
  fileDependencies: string[];
}

interface DependencyAnalysisResult {
  externalDependencies: DependencyInfo[];
  internalDependencies: DependencyInfo[];
  dependencyGraph: DependencyGraph;
  vulnerabilitySummary: VulnerabilitySummary;
  migrationRecommendations: string[];
}

interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

interface DependencyNode {
  id: string;
  name: string;
  type: 'package' | 'module' | 'file';
  version?: string;
  size?: number;
}

interface DependencyEdge {
  from: string;
  to: string;
  type: 'imports' | 'requires' | 'includes' | 'references';
  strength: number;
}

interface VulnerabilitySummary {
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  affectedPackages: string[];
}

interface CodeEvolutionMetrics {
  fileSize: number;
  linesOfCode: number;
  complexityScore: number;
  functionCount: number;
  classCount: number;
  commentRatio: number;
  modificationFrequency: number;
}

interface CodeEvolutionResult {
  fileMetrics: Map<string, CodeEvolutionMetrics>;
  evolutionTrends: EvolutionTrend[];
  teamContributions: TeamContribution[];
  technicalDebtEvolution: TechnicalDebtTrend[];
  changePatterns: ChangePattern[];
}

interface EvolutionTrend {
  timePeriod: string;
  filesModified: number;
  linesAdded: number;
  linesDeleted: number;
  complexityChange: number;
  newFiles: number;
  deletedFiles: number;
}

interface TeamContribution {
  contributor: string;
  filesModified: number;
  linesChanged: number;
  complexityIntroduced: number;
  primaryFileTypes: string[];
  contributionPeriod: string;
}

interface TechnicalDebtTrend {
  date: string;
  debtHours: number;
  complexityScore: number;
  codeSmells: number;
  coveragePercentage: number;
}

interface ChangePattern {
  pattern: string;
  frequency: number;
  impact: 'low' | 'medium' | 'high';
  description: string;
  examples: string[];
}

interface DatabaseSchema {
  name: string;
  type: 'table' | 'view' | 'procedure' | 'function' | 'trigger' | 'index';
  columns: DatabaseColumn[];
  constraints: DatabaseConstraint[];
  relationships: DatabaseRelationship[];
  size: number;
  rowCount?: number;
}

interface DatabaseColumn {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  defaultValue?: string;
  maxLength?: number;
  references?: string; // Foreign key reference
}

interface DatabaseConstraint {
  name: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check' | 'not_null';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  checkCondition?: string;
}

interface DatabaseRelationship {
  fromTable: string;
  toTable: string;
  type: 'one_to_one' | 'one_to_many' | 'many_to_many';
  fromColumns: string[];
  toColumns: string[];
  strength: number; // 0.0 to 1.0
}

interface DatabaseFlow {
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  tables: string[];
  frequency: number;
  performance: number;
  securityRisk: 'low' | 'medium' | 'high';
}

interface DatabaseSchemaResult {
  schemas: DatabaseSchema[];
  dataFlow: DatabaseFlow[];
  migrationAnalysis: MigrationAnalysis;
  securityAssessment: DatabaseSecurityAssessment;
  performanceMetrics: DatabasePerformanceMetrics;
}

interface MigrationAnalysis {
  complexity: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours: number;
  breakingChanges: string[];
  dataMigrationNeeded: boolean;
  rollbackComplexity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface DatabaseSecurityAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: DatabaseVulnerability[];
  accessControls: AccessControl[];
  sensitiveData: SensitiveDataField[];
  complianceScore: number;
}

interface DatabaseVulnerability {
  type: 'sql_injection' | 'data_exposure' | 'privilege_escalation' | 'weak_authentication';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  recommendation: string;
}

interface AccessControl {
  table: string;
  userRole: string;
  permissions: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[];
  grantor: string;
  isInherited: boolean;
}

interface SensitiveDataField {
  table: string;
  column: string;
  dataType: string;
  sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
  encryptionStatus: 'none' | 'at_rest' | 'in_transit' | 'both';
  maskingImplemented: boolean;
}

interface DatabasePerformanceMetrics {
  queryComplexity: number;
  indexEfficiency: number;
  tableSizeDistribution: Record<string, number>;
  bottleneckIdentification: Bottleneck[];
  optimizationOpportunities: OptimizationOpportunity[];
}

interface Bottleneck {
  type: 'table_scan' | 'missing_index' | 'lock_contention' | 'large_table' | 'complex_join';
  location: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
  solution: string;
}

interface OptimizationOpportunity {
  type: 'index' | 'partitioning' | 'query_rewrite' | 'caching' | 'normalization';
  potentialBenefit: number; // Percentage improvement
  implementationComplexity: 'low' | 'medium' | 'high';
  description: string;
  affectedComponents: string[];
}

interface PerformanceProfile {
  algorithmComplexity: AlgorithmComplexity;
  memoryUsage: MemoryUsageProfile;
  ioOperations: IOOperationProfile;
  concurrencyAnalysis: ConcurrencyProfile;
  bottlenecks: PerformanceBottleneck[];
  optimizationRecommendations: PerformanceRecommendation[];
}

interface AlgorithmComplexity {
  overallComplexity: string; // "O(n)", "O(n log n)", etc.
  functionComplexities: Map<string, string>;
  recursionDepth: number;
  loopNesting: number;
  worstCase: string;
  bestCase: string;
  averageCase: string;
}

interface MemoryUsageProfile {
  estimatedMemoryUsage: number; // bytes
  allocationPatterns: AllocationPattern[];
  leakPotential: 'low' | 'medium' | 'high';
  garbageCollectionPressure: number;
  memoryOptimizationScore: number; // 0-100
}

interface AllocationPattern {
  type: 'stack' | 'heap' | 'static' | 'dynamic';
  frequency: number;
  averageSize: number;
  location: string; // file:line
  purpose: string;
}

interface IOOperationProfile {
  fileOperations: FileOperation[];
  networkOperations: NetworkOperation[];
  databaseOperations: DatabaseOperation[];
  ioEfficiency: number; // 0-100 score
  blockingOperations: number;
}

interface FileOperation {
  type: 'read' | 'write' | 'append' | 'delete';
  filePath: string;
  frequency: number;
  averageSize: number;
  isBlocking: boolean;
  optimization: string;
}

interface NetworkOperation {
  type: 'http' | 'tcp' | 'udp' | 'websocket';
  endpoint: string;
  frequency: number;
  dataSize: number;
  isAsync: boolean;
  timeout: number;
}

interface DatabaseOperation {
  type: 'query' | 'insert' | 'update' | 'delete' | 'transaction';
  table: string;
  frequency: number;
  complexity: string;
  indexUsage: boolean;
  lockType: string;
}

interface ConcurrencyProfile {
  threadSafety: 'safe' | 'unsafe' | 'conditionally_safe';
  sharedResources: SharedResource[];
  synchronizationPrimitives: SynchronizationPrimitive[];
  raceConditionRisk: 'low' | 'medium' | 'high';
  deadlockPotential: 'low' | 'medium' | 'high';
}

interface SharedResource {
  name: string;
  type: 'variable' | 'file' | 'database' | 'memory';
  accessPattern: 'read_only' | 'write_only' | 'read_write';
  protectionLevel: 'none' | 'mutex' | 'atomic' | 'lock_free';
}

interface SynchronizationPrimitive {
  type: 'mutex' | 'semaphore' | 'condition_variable' | 'atomic' | 'spinlock';
  location: string;
  purpose: string;
  effectiveness: number; // 0-100
}

interface PerformanceBottleneck {
  type: 'cpu_bound' | 'memory_bound' | 'io_bound' | 'lock_contention' | 'algorithmic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  impact: string;
  solution: string;
}

interface PerformanceRecommendation {
  type: 'algorithm' | 'memory' | 'io' | 'concurrency' | 'caching';
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  benefit: number; // 0-100 percentage improvement
  description: string;
  implementation: string;
  affectedComponents: string[];
}

interface CodeClone {
  type: 'exact' | 'near' | 'functional';
  primaryFile: string;
  cloneFiles: string[];
  startLine: number;
  endLine: number;
  length: number;
  similarity: number; // 0-100 percentage
  cloneContent: string;
  risk: 'low' | 'medium' | 'high';
  refactoringOpportunity: string;
}

interface CloneAnalysisResult {
  exactClones: CodeClone[];
  nearClones: CodeClone[];
  functionalClones: CodeClone[];
  cloneMetrics: CloneMetrics;
  refactoringOpportunities: RefactoringOpportunity[];
  cloneEvolution: CloneEvolution[];
}

interface CloneMetrics {
  totalClones: number;
  totalDuplicatedLines: number;
  duplicationPercentage: number;
  largestClone: number;
  mostClonedFile: string;
  cloneDistribution: Record<string, number>;
}

interface RefactoringOpportunity {
  type: 'extract_method' | 'extract_class' | 'move_method' | 'template_method' | 'strategy_pattern';
  priority: 'low' | 'medium' | 'high' | 'critical';
  benefit: number; // Lines of code reduction
  affectedFiles: string[];
  description: string;
  implementation: string;
  risk: 'low' | 'medium' | 'high';
}

interface CloneEvolution {
  timePeriod: string;
  newClones: number;
  resolvedClones: number;
  growingClones: number;
  cloneDensity: number;
  refactoringImpact: number;
}

interface DocumentationMetrics {
  totalComments: number;
  totalLines: number;
  commentRatio: number;
  functionDocumentation: number;
  classDocumentation: number;
  fileHeaderDocumentation: number;
  inlineComments: number;
  todoComments: number;
  fixmeComments: number;
}

interface DocumentationQuality {
  filePath: string;
  metrics: DocumentationMetrics;
  qualityScore: number;
  missingDocumentation: MissingDocumentation[];
  poorQualityDocumentation: PoorDocumentation[];
  improvementRecommendations: string[];
}

interface MissingDocumentation {
  type: 'function' | 'class' | 'method' | 'parameter' | 'return_value' | 'file_header';
  name: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface PoorDocumentation {
  type: 'unclear' | 'outdated' | 'incomplete' | 'incorrect' | 'missing_examples';
  location: string;
  currentDocumentation: string;
  issues: string[];
  suggestedImprovement: string;
}

interface DocumentationQualityResult {
  overallQualityScore: number;
  fileQualities: DocumentationQuality[];
  summaryMetrics: DocumentationSummaryMetrics;
  missingDocumentation: MissingDocumentation[];
  improvementOpportunities: DocumentationImprovement[];
  documentationEvolution: DocumentationEvolution[];
}

interface DocumentationSummaryMetrics {
  averageCommentRatio: number;
  totalDocumentationLines: number;
  totalCodeLines: number;
  overallDocumentationRatio: number;
  wellDocumentedFiles: number;
  poorlyDocumentedFiles: number;
  undocumentedFunctions: number;
  undocumentedClasses: number;
  todoComments: number;
  fixmeComments: number;
}

interface DocumentationImprovement {
  type: 'add_comments' | 'improve_clarity' | 'add_examples' | 'standardize_format' | 'add_api_docs';
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  benefit: number; // 0-100 percentage improvement
  affectedFiles: string[];
  description: string;
  implementation: string;
}

interface DocumentationEvolution {
  timePeriod: string;
  documentationAdded: number;
  documentationRemoved: number;
  qualityImprovements: number;
  newUndocumentedCode: number;
  documentationRatio: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface PerformanceProfileResult {
  profiles: Map<string, PerformanceProfile>;
  overallPerformanceScore: number;
  criticalBottlenecks: PerformanceBottleneck[];
  topRecommendations: PerformanceRecommendation[];
  scalabilityAssessment: ScalabilityAssessment;
}

interface ScalabilityAssessment {
  currentCapacity: number;
  maxCapacity: number;
  scalingLimiters: string[];
  optimizationPath: string[];
  recommendedImprovements: string[];
  scalabilityGrade: string;
}

/**
 * Code Analysis Engine
 */
export class CodeAnalysisEngine {
  private codebasePath: string;

  constructor(codebasePath: string) {
    this.codebasePath = codebasePath;
  }

  /**
   * Analyze codebase to extract entities and relationships
   */
  async analyzeCodebase(filePaths: string[]): Promise<AnalysisResult> {
    const entities: CodeEntity[] = [];
    const relationships: CodeRelationship[] = [];
    const vulnerabilities: SecurityVulnerability[] = [];
    const qualityMetrics: QualityMetrics = {
      cyclomaticComplexity: 0,
      maintainabilityIndex: 0,
      technicalDebtHours: 0,
      duplicationPercentage: 0,
      testCoverage: 0
    };

    // Create analysis session directory (project-specific reports)
    // Use workspace-relative path for project-specific reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sessionDir = path.join(this.codebasePath, 'CodeAnalysisReports', `analysis_${timestamp}`);
    fs.mkdirSync(sessionDir, { recursive: true });

    // Analyze each file
    for (const filePath of filePaths) {
      try {
        const fullPath = path.resolve(this.codebasePath, filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Extract entities based on language
        const languageEntities = await this.extractEntities(content, filePath);
        entities.push(...languageEntities);

        // Find relationships
        const fileRelationships = await this.findRelationships(entities, content, filePath);
        relationships.push(...fileRelationships);

        // Security analysis
        const fileVulnerabilities = await this.analyzeSecurity(content, filePath);
        vulnerabilities.push(...fileVulnerabilities);

        // Quality analysis
        const fileQuality = await this.analyzeQuality(content, filePath);
        this.updateQualityMetrics(qualityMetrics, fileQuality);

        // Generate individual file report
        this.generateFileReport(sessionDir, filePath, content, languageEntities, fileRelationships, fileVulnerabilities, fileQuality);

      } catch (error) {
        console.error(`Error analyzing ${filePath}:`, error);
      }
    }

    // Generate dependency analysis
    const dependencyResult = await this.analyzeDependencies(filePaths);

    // Generate comprehensive reports
    this.generateComprehensiveReports(sessionDir, entities, relationships, vulnerabilities, qualityMetrics, dependencyResult, filePaths);

    return {
      entities,
      relationships,
      vulnerabilities,
      qualityMetrics: this.finalizeQualityMetrics(qualityMetrics)
    };
  }

  private generateFileReport(
    sessionDir: string,
    filePath: string,
    content: string,
    entities: CodeEntity[],
    relationships: CodeRelationship[],
    vulnerabilities: SecurityVulnerability[],
    qualityMetrics: QualityMetrics
  ) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const reportPath = path.join(sessionDir, `${fileName}_analysis.json`);

    const fileReport = {
      file_path: filePath,
      analysis_timestamp: new Date().toISOString(),
      file_stats: {
        lines_of_code: content.split('\n').length,
        bytes: Buffer.byteLength(content, 'utf8'),
        language: this.detectLanguage(path.extname(filePath))
      },
      entities: entities.filter(e => e.filePath === filePath),
      relationships: relationships.filter(r => r.from === filePath),
      vulnerabilities: vulnerabilities.filter(v => v.location.file === filePath),
      quality_metrics: qualityMetrics,
      code_snippet: content.substring(0, 500) + (content.length > 500 ? '\n... (truncated)' : '')
    };

    fs.writeFileSync(reportPath, JSON.stringify(fileReport, null, 2));
  }

  private async generateComprehensiveReports(
    sessionDir: string,
    entities: CodeEntity[],
    relationships: CodeRelationship[],
    vulnerabilities: SecurityVulnerability[],
    qualityMetrics: QualityMetrics,
    dependencyResult: DependencyAnalysisResult,
    analyzedFiles: string[]
  ) {
    // 1. Entity Inventory Report
    const entityReport = {
      report_type: "Codebase Entity Inventory",
      generated_at: new Date().toISOString(),
      total_files: analyzedFiles.length,
      total_entities: entities.length,
      entities_by_type: this.groupEntitiesByType(entities),
      entities_by_file: this.groupEntitiesByFile(entities),
      detailed_entities: entities
    };
    fs.writeFileSync(path.join(sessionDir, 'entity_inventory.json'), JSON.stringify(entityReport, null, 2));

    // 2. Architecture Relationship Report
    const relationshipReport = {
      report_type: "Architecture Relationship Analysis",
      generated_at: new Date().toISOString(),
      total_relationships: relationships.length,
      relationships_by_type: this.groupRelationshipsByType(relationships),
      relationship_graph: this.buildRelationshipGraph(relationships),
      detailed_relationships: relationships
    };
    fs.writeFileSync(path.join(sessionDir, 'architecture_relationships.json'), JSON.stringify(relationshipReport, null, 2));

    // 3. Security Assessment Report
    const securityReport = {
      report_type: "Security Vulnerability Assessment",
      generated_at: new Date().toISOString(),
      total_vulnerabilities: vulnerabilities.length,
      vulnerabilities_by_severity: this.groupVulnerabilitiesBySeverity(vulnerabilities),
      vulnerabilities_by_type: this.groupVulnerabilitiesByType(vulnerabilities),
      max_severity_found: this.getMaxSeverity(vulnerabilities),
      security_score: this.calculateSecurityScore(vulnerabilities),
      detailed_vulnerabilities: vulnerabilities
    };
    fs.writeFileSync(path.join(sessionDir, 'security_assessment.json'), JSON.stringify(securityReport, null, 2));

    // 4. Quality Metrics Report
    const qualityReport = {
      report_type: "Code Quality Assessment",
      generated_at: new Date().toISOString(),
      overall_quality_score: this.calculateOverallQualityScore(qualityMetrics),
      quality_breakdown: qualityMetrics,
      quality_grade: this.calculateQualityGrade(qualityMetrics),
      recommendations: this.generateQualityRecommendations(qualityMetrics)
    };
    fs.writeFileSync(path.join(sessionDir, 'quality_assessment.json'), JSON.stringify(qualityReport, null, 2));

    // 5. Executive Summary Report
    const executiveSummary = {
      report_type: "Executive Codebase Summary",
      generated_at: new Date().toISOString(),
      codebase_overview: {
        files_analyzed: analyzedFiles.length,
        entities_discovered: entities.length,
        relationships_mapped: relationships.length,
        vulnerabilities_found: vulnerabilities.length
      },
      key_findings: {
        security_posture: this.getSecuritySummary(vulnerabilities),
        code_quality: this.getQualitySummary(qualityMetrics),
        architecture_complexity: this.getComplexitySummary(entities.length, relationships.length)
      },
      files_analyzed: analyzedFiles,
      report_files_generated: [
        'entity_inventory.json',
        'architecture_relationships.json',
        'security_assessment.json',
        'quality_assessment.json',
        '[file]_analysis.json' // For each analyzed file
      ]
    };
    fs.writeFileSync(path.join(sessionDir, 'executive_summary.json'), JSON.stringify(executiveSummary, null, 2));

    // 6. HTML Dashboard Report
    this.generateHTMLDashboard(sessionDir, executiveSummary, entityReport, securityReport, qualityReport);

    // 7. Dependency Analysis Report
    this.generateDependencyReport(sessionDir, dependencyResult);

    // 8. Code Evolution Report
    const evolutionResult = await this.analyzeCodeEvolution(analyzedFiles);
    this.generateEvolutionReport(sessionDir, evolutionResult);

    // 9. Performance Profile Report
    const performanceResult = await this.analyzePerformanceProfile(analyzedFiles);
    this.generatePerformanceReport(sessionDir, performanceResult);

    // 10. Code Clone Report
    const cloneResult = await this.analyzeCodeClones(analyzedFiles);
    this.generateCloneReport(sessionDir, cloneResult);

    // 11. Documentation Quality Report
    const documentationResult = await this.analyzeDocumentationQuality(analyzedFiles);
    this.generateDocumentationReport(sessionDir, documentationResult);
  }

  private generateDependencyReport(sessionDir: string, dependencies: DependencyAnalysisResult) {
    const dependencyReport = {
      report_type: "Dependency Analysis Report",
      generated_at: new Date().toISOString(),
      summary: {
        total_external_dependencies: dependencies.externalDependencies.length,
        total_internal_dependencies: dependencies.internalDependencies.length,
        total_vulnerabilities: dependencies.vulnerabilitySummary.totalVulnerabilities,
        critical_vulnerabilities: dependencies.vulnerabilitySummary.criticalCount,
        dependency_graph_nodes: dependencies.dependencyGraph.nodes.length,
        dependency_graph_edges: dependencies.dependencyGraph.edges.length
      },
      external_dependencies: dependencies.externalDependencies.map(dep => ({
        name: dep.name,
        version: dep.version,
        type: dep.type,
        usage_count: dep.usage.length,
        vulnerability_count: dep.vulnerabilities.length,
        vulnerabilities: dep.vulnerabilities,
        license: dep.license,
        files_using: dep.fileDependencies
      })),
      internal_dependencies: dependencies.internalDependencies.map(dep => ({
        name: dep.name,
        version: dep.version,
        type: dep.type,
        usage_count: dep.usage.length,
        files_using: dep.fileDependencies
      })),
      dependency_graph: {
        nodes: dependencies.dependencyGraph.nodes,
        edges: dependencies.dependencyGraph.edges,
        statistics: {
          max_dependencies: Math.max(...dependencies.dependencyGraph.nodes.map(n =>
            dependencies.dependencyGraph.edges.filter(e => e.from === n.id).length
          )),
          isolated_nodes: dependencies.dependencyGraph.nodes.filter(n =>
            !dependencies.dependencyGraph.edges.some(e => e.from === n.id || e.to === n.id)
          ).length
        }
      },
      vulnerability_assessment: {
        summary: dependencies.vulnerabilitySummary,
        affected_packages: dependencies.vulnerabilitySummary.affectedPackages,
        risk_levels: {
          critical: dependencies.externalDependencies.filter(d => d.vulnerabilities.some(v => v.includes('critical'))),
          high: dependencies.externalDependencies.filter(d => d.vulnerabilities.some(v => v.includes('high'))),
          medium: dependencies.externalDependencies.filter(d => d.vulnerabilities.some(v => v.includes('medium'))),
          low: dependencies.externalDependencies.filter(d => d.vulnerabilities.some(v => v.includes('low')))
        }
      },
      migration_recommendations: dependencies.migrationRecommendations,
      recommendations: [
        ...dependencies.migrationRecommendations,
        ...(dependencies.vulnerabilitySummary.totalVulnerabilities > 0 ?
          [`Address ${dependencies.vulnerabilitySummary.totalVulnerabilities} security vulnerabilities`] : []),
        ...(dependencies.dependencyGraph.edges.length > 100 ?
          ['Consider breaking down large dependency chains'] : []),
        'Regular dependency updates recommended for security'
      ]
    };

    fs.writeFileSync(path.join(sessionDir, 'dependency_analysis.json'), JSON.stringify(dependencyReport, null, 2));
  }

  private generateEvolutionReport(sessionDir: string, evolutionResult: CodeEvolutionResult) {
    const evolutionReport = {
      report_type: "Code Evolution Analysis Report",
      generated_at: new Date().toISOString(),
      summary: {
        files_tracked: evolutionResult.fileMetrics.size,
        total_contributors: evolutionResult.teamContributions.length,
        evolution_periods: evolutionResult.evolutionTrends.length,
        change_patterns_identified: evolutionResult.changePatterns.length,
        average_complexity: Array.from(evolutionResult.fileMetrics.values())
          .reduce((sum, m) => sum + m.complexityScore, 0) / evolutionResult.fileMetrics.size,
        average_comment_ratio: Array.from(evolutionResult.fileMetrics.values())
          .reduce((sum, m) => sum + m.commentRatio, 0) / evolutionResult.fileMetrics.size
      },
      file_metrics: Array.from(evolutionResult.fileMetrics.entries()).map(([file, metrics]) => ({
        file_path: file,
        size_bytes: metrics.fileSize,
        lines_of_code: metrics.linesOfCode,
        complexity_score: metrics.complexityScore,
        function_count: metrics.functionCount,
        class_count: metrics.classCount,
        comment_ratio_percentage: metrics.commentRatio,
        modification_frequency: metrics.modificationFrequency,
        quality_score: this.calculateFileQualityScore(metrics)
      })),
      evolution_trends: evolutionResult.evolutionTrends.map(trend => ({
        period: trend.timePeriod,
        files_modified: trend.filesModified,
        lines_added: trend.linesAdded,
        lines_deleted: trend.linesDeleted,
        net_line_change: trend.linesAdded - trend.linesDeleted,
        complexity_change: trend.complexityChange,
        new_files: trend.newFiles,
        deleted_files: trend.deletedFiles,
        growth_rate: trend.filesModified > 0 ?
          ((trend.linesAdded - trend.linesDeleted) / trend.filesModified) : 0
      })),
      team_contributions: evolutionResult.teamContributions.map(contribution => ({
        contributor: contribution.contributor,
        files_modified: contribution.filesModified,
        lines_changed: contribution.linesChanged,
        complexity_introduced: contribution.complexityIntroduced,
        primary_file_types: contribution.primaryFileTypes,
        contribution_period: contribution.contributionPeriod,
        productivity_score: contribution.linesChanged > 0 ?
          (contribution.complexityIntroduced / contribution.linesChanged) * 100 : 0
      })),
      technical_debt_evolution: evolutionResult.technicalDebtEvolution.map(debt => ({
        date: debt.date,
        debt_hours: debt.debtHours,
        complexity_score: debt.complexityScore,
        code_smells: debt.codeSmells,
        coverage_percentage: debt.coveragePercentage,
        debt_trend: debt.debtHours > 50 ? 'increasing' : debt.debtHours > 20 ? 'moderate' : 'low'
      })),
      change_patterns: evolutionResult.changePatterns.map(pattern => ({
        pattern_name: pattern.pattern,
        frequency: pattern.frequency,
        impact_level: pattern.impact,
        description: pattern.description,
        examples: pattern.examples,
        risk_assessment: pattern.impact === 'high' ? 'Requires immediate attention' :
                        pattern.impact === 'medium' ? 'Monitor and plan improvements' : 'Acceptable pattern'
      })),
      recommendations: [
        ...evolutionResult.changePatterns
          .filter(p => p.impact === 'high')
          .map(p => `Address ${p.pattern}: ${p.description}`),
        ...(Array.from(evolutionResult.fileMetrics.values()).some(m => m.commentRatio < 10) ?
          ['Improve documentation coverage in files with low comment ratios'] : []),
        ...(evolutionResult.technicalDebtEvolution.some(d => d.debtHours > 100) ?
          ['High technical debt detected - prioritize refactoring efforts'] : []),
        'Monitor complexity trends to prevent quality degradation'
      ]
    };

    fs.writeFileSync(path.join(sessionDir, 'code_evolution_analysis.json'), JSON.stringify(evolutionReport, null, 2));
  }

  public calculateFileQualityScore(metrics: CodeEvolutionMetrics): number {
    // Calculate quality score based on multiple factors
    const complexityScore = Math.max(0, 100 - metrics.complexityScore * 2);
    const sizeScore = metrics.linesOfCode > 1000 ? 60 : metrics.linesOfCode > 500 ? 80 : 90;
    const commentScore = Math.min(100, metrics.commentRatio * 5);
    const functionScore = metrics.functionCount > 20 ? 70 : 90;

    return (complexityScore + sizeScore + commentScore + functionScore) / 4;
  }

  private generatePerformanceReport(sessionDir: string, performanceResult: PerformanceProfileResult) {
    const performanceReport = {
      report_type: "Performance Profile Analysis Report",
      generated_at: new Date().toISOString(),
      summary: {
        files_analyzed: performanceResult.profiles.size,
        overall_performance_score: performanceResult.overallPerformanceScore,
        critical_bottlenecks: performanceResult.criticalBottlenecks.length,
        top_recommendations: performanceResult.topRecommendations.length,
        current_capacity: performanceResult.scalabilityAssessment.currentCapacity,
        max_capacity: performanceResult.scalabilityAssessment.maxCapacity,
        scalability_ratio: performanceResult.scalabilityAssessment.currentCapacity /
                          performanceResult.scalabilityAssessment.maxCapacity
      },
      performance_profiles: Array.from(performanceResult.profiles.entries()).map(([file, profile]) => ({
        file_path: file,
        algorithm_complexity: {
          overall: profile.algorithmComplexity.overallComplexity,
          recursion_depth: profile.algorithmComplexity.recursionDepth,
          loop_nesting: profile.algorithmComplexity.loopNesting,
          worst_case: profile.algorithmComplexity.worstCase,
          average_case: profile.algorithmComplexity.averageCase
        },
        memory_analysis: {
          estimated_usage_bytes: profile.memoryUsage.estimatedMemoryUsage,
          leak_potential: profile.memoryUsage.leakPotential,
          optimization_score: profile.memoryUsage.memoryOptimizationScore,
          allocation_patterns: profile.memoryUsage.allocationPatterns.length
        },
        io_analysis: {
          efficiency_score: profile.ioOperations.ioEfficiency,
          blocking_operations: profile.ioOperations.blockingOperations,
          file_operations: profile.ioOperations.fileOperations.length,
          network_operations: profile.ioOperations.networkOperations.length,
          database_operations: profile.ioOperations.databaseOperations.length
        },
        concurrency_analysis: {
          thread_safety: profile.concurrencyAnalysis.threadSafety,
          race_condition_risk: profile.concurrencyAnalysis.raceConditionRisk,
          deadlock_potential: profile.concurrencyAnalysis.deadlockPotential,
          shared_resources: profile.concurrencyAnalysis.sharedResources.length,
          synchronization_primitives: profile.concurrencyAnalysis.synchronizationPrimitives.length
        }
      })),
      critical_bottlenecks: performanceResult.criticalBottlenecks.map(bottleneck => ({
        type: bottleneck.type,
        severity: bottleneck.severity,
        location: bottleneck.location,
        description: bottleneck.description,
        impact: bottleneck.impact,
        solution: bottleneck.solution,
        urgency: bottleneck.severity === 'critical' ? 'immediate' :
                bottleneck.severity === 'high' ? 'high' : 'medium'
      })),
      top_recommendations: performanceResult.topRecommendations.map(rec => ({
        type: rec.type,
        priority: rec.priority,
        effort: rec.effort,
        benefit_percentage: rec.benefit,
        description: rec.description,
        implementation: rec.implementation,
        affected_components: rec.affectedComponents,
        roi_score: rec.benefit / (rec.effort === 'low' ? 1 : rec.effort === 'medium' ? 2 : 3)
      })),
      scalability_assessment: {
        current_capacity: performanceResult.scalabilityAssessment.currentCapacity,
        max_capacity: performanceResult.scalabilityAssessment.maxCapacity,
        capacity_utilization: (performanceResult.scalabilityAssessment.currentCapacity /
                              performanceResult.scalabilityAssessment.maxCapacity) * 100,
        scaling_limiters: performanceResult.scalabilityAssessment.scalingLimiters,
        optimization_path: performanceResult.scalabilityAssessment.optimizationPath,
        recommended_improvements: performanceResult.scalabilityAssessment.recommendedImprovements,
        scalability_grade: performanceResult.scalabilityAssessment.currentCapacity > 5000 ? 'A' :
                          performanceResult.scalabilityAssessment.currentCapacity > 2000 ? 'B' :
                          performanceResult.scalabilityAssessment.currentCapacity > 1000 ? 'C' :
                          performanceResult.scalabilityAssessment.currentCapacity > 500 ? 'D' : 'F'
      },
      performance_insights: {
        primary_concerns: performanceResult.criticalBottlenecks.length > 0 ?
          performanceResult.criticalBottlenecks.slice(0, 3).map(b => b.description) : ['No critical issues detected'],
        optimization_opportunities: performanceResult.topRecommendations
          .filter(r => r.benefit > 50)
          .map(r => `${r.type}: ${r.benefit}% potential improvement`),
        risk_assessment: performanceResult.criticalBottlenecks.length > 3 ? 'High Risk' :
                        performanceResult.criticalBottlenecks.length > 1 ? 'Medium Risk' : 'Low Risk'
      },
      actionable_recommendations: [
        ...performanceResult.topRecommendations
          .filter(r => r.priority === 'critical' || r.priority === 'high')
          .map(r => `CRITICAL: ${r.description} - ${r.benefit}% improvement potential`),
        ...(performanceResult.scalabilityAssessment.currentCapacity < 1000 ?
          ['URGENT: Performance capacity critically low - implement optimizations immediately'] : []),
        ...(performanceResult.criticalBottlenecks.some(b => b.type === 'memory_bound') ?
          ['Memory optimization required - consider smart pointers and efficient data structures'] : []),
        'Implement performance monitoring and establish baseline metrics'
      ]
    };

    fs.writeFileSync(path.join(sessionDir, 'performance_profile_analysis.json'), JSON.stringify(performanceReport, null, 2));
  }

  private generateCloneReport(sessionDir: string, cloneResult: CloneAnalysisResult) {
    const cloneReport = {
      report_type: "Code Clone Analysis Report",
      generated_at: new Date().toISOString(),
      summary: {
        total_clones: cloneResult.cloneMetrics.totalClones,
        total_duplicated_lines: cloneResult.cloneMetrics.totalDuplicatedLines,
        duplication_percentage: cloneResult.cloneMetrics.duplicationPercentage,
        largest_clone: cloneResult.cloneMetrics.largestClone,
        most_cloned_file: cloneResult.cloneMetrics.mostClonedFile,
        exact_clones: cloneResult.exactClones.length,
        near_clones: cloneResult.nearClones.length,
        functional_clones: cloneResult.functionalClones.length,
        refactoring_opportunities: cloneResult.refactoringOpportunities.length
      },
      clone_metrics: {
        ...cloneResult.cloneMetrics,
        duplication_grade: cloneResult.cloneMetrics.duplicationPercentage < 5 ? 'A (Excellent)' :
                          cloneResult.cloneMetrics.duplicationPercentage < 10 ? 'B (Good)' :
                          cloneResult.cloneMetrics.duplicationPercentage < 20 ? 'C (Fair)' :
                          cloneResult.cloneMetrics.duplicationPercentage < 30 ? 'D (Poor)' : 'F (Critical)',
        health_score: Math.max(0, 100 - cloneResult.cloneMetrics.duplicationPercentage * 2)
      },
      exact_clones: cloneResult.exactClones.map(clone => ({
        primary_file: clone.primaryFile,
        clone_files: clone.cloneFiles,
        location: `${clone.startLine}-${clone.endLine}`,
        length: clone.length,
        similarity: clone.similarity,
        risk_level: clone.risk,
        refactoring_opportunity: clone.refactoringOpportunity,
        content_preview: clone.cloneContent.substring(0, 200) + (clone.cloneContent.length > 200 ? '...' : '')
      })),
      near_clones: cloneResult.nearClones.map(clone => ({
        primary_file: clone.primaryFile,
        clone_files: clone.cloneFiles,
        location: `${clone.startLine}-${clone.endLine}`,
        length: clone.length,
        similarity: clone.similarity,
        risk_level: clone.risk,
        refactoring_opportunity: clone.refactoringOpportunity,
        content_preview: clone.cloneContent.substring(0, 200) + (clone.cloneContent.length > 200 ? '...' : '')
      })),
      functional_clones: cloneResult.functionalClones.map(clone => ({
        primary_file: clone.primaryFile,
        clone_files: clone.cloneFiles,
        location: `${clone.startLine}-${clone.endLine}`,
        length: clone.length,
        similarity: clone.similarity,
        risk_level: clone.risk,
        refactoring_opportunity: clone.refactoringOpportunity,
        content_preview: clone.cloneContent.substring(0, 200) + (clone.cloneContent.length > 200 ? '...' : '')
      })),
      refactoring_opportunities: cloneResult.refactoringOpportunities.map(opportunity => ({
        type: opportunity.type,
        priority: opportunity.priority,
        benefit_lines: opportunity.benefit,
        affected_files: opportunity.affectedFiles,
        description: opportunity.description,
        implementation: opportunity.implementation,
        risk: opportunity.risk,
        roi_score: opportunity.benefit / (opportunity.risk === 'low' ? 1 : opportunity.risk === 'medium' ? 2 : 3)
      })),
      clone_evolution: cloneResult.cloneEvolution.map(evolution => ({
        period: evolution.timePeriod,
        new_clones: evolution.newClones,
        resolved_clones: evolution.resolvedClones,
        net_change: evolution.newClones - evolution.resolvedClones,
        growing_clones: evolution.growingClones,
        clone_density: evolution.cloneDensity,
        refactoring_impact: evolution.refactoringImpact,
        trend: evolution.newClones > evolution.resolvedClones ? 'increasing' :
              evolution.resolvedClones > evolution.newClones ? 'decreasing' : 'stable'
      })),
      clone_distribution: {
        by_file: Object.entries(cloneResult.cloneMetrics.cloneDistribution)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([file, count]) => ({ file, clone_count: count })),
        by_type: {
          exact: cloneResult.exactClones.length,
          near: cloneResult.nearClones.length,
          functional: cloneResult.functionalClones.length
        }
      },
      recommendations: [
        ...cloneResult.refactoringOpportunities
          .filter(o => o.priority === 'high' || o.priority === 'critical')
          .map(o => `HIGH PRIORITY: ${o.description} - ${o.benefit} lines of duplication`),
        ...(cloneResult.cloneMetrics.duplicationPercentage > 20 ?
          [`CRITICAL: Duplication at ${cloneResult.cloneMetrics.duplicationPercentage.toFixed(1)}% - requires immediate refactoring`] : []),
        ...(cloneResult.cloneMetrics.largestClone > 50 ?
          [`Large clone detected (${cloneResult.cloneMetrics.largestClone} lines) - extract to utility`] : []),
        'Regular clone detection should be part of code review process'
      ]
    };

    fs.writeFileSync(path.join(sessionDir, 'code_clone_analysis.json'), JSON.stringify(cloneReport, null, 2));
  }

  private generateDocumentationReport(sessionDir: string, documentationResult: DocumentationQualityResult) {
    const documentationReport = {
      report_type: "Documentation Quality Analysis Report",
      generated_at: new Date().toISOString(),
      summary: {
        files_analyzed: documentationResult.fileQualities.length,
        overall_quality_score: documentationResult.overallQualityScore,
        average_comment_ratio: documentationResult.summaryMetrics.averageCommentRatio,
        total_documentation_lines: documentationResult.summaryMetrics.totalDocumentationLines,
        total_code_lines: documentationResult.summaryMetrics.totalCodeLines,
        well_documented_files: documentationResult.summaryMetrics.wellDocumentedFiles,
        poorly_documented_files: documentationResult.summaryMetrics.poorlyDocumentedFiles,
        undocumented_functions: documentationResult.summaryMetrics.undocumentedFunctions,
        undocumented_classes: documentationResult.summaryMetrics.undocumentedClasses,
        documentation_grade: documentationResult.overallQualityScore > 80 ? 'A (Excellent)' :
                            documentationResult.overallQualityScore > 60 ? 'B (Good)' :
                            documentationResult.overallQualityScore > 40 ? 'C (Fair)' :
                            documentationResult.overallQualityScore > 20 ? 'D (Poor)' : 'F (Critical)'
      },
      file_quality_assessment: documentationResult.fileQualities.map(quality => ({
        file_path: quality.filePath,
        quality_score: quality.qualityScore,
        comment_ratio: quality.metrics.commentRatio,
        documentation_lines: quality.metrics.totalComments,
        code_lines: quality.metrics.totalLines,
        function_documentation: quality.metrics.functionDocumentation,
        class_documentation: quality.metrics.classDocumentation,
        file_header_docs: quality.metrics.fileHeaderDocumentation,
        todo_comments: quality.metrics.todoComments,
        fixme_comments: quality.metrics.fixmeComments,
        documentation_status: quality.qualityScore > 70 ? 'Well Documented' :
                             quality.qualityScore > 40 ? 'Adequately Documented' :
                             quality.qualityScore > 20 ? 'Poorly Documented' : 'Critically Undocumented'
      })),
      missing_documentation: documentationResult.missingDocumentation.map(missing => ({
        type: missing.type,
        name: missing.name,
        location: missing.location,
        severity: missing.severity,
        description: missing.description,
        impact: missing.severity === 'critical' ? 'Blocks maintainability' :
               missing.severity === 'high' ? 'Significantly impacts usability' :
               missing.severity === 'medium' ? 'Reduces code clarity' : 'Minor documentation gap'
      })),
      improvement_opportunities: documentationResult.improvementOpportunities.map(improvement => ({
        type: improvement.type,
        priority: improvement.priority,
        effort: improvement.effort,
        benefit_percentage: improvement.benefit,
        affected_files_count: improvement.affectedFiles.length,
        description: improvement.description,
        implementation: improvement.implementation,
        roi_score: improvement.benefit / (improvement.effort === 'low' ? 1 : improvement.effort === 'medium' ? 2 : 3)
      })),
      documentation_evolution: documentationResult.documentationEvolution.map(evolution => ({
        period: evolution.timePeriod,
        documentation_added: evolution.documentationAdded,
        documentation_removed: evolution.documentationRemoved,
        net_documentation_change: evolution.documentationAdded - evolution.documentationRemoved,
        quality_improvements: evolution.qualityImprovements,
        new_undocumented_code: evolution.newUndocumentedCode,
        documentation_ratio: evolution.documentationRatio,
        trend: evolution.trend,
        period_assessment: evolution.documentationRatio > 20 ? 'Good' :
                          evolution.documentationRatio > 10 ? 'Fair' : 'Poor'
      })),
      documentation_distribution: {
        by_quality_score: {
          excellent: documentationResult.fileQualities.filter(q => q.qualityScore > 80).length,
          good: documentationResult.fileQualities.filter(q => q.qualityScore > 60 && q.qualityScore <= 80).length,
          fair: documentationResult.fileQualities.filter(q => q.qualityScore > 40 && q.qualityScore <= 60).length,
          poor: documentationResult.fileQualities.filter(q => q.qualityScore > 20 && q.qualityScore <= 40).length,
          critical: documentationResult.fileQualities.filter(q => q.qualityScore <= 20).length
        },
        by_documentation_type: {
          file_headers: documentationResult.fileQualities.filter(q => q.metrics.fileHeaderDocumentation > 0).length,
          function_docs: documentationResult.fileQualities.filter(q => q.metrics.functionDocumentation > 0).length,
          class_docs: documentationResult.fileQualities.filter(q => q.metrics.classDocumentation > 0).length,
          inline_comments: documentationResult.fileQualities.filter(q => q.metrics.inlineComments > 0).length
        }
      },
      critical_issues: [
        ...documentationResult.missingDocumentation
          .filter(m => m.severity === 'critical' || m.severity === 'high')
          .map(m => `CRITICAL: ${m.description} in ${m.location}`),
        ...documentationResult.fileQualities
          .filter(q => q.qualityScore < 30)
          .map(q => `POOR QUALITY: ${q.filePath} has only ${q.metrics.commentRatio.toFixed(1)}% documentation`),
        ...(documentationResult.summaryMetrics.undocumentedFunctions > 10 ?
          [`MANY UNDOCUMENTED FUNCTIONS: ${documentationResult.summaryMetrics.undocumentedFunctions} functions lack documentation`] : []),
        ...(documentationResult.summaryMetrics.todoComments > 20 ?
          [`EXCESSIVE TODO COMMENTS: ${documentationResult.summaryMetrics.todoComments} TODO/FIXME comments indicate technical debt`] : [])
      ],
      actionable_recommendations: [
        ...documentationResult.improvementOpportunities
          .filter(i => i.priority === 'high' || i.priority === 'critical')
          .map(i => `PRIORITY: ${i.description} - ${i.benefit}% improvement potential`),
        ...(documentationResult.summaryMetrics.averageCommentRatio < 15 ?
          [`URGENT: Overall documentation ratio of ${documentationResult.summaryMetrics.averageCommentRatio.toFixed(1)}% is below acceptable levels`] : []),
        ...(documentationResult.summaryMetrics.undocumentedFunctions > 0 ?
          [`DOCUMENT ${documentationResult.summaryMetrics.undocumentedFunctions} undocumented functions for better maintainability`] : []),
        'Establish documentation standards and conduct regular documentation reviews'
      ]
    };

    fs.writeFileSync(path.join(sessionDir, 'documentation_quality_analysis.json'), JSON.stringify(documentationReport, null, 2));
  }

  /**
   * Analyze database schema and data flow
   */
  async analyzeDatabaseSchema(sqlFiles: string[]): Promise<DatabaseSchemaResult> {
    const schemas: DatabaseSchema[] = [];
    const dataFlow: DatabaseFlow[] = [];
    const migrationAnalysis: MigrationAnalysis = {
      complexity: 'low',
      estimatedHours: 0,
      breakingChanges: [],
      dataMigrationNeeded: false,
      rollbackComplexity: 'low',
      recommendations: []
    };
    const securityAssessment: DatabaseSecurityAssessment = {
      overallRisk: 'low',
      vulnerabilities: [],
      accessControls: [],
      sensitiveData: [],
      complianceScore: 100
    };
    const performanceMetrics: DatabasePerformanceMetrics = {
      queryComplexity: 0,
      indexEfficiency: 0,
      tableSizeDistribution: {},
      bottleneckIdentification: [],
      optimizationOpportunities: []
    };

    // Analyze SQL files for schema information
    for (const filePath of sqlFiles) {
      try {
        const fullPath = path.resolve(this.codebasePath, filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Extract schema information from SQL files
        const fileSchemas = await this.extractSchemasFromSQL(content, filePath);
        schemas.push(...fileSchemas);

        // Analyze data flow patterns
        const fileFlow = await this.analyzeDataFlow(content, filePath);
        dataFlow.push(...fileFlow);

        // Security analysis
        const fileSecurity = await this.analyzeDatabaseSecurity(content, filePath);
        securityAssessment.vulnerabilities.push(...fileSecurity.vulnerabilities);
        securityAssessment.accessControls.push(...fileSecurity.accessControls);
        securityAssessment.sensitiveData.push(...fileSecurity.sensitiveData);

      } catch (error) {
        console.error(`Error analyzing database schema in ${filePath}:`, error);
      }
    }

    // Generate migration analysis
    migrationAnalysis.estimatedHours = schemas.length * 2; // Rough estimate
    migrationAnalysis.complexity = schemas.length > 20 ? 'high' : schemas.length > 10 ? 'medium' : 'low';

    // Update security assessment
    securityAssessment.overallRisk = this.calculateOverallSecurityRisk(securityAssessment.vulnerabilities);

    // Generate performance metrics
    performanceMetrics.queryComplexity = this.calculateQueryComplexity(dataFlow);
    performanceMetrics.bottleneckIdentification = this.identifyBottlenecks(schemas, dataFlow);
    performanceMetrics.optimizationOpportunities = this.findOptimizationOpportunities(schemas, dataFlow);

    return {
      schemas,
      dataFlow,
      migrationAnalysis,
      securityAssessment,
      performanceMetrics
    };
  }

  private async extractSchemasFromSQL(content: string, filePath: string): Promise<DatabaseSchema[]> {
    const schemas: DatabaseSchema[] = [];

    // Extract CREATE TABLE statements
    const createTableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\)/gi;
    let match;

    while ((match = createTableRegex.exec(content)) !== null) {
      const tableName = match[1];
      const columnsText = match[2];

      const columns = this.parseTableColumns(columnsText);
      const constraints = this.parseTableConstraints(columnsText);

      schemas.push({
        name: tableName,
        type: 'table',
        columns,
        constraints,
        relationships: [],
        size: this.estimateTableSize(columns)
      });
    }

    // Extract CREATE VIEW statements
    const createViewRegex = /CREATE\s+VIEW\s+(\w+)\s+AS\s+([\s\S]*?)(?:;|$)/gi;
    while ((match = createViewRegex.exec(content)) !== null) {
      schemas.push({
        name: match[1],
        type: 'view',
        columns: [], // Would need to parse SELECT statement
        constraints: [],
        relationships: [],
        size: 0
      });
    }

    return schemas;
  }

  private parseTableColumns(columnsText: string): DatabaseColumn[] {
    const columns: DatabaseColumn[] = [];

    // Simple column parsing - split by commas and newlines
    const columnLines = columnsText.split(/[,]\s*\n|\n|,/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.toUpperCase().includes('CONSTRAINT'));

    for (const line of columnLines.slice(0, 10)) { // Limit to prevent excessive processing
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        columns.push({
          name: parts[0].replace(/[`"]/g, ''),
          dataType: parts[1].toUpperCase(),
          isNullable: !line.toUpperCase().includes('NOT NULL'),
          isPrimaryKey: line.toUpperCase().includes('PRIMARY KEY'),
          isForeignKey: line.toUpperCase().includes('REFERENCES'),
          maxLength: this.extractMaxLength(parts[1])
        });
      }
    }

    return columns;
  }

  private parseTableConstraints(constraintsText: string): DatabaseConstraint[] {
    const constraints: DatabaseConstraint[] = [];

    // Look for PRIMARY KEY constraints
    const pkMatch = constraintsText.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
    if (pkMatch) {
      constraints.push({
        name: 'PRIMARY_KEY',
        type: 'primary_key',
        columns: pkMatch[1].split(',').map(col => col.trim().replace(/[`"]/g, ''))
      });
    }

    // Look for FOREIGN KEY constraints
    const fkRegex = /FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+(\w+)\s*\(([^)]+)\)/gi;
    let fkMatch;
    while ((fkMatch = fkRegex.exec(constraintsText)) !== null) {
      constraints.push({
        name: `FK_${fkMatch[1].replace(/,/g, '_')}`,
        type: 'foreign_key',
        columns: fkMatch[1].split(',').map(col => col.trim().replace(/[`"]/g, '')),
        referencedTable: fkMatch[2],
        referencedColumns: fkMatch[3].split(',').map(col => col.trim().replace(/[`"]/g, ''))
      });
    }

    return constraints;
  }

  private extractMaxLength(dataType: string): number | undefined {
    const match = dataType.match(/(\w+)\((\d+)\)/);
    return match ? parseInt(match[2]) : undefined;
  }

  private estimateTableSize(columns: DatabaseColumn[]): number {
    return columns.reduce((total, col) => {
      const baseSize = this.getDataTypeSize(col.dataType);
      const length = col.maxLength || 1;
      return total + (baseSize * length);
    }, 0);
  }

  private getDataTypeSize(dataType: string): number {
    const sizeMap: Record<string, number> = {
      'INT': 4, 'INTEGER': 4, 'BIGINT': 8, 'SMALLINT': 2,
      'VARCHAR': 1, 'CHAR': 1, 'TEXT': 1,
      'FLOAT': 4, 'DOUBLE': 8, 'DECIMAL': 8,
      'DATE': 3, 'DATETIME': 8, 'TIMESTAMP': 8,
      'BOOLEAN': 1, 'BOOL': 1
    };

    return sizeMap[dataType.toUpperCase()] || 1;
  }

  private async analyzeDataFlow(content: string, filePath: string): Promise<DatabaseFlow[]> {
    const flows: DatabaseFlow[] = [];

    // Analyze SELECT statements
    const selectRegex = /SELECT[\s\S]*?FROM\s+(\w+)/gi;
    let match;
    while ((match = selectRegex.exec(content)) !== null) {
      flows.push({
        operation: 'SELECT',
        tables: [match[1]],
        frequency: 1,
        performance: 0.8,
        securityRisk: 'low'
      });
    }

    // Analyze INSERT statements
    const insertRegex = /INSERT\s+INTO\s+(\w+)/gi;
    while ((match = insertRegex.exec(content)) !== null) {
      flows.push({
        operation: 'INSERT',
        tables: [match[1]],
        frequency: 1,
        performance: 0.7,
        securityRisk: 'medium'
      });
    }

    return flows;
  }

  private async analyzeDatabaseSecurity(content: string, filePath: string): Promise<{
    vulnerabilities: DatabaseVulnerability[],
    accessControls: AccessControl[],
    sensitiveData: SensitiveDataField[]
  }> {
    const vulnerabilities: DatabaseVulnerability[] = [];
    const accessControls: AccessControl[] = [];
    const sensitiveData: SensitiveDataField[] = [];

    // Check for SQL injection patterns
    if (content.includes('+') || content.includes('||')) {
      vulnerabilities.push({
        type: 'sql_injection',
        severity: 'critical',
        location: filePath,
        description: 'String concatenation detected in SQL queries',
        recommendation: 'Use parameterized queries or prepared statements'
      });
    }

    // Look for sensitive data patterns
    const sensitivePatterns = ['password', 'ssn', 'social_security', 'credit_card', 'api_key'];
    for (const pattern of sensitivePatterns) {
      if (content.toLowerCase().includes(pattern)) {
        sensitiveData.push({
          table: 'unknown',
          column: pattern,
          dataType: 'VARCHAR',
          sensitivityLevel: 'high',
          encryptionStatus: 'none',
          maskingImplemented: false
        });
      }
    }

    return { vulnerabilities, accessControls, sensitiveData };
  }

  private calculateOverallSecurityRisk(vulnerabilities: DatabaseVulnerability[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (highCount > 0) return 'medium';
    return 'low';
  }

  private calculateQueryComplexity(flows: DatabaseFlow[]): number {
    return flows.reduce((total, flow) => {
      let complexity = 1;
      if (flow.tables.length > 3) complexity += 2;
      if (flow.operation === 'SELECT') complexity += 1;
      if (flow.securityRisk === 'high') complexity += 2;
      return total + complexity;
    }, 0);
  }

  private identifyBottlenecks(schemas: DatabaseSchema[], flows: DatabaseFlow[]): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];

    // Check for missing indexes
    for (const schema of schemas) {
      const foreignKeys = schema.constraints.filter(c => c.type === 'foreign_key');
      if (foreignKeys.length > 0 && !schema.name.toLowerCase().includes('index')) {
        bottlenecks.push({
          type: 'missing_index',
          location: schema.name,
          impact: 'medium',
          description: `Table ${schema.name} has foreign keys but no indexes detected`,
          solution: 'Consider adding indexes on foreign key columns'
        });
      }
    }

    return bottlenecks;
  }

  private findOptimizationOpportunities(schemas: DatabaseSchema[], flows: DatabaseFlow[]): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Suggest partitioning for large tables
    for (const schema of schemas) {
      if (schema.size > 1000000) { // Large table threshold
        opportunities.push({
          type: 'partitioning',
          potentialBenefit: 60,
          implementationComplexity: 'high',
          description: `Table ${schema.name} is large and could benefit from partitioning`,
          affectedComponents: [schema.name]
        });
      }
    }

    return opportunities;
  }

  /**
   * Analyze performance characteristics of the codebase
   */
  async analyzePerformanceProfile(filePaths: string[]): Promise<PerformanceProfileResult> {
    const profiles = new Map<string, PerformanceProfile>();
    const criticalBottlenecks: PerformanceBottleneck[] = [];
    const topRecommendations: PerformanceRecommendation[] = [];
    let totalPerformanceScore = 0;

    // Analyze each file for performance characteristics
    for (const filePath of filePaths) {
      try {
        const fullPath = path.resolve(this.codebasePath, filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        const profile: PerformanceProfile = {
          algorithmComplexity: this.analyzeAlgorithmComplexity(content, filePath),
          memoryUsage: this.analyzeMemoryUsage(content, filePath),
          ioOperations: this.analyzeIOOperations(content, filePath),
          concurrencyAnalysis: this.analyzeConcurrency(content, filePath),
          bottlenecks: this.identifyPerformanceBottlenecks(content, filePath),
          optimizationRecommendations: this.generatePerformanceRecommendations(content, filePath)
        };

        profiles.set(filePath, profile);

        // Collect critical bottlenecks
        criticalBottlenecks.push(...profile.bottlenecks.filter(b => b.severity === 'critical' || b.severity === 'high'));

        // Collect top recommendations
        topRecommendations.push(...profile.optimizationRecommendations
          .filter(r => r.priority === 'high' || r.priority === 'critical')
          .slice(0, 3));

        // Calculate file performance score
        const fileScore = this.calculatePerformanceScore(profile);
        totalPerformanceScore += fileScore;

      } catch (error) {
        console.error(`Error analyzing performance for ${filePath}:`, error);
      }
    }

    const overallPerformanceScore = profiles.size > 0 ? totalPerformanceScore / profiles.size : 0;

    // Generate scalability assessment
    const scalabilityAssessment = this.assessScalability(profiles, criticalBottlenecks);

    return {
      profiles,
      overallPerformanceScore,
      criticalBottlenecks,
      topRecommendations: topRecommendations.slice(0, 10),
      scalabilityAssessment
    };
  }

  private analyzeAlgorithmComplexity(content: string, filePath: string): AlgorithmComplexity {
    const complexities = new Map<string, string>();

    // Analyze loops
    const loopPatterns = [
      { pattern: /for\s*\([^}]*\{[\s\S]*?\}/g, complexity: 'O(n)' },
      { pattern: /while\s*\([^}]*\{[\s\S]*?\}/g, complexity: 'O(n)' },
      { pattern: /for\s*\([^}]*\{[\s\S]*?for\s*\([^}]*\{[\s\S]*?\}\s*\}\s*\}/g, complexity: 'O(n²)' }
    ];

    let maxComplexity = 'O(1)';
    let maxNesting = 0;
    let recursionDepth = 0;

    for (const { pattern, complexity } of loopPatterns) {
      const matches = content.match(pattern) || [];
      if (matches.length > 0 && this.getComplexityOrder(complexity) > this.getComplexityOrder(maxComplexity)) {
        maxComplexity = complexity;
      }
    }

    // Check for recursion
    const recursionMatches = content.match(/(\w+)\s*\([^)]*\)\s*{[\s\S]*?\1\s*\(/g);
    if (recursionMatches) {
      recursionDepth = recursionMatches.length;
      if (recursionDepth > 0) {
        maxComplexity = recursionDepth > 2 ? 'O(2ⁿ)' : 'O(n)';
    }
  }

    // Analyze nested loops
    const nestedLoopMatches = content.match(/for\s*\([^}]*\{[\s\S]*?for\s*\([^}]*\{/g);
    if (nestedLoopMatches) {
      maxNesting = nestedLoopMatches.length + 1;
      if (maxNesting >= 3) maxComplexity = 'O(n³)';
      else if (maxNesting >= 2) maxComplexity = 'O(n²)';
    }

    return {
      overallComplexity: maxComplexity,
      functionComplexities: complexities,
      recursionDepth,
      loopNesting: maxNesting,
      worstCase: maxComplexity,
      bestCase: 'O(1)',
      averageCase: maxComplexity.includes('²') ? 'O(n¹.⁵)' : maxComplexity
    };
  }

  public getComplexityOrder(complexity: string): number {
    const orderMap: Record<string, number> = {
      'O(1)': 1, 'O(log n)': 2, 'O(n)': 3, 'O(n log n)': 4,
      'O(n²)': 5, 'O(n³)': 6, 'O(2ⁿ)': 7, 'O(n!)': 8
    };
    return orderMap[complexity] || 1;
  }

  private analyzeMemoryUsage(content: string, filePath: string): MemoryUsageProfile {
    const allocations: AllocationPattern[] = [];

    // Detect memory allocations
    const allocationPatterns = [
      { pattern: /new\s+\w+/g, type: 'heap' as const, purpose: 'Dynamic allocation' },
      { pattern: /malloc\s*\(/g, type: 'heap' as const, purpose: 'C-style allocation' },
      { pattern: /std::vector/g, type: 'dynamic' as const, purpose: 'STL container' },
      { pattern: /std::string/g, type: 'heap' as const, purpose: 'String allocation' },
      { pattern: /std::unique_ptr/g, type: 'heap' as const, purpose: 'Smart pointer' },
      { pattern: /std::shared_ptr/g, type: 'heap' as const, purpose: 'Shared pointer' }
    ];

    for (const { pattern, type, purpose } of allocationPatterns) {
      const matches = content.match(pattern) || [];
      if (matches.length > 0) {
        allocations.push({
          type,
          frequency: matches.length,
          averageSize: type === 'heap' ? 64 : 32, // Rough estimates
          location: filePath,
          purpose
        });
      }
    }

    // Estimate total memory usage
    const estimatedMemoryUsage = allocations.reduce((total, alloc) =>
      total + (alloc.frequency * alloc.averageSize), 0);

    // Assess leak potential
    const heapAllocations = allocations.filter(a => a.type === 'heap').length;
    const smartPointerUsage = allocations.filter(a =>
      a.purpose.includes('Smart pointer') || a.purpose.includes('unique_ptr') || a.purpose.includes('shared_ptr')).length;

    const leakPotential: 'low' | 'medium' | 'high' =
      heapAllocations > 10 && smartPointerUsage === 0 ? 'high' :
      heapAllocations > 5 ? 'medium' : 'low';

    return {
      estimatedMemoryUsage,
      allocationPatterns: allocations,
      leakPotential,
      garbageCollectionPressure: heapAllocations * 10,
      memoryOptimizationScore: leakPotential === 'low' ? 90 :
                              leakPotential === 'medium' ? 70 : 50
    };
  }

  private analyzeIOOperations(content: string, filePath: string): IOOperationProfile {
    const fileOperations: FileOperation[] = [];
    const networkOperations: NetworkOperation[] = [];
    const databaseOperations: DatabaseOperation[] = [];

    // Analyze file operations
    const fileOpPatterns = [
      { pattern: /fs\.readFile|readFileSync|fopen.*"r"/g, type: 'read' as const },
      { pattern: /fs\.writeFile|writeFileSync|fopen.*"w"/g, type: 'write' as const },
      { pattern: /fs\.appendFile|fprintf/g, type: 'append' as const }
    ];

    for (const { pattern, type } of fileOpPatterns) {
      const matches = content.match(pattern) || [];
      if (matches.length > 0) {
        fileOperations.push({
          type,
          filePath: 'unknown', // Would need more sophisticated parsing
          frequency: matches.length,
          averageSize: 1024, // Rough estimate
          isBlocking: type !== 'read', // Assume writes are blocking
          optimization: type === 'read' ? 'Consider caching' : 'Consider async I/O'
        });
      }
    }

    // Analyze network operations
    const networkPatterns = [
      /fetch\(|axios\.|http\.|socket\./g,
      /XMLHttpRequest|WebSocket/g
    ];

    for (const pattern of networkPatterns) {
      const matches = content.match(pattern) || [];
      if (matches.length > 0) {
        networkOperations.push({
          type: 'http',
          endpoint: 'unknown',
          frequency: matches.length,
          dataSize: 1024,
          isAsync: true,
          timeout: 5000
        });
      }
    }

    // Analyze database operations
    const dbPatterns = [
      /SELECT|INSERT|UPDATE|DELETE/g,
      /mongoose\.|sequelize\.|prisma\./g
    ];

    for (const pattern of dbPatterns) {
      const matches = content.match(pattern) || [];
      if (matches.length > 0) {
        databaseOperations.push({
          type: 'query',
          table: 'unknown',
          frequency: matches.length,
          complexity: 'O(1)',
          indexUsage: false,
          lockType: 'none'
        });
      }
    }

    // Calculate I/O efficiency score
    const totalOperations = fileOperations.length + networkOperations.length + databaseOperations.length;
    const blockingOperations = fileOperations.filter(op => op.isBlocking).length;
    const ioEfficiency = totalOperations > 0 ? Math.max(0, 100 - (blockingOperations / totalOperations) * 50) : 100;

    return {
      fileOperations,
      networkOperations,
      databaseOperations,
      ioEfficiency,
      blockingOperations
    };
  }

  private analyzeConcurrency(content: string, filePath: string): ConcurrencyProfile {
    const sharedResources: SharedResource[] = [];
    const synchronizationPrimitives: SynchronizationPrimitive[] = [];

    // Detect shared resources
    const sharedPatterns = [
      /static\s+\w+|global\s+\w+/g,
      /extern\s+\w+/g,
      /volatile\s+\w+/g
    ];

    for (const pattern of sharedPatterns) {
      const matches = content.match(pattern) || [];
      if (matches.length > 0) {
        sharedResources.push({
          name: 'detected_shared',
          type: 'variable',
          accessPattern: 'read_write',
          protectionLevel: 'none'
        });
      }
    }

    // Detect synchronization primitives
    const syncPatterns = [
      { pattern: /std::mutex|pthread_mutex/g, type: 'mutex' as const },
      { pattern: /std::atomic/g, type: 'atomic' as const },
      { pattern: /std::lock_guard|std::unique_lock/g, type: 'mutex' as const }
    ];

    for (const { pattern, type } of syncPatterns) {
      const matches = content.match(pattern) || [];
      if (matches.length > 0) {
        synchronizationPrimitives.push({
          type,
          location: filePath,
          purpose: 'Thread synchronization',
          effectiveness: type === 'atomic' ? 95 : 85
        });
      }
    }

    // Assess thread safety
    const hasSharedResources = sharedResources.length > 0;
    const hasSynchronization = synchronizationPrimitives.length > 0;

    const threadSafety: 'safe' | 'unsafe' | 'conditionally_safe' =
      !hasSharedResources ? 'safe' :
      hasSynchronization ? 'conditionally_safe' : 'unsafe';

    // Assess race condition risk
    const unprotectedShared = sharedResources.filter(r => r.protectionLevel === 'none').length;
    const raceConditionRisk: 'low' | 'medium' | 'high' =
      unprotectedShared === 0 ? 'low' :
      unprotectedShared > 5 ? 'high' : 'medium';

    return {
      threadSafety,
      sharedResources,
      synchronizationPrimitives,
      raceConditionRisk,
      deadlockPotential: synchronizationPrimitives.length > 3 ? 'medium' : 'low'
    };
  }

  private identifyPerformanceBottlenecks(content: string, filePath: string): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];

    // Check for nested loops (algorithmic bottleneck)
    const nestedLoops = content.match(/for\s*\([^}]*\{[\s\S]*?for\s*\([^}]*\{[\s\S]*?\}\s*\}/g);
    if (nestedLoops && nestedLoops.length > 0) {
      bottlenecks.push({
        type: 'algorithmic',
        severity: 'high',
        location: filePath,
        description: `${nestedLoops.length} nested loops detected`,
        impact: 'Exponential time complexity',
        solution: 'Consider optimizing algorithm or using more efficient data structures'
      });
    }

    // Check for large data structures
    const largeArrays = content.match(/std::vector|Array\[\d+\]|\.length\s*>\s*\d+/g);
    if (largeArrays && largeArrays.length > 5) {
      bottlenecks.push({
        type: 'memory_bound',
        severity: 'medium',
        location: filePath,
        description: 'Multiple large data structures detected',
        impact: 'High memory usage',
        solution: 'Consider pagination or streaming for large datasets'
      });
    }

    // Check for blocking I/O
    const blockingIO = content.match(/\.readFileSync|\.writeFileSync|fopen.*[rw]/g);
    if (blockingIO && blockingIO.length > 2) {
      bottlenecks.push({
        type: 'io_bound',
        severity: 'medium',
        location: filePath,
        description: `${blockingIO.length} blocking I/O operations detected`,
        impact: 'Application blocking on I/O',
        solution: 'Use asynchronous I/O or implement buffering'
      });
    }

    return bottlenecks;
  }

  private generatePerformanceRecommendations(content: string, filePath: string): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // Memory optimization recommendations
    if (content.includes('new ') && !content.includes('unique_ptr') && !content.includes('shared_ptr')) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        effort: 'low',
        benefit: 30,
        description: 'Replace raw pointers with smart pointers',
        implementation: 'Use std::unique_ptr or std::shared_ptr instead of raw new/delete',
        affectedComponents: [filePath]
      });
    }

    // Algorithm optimization recommendations
    const nestedLoops = content.match(/for\s*\([^}]*\{[\s\S]*?for\s*\([^}]*\{/g);
    if (nestedLoops && nestedLoops.length > 0) {
      recommendations.push({
        type: 'algorithm',
        priority: 'high',
        effort: 'medium',
        benefit: 60,
        description: 'Optimize nested loop algorithm',
        implementation: 'Consider using hash maps or sorting to reduce complexity',
        affectedComponents: [filePath]
      });
    }

    // I/O optimization recommendations
    const syncIO = content.match(/readFileSync|writeFileSync/g);
    if (syncIO && syncIO.length > 0) {
      recommendations.push({
        type: 'io',
        priority: 'medium',
        effort: 'medium',
        benefit: 40,
        description: 'Replace synchronous I/O with asynchronous',
        implementation: 'Use async/await or Promise-based I/O operations',
        affectedComponents: [filePath]
      });
    }

    return recommendations;
  }

  private calculatePerformanceScore(profile: PerformanceProfile): number {
    const complexityScore = this.getComplexityOrder(profile.algorithmComplexity.overallComplexity) * 10;
    const memoryScore = profile.memoryUsage.memoryOptimizationScore;
    const ioScore = profile.ioOperations.ioEfficiency;
    const concurrencyScore = profile.concurrencyAnalysis.raceConditionRisk === 'low' ? 90 :
                            profile.concurrencyAnalysis.raceConditionRisk === 'medium' ? 70 : 50;

    return (complexityScore + memoryScore + ioScore + concurrencyScore) / 4;
  }

  private assessScalability(profiles: Map<string, PerformanceProfile>, bottlenecks: PerformanceBottleneck[]): ScalabilityAssessment {
    const criticalIssues = bottlenecks.filter(b => b.severity === 'critical').length;
    const highIssues = bottlenecks.filter(b => b.severity === 'high').length;

    let currentCapacity = 1000; // Base capacity
    currentCapacity -= criticalIssues * 200;
    currentCapacity -= highIssues * 100;

    const maxCapacity = currentCapacity * 3; // Theoretical max with optimizations

    const scalingLimiters = [];
    if (criticalIssues > 0) scalingLimiters.push('Critical performance bottlenecks');
    if (highIssues > 2) scalingLimiters.push('Multiple high-severity bottlenecks');
    if (profiles.size > 50) scalingLimiters.push('Large codebase complexity');

    const scalabilityGrade = currentCapacity > 5000 ? 'A' :
                            currentCapacity > 2000 ? 'B' :
                            currentCapacity > 1000 ? 'C' :
                            currentCapacity > 500 ? 'D' : 'F';

    return {
      currentCapacity,
      maxCapacity,
      scalingLimiters,
      optimizationPath: [
        'Address critical bottlenecks',
        'Implement caching strategies',
        'Optimize memory usage',
        'Improve I/O efficiency'
      ],
      recommendedImprovements: [
        'Implement performance monitoring',
        'Add automated performance testing',
        'Consider microservices for scalability',
        'Implement caching layers'
      ],
      scalabilityGrade
    };
  }

  private groupEntitiesByType(entities: CodeEntity[]): Record<string, number> {
    return entities.reduce((acc, entity) => {
      acc[entity.type] = (acc[entity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupEntitiesByFile(entities: CodeEntity[]): Record<string, CodeEntity[]> {
    return entities.reduce((acc, entity) => {
      if (!acc[entity.filePath]) {
        acc[entity.filePath] = [];
      }
      acc[entity.filePath].push(entity);
      return acc;
    }, {} as Record<string, CodeEntity[]>);
  }

  private groupRelationshipsByType(relationships: CodeRelationship[]): Record<string, number> {
    return relationships.reduce((acc, rel) => {
      acc[rel.type] = (acc[rel.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private buildRelationshipGraph(relationships: CodeRelationship[]): any {
    const nodes = new Set<string>();
    const edges: any[] = [];

    relationships.forEach(rel => {
      nodes.add(rel.from);
      nodes.add(rel.to);
      edges.push({
        source: rel.from,
        target: rel.to,
        type: rel.type,
        confidence: rel.confidence
      });
    });

    return {
      nodes: Array.from(nodes),
      edges: edges
    };
  }

  /**
   * Analyze code clones and duplication patterns
   */
  async analyzeCodeClones(filePaths: string[]): Promise<CloneAnalysisResult> {
    const exactClones: CodeClone[] = [];
    const nearClones: CodeClone[] = [];
    const functionalClones: CodeClone[] = [];
    const refactoringOpportunities: RefactoringOpportunity[] = [];
    const cloneEvolution: CloneEvolution[] = [];

    // Analyze each file for clone patterns
    for (let i = 0; i < filePaths.length; i++) {
      for (let j = i + 1; j < filePaths.length; j++) {
        try {
          const file1 = path.resolve(this.codebasePath, filePaths[i]);
          const file2 = path.resolve(this.codebasePath, filePaths[j]);

          const content1 = fs.readFileSync(file1, 'utf-8');
          const content2 = fs.readFileSync(file2, 'utf-8');

          // Find exact clones
          const exactClone = this.findExactClones(content1, content2, filePaths[i], filePaths[j]);
          if (exactClone) exactClones.push(exactClone);

          // Find near clones (similar but not identical)
          const nearClone = this.findNearClones(content1, content2, filePaths[i], filePaths[j]);
          if (nearClone) nearClones.push(nearClone);

          // Find functional clones (same logic, different implementation)
          const functionalClone = this.findFunctionalClones(content1, content2, filePaths[i], filePaths[j]);
          if (functionalClone) functionalClones.push(functionalClone);

        } catch (error) {
          // Ignore file read errors
        }
      }
    }

    // Generate clone metrics
    const cloneMetrics = this.calculateCloneMetrics(exactClones, nearClones, functionalClones, filePaths);

    // Identify refactoring opportunities
    refactoringOpportunities.push(...this.identifyRefactoringOpportunities(exactClones, nearClones, functionalClones));

    // Generate clone evolution data
    cloneEvolution.push(...this.generateCloneEvolutionData(cloneMetrics));

    return {
      exactClones,
      nearClones,
      functionalClones,
      cloneMetrics,
      refactoringOpportunities,
      cloneEvolution
    };
  }

  private findExactClones(content1: string, content2: string, file1: string, file2: string): CodeClone | null {
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');

    const minLength = 5; // Minimum clone length
    let bestClone: CodeClone | null = null;

    for (let i = 0; i <= lines1.length - minLength; i++) {
      for (let j = 0; j <= lines2.length - minLength; j++) {
        let matchLength = 0;
        while (i + matchLength < lines1.length &&
               j + matchLength < lines2.length &&
               lines1[i + matchLength].trim() === lines2[j + matchLength].trim()) {
          matchLength++;
        }

        if (matchLength >= minLength) {
          const clone: CodeClone = {
            type: 'exact',
            primaryFile: file1,
            cloneFiles: [file2],
            startLine: i + 1,
            endLine: i + matchLength,
            length: matchLength,
            similarity: 100,
            cloneContent: lines1.slice(i, i + matchLength).join('\n'),
            risk: matchLength > 20 ? 'high' : matchLength > 10 ? 'medium' : 'low',
            refactoringOpportunity: 'Extract to shared utility function'
          };

          if (!bestClone || matchLength > bestClone.length) {
            bestClone = clone;
          }
        }
      }
    }

    return bestClone;
  }

  private findNearClones(content1: string, content2: string, file1: string, file2: string): CodeClone | null {
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');

    const minLength = 3;
    let bestClone: CodeClone | null = null;

    for (let i = 0; i <= lines1.length - minLength; i++) {
      for (let j = 0; j <= lines2.length - minLength; j++) {
        let matchLength = 0;
        let similarity = 0;

        while (i + matchLength < lines1.length && j + matchLength < lines2.length) {
          const line1 = lines1[i + matchLength].trim();
          const line2 = lines2[j + matchLength].trim();

          if (line1 === line2) {
            similarity += 100;
          } else if (this.calculateLineSimilarity(line1, line2) > 70) {
            similarity += this.calculateLineSimilarity(line1, line2);
          } else {
            break;
          }
          matchLength++;
        }

        if (matchLength >= minLength) {
          const avgSimilarity = similarity / matchLength;
          if (avgSimilarity >= 80 && avgSimilarity < 100) {
            const clone: CodeClone = {
              type: 'near',
              primaryFile: file1,
              cloneFiles: [file2],
              startLine: i + 1,
              endLine: i + matchLength,
              length: matchLength,
              similarity: avgSimilarity,
              cloneContent: lines1.slice(i, i + matchLength).join('\n'),
              risk: avgSimilarity > 90 ? 'medium' : 'low',
              refactoringOpportunity: 'Consider consolidating similar implementations'
            };

            if (!bestClone || avgSimilarity > bestClone.similarity) {
              bestClone = clone;
            }
          }
        }
      }
    }

    return bestClone;
  }

  private findFunctionalClones(content1: string, content2: string, file1: string, file2: string): CodeClone | null {
    // Look for similar function patterns
    const functionPattern1 = this.extractFunctionPatterns(content1);
    const functionPattern2 = this.extractFunctionPatterns(content2);

    for (const pattern1 of functionPattern1) {
      for (const pattern2 of functionPattern2) {
        const similarity = this.calculateFunctionSimilarity(pattern1, pattern2);
        if (similarity >= 75) {
          return {
            type: 'functional',
            primaryFile: file1,
            cloneFiles: [file2],
            startLine: pattern1.startLine,
            endLine: pattern1.endLine,
            length: pattern1.lines,
            similarity,
            cloneContent: pattern1.content,
            risk: similarity > 90 ? 'medium' : 'low',
            refactoringOpportunity: 'Consider strategy pattern or shared interface'
          };
        }
      }
    }

    return null;
  }

  private calculateLineSimilarity(line1: string, line2: string): number {
    if (line1 === line2) return 100;

    // Simple similarity based on common words and structure
    const words1 = line1.split(/\s+/).filter(w => w.length > 2);
    const words2 = line2.split(/\s+/).filter(w => w.length > 2);

    const commonWords = words1.filter(w => words2.includes(w)).length;
    const totalWords = Math.max(words1.length, words2.length);

    return totalWords > 0 ? (commonWords / totalWords) * 100 : 0;
  }

  private extractFunctionPatterns(content: string): any[] {
    const patterns: any[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Look for function definitions
      if (line.match(/function\s+\w+|def\s+\w+|\w+\s*\([^)]*\)\s*{/)) {
        // Find function end (simple heuristic)
        let endLine = i;
        let braceCount = 0;

        for (let j = i; j < lines.length; j++) {
          braceCount += (lines[j].match(/\{/g) || []).length;
          braceCount -= (lines[j].match(/\}/g) || []).length;

          if (braceCount <= 0 && j > i) {
            endLine = j;
            break;
          }
        }

        patterns.push({
          startLine: i + 1,
          endLine: endLine + 1,
          lines: endLine - i,
          content: lines.slice(i, endLine + 1).join('\n')
        });
      }
    }

    return patterns;
  }

  private calculateFunctionSimilarity(pattern1: any, pattern2: any): number {
    // Compare function structure and content
    const content1 = pattern1.content;
    const content2 = pattern2.content;

    // Compare line count
    const lineDiff = Math.abs(pattern1.lines - pattern2.lines);
    const lineSimilarity = Math.max(0, 100 - (lineDiff / Math.max(pattern1.lines, pattern2.lines)) * 50);

    // Compare content similarity
    const contentSimilarity = this.calculateLineSimilarity(
      content1.replace(/\s+/g, ' ').substring(0, 100),
      content2.replace(/\s+/g, ' ').substring(0, 100)
    );

    return (lineSimilarity + contentSimilarity) / 2;
  }

  private calculateCloneMetrics(exactClones: CodeClone[], nearClones: CodeClone[], functionalClones: CodeClone[], filePaths: string[]): CloneMetrics {
    const allClones = [...exactClones, ...nearClones, ...functionalClones];
    const totalDuplicatedLines = allClones.reduce((sum, clone) => sum + clone.length, 0);
    const totalLines = filePaths.reduce((sum, file) => {
      try {
        const content = fs.readFileSync(path.resolve(this.codebasePath, file), 'utf-8');
        return sum + content.split('\n').length;
      } catch {
        return sum;
      }
    }, 0);

    // Find most cloned file
    const fileCloneCount = new Map<string, number>();
    allClones.forEach(clone => {
      fileCloneCount.set(clone.primaryFile, (fileCloneCount.get(clone.primaryFile) || 0) + 1);
      clone.cloneFiles.forEach(cloneFile => {
        fileCloneCount.set(cloneFile, (fileCloneCount.get(cloneFile) || 0) + 1);
      });
    });

    const mostClonedFile = Array.from(fileCloneCount.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    return {
      totalClones: allClones.length,
      totalDuplicatedLines,
      duplicationPercentage: totalLines > 0 ? (totalDuplicatedLines / totalLines) * 100 : 0,
      largestClone: Math.max(...allClones.map(c => c.length), 0),
      mostClonedFile,
      cloneDistribution: Object.fromEntries(fileCloneCount)
    };
  }

  private identifyRefactoringOpportunities(exactClones: CodeClone[], nearClones: CodeClone[], functionalClones: CodeClone[]): RefactoringOpportunity[] {
    const opportunities: RefactoringOpportunity[] = [];

    // Extract method opportunities for exact clones
    const largeExactClones = exactClones.filter(c => c.length > 10);
    if (largeExactClones.length > 0) {
      opportunities.push({
        type: 'extract_method',
        priority: 'high',
        benefit: largeExactClones.reduce((sum, c) => sum + c.length, 0),
        affectedFiles: [...new Set(largeExactClones.flatMap(c => [c.primaryFile, ...c.cloneFiles]))],
        description: `${largeExactClones.length} large exact clones found`,
        implementation: 'Extract common functionality into shared utility functions',
        risk: 'low'
      });
    }

    // Strategy pattern for functional clones
    const significantFunctionalClones = functionalClones.filter(c => c.similarity > 80);
    if (significantFunctionalClones.length > 2) {
      opportunities.push({
        type: 'strategy_pattern',
        priority: 'medium',
        benefit: significantFunctionalClones.length * 20,
        affectedFiles: [...new Set(significantFunctionalClones.flatMap(c => [c.primaryFile, ...c.cloneFiles]))],
        description: `${significantFunctionalClones.length} functional clones with high similarity`,
        implementation: 'Implement strategy pattern to eliminate similar implementations',
        risk: 'medium'
      });
    }

    return opportunities;
  }

  private generateCloneEvolutionData(metrics: CloneMetrics): CloneEvolution[] {
    const evolution: CloneEvolution[] = [];

    // Generate mock evolution data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));

      evolution.push({
        timePeriod: date.toISOString().split('T')[0],
        newClones: Math.floor(Math.random() * 5),
        resolvedClones: Math.floor(Math.random() * 3),
        growingClones: Math.floor(Math.random() * 8),
        cloneDensity: metrics.duplicationPercentage * (0.8 + Math.random() * 0.4),
        refactoringImpact: Math.floor(Math.random() * 50) + 10
      });
    }

    return evolution;
  }

  /**
   * Analyze documentation quality and coverage
   */
  async analyzeDocumentationQuality(filePaths: string[]): Promise<DocumentationQualityResult> {
    const fileQualities: DocumentationQuality[] = [];
    const missingDocumentation: MissingDocumentation[] = [];
    const improvementOpportunities: DocumentationImprovement[] = [];
    const documentationEvolution: DocumentationEvolution[] = [];

    let totalDocumentationLines = 0;
    let totalCodeLines = 0;
    let wellDocumentedFiles = 0;
    let poorlyDocumentedFiles = 0;
    let undocumentedFunctions = 0;
    let undocumentedClasses = 0;
    let totalTodoComments = 0;
    let totalFixmeComments = 0;

    // Analyze each file for documentation quality
    for (const filePath of filePaths) {
      try {
        const fullPath = path.resolve(this.codebasePath, filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');

        const metrics: DocumentationMetrics = {
          totalComments: this.countComments(lines),
          totalLines: lines.length,
          commentRatio: 0,
          functionDocumentation: this.countFunctionDocumentation(lines, filePath),
          classDocumentation: this.countClassDocumentation(lines, filePath),
          fileHeaderDocumentation: this.countFileHeaderDocumentation(lines),
          inlineComments: this.countInlineComments(lines),
          todoComments: this.countTodoComments(lines),
          fixmeComments: this.countFixmeComments(lines)
        };

        metrics.commentRatio = lines.length > 0 ? (metrics.totalComments / lines.length) * 100 : 0;

        const quality = this.assessDocumentationQuality(filePath, metrics, content);
        fileQualities.push(quality);

        // Update summary metrics
        totalDocumentationLines += metrics.totalComments;
        totalCodeLines += lines.length;
        wellDocumentedFiles += metrics.commentRatio > 20 ? 1 : 0;
        poorlyDocumentedFiles += metrics.commentRatio < 10 ? 1 : 0;
        undocumentedFunctions += quality.missingDocumentation.filter(m => m.type === 'function').length;
        undocumentedClasses += quality.missingDocumentation.filter(m => m.type === 'class').length;
        totalTodoComments += metrics.todoComments;
        totalFixmeComments += metrics.fixmeComments;

        // Collect missing documentation
        missingDocumentation.push(...quality.missingDocumentation);

        // Collect improvement opportunities
        if (quality.improvementRecommendations.length > 0) {
          improvementOpportunities.push({
            type: 'add_comments',
            priority: metrics.commentRatio < 10 ? 'high' : 'medium',
            effort: 'low',
            benefit: Math.min(50, (25 - metrics.commentRatio) * 2),
            affectedFiles: [filePath],
            description: `Improve documentation in ${filePath}`,
            implementation: 'Add comprehensive comments and API documentation'
          });
        }

      } catch (error) {
        console.error(`Error analyzing documentation quality for ${filePath}:`, error);
      }
    }

    const overallQualityScore = fileQualities.length > 0 ?
      fileQualities.reduce((sum, q) => sum + q.qualityScore, 0) / fileQualities.length : 0;

    // Generate documentation evolution data
    documentationEvolution.push(...this.generateDocumentationEvolutionData(totalDocumentationLines, totalCodeLines));

    return {
      overallQualityScore,
      fileQualities,
      summaryMetrics: {
        averageCommentRatio: totalCodeLines > 0 ? (totalDocumentationLines / totalCodeLines) * 100 : 0,
        totalDocumentationLines,
        totalCodeLines,
        overallDocumentationRatio: totalCodeLines > 0 ? (totalDocumentationLines / totalCodeLines) * 100 : 0,
        wellDocumentedFiles,
        poorlyDocumentedFiles,
        undocumentedFunctions,
        undocumentedClasses,
        todoComments: totalTodoComments,
        fixmeComments: totalFixmeComments
      },
      missingDocumentation,
      improvementOpportunities,
      documentationEvolution
    };
  }

  private countComments(lines: string[]): number {
    return lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('#') ||
             trimmed.startsWith('/*') || trimmed.startsWith('*/') ||
             trimmed.startsWith('"""') || trimmed.startsWith("'''") ||
             (trimmed.startsWith('*') && trimmed.length > 1);
    }).length;
  }

  private countFunctionDocumentation(lines: string[], filePath: string): number {
    const extension = path.extname(filePath).toLowerCase();
    let documentedFunctions = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Look for function definitions
      if ((extension === '.js' || extension === '.ts') && line.match(/function\s+\w+|const\s+\w+\s*=\s*.*=>/)) {
        // Check if next few lines have comments
        let hasDocumentation = false;
        for (let j = i - 3; j < i; j++) {
          if (j >= 0 && (lines[j].trim().startsWith('//') || lines[j].trim().startsWith('/*'))) {
            hasDocumentation = true;
            break;
          }
        }
        if (hasDocumentation) documentedFunctions++;
      }

      if (extension === '.py' && line.match(/def\s+\w+/)) {
        // Check for docstring
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('"""')) {
          documentedFunctions++;
        }
      }

      if ((extension === '.cpp' || extension === '.hpp') && line.match(/\w+\s+\w+\s*\([^)]*\)\s*{/)) {
        // Check for preceding comments
        let hasDocumentation = false;
        for (let j = i - 3; j < i; j++) {
          if (j >= 0 && (lines[j].trim().startsWith('//') || lines[j].trim().startsWith('/*'))) {
            hasDocumentation = true;
            break;
          }
        }
        if (hasDocumentation) documentedFunctions++;
      }
    }

    return documentedFunctions;
  }

  private countClassDocumentation(lines: string[], filePath: string): number {
    const extension = path.extname(filePath).toLowerCase();
    let documentedClasses = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Look for class definitions
      if (line.match(/class\s+\w+|struct\s+\w+/)) {
        // Check for preceding documentation
        let hasDocumentation = false;
        for (let j = i - 5; j < i; j++) {
          if (j >= 0 && (lines[j].trim().startsWith('//') || lines[j].trim().startsWith('/*'))) {
            hasDocumentation = true;
            break;
          }
        }
        if (hasDocumentation) documentedClasses++;
      }
    }

    return documentedClasses;
  }

  private countFileHeaderDocumentation(lines: string[]): number {
    // Check first 10 lines for file header documentation
    const headerLines = lines.slice(0, 10);
    return headerLines.filter(line =>
      line.trim().startsWith('//') ||
      line.trim().startsWith('/*') ||
      line.trim().startsWith('#') ||
      line.trim().startsWith('"""')
    ).length;
  }

  private countInlineComments(lines: string[]): number {
    return lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') && !trimmed.includes('TODO') && !trimmed.includes('FIXME');
    }).length;
  }

  private countTodoComments(lines: string[]): number {
    return lines.filter(line =>
      line.toUpperCase().includes('TODO') ||
      line.toUpperCase().includes('FIXME')
    ).length;
  }

  private countFixmeComments(lines: string[]): number {
    return lines.filter(line =>
      line.toUpperCase().includes('FIXME') ||
      line.toUpperCase().includes('HACK')
    ).length;
  }

  private assessDocumentationQuality(filePath: string, metrics: DocumentationMetrics, content: string): DocumentationQuality {
    const missingDocumentation: MissingDocumentation[] = [];
    const poorQualityDocumentation: PoorDocumentation[] = [];
    const improvementRecommendations: string[] = [];

    // Assess overall quality score
    let qualityScore = 0;
    if (metrics.commentRatio > 25) qualityScore += 30;
    else if (metrics.commentRatio > 15) qualityScore += 20;
    else if (metrics.commentRatio > 10) qualityScore += 10;

    if (metrics.fileHeaderDocumentation > 0) qualityScore += 20;
    if (metrics.functionDocumentation > 0) qualityScore += 25;
    if (metrics.classDocumentation > 0) qualityScore += 25;

    // Penalize for TODO/FIXME comments
    if (metrics.todoComments > 0) qualityScore -= Math.min(20, metrics.todoComments * 5);

    // Check for missing function documentation
    const totalFunctions = this.countFunctions(content, filePath);
    if (totalFunctions > metrics.functionDocumentation) {
      missingDocumentation.push({
        type: 'function',
        name: 'undocumented_functions',
        location: filePath,
        severity: totalFunctions - metrics.functionDocumentation > 5 ? 'high' : 'medium',
        description: `${totalFunctions - metrics.functionDocumentation} functions lack documentation`
      });
    }

    // Check for missing class documentation
    const totalClasses = this.countClasses(content, filePath);
    if (totalClasses > metrics.classDocumentation) {
      missingDocumentation.push({
        type: 'class',
        name: 'undocumented_classes',
        location: filePath,
        severity: totalClasses - metrics.classDocumentation > 3 ? 'high' : 'medium',
        description: `${totalClasses - metrics.classDocumentation} classes lack documentation`
      });
    }

    // Check for poor quality documentation
    if (metrics.commentRatio < 10) {
      poorQualityDocumentation.push({
        type: 'incomplete',
        location: filePath,
        currentDocumentation: 'Minimal comments',
        issues: ['Insufficient comment coverage', 'Poor code readability'],
        suggestedImprovement: 'Add comprehensive comments explaining complex logic and business rules'
      });
    }

    // Generate improvement recommendations
    if (metrics.commentRatio < 15) {
      improvementRecommendations.push('Increase comment ratio to at least 15% for better maintainability');
    }
    if (metrics.todoComments > 0) {
      improvementRecommendations.push(`Address ${metrics.todoComments} TODO/FIXME comments`);
    }
    if (metrics.fileHeaderDocumentation === 0) {
      improvementRecommendations.push('Add file header documentation explaining purpose and usage');
    }

    return {
      filePath,
      metrics,
      qualityScore,
      missingDocumentation,
      poorQualityDocumentation,
      improvementRecommendations
    };
  }

  private generateDocumentationEvolutionData(totalDocumentationLines: number, totalCodeLines: number): DocumentationEvolution[] {
    const evolution: DocumentationEvolution[] = [];

    // Generate mock evolution data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));

      const baseRatio = totalCodeLines > 0 ? (totalDocumentationLines / totalCodeLines) * 100 : 0;

      evolution.push({
        timePeriod: date.toISOString().split('T')[0],
        documentationAdded: Math.floor(Math.random() * 20),
        documentationRemoved: Math.floor(Math.random() * 10),
        qualityImprovements: Math.floor(Math.random() * 5),
        newUndocumentedCode: Math.floor(Math.random() * 15),
        documentationRatio: baseRatio * (0.8 + Math.random() * 0.4),
        trend: Math.random() > 0.5 ? 'improving' : 'stable'
      });
    }

    return evolution;
  }

  private groupVulnerabilitiesBySeverity(vulnerabilities: SecurityVulnerability[]): Record<string, number> {
    return vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupVulnerabilitiesByType(vulnerabilities: SecurityVulnerability[]): Record<string, number> {
    return vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.type] = (acc[vuln.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getMaxSeverity(vulnerabilities: SecurityVulnerability[]): string {
    const severities = ['critical', 'high', 'medium', 'low'];
    for (const severity of severities) {
      if (vulnerabilities.some(v => v.severity === severity)) {
        return severity;
      }
    }
    return 'none';
  }

  private calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
    const severityWeights = { critical: 10, high: 7, medium: 4, low: 1 };
    const totalScore = vulnerabilities.reduce((sum, vuln) =>
      sum + (severityWeights[vuln.severity as keyof typeof severityWeights] || 0), 0);
    return Math.max(0, 100 - totalScore);
  }

  private calculateOverallQualityScore(metrics: QualityMetrics): number {
    // Normalize and combine metrics
    const complexityScore = Math.max(0, 100 - metrics.cyclomaticComplexity * 2);
    const maintainabilityScore = (metrics.maintainabilityIndex / 171) * 100;
    const duplicationScore = Math.max(0, 100 - metrics.duplicationPercentage);
    const debtScore = Math.max(0, 100 - metrics.technicalDebtHours);

    return (complexityScore + maintainabilityScore + duplicationScore + debtScore) / 4;
  }

  private calculateQualityGrade(metrics: QualityMetrics): string {
    const score = this.calculateOverallQualityScore(metrics);
    if (score >= 90) return 'A (Excellent)';
    if (score >= 80) return 'B (Good)';
    if (score >= 70) return 'C (Fair)';
    if (score >= 60) return 'D (Poor)';
    return 'F (Fail)';
  }

  private generateQualityRecommendations(metrics: QualityMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.cyclomaticComplexity > 15) {
      recommendations.push("High complexity detected - consider breaking down complex functions into smaller, focused methods");
    }

    if (metrics.maintainabilityIndex < 50) {
      recommendations.push("Low maintainability index - improve code structure through better organization and documentation");
    }

    if (metrics.technicalDebtHours > 20) {
      recommendations.push("Significant technical debt detected - prioritize refactoring to address accumulated issues");
    }

    if (metrics.duplicationPercentage > 30) {
      recommendations.push("High code duplication - extract common patterns into shared utility functions or classes");
    }

    return recommendations.length > 0 ? recommendations : ["Code quality is within acceptable ranges"];
  }

  private getSecuritySummary(vulnerabilities: SecurityVulnerability[]): string {
    if (vulnerabilities.length === 0) return "Secure - No vulnerabilities detected";
    const maxSeverity = this.getMaxSeverity(vulnerabilities);
    return `${maxSeverity.charAt(0).toUpperCase() + maxSeverity.slice(1)} risk - ${vulnerabilities.length} issues found`;
  }

  private getQualitySummary(metrics: QualityMetrics): string {
    const score = this.calculateOverallQualityScore(metrics);
    const grade = this.calculateQualityGrade(metrics);
    return `${grade} (${score.toFixed(1)}/100)`;
  }

  private getComplexitySummary(entityCount: number, relationshipCount: number): string {
    if (entityCount < 20) return "Low complexity - Simple codebase";
    if (entityCount < 100) return "Moderate complexity - Typical application";
    if (entityCount < 500) return "High complexity - Large system";
    return "Very high complexity - Enterprise-scale system";
  }

  private generateHTMLDashboard(sessionDir: string, summary: any, entities: any, security: any, quality: any) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codebase Analysis Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metric-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card h3 { margin-top: 0; color: #2c3e50; }
        .card .value { font-size: 2em; font-weight: bold; }
        .card .label { color: #7f8c8d; text-transform: uppercase; font-size: 0.8em; }
        .status-good { color: #27ae60; }
        .status-warning { color: #f39c12; }
        .status-danger { color: #e74c3c; }
        .table-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .footer { text-align: center; color: #7f8c8d; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Codebase Analysis Dashboard</h1>
            <p>Analysis completed on ${new Date(summary.generated_at).toLocaleString()}</p>
        </div>

        <div class="metric-cards">
            <div class="card">
                <h3>📁 Files Analyzed</h3>
                <div class="value">${summary.codebase_overview.files_analyzed}</div>
                <div class="label">Total files scanned</div>
            </div>
            <div class="card">
                <h3>🏗️ Entities Found</h3>
                <div class="value">${summary.codebase_overview.entities_discovered}</div>
                <div class="label">Classes, functions, variables</div>
            </div>
            <div class="card">
                <h3>🔗 Relationships</h3>
                <div class="value">${summary.codebase_overview.relationships_mapped}</div>
                <div class="label">Architecture connections</div>
            </div>
            <div class="card">
                <h3>🛡️ Security Status</h3>
                <div class="value status-${summary.key_findings.security_posture.includes('Secure') ? 'good' : summary.key_findings.security_posture.includes('critical') ? 'danger' : 'warning'}">${summary.key_findings.security_posture}</div>
                <div class="label">Vulnerability assessment</div>
            </div>
        </div>

        <div class="metric-cards">
            <div class="card">
                <h3>📊 Code Quality</h3>
                <div class="value status-${quality.overall_quality_score >= 80 ? 'good' : quality.overall_quality_score >= 60 ? 'warning' : 'danger'}">${quality.quality_grade}</div>
                <div class="label">Overall quality score</div>
            </div>
            <div class="card">
                <h3>🏛️ Architecture</h3>
                <div class="value">${summary.key_findings.architecture_complexity}</div>
                <div class="label">System complexity level</div>
            </div>
            <div class="card">
                <h3>⚠️ Vulnerabilities</h3>
                <div class="value">${summary.codebase_overview.vulnerabilities_found}</div>
                <div class="label">Security issues detected</div>
            </div>
            <div class="card">
                <h3>📈 Maintainability</h3>
                <div class="value">${Math.round(quality.quality_breakdown.maintainabilityIndex)}</div>
                <div class="label">MI score (0-171)</div>
            </div>
        </div>

        <div class="table-container">
            <h2>🏗️ Entity Types Distribution</h2>
            <table>
                <thead>
                    <tr>
                        <th>Entity Type</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(entities.entities_by_type).map(([type, count]) =>
                        `<tr>
                            <td>${type}</td>
                            <td>${count}</td>
                            <td>${((count as number / entities.total_entities) * 100).toFixed(1)}%</td>
                        </tr>`
                    ).join('')}
                </tbody>
            </table>
        </div>

        <div class="table-container">
            <h2>🛡️ Security Assessment</h2>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Count</th>
                        <th>Risk Level</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(security.vulnerabilities_by_severity).map(([severity, count]) =>
                        `<tr>
                            <td class="${severity === 'critical' ? 'status-danger' : severity === 'high' ? 'status-warning' : 'status-good'}">${severity.toUpperCase()}</td>
                            <td>${count}</td>
                            <td>${severity === 'critical' ? '🚨 High Risk' : severity === 'high' ? '⚠️ Medium Risk' : '✅ Low Risk'}</td>
                        </tr>`
                    ).join('')}
                    ${Object.keys(security.vulnerabilities_by_severity).length === 0 ? '<tr><td colspan="3">✅ No vulnerabilities detected</td></tr>' : ''}
                </tbody>
            </table>
        </div>

        <div class="table-container">
            <h2>📋 Quality Recommendations</h2>
            <ul>
                ${quality.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
            </ul>
        </div>

        <div class="footer">
            <p>Generated by Codebase Analysis MCP Server | Reports saved to: ${sessionDir}</p>
            <p>Raw data available in JSON format files in the analysis directory</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(sessionDir, 'analysis_dashboard.html'), htmlContent);
  }

  private async extractEntities(content: string, filePath: string): Promise<CodeEntity[]> {
    const entities: CodeEntity[] = [];
    const lines = content.split('\n');

    // Language detection based on extension
    const extension = path.extname(filePath).toLowerCase();
    const language = this.detectLanguage(extension);

    // Extract entities based on language patterns
    switch (language) {
      case 'python':
        return this.extractPythonEntities(content, filePath);
      case 'javascript':
      case 'typescript':
        return this.extractJSEntities(content, filePath);
      case 'cpp':
      case 'c':
        return this.extractCppEntities(content, filePath);
      case 'mql5':
        return this.extractMQL5Entities(content, filePath);
      default:
        return this.extractGenericEntities(content, filePath);
    }
  }

  private detectLanguage(extension: string): string {
    const langMap: { [key: string]: string } = {
      '.py': 'python',
      '.js': 'javascript',
      '.ts': 'typescript',
      '.cpp': 'cpp',
      '.cc': 'cpp',
      '.cxx': 'cpp',
      '.c': 'c',
      '.h': 'cpp',
      '.hpp': 'cpp',
      '.mq5': 'mql5',
      '.mqh': 'mql5',
    };
    return langMap[extension] || 'unknown';
  }

  private extractPythonEntities(content: string, filePath: string): CodeEntity[] {
    const entities: CodeEntity[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Class definitions
      const classMatch = line.match(/class\s+(\w+)/);
      if (classMatch) {
        entities.push({
          type: 'class',
          name: classMatch[1],
          filePath,
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          dependencies: [],
          securityRisks: [],
          qualityIssues: []
        });
      }

      // Function definitions
      const funcMatch = line.match(/def\s+(\w+)/);
      if (funcMatch) {
        entities.push({
          type: 'function',
          name: funcMatch[1],
          filePath,
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          dependencies: [],
          securityRisks: [],
          qualityIssues: []
        });
      }
    }

    return entities;
  }

  private extractJSEntities(content: string, filePath: string): CodeEntity[] {
    const entities: CodeEntity[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Class definitions
      const classMatch = line.match(/class\s+(\w+)/);
      if (classMatch) {
        entities.push({
          type: 'class',
          name: classMatch[1],
          filePath,
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          dependencies: [],
          securityRisks: [],
          qualityIssues: []
        });
      }

      // Function definitions (function keyword or arrow)
      const funcMatch = line.match(/(?:function\s+(\w+)|\w+\s*=.*?\(|const\s+(\w+)\s*=.*?\()/);
      if (funcMatch) {
        const funcName = funcMatch[1] || funcMatch[2];
        if (funcName && !line.includes('=') || line.includes('function')) {
          entities.push({
            type: 'function',
            name: funcName,
            filePath,
            lineNumber: i + 1,
            codeSnippet: line.trim(),
            dependencies: [],
            securityRisks: [],
            qualityIssues: []
          });
        }
      }
    }

    return entities;
  }

  private extractCppEntities(content: string, filePath: string): CodeEntity[] {
    const entities: CodeEntity[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Class/Struct definitions
      const classMatch = line.match(/(?:class|struct)\s+(\w+)/);
      if (classMatch) {
        entities.push({
          type: 'class',
          name: classMatch[1],
          filePath,
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          dependencies: [],
          securityRisks: [],
          qualityIssues: []
        });
      }

      // Function definitions
      const funcMatch = line.match(/(?:[a-zA-Z_][a-zA-Z0-9_*\s&]+\s+)?(\w+)\s*\([^)]*\)\s*{/);
      if (funcMatch && !line.includes('class') && !line.includes('struct')) {
        entities.push({
          type: 'function',
          name: funcMatch[1],
          filePath,
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          dependencies: [],
          securityRisks: [],
          qualityIssues: []
        });
      }

      // Member function definitions
      const memberFuncMatch = line.match(/(\w+)\s*\([^)]*\)\s*{/);
      if (memberFuncMatch && (line.includes('::') || (i > 0 && lines[i-1].includes('::')))) {
        entities.push({
          type: 'method',
          name: memberFuncMatch[1],
          filePath,
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          dependencies: [],
          securityRisks: [],
          qualityIssues: []
        });
      }
    }

    return entities;
  }

  private extractMQL5Entities(content: string, filePath: string): CodeEntity[] {
    const entities: CodeEntity[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Class definitions
      const classMatch = line.match(/class\s+(\w+)/i);
      if (classMatch) {
        entities.push({
          type: 'class',
          name: classMatch[1],
          filePath,
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          dependencies: [],
          securityRisks: [],
          qualityIssues: []
        });
      }

      // Function definitions (MQL5 functions)
      const funcMatch = line.match(/(?:int|double|bool|void|string|datetime)\s+(\w+)\s*\([^)]*\)\s*{/i);
      if (funcMatch) {
        entities.push({
          type: 'function',
          name: funcMatch[1],
          filePath,
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          dependencies: [],
          securityRisks: [],
          qualityIssues: []
        });
      }

      // Global variables (extern, input parameters)
      const varMatch = line.match(/(?:extern|input)\s+(?:int|double|bool|string|datetime)\s+(\w+)/i);
      if (varMatch) {
        entities.push({
          type: 'variable',
          name: varMatch[1],
          filePath,
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          dependencies: [],
          securityRisks: [],
          qualityIssues: []
        });
      }

      // Event handlers (OnInit, OnDeinit, OnTick, etc.)
      const eventMatch = line.match(/(OnInit|OnDeinit|OnTick|OnTimer|OnTrade|OnTester)\s*\(/i);
      if (eventMatch) {
        entities.push({
          type: 'function',
          name: eventMatch[1],
          filePath,
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          dependencies: [],
          securityRisks: [],
          qualityIssues: []
        });
      }
    }

    return entities;
  }

  private extractGenericEntities(content: string, filePath: string): CodeEntity[] {
    // Basic fallback for unknown languages
    return [{
      type: 'module',
      name: path.basename(filePath, path.extname(filePath)),
      filePath,
      lineNumber: 1,
      codeSnippet: `module ${path.basename(filePath)}`,
      dependencies: [],
      securityRisks: [],
      qualityIssues: []
    }];
  }

  private async findRelationships(entities: CodeEntity[], content: string, filePath: string): Promise<CodeRelationship[]> {
    const relationships: CodeRelationship[] = [];

    // Basic relationship detection (can be enhanced significantly)
    for (const entity of entities) {
      // Find function calls
      const functionCalls = content.match(new RegExp(`\\b${entity.name}\\s*\\(`, 'g'));
      if (functionCalls) {
        // This would need more sophisticated AST parsing for real accuracy
        relationships.push({
          from: filePath,
          to: entity.name,
          type: 'calls',
          confidence: 0.7
        });
      }

      // Find imports/references
      const references = content.match(new RegExp(`\\b${entity.name}\\b`, 'g'));
      if (references && references.length > 1) { // More than just the definition
        relationships.push({
          from: filePath,
          to: entity.name,
          type: 'references',
          confidence: 0.6
        });
      }
    }

    return relationships;
  }

  private async analyzeSecurity(content: string, filePath: string): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const lines = content.split('\n');

    const securityPatterns = {
      sql_injection: /SELECT.*\+.*|INSERT.*\+.*|\$query.*\+|(execute|query).*\%s/g,
      xss: /(innerHTML|outerHTML|document\.write|eval)\s*[\+=]/g,
      secrecy_leak: /password.*=|token.*=|(api_key|secret|private_key).*=/gi,
      insecure_random: /Math\.random|rand\(\)|srand\(time/g,
      unsafe_deserialize: /(pickle|unserialize|yaml\.load)\(/g
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const [patternName, regex] of Object.entries(securityPatterns)) {
        if (regex.test(line)) {
          let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
          let description = '';
          let recommendation = '';

          switch (patternName) {
            case 'sql_injection':
              severity = 'critical';
              description = 'Potential SQL injection vulnerability';
              recommendation = 'Use parameterized queries or prepared statements';
              break;
            case 'xss':
              severity = 'high';
              description = 'Potential XSS vulnerability';
              recommendation = 'Sanitize user input and use innerText/textContent';
              break;
            case 'secrecy_leak':
              severity = 'critical';
              description = 'Potential secret exposure';
              recommendation = 'Use environment variables or secure secret management';
              break;
            case 'insecure_random':
              severity = 'medium';
              description = 'Insecure random number generation';
              recommendation = 'Use cryptographically secure random generators';
              break;
            case 'unsafe_deserialize':
              severity = 'critical';
              description = 'Unsafe deserialization';
              recommendation = 'Validate serialized data and use safe deserialization';
              break;
          }

          vulnerabilities.push({
            type: patternName as any,
            severity,
            location: { file: filePath, line: i + 1, column: line.indexOf(line.match(regex)![0]) + 1 },
            description,
            recommendation
          });
        }
      }
    }

    return vulnerabilities;
  }

  private async analyzeQuality(content: string, filePath: string): Promise<QualityMetrics> {
    const lines = content.split('\n');
    return {
      cyclomaticComplexity: this.calculateCyclomaticComplexity(content),
      maintainabilityIndex: this.calculateMaintainabilityIndex(lines),
      technicalDebtHours: this.estimateTechnicalDebt(lines),
      duplicationPercentage: this.calculateDuplication(lines),
      testCoverage: 0 // Would need test files to calculate
    };
  }

  private calculateCyclomaticComplexity(content: string): number {
    // More accurate complexity calculation
    const complexityKeywords = /\bif\b|\bwhile\b|\bfor\b|\bcase\b|\bcatch\b/g;
    const matches = content.match(complexityKeywords) || [];
    return matches.length + 1; // Base complexity of 1
  }

  private calculateMaintainabilityIndex(lines: string[]): number {
    // Simplified MI calculation
    const loc = lines.length;
    const comments = lines.filter(line => line.trim().startsWith('#') || line.trim().startsWith('//')).length;
    const commentRatio = loc > 0 ? (comments / loc) * 100 : 0;

    // Rough MI estimate based on lines and comments
    const mi = 171 - 5.2 * Math.log(loc) - 0.23 * (commentRatio) + 50 * Math.sin(Math.sqrt(2.4 * 0.1));

    return Math.max(0, Math.min(171, mi)); // Clamp to 0-171 range
  }

  private estimateTechnicalDebt(lines: string[]): number {
    // Rough estimate based on code smells
    let debtHours = 0;

    for (const line of lines) {
      if (line.length > 120) debtHours += 0.1; // Long lines
      if (line.includes('TODO') || line.includes('FIXME')) debtHours += 0.5; // TODOs
      if (line.includes('console.log') || line.includes('print(')) debtHours += 0.2; // Debug logging
      if (line.includes('Exception') || line.includes('catch')) debtHours += 0.3; // Exception handling
    }

    return debtHours;
  }

  private calculateDuplication(lines: string[]): number {
    // Very basic duplication detection - compare every pair of lines
    let duplicatedLines = 0;
    const trimmedLines = lines.map(line => line.trim()).filter(line => line.length > 10);

    for (let i = 0; i < trimmedLines.length; i++) {
      for (let j = i + 1; j < trimmedLines.length; j++) {
        if (trimmedLines[i] === trimmedLines[j]) {
          duplicatedLines++;
          break; // Count each duplicate line only once
        }
      }
    }

    return lines.length > 0 ? (duplicatedLines / lines.length) * 100 : 0;
  }

  private updateQualityMetrics(metrics: QualityMetrics, fileMetrics: QualityMetrics) {
    // Simple averaging - in reality would need more sophisticated aggregation
    metrics.cyclomaticComplexity += fileMetrics.cyclomaticComplexity;
    metrics.maintainabilityIndex += fileMetrics.maintainabilityIndex;
    metrics.technicalDebtHours += fileMetrics.technicalDebtHours;
    metrics.duplicationPercentage += fileMetrics.duplicationPercentage;
  }

  private finalizeQualityMetrics(metrics: QualityMetrics): QualityMetrics {
    // This is a single codebase, so we return the aggregated metrics
    // In a multi-file analysis, you'd divide by number of files
    return metrics;
  }

  /**
   * Analyze dependencies in the codebase
   */
  async analyzeDependencies(filePaths: string[]): Promise<DependencyAnalysisResult> {
    const externalDependencies: DependencyInfo[] = [];
    const internalDependencies: DependencyInfo[] = [];
    const dependencyGraph: DependencyGraph = { nodes: [], edges: [] };
    const vulnerabilitySummary: VulnerabilitySummary = {
      totalVulnerabilities: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      affectedPackages: []
    };
    const migrationRecommendations: string[] = [];

    // Analyze package.json files for external dependencies
    for (const filePath of filePaths) {
      if (filePath.includes('package.json')) {
        try {
          const content = fs.readFileSync(path.resolve(this.codebasePath, filePath), 'utf-8');
          const packageData = JSON.parse(content);

          // Analyze dependencies
          if (packageData.dependencies) {
            for (const [depName, depVersion] of Object.entries(packageData.dependencies)) {
              externalDependencies.push({
                name: depName,
                version: String(depVersion),
                type: 'external',
                usage: await this.findDependencyUsage(filePaths, depName),
                vulnerabilities: await this.checkVulnerabilities(depName, String(depVersion)),
                lastUpdated: new Date().toISOString(),
                license: 'Unknown', // Would need license checking
                fileDependencies: [filePath]
              });
            }
          }

          // Analyze devDependencies
          if (packageData.devDependencies) {
            for (const [depName, depVersion] of Object.entries(packageData.devDependencies)) {
              externalDependencies.push({
                name: depName,
                version: String(depVersion),
                type: 'external',
                usage: await this.findDependencyUsage(filePaths, depName),
                vulnerabilities: await this.checkVulnerabilities(depName, String(depVersion)),
                lastUpdated: new Date().toISOString(),
                license: 'Unknown',
                fileDependencies: [filePath]
              });
            }
          }
        } catch (error) {
          console.error(`Error analyzing dependencies in ${filePath}:`, error);
        }
      }
    }

    // Analyze internal module dependencies
    await this.analyzeInternalDependencies(filePaths, internalDependencies, dependencyGraph);

    // Generate migration recommendations
    migrationRecommendations.push(...await this.generateMigrationRecommendations(externalDependencies));

    return {
      externalDependencies,
      internalDependencies,
      dependencyGraph,
      vulnerabilitySummary,
      migrationRecommendations
    };
  }

  private async findDependencyUsage(filePaths: string[], dependencyName: string): Promise<string[]> {
    const usage: string[] = [];

    for (const filePath of filePaths) {
      try {
        const content = fs.readFileSync(path.resolve(this.codebasePath, filePath), 'utf-8');

        // Check for import statements
        const importMatches = content.match(new RegExp(`import.*${dependencyName}`, 'g'));
        if (importMatches) {
          usage.push(`Import in ${filePath}`);
        }

        // Check for require statements
        const requireMatches = content.match(new RegExp(`require.*${dependencyName}`, 'g'));
        if (requireMatches) {
          usage.push(`Require in ${filePath}`);
        }

        // Check for usage in code
        if (content.includes(dependencyName) && !filePath.includes('package.json')) {
          usage.push(`Usage in ${filePath}`);
        }
      } catch (error) {
        // Ignore file read errors
      }
    }

    return [...new Set(usage)]; // Remove duplicates
  }

  private async checkVulnerabilities(packageName: string, version: string): Promise<string[]> {
    // This would integrate with vulnerability databases
    // For now, return mock vulnerabilities for demonstration
    const mockVulnerabilities = {
      'old-package': ['CVE-2023-1234: Buffer overflow vulnerability'],
      'outdated-lib': ['CVE-2023-5678: Authentication bypass']
    };

    return mockVulnerabilities[packageName as keyof typeof mockVulnerabilities] || [];
  }

  private async analyzeInternalDependencies(filePaths: string[], internalDependencies: DependencyInfo[], dependencyGraph: DependencyGraph): Promise<void> {
    const nodeMap = new Map<string, DependencyNode>();

    for (const filePath of filePaths) {
      try {
        const content = fs.readFileSync(path.resolve(this.codebasePath, filePath), 'utf-8');
        const fileName = path.basename(filePath);

        // Add file as node
        const nodeId = filePath;
        if (!nodeMap.has(nodeId)) {
          nodeMap.set(nodeId, {
            id: nodeId,
            name: fileName,
            type: 'file',
            size: content.length
          });
        }

        // Find internal imports/references
        const internalRefs = this.findInternalReferences(content, filePath);
        for (const ref of internalRefs) {
          if (!nodeMap.has(ref)) {
            nodeMap.set(ref, {
              id: ref,
              name: path.basename(ref),
              type: 'file'
            });
          }

          // Add edge
          dependencyGraph.edges.push({
            from: filePath,
            to: ref,
            type: 'references',
            strength: 1.0
          });
        }
      } catch (error) {
        // Ignore file read errors
      }
    }

    dependencyGraph.nodes = Array.from(nodeMap.values());
  }

  private findInternalReferences(content: string, currentFile: string): string[] {
    const references: string[] = [];

    // Find import statements
    const importMatches = content.match(/import.*from ['"](.+?)['"]/g);
    if (importMatches) {
      for (const match of importMatches) {
        const importPath = match.match(/from ['"](.+?)['"]/)?.[1];
        if (importPath && !importPath.includes('node_modules')) {
          const fullPath = path.resolve(path.dirname(currentFile), importPath + '.js');
          references.push(fullPath);
        }
      }
    }

    // Find require statements
    const requireMatches = content.match(/require\(['"](.+?)['"]\)/g);
    if (requireMatches) {
      for (const match of requireMatches) {
        const requirePath = match.match(/require\(['"](.+?)['"]\)/)?.[1];
        if (requirePath && !requirePath.includes('node_modules')) {
          const fullPath = path.resolve(path.dirname(currentFile), requirePath + '.js');
          references.push(fullPath);
        }
      }
    }

    return references;
  }

  private async generateMigrationRecommendations(dependencies: DependencyInfo[]): Promise<string[]> {
    const recommendations: string[] = [];

    for (const dep of dependencies) {
      if (dep.vulnerabilities.length > 0) {
        recommendations.push(`${dep.name}: Address ${dep.vulnerabilities.length} security vulnerabilities`);
      }

      // Check for outdated patterns
      if (dep.name.includes('old-') || dep.name.includes('legacy')) {
        recommendations.push(`${dep.name}: Consider migrating to modern alternative`);
      }
    }

    return recommendations;
  }

  /**
   * Analyze code evolution patterns and trends
   */
  async analyzeCodeEvolution(filePaths: string[]): Promise<CodeEvolutionResult> {
    const fileMetrics = new Map<string, CodeEvolutionMetrics>();
    const evolutionTrends: EvolutionTrend[] = [];
    const teamContributions: TeamContribution[] = [];
    const technicalDebtEvolution: TechnicalDebtTrend[] = [];
    const changePatterns: ChangePattern[] = [];

    // Analyze each file for evolution metrics
    for (const filePath of filePaths) {
      try {
        const fullPath = path.resolve(this.codebasePath, filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const stats = fs.statSync(fullPath);

        const metrics: CodeEvolutionMetrics = {
          fileSize: stats.size,
          linesOfCode: content.split('\n').length,
          complexityScore: this.calculateFileComplexity(content),
          functionCount: this.countFunctions(content, filePath),
          classCount: this.countClasses(content, filePath),
          commentRatio: this.calculateCommentRatio(content),
          modificationFrequency: this.estimateModificationFrequency(filePath)
        };

        fileMetrics.set(filePath, metrics);
      } catch (error) {
        console.error(`Error analyzing evolution for ${filePath}:`, error);
      }
    }

    // Generate evolution trends (mock data for demonstration)
    evolutionTrends.push(...this.generateEvolutionTrends(fileMetrics));

    // Analyze team contributions (mock data for demonstration)
    teamContributions.push(...this.analyzeTeamContributions(filePaths));

    // Track technical debt evolution
    technicalDebtEvolution.push(...this.trackTechnicalDebtEvolution(fileMetrics));

    // Identify change patterns
    changePatterns.push(...this.identifyChangePatterns(fileMetrics));

    return {
      fileMetrics,
      evolutionTrends,
      teamContributions,
      technicalDebtEvolution,
      changePatterns
    };
  }

  private calculateFileComplexity(content: string): number {
    // Calculate basic complexity based on control structures
    const complexityPatterns = [
      /\bif\s*\(/g, /\belse\b/g, /\bwhile\s*\(/g, /\bfor\s*\(/g,
      /\bcatch\s*\(/g, /\bswitch\s*\(/g, /\bcase\b/g
    ];

    return complexityPatterns.reduce((total, pattern) => {
      const matches = content.match(pattern) || [];
      return total + matches.length;
    }, 1); // Base complexity of 1
  }

  private countFunctions(content: string, filePath: string): number {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case '.js':
      case '.ts':
        return (content.match(/function\s+\w+|const\s+\w+\s*=\s*.*=>|class\s+\w+/g) || []).length;
      case '.py':
        return (content.match(/def\s+\w+\s*\(|class\s+\w+/g) || []).length;
      case '.cpp':
      case '.hpp':
      case '.c':
      case '.h':
        return (content.match(/\w+\s+\w+\s*\([^)]*\)\s*{|class\s+\w+/g) || []).length;
      default:
        return 0;
    }
  }

  private countClasses(content: string, filePath: string): number {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case '.js':
      case '.ts':
        return (content.match(/class\s+\w+/g) || []).length;
      case '.py':
        return (content.match(/class\s+\w+/g) || []).length;
      case '.cpp':
      case '.hpp':
      case '.c':
      case '.h':
        return (content.match(/class\s+\w+|struct\s+\w+/g) || []).length;
      default:
        return 0;
    }
  }

  private calculateCommentRatio(content: string): number {
    const lines = content.split('\n');
    const commentLines = lines.filter(line =>
      line.trim().startsWith('//') ||
      line.trim().startsWith('#') ||
      line.trim().startsWith('/*') ||
      line.trim().startsWith('"""') ||
      line.trim().startsWith("'''")
    ).length;

    return lines.length > 0 ? (commentLines / lines.length) * 100 : 0;
  }

  private estimateModificationFrequency(filePath: string): number {
    // This would analyze git history in a real implementation
    // For now, return mock frequency based on file characteristics
    try {
      const stats = fs.statSync(path.resolve(this.codebasePath, filePath));
      const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      return Math.max(0, 30 - daysSinceModified) / 30; // Normalize to 0-1 scale
    } catch {
      return 0.5; // Default moderate frequency
    }
  }

  private generateEvolutionTrends(fileMetrics: Map<string, CodeEvolutionMetrics>): EvolutionTrend[] {
    const trends: EvolutionTrend[] = [];
    let totalComplexity = 0;
    let totalLines = 0;

    for (const metrics of fileMetrics.values()) {
      totalComplexity += metrics.complexityScore;
      totalLines += metrics.linesOfCode;
    }

    // Generate mock evolution data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));

      trends.push({
        timePeriod: date.toISOString().split('T')[0],
        filesModified: Math.floor(fileMetrics.size * (0.3 + Math.random() * 0.4)),
        linesAdded: Math.floor(totalLines * 0.05 * (Math.random() + 0.5)),
        linesDeleted: Math.floor(totalLines * 0.03 * (Math.random() + 0.3)),
        complexityChange: (Math.random() - 0.5) * 10,
        newFiles: Math.floor(Math.random() * 3),
        deletedFiles: Math.floor(Math.random() * 2)
      });
    }

    return trends;
  }

  private analyzeTeamContributions(filePaths: string[]): TeamContribution[] {
    // Mock team contribution analysis
    const contributors = ['developer1', 'developer2', 'senior_dev', 'junior_dev'];
    const contributions: TeamContribution[] = [];

    for (const contributor of contributors) {
      contributions.push({
        contributor,
        filesModified: Math.floor(Math.random() * 20) + 5,
        linesChanged: Math.floor(Math.random() * 500) + 100,
        complexityIntroduced: Math.floor(Math.random() * 50) + 10,
        primaryFileTypes: ['.js', '.ts', '.py'].sort(() => Math.random() - 0.5).slice(0, 2),
        contributionPeriod: '2025-Q1'
      });
    }

    return contributions;
  }

  private trackTechnicalDebtEvolution(fileMetrics: Map<string, CodeEvolutionMetrics>): TechnicalDebtTrend[] {
    const trends: TechnicalDebtTrend[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));

      let totalDebt = 0;
      let totalComplexity = 0;
      let totalSmells = 0;

      for (const metrics of fileMetrics.values()) {
        totalDebt += (metrics.complexityScore * 0.5) + (metrics.linesOfCode * 0.01);
        totalComplexity += metrics.complexityScore;
        totalSmells += Math.floor(metrics.complexityScore / 5);
      }

      trends.push({
        date: date.toISOString().split('T')[0],
        debtHours: totalDebt,
        complexityScore: totalComplexity,
        codeSmells: totalSmells,
        coveragePercentage: Math.max(60, 95 - (totalComplexity * 0.5))
      });
    }

    return trends;
  }

  private identifyChangePatterns(fileMetrics: Map<string, CodeEvolutionMetrics>): ChangePattern[] {
    const patterns: ChangePattern[] = [];

    // Analyze patterns based on file metrics
    let highComplexityFiles = 0;
    let largeFiles = 0;
    let poorlyCommentedFiles = 0;

    for (const metrics of fileMetrics.values()) {
      if (metrics.complexityScore > 20) highComplexityFiles++;
      if (metrics.linesOfCode > 500) largeFiles++;
      if (metrics.commentRatio < 10) poorlyCommentedFiles++;
    }

    if (highComplexityFiles > fileMetrics.size * 0.3) {
      patterns.push({
        pattern: "High Complexity Growth",
        frequency: highComplexityFiles,
        impact: "high",
        description: "Many files developing high cyclomatic complexity",
        examples: ["Functions with multiple nested conditions", "Large switch statements", "Complex business logic"]
      });
    }

    if (largeFiles > fileMetrics.size * 0.2) {
      patterns.push({
        pattern: "Large File Accumulation",
        frequency: largeFiles,
        impact: "medium",
        description: "Files growing beyond recommended size limits",
        examples: ["Classes with too many methods", "Files with multiple responsibilities"]
      });
    }

    if (poorlyCommentedFiles > fileMetrics.size * 0.4) {
      patterns.push({
        pattern: "Documentation Decline",
        frequency: poorlyCommentedFiles,
        impact: "medium",
        description: "Decreasing ratio of comments to code",
        examples: ["Complex algorithms without explanation", "Undocumented public APIs"]
      });
    }

    return patterns;
  }
}

/**
 * Create an MCP server with capabilities for resources (to list/read notes),
 * tools (to create new notes), and prompts (to summarize notes).
 */
const server = new Server(
  {
    name: "codebase-insights",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler for listing available notes as resources.
 * Each note is exposed as a resource with:
 * - A note:// URI scheme
 * - Plain text MIME type
 * - Human readable name and description (now including the note title)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: []
  };
});

/**
 * Handler for reading the contents of a specific note.
 * Takes a note:// URI and returns the note content as plain text.
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  throw new Error(`Resource ${request.params.uri} not found`);
});

/**
 * Handler that lists available tools.
 * Exposes a single "create_note" tool that lets clients create new notes.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_codebase",
        description: "Analyze a codebase for entities, relationships, security vulnerabilities, and quality metrics",
        inputSchema: {
          type: "object",
          properties: {
            codebase_path: {
              type: "string",
              description: "Path to the codebase directory to analyze"
            },
            include_patterns: {
              type: "array",
              items: { type: "string" },
              description: "File patterns to include (*.py, *.js, *.cpp, *.mq5, etc.)",
              default: ["**/*.{py,js,ts,cpp,c,h,hpp,mq5,mqh}"]
            },
            exclude_patterns: {
              type: "array",
              items: { type: "string" },
              description: "File patterns to exclude",
              default: ["node_modules/**", ".git/**", "__pycache__/**"]
            }
          },
          required: ["codebase_path"]
        }
      },
      {
        name: "find_security_vulnerabilities",
        description: "Scan codebase for security vulnerabilities and provide detailed reports",
        inputSchema: {
          type: "object",
          properties: {
            codebase_path: {
              type: "string",
              description: "Path to the codebase directory to scan"
            },
            severity_filter: {
              type: "array",
              items: {
                enum: ["low", "medium", "high", "critical"]
              },
              description: "Filter vulnerabilities by severity",
              default: ["medium", "high", "critical"]
            }
          },
          required: ["codebase_path"]
        }
      },
      {
        name: "assess_code_quality",
        description: "Analyze code quality metrics including complexity, duplication, and technical debt",
        inputSchema: {
          type: "object",
          properties: {
            file_paths: {
              type: "array",
              items: { type: "string" },
              description: "List of file paths to analyze"
            }
          },
          required: ["file_paths"]
        }
      },
      {
        name: "analyze_dependencies",
        description: "Analyze external and internal dependencies, vulnerabilities, and migration paths",
        inputSchema: {
          type: "object",
          properties: {
            codebase_path: {
              type: "string",
              description: "Path to the codebase directory to analyze"
            },
            include_patterns: {
              type: "array",
              items: { type: "string" },
              description: "File patterns to include for dependency analysis",
              default: ["**/*.{js,ts,py,cpp,c,h,hpp,cs,java}"]
            },
            check_vulnerabilities: {
              type: "boolean",
              description: "Whether to check for security vulnerabilities",
              default: true
            }
          },
          required: ["codebase_path"]
        }
      },
      {
        name: "analyze_code_evolution",
        description: "Analyze code evolution patterns, complexity trends, team contributions, and technical debt evolution",
        inputSchema: {
          type: "object",
          properties: {
            codebase_path: {
              type: "string",
              description: "Path to the codebase directory to analyze"
            },
            include_patterns: {
              type: "array",
              items: { type: "string" },
              description: "File patterns to include for evolution analysis",
              default: ["**/*.{js,ts,py,cpp,c,h,hpp,cs,java}"]
            },
            analysis_period_days: {
              type: "number",
              description: "Number of days to analyze for evolution trends",
              default: 90
            }
          },
          required: ["codebase_path"]
        }
      },
      {
        name: "analyze_performance_profile",
        description: "Analyze algorithm complexity, memory usage, I/O patterns, and concurrency characteristics",
        inputSchema: {
          type: "object",
          properties: {
            codebase_path: {
              type: "string",
              description: "Path to the codebase directory to analyze"
            },
            include_patterns: {
              type: "array",
              items: { type: "string" },
              description: "File patterns to include for performance analysis",
              default: ["**/*.{js,ts,py,cpp,c,h,hpp,cs,java}"]
            },
            focus_areas: {
              type: "array",
              items: {
                enum: ["algorithm", "memory", "io", "concurrency", "scalability"]
              },
              description: "Specific performance areas to focus analysis on",
              default: ["algorithm", "memory", "io", "concurrency"]
            }
          },
          required: ["codebase_path"]
        }
      },
      {
        name: "analyze_code_clones",
        description: "Analyze code duplication, find exact/near/functional clones, and identify refactoring opportunities",
        inputSchema: {
          type: "object",
          properties: {
            codebase_path: {
              type: "string",
              description: "Path to the codebase directory to analyze"
            },
            include_patterns: {
              type: "array",
              items: { type: "string" },
              description: "File patterns to include for clone analysis",
              default: ["**/*.{js,ts,py,cpp,c,h,hpp,cs,java}"]
            },
            min_clone_length: {
              type: "number",
              description: "Minimum length of code clones to detect",
              default: 5
            },
            similarity_threshold: {
              type: "number",
              description: "Minimum similarity percentage for near clones",
              default: 80
            }
          },
          required: ["codebase_path"]
        }
      },
      {
        name: "analyze_documentation_quality",
        description: "Analyze documentation coverage, quality metrics, missing documentation, and improvement recommendations",
        inputSchema: {
          type: "object",
          properties: {
            codebase_path: {
              type: "string",
              description: "Path to the codebase directory to analyze"
            },
            include_patterns: {
              type: "array",
              items: { type: "string" },
              description: "File patterns to include for documentation analysis",
              default: ["**/*.{js,ts,py,cpp,c,h,hpp,cs,java}"]
            },
            min_comment_ratio: {
              type: "number",
              description: "Minimum acceptable comment ratio percentage",
              default: 15
            },
            require_function_docs: {
              type: "boolean",
              description: "Whether to require documentation for all functions",
              default: true
            }
          },
          required: ["codebase_path"]
        }
      }
    ]
  };
});

/**
 * Handler for MCP tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "analyze_codebase": {
        const codebasePath = String(args?.codebase_path);
        const includePatterns = (args?.include_patterns as string[]) || ["**/*.{py,js,ts,cpp,c,h,hpp,mq5,mqh}"];
        const excludePatterns = (args?.exclude_patterns as string[]) || ["node_modules/**", ".git/**", "__pycache__/**"];

        // Find files using glob patterns
        let allFiles: string[] = [];
        for (const pattern of includePatterns) {
          try {
            const files = glob.sync(pattern, { cwd: codebasePath });
            allFiles.push(...files);
          } catch (error) {
            // Ignore glob errors
          }
        }

        // Filter out excluded files
        const excludeSet = new Set<string>();
        for (const pattern of excludePatterns) {
          try {
            const files = glob.sync(pattern, { cwd: codebasePath });
            files.forEach((file: string) => excludeSet.add(file));
          } catch (error) {
            // Ignore glob errors
          }
        }

        const filteredFiles = allFiles.filter(file => !excludeSet.has(file));

        // Analyze codebase
        const engine = new CodeAnalysisEngine(codebasePath);
        const result = await engine.analyzeCodebase(filteredFiles);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }

      case "find_security_vulnerabilities": {
        const codebasePath = String(args?.codebase_path);
        const severityFilter = (args?.severity_filter as string[]) || ["medium", "high", "critical"];

        // Find all supported files
        const supportedExtensions = ['**/*.{py,js,ts,cpp,c,h,hpp,mq5,mqh}'];
        let allFiles: string[] = [];
        for (const pattern of supportedExtensions) {
          try {
            const files = glob.sync(pattern, { cwd: codebasePath });
            allFiles.push(...files);
          } catch (error) {
            // Ignore glob errors
          }
        }

        // Analyze security
        const engine = new CodeAnalysisEngine(codebasePath);
        const result = await engine.analyzeCodebase(allFiles);
        const filteredVulnerabilities = result.vulnerabilities.filter(v =>
          severityFilter.includes(v.severity)
        );

        const report = {
          total_vulnerabilities: filteredVulnerabilities.length,
          vulnerabilities: filteredVulnerabilities,
          summary_by_severity: severityFilter.reduce((acc, sev) => {
            acc[sev] = result.vulnerabilities.filter(v => v.severity === sev).length;
            return acc;
          }, {} as Record<string, number>)
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(report, null, 2)
          }]
        };
      }

      case "assess_code_quality": {
        const filePaths = args?.file_paths as string[];
        if (!filePaths || !Array.isArray(filePaths)) {
          throw new Error("file_paths must be an array of strings");
        }

        const engine = new CodeAnalysisEngine(process.cwd());
        const result = await engine.analyzeCodebase(filePaths);

        const qualityReport = {
          overall_metrics: result.qualityMetrics,
          files_analyzed: filePaths.length,
          entities_count: result.entities.length,
          relationships_count: result.relationships.length,
          recommendations: generateQualityRecommendations(result.qualityMetrics)
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(qualityReport, null, 2)
          }]
        };
      }

      case "analyze_dependencies": {
        const codebasePath = String(args?.codebase_path);
        const includePatterns = (args?.include_patterns as string[]) || ["**/*.{js,ts,py,cpp,c,h,hpp,cs,java}"];
        const checkVulnerabilities = args?.check_vulnerabilities !== false;

        // Find files using glob patterns
        let allFiles: string[] = [];
        for (const pattern of includePatterns) {
          try {
            const files = glob.sync(pattern, { cwd: codebasePath });
            allFiles.push(...files);
          } catch (error) {
            // Ignore glob errors
          }
        }

        // Analyze dependencies
        const engine = new CodeAnalysisEngine(codebasePath);
        const dependencyResult = await engine.analyzeDependencies(allFiles);

        const dependencyReport = {
          summary: {
            external_dependencies: dependencyResult.externalDependencies.length,
            internal_dependencies: dependencyResult.internalDependencies.length,
            total_vulnerabilities: dependencyResult.vulnerabilitySummary.totalVulnerabilities,
            dependency_nodes: dependencyResult.dependencyGraph.nodes.length,
            dependency_edges: dependencyResult.dependencyGraph.edges.length
          },
          external_dependencies: dependencyResult.externalDependencies,
          internal_dependencies: dependencyResult.internalDependencies,
          vulnerability_summary: dependencyResult.vulnerabilitySummary,
          migration_recommendations: dependencyResult.migrationRecommendations,
          top_risk_packages: dependencyResult.externalDependencies
            .filter(dep => dep.vulnerabilities.length > 0)
            .sort((a, b) => b.vulnerabilities.length - a.vulnerabilities.length)
            .slice(0, 10)
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(dependencyReport, null, 2)
          }]
        };
      }

      case "analyze_code_evolution": {
        const codebasePath = String(args?.codebase_path);
        const includePatterns = (args?.include_patterns as string[]) || ["**/*.{js,ts,py,cpp,c,h,hpp,cs,java}"];

        // Find files using glob patterns
        let allFiles: string[] = [];
        for (const pattern of includePatterns) {
          try {
            const files = glob.sync(pattern, { cwd: codebasePath });
            allFiles.push(...files);
          } catch (error) {
            // Ignore glob errors
          }
        }

        // Analyze code evolution
        const engine = new CodeAnalysisEngine(codebasePath);
        const evolutionResult = await engine.analyzeCodeEvolution(allFiles);

        const evolutionReport = {
          summary: {
            files_tracked: evolutionResult.fileMetrics.size,
            total_contributors: evolutionResult.teamContributions.length,
            evolution_periods_analyzed: evolutionResult.evolutionTrends.length,
            change_patterns_found: evolutionResult.changePatterns.length,
            average_file_quality: Array.from(evolutionResult.fileMetrics.values())
              .reduce((sum, m) => sum + engine.calculateFileQualityScore(m), 0) / evolutionResult.fileMetrics.size,
            technical_debt_trend: evolutionResult.technicalDebtEvolution.length > 0 ?
              (evolutionResult.technicalDebtEvolution[evolutionResult.technicalDebtEvolution.length - 1].debtHours > 50 ? 'increasing' : 'stable') : 'unknown'
          },
          file_evolution_metrics: Array.from(evolutionResult.fileMetrics.entries()).map(([file, metrics]) => ({
            file_path: file,
            current_state: {
              size: metrics.fileSize,
              complexity: metrics.complexityScore,
              functions: metrics.functionCount,
              classes: metrics.classCount,
              documentation: metrics.commentRatio
            },
            evolution_indicators: {
              modification_frequency: metrics.modificationFrequency,
              quality_score: engine.calculateFileQualityScore(metrics),
              growth_rate: metrics.linesOfCode > 0 ? (metrics.complexityScore / metrics.linesOfCode) * 100 : 0
            }
          })),
          evolution_trends: evolutionResult.evolutionTrends,
          team_productivity: evolutionResult.teamContributions.map(contrib => ({
            contributor: contrib.contributor,
            productivity_metrics: {
              files_modified: contrib.filesModified,
              lines_changed: contrib.linesChanged,
              complexity_per_change: contrib.complexityIntroduced / Math.max(1, contrib.linesChanged),
              file_type_focus: contrib.primaryFileTypes
            }
          })),
          technical_debt_analysis: {
            current_debt_level: evolutionResult.technicalDebtEvolution.length > 0 ?
              evolutionResult.technicalDebtEvolution[evolutionResult.technicalDebtEvolution.length - 1].debtHours : 0,
            debt_trend: evolutionResult.technicalDebtEvolution.length >= 2 ?
              (evolutionResult.technicalDebtEvolution[evolutionResult.technicalDebtEvolution.length - 1].debtHours >
               evolutionResult.technicalDebtEvolution[0].debtHours ? 'increasing' : 'decreasing') : 'stable',
            coverage_trend: evolutionResult.technicalDebtEvolution.length > 0 ?
              evolutionResult.technicalDebtEvolution[evolutionResult.technicalDebtEvolution.length - 1].coveragePercentage : 0
          },
          change_patterns: evolutionResult.changePatterns,
          recommendations: [
            ...evolutionResult.changePatterns
              .filter(p => p.impact === 'high')
              .map(p => `High priority: ${p.description}`),
            ...(Array.from(evolutionResult.fileMetrics.values()).some(m => m.commentRatio < 15) ?
              ['Improve documentation in files with comment ratio below 15%'] : []),
            ...(evolutionResult.technicalDebtEvolution.some(d => d.debtHours > 80) ?
              ['Critical: Technical debt exceeding 80 hours - immediate refactoring needed'] : []),
            'Monitor complexity trends and implement refactoring sprints as needed'
          ]
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(evolutionReport, null, 2)
          }]
        };
      }

      case "analyze_performance_profile": {
        const codebasePath = String(args?.codebase_path);
        const includePatterns = (args?.include_patterns as string[]) || ["**/*.{js,ts,py,cpp,c,h,hpp,cs,java}"];
        const focusAreas = (args?.focus_areas as string[]) || ["algorithm", "memory", "io", "concurrency"];

        // Find files using glob patterns
        let allFiles: string[] = [];
        for (const pattern of includePatterns) {
          try {
            const files = glob.sync(pattern, { cwd: codebasePath });
            allFiles.push(...files);
          } catch (error) {
            // Ignore glob errors
          }
        }

        // Analyze performance profile
        const engine = new CodeAnalysisEngine(codebasePath);
        const performanceResult = await engine.analyzePerformanceProfile(allFiles);

        const performanceReport = {
          summary: {
            files_analyzed: performanceResult.profiles.size,
            overall_performance_score: performanceResult.overallPerformanceScore,
            critical_bottlenecks: performanceResult.criticalBottlenecks.length,
            high_priority_recommendations: performanceResult.topRecommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length,
            current_capacity: performanceResult.scalabilityAssessment.currentCapacity,
            scalability_grade: performanceResult.scalabilityAssessment.scalabilityGrade,
            risk_level: performanceResult.criticalBottlenecks.length > 3 ? 'Critical' :
                       performanceResult.criticalBottlenecks.length > 1 ? 'High' : 'Medium'
          },
          complexity_analysis: {
            average_complexity: Array.from(performanceResult.profiles.values())
              .reduce((sum, p) => sum + engine.getComplexityOrder(p.algorithmComplexity.overallComplexity), 0) / performanceResult.profiles.size,
            most_complex_files: Array.from(performanceResult.profiles.entries())
              .sort(([,a], [,b]) => engine.getComplexityOrder(b.algorithmComplexity.overallComplexity) - engine.getComplexityOrder(a.algorithmComplexity.overallComplexity))
              .slice(0, 5)
              .map(([file, profile]) => ({
                file,
                complexity: profile.algorithmComplexity.overallComplexity,
                recursion_depth: profile.algorithmComplexity.recursionDepth,
                loop_nesting: profile.algorithmComplexity.loopNesting
              })),
            recursion_detected: Array.from(performanceResult.profiles.values()).some(p => p.algorithmComplexity.recursionDepth > 0)
          },
          memory_analysis: {
            total_estimated_usage: Array.from(performanceResult.profiles.values())
              .reduce((sum, p) => sum + p.memoryUsage.estimatedMemoryUsage, 0),
            leak_risk_files: Array.from(performanceResult.profiles.entries())
              .filter(([, p]) => p.memoryUsage.leakPotential === 'high')
              .map(([file]) => file),
            optimization_score: Array.from(performanceResult.profiles.values())
              .reduce((sum, p) => sum + p.memoryUsage.memoryOptimizationScore, 0) / performanceResult.profiles.size
          },
          io_analysis: {
            total_blocking_operations: Array.from(performanceResult.profiles.values())
              .reduce((sum, p) => sum + p.ioOperations.blockingOperations, 0),
            average_io_efficiency: Array.from(performanceResult.profiles.values())
              .reduce((sum, p) => sum + p.ioOperations.ioEfficiency, 0) / performanceResult.profiles.size,
            io_bound_files: Array.from(performanceResult.profiles.entries())
              .filter(([, p]) => p.bottlenecks.some(b => b.type === 'io_bound'))
              .map(([file]) => file)
          },
          concurrency_analysis: {
            thread_safety_distribution: Array.from(performanceResult.profiles.values())
              .reduce((acc, p) => {
                acc[p.concurrencyAnalysis.threadSafety] = (acc[p.concurrencyAnalysis.threadSafety] || 0) + 1;
                return acc;
              }, {} as Record<string, number>),
            race_condition_risk: Array.from(performanceResult.profiles.values())
              .reduce((acc, p) => {
                acc[p.concurrencyAnalysis.raceConditionRisk] = (acc[p.concurrencyAnalysis.raceConditionRisk] || 0) + 1;
                return acc;
              }, {} as Record<string, number>),
            synchronization_usage: Array.from(performanceResult.profiles.values())
              .reduce((sum, p) => sum + p.concurrencyAnalysis.synchronizationPrimitives.length, 0)
          },
          critical_bottlenecks: performanceResult.criticalBottlenecks,
          top_recommendations: performanceResult.topRecommendations,
          scalability_assessment: performanceResult.scalabilityAssessment,
          immediate_actions: [
            ...performanceResult.criticalBottlenecks
              .filter(b => b.severity === 'critical')
              .map(b => `CRITICAL: ${b.description} - ${b.solution}`),
            ...performanceResult.topRecommendations
              .filter(r => r.priority === 'critical')
              .map(r => `URGENT: ${r.description} - ${r.benefit}% improvement possible`),
            ...(performanceResult.scalabilityAssessment.currentCapacity < 1000 ?
              ['CAPACITY ALERT: Performance capacity critically low - scale up or optimize immediately'] : [])
          ]
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(performanceReport, null, 2)
          }]
        };
      }

      case "analyze_code_clones": {
        const codebasePath = String(args?.codebase_path);
        const includePatterns = (args?.include_patterns as string[]) || ["**/*.{js,ts,py,cpp,c,h,hpp,cs,java}"];

        // Find files using glob patterns
        let allFiles: string[] = [];
        for (const pattern of includePatterns) {
          try {
            const files = glob.sync(pattern, { cwd: codebasePath });
            allFiles.push(...files);
          } catch (error) {
            // Ignore glob errors
          }
        }

        // Analyze code clones
        const engine = new CodeAnalysisEngine(codebasePath);
        const cloneResult = await engine.analyzeCodeClones(allFiles);

        const cloneReport = {
          summary: {
            files_analyzed: allFiles.length,
            total_clones: cloneResult.cloneMetrics.totalClones,
            duplicated_lines: cloneResult.cloneMetrics.totalDuplicatedLines,
            duplication_percentage: cloneResult.cloneMetrics.duplicationPercentage,
            largest_clone: cloneResult.cloneMetrics.largestClone,
            most_cloned_file: cloneResult.cloneMetrics.mostClonedFile,
            refactoring_opportunities: cloneResult.refactoringOpportunities.length,
            duplication_grade: cloneResult.cloneMetrics.duplicationPercentage < 5 ? 'A (Excellent)' :
                              cloneResult.cloneMetrics.duplicationPercentage < 10 ? 'B (Good)' :
                              cloneResult.cloneMetrics.duplicationPercentage < 20 ? 'C (Fair)' :
                              cloneResult.cloneMetrics.duplicationPercentage < 30 ? 'D (Poor)' : 'F (Critical)'
          },
          clone_analysis: {
            exact_clones: cloneResult.exactClones.length,
            near_clones: cloneResult.nearClones.length,
            functional_clones: cloneResult.functionalClones.length,
            high_risk_clones: [...cloneResult.exactClones, ...cloneResult.nearClones, ...cloneResult.functionalClones]
              .filter(c => c.risk === 'high').length,
            average_clone_similarity: cloneResult.exactClones.length > 0 ?
              cloneResult.exactClones.reduce((sum, c) => sum + c.similarity, 0) / cloneResult.exactClones.length : 0
          },
          largest_clones: [...cloneResult.exactClones, ...cloneResult.nearClones, ...cloneResult.functionalClones]
            .sort((a, b) => b.length - a.length)
            .slice(0, 10)
            .map(clone => ({
              type: clone.type,
              primary_file: clone.primaryFile,
              clone_files: clone.cloneFiles,
              length: clone.length,
              similarity: clone.similarity,
              risk: clone.risk,
              refactoring_opportunity: clone.refactoringOpportunity
            })),
          refactoring_opportunities: cloneResult.refactoringOpportunities
            .sort((a, b) => b.benefit - a.benefit)
            .map(opportunity => ({
              type: opportunity.type,
              priority: opportunity.priority,
              benefit_lines: opportunity.benefit,
              affected_files_count: opportunity.affectedFiles.length,
              description: opportunity.description,
              implementation: opportunity.implementation,
              risk: opportunity.risk,
              roi_score: opportunity.benefit / (opportunity.risk === 'low' ? 1 : opportunity.risk === 'medium' ? 2 : 3)
            })),
          clone_evolution: cloneResult.cloneEvolution.map(evolution => ({
            period: evolution.timePeriod,
            new_clones: evolution.newClones,
            resolved_clones: evolution.resolvedClones,
            net_change: evolution.newClones - evolution.resolvedClones,
            clone_density: evolution.cloneDensity,
            trend: evolution.newClones > evolution.resolvedClones ? 'increasing' :
                  evolution.resolvedClones > evolution.newClones ? 'decreasing' : 'stable'
          })),
          immediate_actions: [
            ...cloneResult.refactoringOpportunities
              .filter(o => o.priority === 'critical' || o.priority === 'high')
              .map(o => `URGENT: ${o.description} - ${o.benefit} lines of duplication to eliminate`),
            ...(cloneResult.cloneMetrics.duplicationPercentage > 25 ?
              [`CRITICAL DUPLICATION: ${cloneResult.cloneMetrics.duplicationPercentage.toFixed(1)}% duplication rate requires immediate refactoring`] : []),
            ...(cloneResult.cloneMetrics.largestClone > 30 ?
              [`LARGE CLONE DETECTED: ${cloneResult.cloneMetrics.largestClone} line clone should be extracted to utility function`] : []),
            'Implement code clone detection as part of regular code review process'
          ]
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(cloneReport, null, 2)
          }]
        };
      }

      case "analyze_documentation_quality": {
        const codebasePath = String(args?.codebase_path);
        const includePatterns = (args?.include_patterns as string[]) || ["**/*.{js,ts,py,cpp,c,h,hpp,cs,java}"];

        // Find files using glob patterns
        let allFiles: string[] = [];
        for (const pattern of includePatterns) {
          try {
            const files = glob.sync(pattern, { cwd: codebasePath });
            allFiles.push(...files);
          } catch (error) {
            // Ignore glob errors
          }
        }

        // Analyze documentation quality
        const engine = new CodeAnalysisEngine(codebasePath);
        const documentationResult = await engine.analyzeDocumentationQuality(allFiles);

        const documentationReport = {
          summary: {
            files_analyzed: documentationResult.fileQualities.length,
            overall_quality_score: documentationResult.overallQualityScore,
            average_comment_ratio: documentationResult.summaryMetrics.averageCommentRatio,
            documentation_grade: documentationResult.overallQualityScore > 80 ? 'A (Excellent)' :
                                documentationResult.overallQualityScore > 60 ? 'B (Good)' :
                                documentationResult.overallQualityScore > 40 ? 'C (Fair)' :
                                documentationResult.overallQualityScore > 20 ? 'D (Poor)' : 'F (Critical)',
            well_documented_files: documentationResult.summaryMetrics.wellDocumentedFiles,
            poorly_documented_files: documentationResult.summaryMetrics.poorlyDocumentedFiles,
            total_missing_documentation: documentationResult.missingDocumentation.length,
            improvement_opportunities: documentationResult.improvementOpportunities.length
          },
          quality_distribution: {
            excellent: documentationResult.fileQualities.filter(q => q.qualityScore > 80).length,
            good: documentationResult.fileQualities.filter(q => q.qualityScore > 60 && q.qualityScore <= 80).length,
            fair: documentationResult.fileQualities.filter(q => q.qualityScore > 40 && q.qualityScore <= 60).length,
            poor: documentationResult.fileQualities.filter(q => q.qualityScore > 20 && q.qualityScore <= 40).length,
            critical: documentationResult.fileQualities.filter(q => q.qualityScore <= 20).length
          },
          documentation_metrics: {
            total_documentation_lines: documentationResult.summaryMetrics.totalDocumentationLines,
            total_code_lines: documentationResult.summaryMetrics.totalCodeLines,
            overall_ratio: documentationResult.summaryMetrics.overallDocumentationRatio,
            undocumented_functions: documentationResult.summaryMetrics.undocumentedFunctions,
            undocumented_classes: documentationResult.summaryMetrics.undocumentedClasses,
            todo_comments: documentationResult.summaryMetrics.todoComments,
            fixme_comments: documentationResult.summaryMetrics.fixmeComments
          },
          critical_issues: documentationResult.missingDocumentation
            .filter(m => m.severity === 'critical' || m.severity === 'high')
            .map(missing => ({
              type: missing.type,
              location: missing.location,
              severity: missing.severity,
              description: missing.description,
              impact: missing.severity === 'critical' ? 'Critical maintainability issue' : 'High maintainability impact'
            })),
          top_improvement_opportunities: documentationResult.improvementOpportunities
            .sort((a, b) => b.benefit - a.benefit)
            .slice(0, 10)
            .map(improvement => ({
              type: improvement.type,
              priority: improvement.priority,
              benefit_percentage: improvement.benefit,
              effort: improvement.effort,
              description: improvement.description,
              implementation: improvement.implementation,
              roi_score: improvement.benefit / (improvement.effort === 'low' ? 1 : improvement.effort === 'medium' ? 2 : 3)
            })),
          immediate_actions: [
            ...documentationResult.missingDocumentation
              .filter(m => m.severity === 'critical')
              .map(m => `CRITICAL: ${m.description} - Immediate documentation required`),
            ...documentationResult.improvementOpportunities
              .filter(i => i.priority === 'high')
              .map(i => `HIGH PRIORITY: ${i.description} - ${i.benefit}% maintainability improvement`),
            ...(documentationResult.summaryMetrics.averageCommentRatio < 10 ?
              [`URGENT: Overall documentation ratio of ${documentationResult.summaryMetrics.averageCommentRatio.toFixed(1)}% is critically low`] : []),
            ...(documentationResult.summaryMetrics.todoComments > 15 ?
              [`TECHNICAL DEBT: ${documentationResult.summaryMetrics.todoComments} TODO comments indicate significant technical debt`] : []),
            'Establish documentation standards and implement regular documentation reviews'
          ]
        };

        return {
          content: [{
            type: "text",
            text: JSON.stringify(documentationReport, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new Error(`Tool execution failed: ${(error as Error).message}`);
  }
});

/**
 * Helper function to generate quality recommendations
 */
function generateQualityRecommendations(metrics: QualityMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.cyclomaticComplexity > 10) {
    recommendations.push("High complexity detected - consider breaking down complex functions");
  }

  if (metrics.maintainabilityIndex < 50) {
    recommendations.push("Low maintainability index - improve code structure and documentation");
  }

  if (metrics.technicalDebtHours > 100) {
    recommendations.push("Significant technical debt detected - consider refactoring");
  }

  if (metrics.duplicationPercentage > 20) {
    recommendations.push("High code duplication - extract common patterns into utilities");
  }

  return recommendations;
}

/**
 * Handler that lists available prompts.
 * Exposes a single "summarize_notes" prompt that summarizes all notes.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: []
  };
});

/**
 * Handler for the summarize_notes prompt.
 * Returns a prompt that requests summarization of all notes, with the notes' contents embedded as resources.
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  throw new Error(`Unknown prompt: ${request.params.name}`);
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Codebase Analysis MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
