---
id: dev-environment
title: "Development Environment Setup"
level: practical
type: guide
tags: ["development", "setup", "environment", "scheme", "prolog", "datalog"]
keywords: ["setup", "install", "scheme", "prolog", "datalog", "development"]
prerequisites: ["quick-start"]
enables: ["first-automaton", "scheme-core"]
related: ["scheme-core", "quick-start"]
readingTime: 25
difficulty: 2
status: published
authors: ["Brian James Thorne"]
dateCreated: "2025-01-15"
---

# Development Environment Setup

> **Set up your development environment for DANL: Scheme, Prolog, and Datalog**

This guide helps you set up a complete development environment for DANL, including Scheme interpreters, Prolog engines, and Datalog query processors.

## Required Tools

### Core Components

1. **Scheme Interpreter** - Guile or Racket
2. **Prolog Engine** - SWI-Prolog
3. **Datalog Engine** - Soufflé
4. **Editor/IDE** - Your choice
5. **Version Control** - Git

## Scheme Setup

### Option 1: Guile (Recommended)

**Install Guile**:

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install guile-3.0 guile-3.0-dev
```

**macOS**:
```bash
brew install guile
```

**Verify installation**:
```bash
guile --version
# Should show: guile (GNU Guile) 3.0.x
```

**Test Scheme**:
```bash
guile
> (display "Hello, DANL!\n")
Hello, DANL!
> (exit)
```

### Option 2: Racket

**Install Racket**:

**Ubuntu/Debian**:
```bash
sudo apt-get install racket
```

**macOS**:
```bash
brew install racket
```

**Download**: https://racket-lang.org/download/

**Verify installation**:
```bash
racket --version
```

### Load DANL Core

**Load `danl-core.scm`**:
```bash
guile -s danl-core.scm
```

Or interactively:
```scheme
guile
> (load "danl-core.scm")
> (run-tests)
```

## Prolog Setup

### SWI-Prolog

**Install SWI-Prolog**:

**Ubuntu/Debian**:
```bash
sudo apt-get install swi-prolog
```

**macOS**:
```bash
brew install swi-prolog
```

**Verify installation**:
```bash
swipl --version
```

**Load DANL Rules**:
```prolog
swipl
?- [danl-rules].
?- run_tests.
```

### Test Prolog

**Test epistemic state**:
```prolog
?- epistemic_state(alice, KK, KU, UK, UU).
KK = 100,
KU = 50,
UK = 30,
UU = 20.
```

## Datalog Setup

### Soufflé

**Install Soufflé**:

**Ubuntu/Debian**:
```bash
sudo apt-get install souffle
```

**macOS**:
```bash
brew install souffle
```

**Build from source**:
```bash
git clone https://github.com/souffle-lang/souffle.git
cd souffle
cmake -B build -S .
cmake --build build
sudo cmake --install build
```

**Verify installation**:
```bash
souffle --version
```

### Run Datalog Queries

**Run queries**:
```bash
souffle danl-queries.dl
```

**Interactive mode**:
```bash
souffle -i danl-queries.dl
```

## Project Structure

### Recommended Layout

```
epistemic-topology/
├── danl-core.scm          # Scheme core implementation
├── danl-rules.pl          # Prolog rules
├── danl-queries.dl        # Datalog queries
├── docs/                  # Documentation
├── tools/                 # Tools and scripts
└── tests/                 # Test files
```

### Create Project Directory

```bash
mkdir -p my-danl-project
cd my-danl-project
git init
```

## Editor Configuration

### VS Code

**Extensions**:
- **scheme-lang** - Scheme syntax highlighting
- **Prolog** - Prolog support
- **Datalog** - Datalog support

**Settings** (`.vscode/settings.json`):
```json
{
  "files.associations": {
    "*.scm": "scheme",
    "*.pl": "prolog",
    "*.dl": "datalog"
  }
}
```

### Emacs

**Packages**:
- `geiser` - Scheme support
- `prolog-mode` - Prolog support
- `datalog-mode` - Datalog support

**Configuration** (`~/.emacs.d/init.el`):
```elisp
(require 'geiser-guile)
(add-to-list 'auto-mode-alist '("\\.scm\\'" . scheme-mode))
(add-to-list 'auto-mode-alist '("\\.pl\\'" . prolog-mode))
```

### Vim/Neovim

**Plugins**:
- `vim-scheme`
- `vim-prolog`
- `vim-datalog`

## Environment Variables

### Setup Script

**Create `setup-env.sh`**:
```bash
#!/bin/bash

# DANL Development Environment Setup

export DANL_HOME=$(pwd)
export DANL_SCHEME=guile
export DANL_PROLOG=swipl
export DANL_DATALOG=souffle

# Add to PATH
export PATH="$DANL_HOME/tools:$PATH"

# Scheme library path
export GUILE_LOAD_PATH="$DANL_HOME:$GUILE_LOAD_PATH"

echo "DANL environment configured!"
echo "DANL_HOME: $DANL_HOME"
```

**Source it**:
```bash
source setup-env.sh
```

## Testing Your Setup

### Test Script

**Create `test-setup.sh`**:
```bash
#!/bin/bash

echo "Testing DANL Development Environment..."
echo ""

echo "1. Testing Scheme (Guile)..."
guile -c "(display \"✓ Scheme works!\n\")" || echo "✗ Scheme failed"

echo ""
echo "2. Testing Prolog (SWI-Prolog)..."
swipl -q -g "write('✓ Prolog works!'), nl, halt." || echo "✗ Prolog failed"

echo ""
echo "3. Testing Datalog (Soufflé)..."
souffle --version > /dev/null && echo "✓ Datalog works!" || echo "✗ Datalog failed"

echo ""
echo "Setup test complete!"
```

**Run test**:
```bash
chmod +x test-setup.sh
./test-setup.sh
```

## Quick Test

### Test DANL Core

**Test Scheme**:
```bash
guile -s danl-core.scm
```

**Expected output**:
```
Testing Euler phi:
φ(4) = 2
φ(8) = 4
φ(12) = 4
...
```

### Test Prolog Rules

**Test Prolog**:
```prolog
swipl danl-rules.pl
?- run_tests.
```

**Expected output**:
```
=== Testing Epistemic States ===
Alice: KK=100, KU=50, UK=30, UU=20
...
```

### Test Datalog Queries

**Test Datalog**:
```bash
souffle danl-queries.dl
```

**Check output files**:
```bash
ls *.csv
# Should see: happens_before.csv, concurrent.csv, etc.
```

## Troubleshooting

### Common Issues

**Issue**: Guile not found
```bash
# Ubuntu/Debian
sudo apt-get install guile-3.0

# macOS
brew install guile
```

**Issue**: Prolog module not found
```prolog
% Add current directory to load path
?- use_module('./danl-rules.pl').
```

**Issue**: Datalog syntax errors
```bash
# Check syntax
souffle --help

# Debug mode
souffle -d danl-queries.dl
```

### Getting Help

**Scheme**:
- Guile docs: https://www.gnu.org/software/guile/manual/
- Racket docs: https://docs.racket-lang.org/

**Prolog**:
- SWI-Prolog docs: https://www.swi-prolog.org/pldoc/

**Datalog**:
- Soufflé docs: https://souffle-lang.github.io/docs/

## Next Steps

- **Create your first automaton**: [First Automaton](first-automaton.md) - Tutorial
- **Learn Scheme core**: [Scheme Core](scheme-core.md) - Implementation details
- **See quick start**: [Quick Start](quick-start.md) - 30-minute guide

## Related Resources

- [Quick Start](quick-start.md) - Getting started guide
- [First Automaton](first-automaton.md) - First automaton tutorial
- [Scheme Core](scheme-core.md) - Scheme implementation
