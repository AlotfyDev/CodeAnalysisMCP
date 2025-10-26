@echo off
echo ========================================
echo CodeAnalysisServer MCP Portable Setup
echo ========================================
echo.
echo This setup will configure your VSCode project to use the
echo shared CodeAnalysisServer MCP from the portable directory.
echo.
echo Location: D:\Cline\SharedPackages\CodeAnalysisServer-Portable
echo.
pause

echo Configuring .vscode/settings.json...
if not exist ".vscode" mkdir ".vscode"

(
echo {
echo   "cline.mcpServers": {
echo     "codeanalysis-server": {
echo       "command": "node",
echo       "args": ["D:\\Cline\\SharedPackages\\CodeAnalysisServer-Portable\\build\\index.js"],
echo       "disabled": false,
echo       "autoApprove": [
echo         "analyze_file",
echo         "analyze_codebase",
echo         "security_analysis",
echo         "performance_analysis",
echo         "code_quality_metrics",
echo         "architectural_insights",
echo         "graphrag_enhanced_analysis"
echo       ]
echo     }
echo   }
echo }
) > .vscode\settings.json

echo Configuration complete! Restart VSCode to enable the MCP server.
echo.
pause
