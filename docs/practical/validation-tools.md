---
id: validation-tools
title: "Validation Tools for Epistemic Topology"
level: practical
type: implementation
tags: ["validation", "tools", "epistemic-topology", "quality-assurance"]
keywords: ["validation", "validator", "epistemic", "topology", "quality"]
prerequisites: ["testing-guide"]
enables: ["api-reference"]
related: ["testing-guide", "quick-start"]
readingTime: 25
difficulty: 2
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Validation Tools for Epistemic Topology

> **Documentation and structure validation tools**

The epistemic topology validator (`tools/validate-epistemic-topology.js`) checks that all documentation follows the EpistemicNode structure and maintains valid relationships.

## Overview

### What It Validates

1. **Front Matter Structure** - YAML front matter follows EpistemicNode interface
2. **Required Fields** - All required fields present
3. **Relationship Integrity** - Prerequisites and enables links are valid
4. **Type Validation** - Levels and types are valid
5. **Quality Checks** - Reading time, difficulty ratings

## Usage

### Basic Usage

**Run validator**:
```bash
node tools/validate-epistemic-topology.js docs/
```

**Output**:
```
Epistemic Topology Validator

Scanning directory: docs/

Found 18 markdown files

SUMMARY
  Total nodes: 18
  Errors: 0
  Warnings: 2
  Suggestions: 1
```

### Command Line Options

**Specify directory**:
```bash
node tools/validate-epistemic-topology.js /path/to/docs
```

**Default**: Uses `docs/` directory if not specified

## Validation Rules

### Required Fields

**All documents must have**:
- `id` - Unique identifier
- `title` - Document title
- `level` - Document level (gateway, foundational, practical, applied)
- `type` - Document type (navigation, concept, implementation, application, guide)
- `tags` - Array of tags
- `keywords` - Array of keywords
- `prerequisites` - Array of prerequisite document IDs
- `enables` - Array of enabled document IDs

### Valid Levels

**Level values**:
- `gateway` - Entry-level documents
- `foundational` - Core concepts
- `practical` - Implementation guides
- `applied` - Real-world applications
- `navigation` - Index/navigation documents

### Valid Types

**Type values**:
- `navigation` - Navigation/index documents
- `concept` - Conceptual explanations
- `implementation` - Implementation details
- `application` - Application examples
- `guide` - How-to guides

### Field Types

**Arrays**:
- `tags` - Must be array
- `keywords` - Must be array
- `prerequisites` - Must be array
- `enables` - Must be array
- `related` - Must be array (optional)

**Numbers**:
- `difficulty` - Must be 1-5
- `readingTime` - Must be positive number

## Validation Output

### Summary

**Summary section**:
```
SUMMARY
  Total nodes: 18
  Errors: 0
  Warnings: 2
  Suggestions: 1
```

### Errors

**Critical issues**:
```
ERRORS (2)
  ❌ my-doc.md: Missing required field "prerequisites"
  ❌ other-doc.md: Invalid level "foundation"
```

**Fix errors** before proceeding.

### Warnings

**Non-critical issues**:
```
WARNINGS (5)
  ⚠️  my-doc.md: Consider adding "readingTime" estimate
  ⚠️  other-doc.md: Enabled node "future-doc" not found (might not exist yet)
```

**Warnings** are suggestions for improvement.

### Suggestions

**Quality improvements**:
```
SUGGESTIONS (3)
  💡 gateway-doc.md: Gateway documents should typically have difficulty ≤ 2
  💡 applied-doc.md: Applied documents should typically have difficulty ≥ 3
```

**Suggestions** help improve document quality.

## Validation Checks

### Front Matter Structure

**Valid front matter**:
```yaml
---
id: my-document
title: "My Document"
level: foundational
type: concept
tags: ["tag1", "tag2"]
keywords: ["keyword1", "keyword2"]
prerequisites: ["prereq-doc"]
enables: ["enabled-doc"]
related: ["related-doc"]
readingTime: 30
difficulty: 3
status: published
authors: ["Author Name"]
dateCreated: "2025-01-15"
---
```

### Relationship Validation

