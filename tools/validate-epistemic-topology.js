#!/usr/bin/env node

/**
 * Epistemic Topology Validator
 * 
 * Validates that all documents in the epistemic topology follow the
 * EpistemicNode structure and have valid relationships.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

class EpistemicValidator {
    constructor(docsDir) {
        this.docsDir = docsDir;
        this.nodes = new Map();
        this.errors = [];
        this.warnings = [];
        this.suggestions = [];
    }

    // Extract YAML front matter from markdown file
    extractFrontMatter(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        
        if (!match) {
            return null;
        }

        try {
            return yaml.load(match[1]);
        } catch (error) {
            this.errors.push(`Invalid YAML in ${filePath}: ${error.message}`);
            return null;
        }
    }

    // Validate a single node
    validateNode(filePath, frontMatter) {
        const fileName = path.basename(filePath, '.md');
        
        // Required fields
        const required = ['id', 'title', 'level', 'type', 'tags', 'keywords', 'prerequisites', 'enables'];
        for (const field of required) {
            if (!(field in frontMatter)) {
                this.errors.push(`${fileName}: Missing required field "${field}"`);
            }
        }

        // Validate level
        const validLevels = ['gateway', 'foundational', 'practical', 'applied', 'navigation'];
        if (frontMatter.level && !validLevels.includes(frontMatter.level)) {
            this.errors.push(`${fileName}: Invalid level "${frontMatter.level}". Must be one of: ${validLevels.join(', ')}`);
        }

        // Validate type
        const validTypes = ['navigation', 'concept', 'implementation', 'application', 'guide'];
        if (frontMatter.type && !validTypes.includes(frontMatter.type)) {
            this.errors.push(`${fileName}: Invalid type "${frontMatter.type}". Must be one of: ${validTypes.join(', ')}`);
        }

        // Validate arrays
        if (frontMatter.tags && !Array.isArray(frontMatter.tags)) {
            this.errors.push(`${fileName}: "tags" must be an array`);
        }
        if (frontMatter.keywords && !Array.isArray(frontMatter.keywords)) {
            this.errors.push(`${fileName}: "keywords" must be an array`);
        }
        if (frontMatter.prerequisites && !Array.isArray(frontMatter.prerequisites)) {
            this.errors.push(`${fileName}: "prerequisites" must be an array`);
        }
        if (frontMatter.enables && !Array.isArray(frontMatter.enables)) {
            this.errors.push(`${fileName}: "enables" must be an array`);
        }

        // Validate difficulty (optional)
        if (frontMatter.difficulty && (frontMatter.difficulty < 1 || frontMatter.difficulty > 5)) {
            this.errors.push(`${fileName}: "difficulty" must be between 1 and 5`);
        }

        // Validate reading time (optional)
        if (frontMatter.readingTime && (typeof frontMatter.readingTime !== 'number' || frontMatter.readingTime < 0)) {
            this.errors.push(`${fileName}: "readingTime" must be a positive number`);
        }

        // Warnings for missing optional but recommended fields
        if (!frontMatter.readingTime) {
            this.warnings.push(`${fileName}: Consider adding "readingTime" estimate`);
        }
        if (!frontMatter.difficulty) {
            this.warnings.push(`${fileName}: Consider adding "difficulty" rating (1-5)`);
        }

        // Suggestions
        if (frontMatter.level === 'gateway' && frontMatter.difficulty > 2) {
            this.suggestions.push(`${fileName}: Gateway documents should typically have difficulty ≤ 2`);
        }
        if (frontMatter.level === 'applied' && frontMatter.difficulty < 3) {
            this.suggestions.push(`${fileName}: Applied documents should typically have difficulty ≥ 3`);
        }

        if (frontMatter.tags && frontMatter.tags.length === 0) {
            this.warnings.push(`${fileName}: No tags specified`);
        }

        return frontMatter;
    }

    // Find all markdown files recursively
    findMarkdownFiles(dir) {
        const files = [];
        
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && item !== 'node_modules' && item !== '.git') {
                files.push(...this.findMarkdownFiles(fullPath));
            } else if (stat.isFile() && item.endsWith('.md')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    // Validate all nodes
    async validateAll() {
        console.log(`${colors.cyan}Epistemic Topology Validator${colors.reset}\n`);
        console.log(`Scanning directory: ${this.docsDir}\n`);

        const files = this.findMarkdownFiles(this.docsDir);
        console.log(`Found ${files.length} markdown files\n`);

        // First pass: collect all nodes
        for (const file of files) {
            const frontMatter = this.extractFrontMatter(file);
            if (frontMatter) {
                const validated = this.validateNode(file, frontMatter);
                if (validated && validated.id) {
                    this.nodes.set(validated.id, {
                        file,
                        data: validated
                    });
                }
            } else {
                this.warnings.push(`${path.basename(file)}: No front matter found`);
            }
        }

        // Second pass: validate relationships
        for (const [id, node] of this.nodes.entries()) {
            const { file, data } = node;
            const fileName = path.basename(file);

            // Check prerequisites exist
            if (data.prerequisites) {
                for (const prereq of data.prerequisites) {
                    if (prereq !== '*' && !this.nodes.has(prereq)) {
                        this.errors.push(`${fileName}: Prerequisite "${prereq}" not found`);
                    }
                }
            }

            // Check enables exist
            if (data.enables) {
                for (const enabled of data.enables) {
                    if (enabled !== '*' && !this.nodes.has(enabled)) {
                        this.warnings.push(`${fileName}: Enabled node "${enabled}" not found (might not exist yet)`);
                    }
                }
            }

            // Check related exist
            if (data.related) {
                for (const related of data.related) {
                    if (related !== '*' && !this.nodes.has(related)) {
                        this.warnings.push(`${fileName}: Related node "${related}" not found`);
                    }
                }
            }

            // Check for circular prerequisites
            if (data.prerequisites) {
                for (const prereq of data.prerequisites) {
                    if (prereq !== '*' && this.nodes.has(prereq)) {
                        const prereqNode = this.nodes.get(prereq);
                        if (prereqNode.data.prerequisites && prereqNode.data.prerequisites.includes(id)) {
                            this.errors.push(`${fileName}: Circular prerequisite with "${prereq}"`);
                        }
                    }
                }
            }
        }

        // Check for orphaned nodes (no incoming enables, except gateways)
        for (const [id, node] of this.nodes.entries()) {
            if (node.data.level === 'gateway') continue;
            
            let hasIncoming = false;
            for (const [otherId, otherNode] of this.nodes.entries()) {
                if (otherId === id) continue;
                if (otherNode.data.enables && otherNode.data.enables.includes(id)) {
                    hasIncoming = true;
                    break;
                }
            }
            
            if (!hasIncoming) {
                this.suggestions.push(`${path.basename(node.file)}: Node has no incoming "enables" relationships`);
            }
        }

        // Print results
        this.printResults();
    }

    printResults() {
        console.log(`\n${'='.repeat(60)}\n`);
        
        // Summary
        console.log(`${colors.cyan}SUMMARY${colors.reset}`);
        console.log(`  Total nodes: ${this.nodes.size}`);
        console.log(`  Errors: ${colors.red}${this.errors.length}${colors.reset}`);
        console.log(`  Warnings: ${colors.yellow}${this.warnings.length}${colors.reset}`);
        console.log(`  Suggestions: ${colors.blue}${this.suggestions.length}${colors.reset}`);

        // Level breakdown
        const levelCounts = {};
        for (const node of this.nodes.values()) {
            const level = node.data.level || 'unknown';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
        }
        
        console.log(`\n${colors.cyan}NODES BY LEVEL${colors.reset}`);
        for (const [level, count] of Object.entries(levelCounts)) {
            console.log(`  ${level}: ${count}`);
        }

        // Type breakdown
        const typeCounts = {};
        for (const node of this.nodes.values()) {
            const type = node.data.type || 'unknown';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
        
        console.log(`\n${colors.cyan}NODES BY TYPE${colors.reset}`);
        for (const [type, count] of Object.entries(typeCounts)) {
            console.log(`  ${type}: ${count}`);
        }

        // Errors
        if (this.errors.length > 0) {
            console.log(`\n${colors.red}ERRORS (${this.errors.length})${colors.reset}`);
            for (const error of this.errors) {
                console.log(`  ❌ ${error}`);
            }
        }

        // Warnings
        if (this.warnings.length > 0) {
            console.log(`\n${colors.yellow}WARNINGS (${this.warnings.length})${colors.reset}`);
            for (const warning of this.warnings.slice(0, 10)) {
                console.log(`  ⚠️  ${warning}`);
            }
            if (this.warnings.length > 10) {
                console.log(`  ... and ${this.warnings.length - 10} more`);
            }
        }

        // Suggestions
        if (this.suggestions.length > 0) {
            console.log(`\n${colors.blue}SUGGESTIONS (${this.suggestions.length})${colors.reset}`);
            for (const suggestion of this.suggestions.slice(0, 10)) {
                console.log(`  💡 ${suggestion}`);
            }
            if (this.suggestions.length > 10) {
                console.log(`  ... and ${this.suggestions.length - 10} more`);
            }
        }

        console.log(`\n${'='.repeat(60)}\n`);

        // Final status
        if (this.errors.length === 0) {
            console.log(`${colors.green}✅ Validation passed! No errors found.${colors.reset}\n`);
            return 0;
        } else {
            console.log(`${colors.red}❌ Validation failed. Please fix the errors above.${colors.reset}\n`);
            return 1;
        }
    }

    // Export graph data for visualization
    exportGraph(outputPath) {
        const nodes = [];
        const links = [];

        for (const [id, node] of this.nodes.entries()) {
            nodes.push({
                id,
                title: node.data.title,
                level: node.data.level,
                type: node.data.type,
                difficulty: node.data.difficulty || 3,
                readingTime: node.data.readingTime || 10,
                tags: node.data.tags || [],
                keywords: node.data.keywords || []
            });

            // Add links
            if (node.data.enables) {
                for (const target of node.data.enables) {
                    if (target !== '*' && this.nodes.has(target)) {
                        links.push({
                            source: id,
                            target,
                            type: 'enables'
                        });
                    }
                }
            }

            if (node.data.related) {
                for (const target of node.data.related) {
                    if (target !== '*' && this.nodes.has(target)) {
                        links.push({
                            source: id,
                            target,
                            type: 'related'
                        });
                    }
                }
            }
        }

        const graphData = { nodes, links };
        fs.writeFileSync(outputPath, JSON.stringify(graphData, null, 2));
        console.log(`${colors.green}Graph data exported to ${outputPath}${colors.reset}`);
    }
}

// Main execution
if (require.main === module) {
    const docsDir = process.argv[2] || path.join(__dirname, '..', 'docs');
    const validator = new EpistemicValidator(docsDir);
    
    validator.validateAll().then(() => {
        const graphPath = path.join(docsDir, 'assets', 'graph-data.json');
        try {
            validator.exportGraph(graphPath);
        } catch (error) {
            console.log(`Note: Could not export graph data: ${error.message}`);
        }
    });
}

module.exports = EpistemicValidator;