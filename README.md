# Style Converter

Convert CSS framework classes (Tailwind CSS or Bootstrap) in React TSX files to modular SCSS with semantic selectors.

## Background

This tool was created after hearing about fellow students spend weeks manually converting Tailwind classes to SASS during their internship. Watching them do repetitive, tedious work that could be automated felt like a waste of valuable time that could have been spent on actual productive development.

## ⚡ Performance

**Blazing fast conversion:**
- 6 features with ~570 classes: **1.6 seconds**
- Per feature: **~0.26 seconds**
- Per class: **~0.003 seconds**

This includes full AST parsing, SCSS generation, TSX updates, and comprehensive report generation.

**What would take weeks manually, takes seconds with this tool.** 🚀

## Quick Start

Install dependencies:
```bash
npm install --save-dev tsx @babel/parser @babel/traverse @babel/generator @babel/types glob
```

Add script to package.json:
```json
"scripts": {
  "styleConvert": "tsx script/styleConvert.ts"
}
```

## Usage

Convert Tailwind classes:
```bash
npm run styleConvert adminBoard
npm run styleConvert all
```

Convert Bootstrap classes:
```bash
npm run styleConvert adminBoard -- --framework bootstrap
```

Replace className with CSS Modules:
```bash
npm run styleConvert adminBoard -- --replace
```

## What It Does

Converts this:
```tsx
<header className="bg-blue-500 p-4 text-white">
  <h1 className="text-2xl font-bold">Dashboard</h1>
</header>
```

Into SCSS:
```scss
.feature {
  header {
    background-color: #3b82f6;
    padding: 1rem;
    color: #ffffff;
  }
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
  }
}
```

With --replace, updates TSX to:
```tsx
import styles from './Feature.module.scss';

<header className={styles["header"]}>
  <h1 className={styles["h1"]}>Dashboard</h1>
</header>
```

## Features

- ✨ **Beautiful unified reports** - Single Markdown file with executive summary, metrics, and next steps
- 🎯 **Comprehensive framework support**:
  - Tailwind CSS: **384 lines**, 300+ class mappings (colors, spacing, flex, grid, text, borders, shadows, transitions, pseudo-states)
  - Bootstrap: **350 lines**, 250+ class mappings (utilities, components like buttons/cards/forms/alerts, grid system)
- 🏗️ Uses semantic HTML element selectors (header, nav, main, etc.)
- 📦 Generates CSS Modules with SCSS
- 🔄 Preserves unknown classes in hybrid mode
- 🚀 Batch process all features at once
- 🔍 **Duplicate detection** - Property-level analysis across features
- 📊 Detailed conversion guides with tables and metrics
- 🎨 Clean, viewer-friendly Markdown output

## Configuration

Edit `script/config.ts` to customize paths, elements, breakpoints, and pseudo-classes.

## File Structure

```
script/
  ├── styleConvert.ts       # Main script
  ├── config.ts             # Configuration
  ├── tailwindLibrary.ts    # Tailwind mappings
  └── bootstrapLibrary.ts   # Bootstrap mappings
```

## Generated Files

**For each feature:**
- `[feature].module.scss` - Converted styles with nested selectors
- `_variables.scss` - Color and spacing variables
- `tailwind.mixins.scss` - Reusable SCSS mixins
- `CONVERSION_GUIDE.md` - Detailed conversion mapping per file

**Global reports (after conversion):**
- `CONVERSION_REPORT.md` - 🎨 **Beautiful unified report** with:
  - Executive summary with success metrics
  - Feature-by-feature breakdown with tables
  - Unknown classes requiring attention
  - Clear next steps and recommendations
- `_global_properties.scss` - Technical analysis of duplicate CSS properties
- `PROPERTY_DUPLICATES_REPORT.md` - Step-by-step refactoring guide

### Example CONVERSION_REPORT.md