**Prerequisites check**:
- ✅ All prerequisites exist
- ✅ No circular prerequisites
- ✅ Prerequisites are valid document IDs

**Enables check**:
- ⚠️ Enabled documents exist (warnings for future documents)
- ✅ Enabled documents are valid document IDs

**Related check**:
- ⚠️ Related documents exist (warnings if missing)

### Type Validation

**Level validation**:
- ✅ Level is valid (gateway, foundational, practical, applied, navigation)
- ✅ Level matches document location

**Type validation**:
- ✅ Type is valid (navigation, concept, implementation, application, guide)
- ✅ Type matches document content

### Quality Validation

**Difficulty validation**:
- ✅ Difficulty is 1-5
- 💡 Gateway documents should have difficulty ≤ 2
- 💡 Applied documents should have difficulty ≥ 3

**Reading time validation**:
- ✅ Reading time is positive number
- ⚠️ Consider adding reading time estimate

## Graph Export

### Exporting Graph Data

**Graph export**:
```bash
node tools/validate-epistemic-topology.js docs/
# Automatically exports to docs/assets/graph-data.json
```

**Graph structure**:
```json
{
  "nodes": [
    {
      "id": "vector-clocks",
      "title": "Vector Clocks and Causal Ordering",
      "level": "foundational",
      "type": "concept",
      "difficulty": 3,
      "readingTime": 35,
      "tags": ["vector-clocks", "causality"],
      "keywords": ["vector-clock", "happens-before"]
    }
  ],
  "links": [
    {
      "source": "max-plus-algebra",
      "target": "vector-clocks",
      "type": "enables"
    }
  ]
}
```

**Use cases**:
- Visualization tools
- Navigation systems
- Documentation generators

## Integration

### CI/CD Integration

**GitHub Actions**:
```yaml
name: Validate Documentation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: node tools/validate-epistemic-topology.js docs/
```

### Pre-commit Hook

**Git hook**:
```bash
#!/bin/bash
# .git/hooks/pre-commit

node tools/validate-epistemic-topology.js docs/
if [ $? -ne 0 ]; then
    echo "Validation failed. Please fix errors."
    exit 1
fi
```

## API Usage

### Programmatic Usage

**JavaScript API**:
```javascript
const EpistemicValidator = require('./tools/validate-epistemic-topology');

const validator = new EpistemicValidator('docs/');
await validator.validateAll();

// Export graph
validator.exportGraph('docs/assets/graph-data.json');
```

### Custom Validation

**Extend validator**:
```javascript
class CustomValidator extends EpistemicValidator {
    validateNode(filePath, frontMatter) {
        super.validateNode(filePath, frontMatter);
        
        // Custom validation
        if (frontMatter.level === 'gateway' && frontMatter.difficulty > 2) {
            this.warnings.push(`${filePath}: Gateway should be easy`);
        }
    }
}
```

## Troubleshooting

### Common Issues

**"Missing required field"**:
- Check YAML syntax
- Ensure all required fields present
- Verify field names are correct

**"Invalid level"**:
- Use valid level values
- Check spelling (foundational, not foundation)

**"Circular prerequisite"**:
- Remove circular dependencies
- Review prerequisite chain

**"Broken link"**:
- Check document IDs match
- Verify file paths are correct

## Best Practices

### Validation Workflow

1. **Run before commit**: Validate before committing changes
2. **Fix errors first**: Address errors before warnings
3. **Review suggestions**: Consider quality suggestions
4. **Automate**: Use CI/CD for continuous validation

### Document Structure

1. **Consistent formatting**: Use consistent YAML format
2. **Complete metadata**: Include all required fields
3. **Valid relationships**: Ensure prerequisites/enables exist
4. **Appropriate difficulty**: Match difficulty to level

## Next Steps

- **Learn testing**: [Testing Guide](testing-guide.md) - How to test
- **See examples**: [Quick Start](quick-start.md) - Example usage
- **Check API**: [API Reference](api-reference.md) - Complete API

## Related Resources

- [Testing Guide](testing-guide.md) - Testing approach
- [Quick Start](quick-start.md) - Getting started
- [API Reference](api-reference.md) - API documentation