```markdown
# 🎨 Style Conversion Report

**Generated:** 2025-11-16 03:17:27
**Framework:** TAILWIND
**Mode:** Generate Only

---

## 📊 Executive Summary

| Metric | Count |
|--------|-------|
| Features Converted | 9 |
| TSX Files Processed | 27 |
| Classes Converted | 56 |
| Unknown Classes | 1 |
| Success Rate | 98.2% |

## 📦 Feature Breakdown

### ✅ duplicateTest1

| Detail | Value |
|--------|-------|
| Files Processed | 1 |
| Classes Converted | 17 |
| Unknown Classes | 0 |
| SCSS Generated | ✅ |
| TSX Updated | ➖ |
```

## Duplicate Detection

When converting multiple features with `npm run styleConvert all`, the tool automatically analyzes all generated styles and identifies CSS properties that appear in 3 or more different selectors across features.

**Benefits:**
- Reduces code duplication across features
- Identifies reusable component styles
- Provides actionable refactoring guidance
- Foundation for building a design system

**How It Works:**

1. **Analyzes** all `.module.scss` files after conversion
2. **Identifies** CSS properties used 3+ times across different selectors
3. **Generates** detailed reports with step-by-step refactoring guides

**Example Output:**

Running `npm run styleConvert all` will produce:

```
🔍 Analyzing SCSS files for duplicate CSS properties...
✅ Property analysis file created: src\features\_global_properties.scss
📊 Found 8 duplicate CSS property(ies) across features
📋 Detailed report created: PROPERTY_DUPLICATES_REPORT.md
```

**Generated Reports:**

1. **`_global_properties.scss`** - Technical analysis showing all duplicates:
```scss
// Property: color: #4b5563
// Used 3 times in 3 feature(s): featureA, featureB, featureC
// Locations:
//   - featureA > a:nth-of-type(1)
//   - featureB > p:nth-of-type(1)
//   - featureC > span
```

2. **`PROPERTY_DUPLICATES_REPORT.md`** - Step-by-step refactoring guide with:
   - Summary of duplicates found
   - Ready-to-copy SCSS variable suggestions
   - Before/after code examples
   - Optional utility class patterns
   - Benefits and optimization tips

**Refactoring Workflow:**

```bash
# 1. Convert all features
npm run styleConvert all

# 2. Review the report
cat PROPERTY_DUPLICATES_REPORT.md

# 3. Copy suggested variables to _variables.scss
# The report includes ready-to-use variable definitions like:
# $bg-white: #ffffff;
# $text-gray: #4b5563;
# $radius-md: 0.5rem;

# 4. Update .module.scss files
# Replace hardcoded values with variables (use find/replace)

# 5. Test your app
```

**Example Refactoring:**

The report provides concrete examples:

**Before:**
```scss
a:nth-of-type(1) {
  color: #4b5563;
}
a:nth-of-type(2) {
  color: #4b5563;
}
p:nth-of-type(1) {
  color: #4b5563;
}
```

**After:**
```scss
a:nth-of-type(1) {
  color: $text-gray;
}
a:nth-of-type(2) {
  color: $text-gray;
}
p:nth-of-type(1) {
  color: $text-gray;
}
```

**Why Manual Refactoring?**

The tool guides you instead of auto-replacing because:
- ✅ You review and approve changes
- ✅ You choose which duplicates to extract
- ✅ No risk of breaking existing code
- ✅ You learn patterns for future work
- ✅ Full control over your design system

## Adding Custom Classes

Edit library files to add more class mappings:
- `script/tailwindLibrary.ts` for Tailwind
- `script/bootstrapLibrary.ts` for Bootstrap

## 👥 About This Project

**Built by:** A frontend developer student in collaboration with GitHub Copilot AI


## Credits & Attribution

This tool uses class name mappings inspired by:

- **Tailwind CSS** - MIT License - https://tailwindcss.com
  - Copyright (c) Tailwind Labs, Inc.
  
- **Bootstrap** - MIT License - https://getbootstrap.com
  - Copyright (c) 2011-2024 The Bootstrap Authors

**Dependencies:**
- `@babel/parser`, `@babel/traverse`, `@babel/generator`, `@babel/types` - MIT License
- `tsx` - MIT License
- `glob` - ISC License

## License

MIT License

Copyright (c) 2025 Fredrik Wiking

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
