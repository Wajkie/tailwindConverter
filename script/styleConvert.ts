#!/usr/bin/env ts-node

console.log("Script is running")
import fs from 'fs';
import path from 'path';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import { glob } from 'glob';
import * as t from '@babel/types';
import { config, variablesScss, mixinsScss, responsivePrefixes, pseudoMap } from './config';
import { tailwindMap } from './tailwindLibrary';
import { bootstrapMap } from './bootstrapLibrary';

// Fix for ESM default import
const traverse = (_traverse as any).default || _traverse;
const generate = (_generate as any).default || _generate;

// Framework selection
let selectedFramework: 'tailwind' | 'bootstrap' = 'tailwind';
const frameworkIndex = process.argv.indexOf('--framework');
if (frameworkIndex !== -1 && process.argv[frameworkIndex + 1]) {
  const fw = process.argv[frameworkIndex + 1].toLowerCase();
  if (fw === 'tailwind' || fw === 'bootstrap') {
    selectedFramework = fw;
  } else {
    console.error(`❌ Invalid framework: ${fw}. Use 'tailwind' or 'bootstrap'`);
    process.exit(1);
  }
}

// Get active class map based on selected framework
const activeClassMap = selectedFramework === 'tailwind' ? tailwindMap : bootstrapMap;

// CSS Property tracking for duplicate detection
type CSSProperty = {
  property: string;  // e.g., "color"
  value: string;     // e.g., "#2563eb" or "@include text($blue-600)"
  fullLine: string;  // e.g., "color: #2563eb;"
  feature: string;
  selector: string;  // e.g., "a:nth-of-type(1)"
  file: string;      // e.g., "propertyTest.module.scss"
};

// Global conversion tracking for unified report
type ConversionLogEntry = {
  feature: string;
  file: string;
  lineNumber: number;
  element: string;
  unknownClass: string;
};

const globalConversionLog: ConversionLogEntry[] = [];

type FeatureSummary = {
  feature: string;
  filesProcessed: number;
  classesConverted: number;
  unknownClasses: number;
  scssGenerated: boolean;
  tsxUpdated: boolean;
};

const featureSummaries: FeatureSummary[] = [];

// -----------------------------
// CLI-arguments: target folder & options
// -----------------------------
const featureArg = process.argv[2];
const shouldReplace = process.argv.includes('--replace');

if (!featureArg || featureArg.startsWith('--')) {
  console.error('Usage: npm run tailwindConvert <featureName|all> [--replace] [--framework <tailwind|bootstrap>]');
  console.error('  <featureName>: Name of the feature folder (e.g. "adminBoard" or "features/adminBoard")');
  console.error('  all: Convert all features in src/features/');
  console.error('  --replace: Replace framework classes with CSS module classes in TSX files');
  console.error('  --framework: Select framework (tailwind or bootstrap, default: tailwind)');
  process.exit(1);
}

// If argument is "all", find all subdirectories in src/features
let targetFolders: string[] = [];

if (featureArg === 'all') {
  const featuresDir = path.resolve(config.paths.featuresDir);
  if (!fs.existsSync(featuresDir)) {
    console.error(`❌ Folder does not exist: ${featuresDir}`);
    process.exit(1);
  }
  
  // Find all subdirectories containing .tsx files
  const entries = fs.readdirSync(featuresDir, { withFileTypes: true });
  targetFolders = entries
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(featuresDir, entry.name))
    .filter(dir => {
      // Check that folder contains .tsx files
      const tsxFiles = glob.sync(path.join(dir, '**/*.tsx').replace(/\\/g, '/'));
      return tsxFiles.length > 0;
    });
    
  if (targetFolders.length === 0) {
    console.error('❌ No feature folders with .tsx files found in src/features/');
    process.exit(1);
  }
  
  console.log(`🔍 Found ${targetFolders.length} feature folders to convert:`);
  targetFolders.forEach(f => console.log(`   - ${path.basename(f)}`));
  console.log('');
} else {
  // If argument doesn't contain "/", interpret it as a feature in src/features
  // If it starts with "features/", add "src/" before it
  let targetFolder: string;
  if (!featureArg.includes('/')) {
    targetFolder = path.resolve('./src/features', featureArg);
  } else if (featureArg.startsWith('features/')) {
    targetFolder = path.resolve('./src', featureArg);
  } else {
    targetFolder = path.resolve(featureArg);
  }

  if (!fs.existsSync(targetFolder)) {
    console.error(`❌ Folder does not exist: ${targetFolder}`);
    process.exit(1);
  }
  
  targetFolders = [targetFolder];
}

// -----------------------------
// Duplicate Detection & Global Styles Generator
// -----------------------------
function analyzeSCSSFiles(featurePaths: string[]): CSSProperty[] {
  const allProperties: CSSProperty[] = [];
  
  featurePaths.forEach(featurePath => {
    const featureName = path.basename(featurePath);
    const scssFile = path.join(featurePath, `${featureName}.module.scss`);
    
    if (!fs.existsSync(scssFile)) return;
    
    const content = fs.readFileSync(scssFile, 'utf-8');
    const lines = content.split('\n');
    
    let currentSelector = '';
    let depth = 0;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Track selector (e.g., "a:nth-of-type(1) {")
      if (trimmed.includes('{') && !trimmed.startsWith('//') && !trimmed.startsWith('@include')) {
        const selectorMatch = trimmed.match(/^([a-zA-Z0-9_:()-]+)\s*{/);
        if (selectorMatch) {
          currentSelector = selectorMatch[1];
          depth++;
        }
      }
      
      // Track closing braces
      if (trimmed === '}') {
        depth--;
        if (depth <= 1) currentSelector = '';
      }
      
      // Extract CSS properties (ignore comments, empty lines, selectors)
      if (currentSelector && 
          trimmed && 
          !trimmed.startsWith('//') && 
          !trimmed.includes('{') && 
          !trimmed.includes('}') &&
          trimmed.includes(':')) {
        
        // Parse property and value
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
          const property = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).replace(';', '').trim();
          
          allProperties.push({
            property,
            value,
            fullLine: trimmed,
            feature: featureName,
            selector: currentSelector,
            file: `${featureName}.module.scss`
          });
        }
      }
    });
  });
  
  return allProperties;
}

function generateGlobalStyles(featurePaths: string[]): string | null {
  const allProperties = analyzeSCSSFiles(featurePaths);
  
  if (allProperties.length === 0) return null;
  
  // Group by property:value combination
  const propertyGroups: Map<string, CSSProperty[]> = new Map();
  
  allProperties.forEach(prop => {
    const key = `${prop.property}: ${prop.value}`;
    const existing = propertyGroups.get(key) || [];
    existing.push(prop);
    propertyGroups.set(key, existing);
  });
  
  // Find duplicates (appears in 3+ different selectors across different features)
  const duplicates: Array<{ key: string; props: CSSProperty[] }> = [];
  
  propertyGroups.forEach((props, key) => {
    // Count unique feature+selector combinations
    const uniqueLocations = new Set(props.map(p => `${p.feature}::${p.selector}`));
    if (uniqueLocations.size >= 3) {
      duplicates.push({ key, props });
    }
  });
  
  if (duplicates.length === 0) return null;
  
  // Sort by frequency (most used first)
  duplicates.sort((a, b) => b.props.length - a.props.length);
  
  // Generate global SCSS
  let globalScss = `// Auto-generated Global Styles (Property-level duplicates)\n`;
  globalScss += `// This file contains CSS properties that appear in 3+ different selectors\n`;
  globalScss += `// Generated: ${new Date().toISOString().split('T')[0]}\n\n`;
  
  duplicates.forEach(({ key, props }, index) => {
    const uniqueFeatures = [...new Set(props.map(p => p.feature))];
    const usageCount = props.length;
    
    globalScss += `// Property: ${key}\n`;
    globalScss += `// Used ${usageCount} times in ${uniqueFeatures.length} feature(s): ${uniqueFeatures.join(', ')}\n`;
    globalScss += `// Locations:\n`;
    
    // Show first 5 locations as examples
    props.slice(0, 5).forEach(p => {
      globalScss += `//   - ${p.feature} > ${p.selector}\n`;
    });
    
    if (props.length > 5) {
      globalScss += `//   ... and ${props.length - 5} more\n`;
    }
    
    globalScss += `\n`;
  });
  
  globalScss += `// Suggested SCSS Variables:\n`;
  globalScss += `// Add these to _variables.scss to reduce duplication\n\n`;
  
  duplicates.slice(0, 10).forEach(({ key, props }) => {
    const [property, value] = key.split(': ');
    const varName = property.replace(/-/g, '_');
    globalScss += `// $${varName}: ${value};\n`;
  });
  
  return globalScss;
}

// -----------------------------
// Helper functions
// -----------------------------
function parseClassName(cls: string) {
  let responsive = '';
  let pseudo = '';
  let base = cls;

  const parts = cls.split(':');
  if (parts.length === 2) {
    if (responsivePrefixes[parts[0]]) responsive = parts[0];
    else if (pseudoMap[parts[0]]) pseudo = parts[0];
    base = parts[1];
  } else if (parts.length === 3) {
    responsive = parts[0];
    pseudo = parts[1];
    base = parts[2];
  }
  return { base, responsive, pseudo };
}

function mapCssToMixin(css: string, cls: string) {
  // Map CSS properties to use mixins where applicable
  if (!css) return '';
  
  // Split by semicolons to get individual properties
  const properties = css.split(';').map(p => p.trim()).filter(p => p);
  const mixinLines: string[] = [];
  
  for (const prop of properties) {
    // Check if this property can be replaced with a mixin
    if (prop.startsWith('background-color:')) {
      const color = prop.match(/background-color:\s*(.+)/)?.[1];
      if (color) {
        mixinLines.push(`@include bg(${color});`);
        continue;
      }
    }
    if (prop.startsWith('color:')) {
      const color = prop.match(/color:\s*(.+)/)?.[1];
      if (color) {
        mixinLines.push(`@include text(${color});`);
        continue;
      }
    }
    if (prop.match(/^padding(-left|-right|-top|-bottom)?:/)) {
      const padding = prop.match(/padding[^:]*:\s*(.+)/)?.[1];
      if (padding && !padding.includes(' ')) {
        mixinLines.push(`@include p(${padding});`);
        continue;
      }
    }
    if (prop.startsWith('gap:')) {
      const gap = prop.match(/gap:\s*(.+)/)?.[1];
      if (gap) {
        mixinLines.push(`@include gap(${gap});`);
        continue;
      }
    }
    if (prop.startsWith('border-radius:')) {
      const radius = prop.match(/border-radius:\s*(.+)/)?.[1];
      if (radius) {
        mixinLines.push(`@include rounded(${radius});`);
        continue;
      }
    }
    // Keep the original CSS if no mixin match
    mixinLines.push(prop + ';');
  }
  
  // Join without separators - the calling code will handle joining with proper separators
  return mixinLines.join(' ');
}

function indent(text: string, spaces: number) {
  return text.split('\n').map((l) => l ? ' '.repeat(spaces) + l : l).join('\n');
}

function convertTailwindClasses(
  classes: string[],
  file: string,
  element: string,
  line: number,
  globalClasses: Set<string>,
  log: string[],
  unknownClasses: Set<string>,
  targetFolder: string
) {
  const blocks: Record<string, string[]> = {};
  const knownClasses: string[] = [];
  const unknownClassList: string[] = [];
  
  for (const cls of classes) {
    let isGlobal = false;
    let rawClass = cls;
    if (cls.startsWith('global:')) {
      isGlobal = true;
      rawClass = cls.replace('global:', '');
    }
    const { base, responsive, pseudo } = parseClassName(rawClass);
    const css = activeClassMap[base];
    
    if (!css) {
      // Create relative path from project root
      const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
      log.push(`${relativePath}:${line}\n  Element: <${element}>\n  Unknown class: ${rawClass}\n  Framework: ${selectedFramework}\n`);
      unknownClasses.add(rawClass);
      unknownClassList.push(rawClass);
    } else {
      knownClasses.push(cls);
    }
    
    if (isGlobal) globalClasses.add(rawClass);
    const key = `${responsive || 'base'}__${pseudo || 'base'}`;
    if (!blocks[key]) blocks[key] = [];
    const mappedCss = mapCssToMixin(css, base);
    if (mappedCss) {  // Only add if CSS exists
      blocks[key].push(mappedCss);
    }
  }
  return { blocks, knownClasses, unknownClasses: unknownClassList };
}

// -----------------------------
// Main conversion function
// -----------------------------
function convertFeature(targetFolder: string) {
  const featureName = path.basename(targetFolder);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 Converting feature: ${featureName} [${selectedFramework.toUpperCase()}]`);
  console.log(`📁 Path: ${targetFolder}`);
  console.log(`${'='.repeat(60)}\n`);

  fs.writeFileSync(path.join(targetFolder, '_variables.scss'), variablesScss);
  fs.writeFileSync(path.join(targetFolder, 'tailwind.mixins.scss'), mixinsScss);

  // -----------------------------
  // Scan TSX files
  // -----------------------------
  // Convert Windows paths to forward slashes for glob
  const globPattern = path.join(targetFolder, '**/*.tsx').replace(/\\/g, '/');
  const files = glob.sync(globPattern);
  const globalClasses = new Set<string>();
  const conversionLog: string[] = [];
  const unknownClassesByFile: Record<string, Set<string>> = {};

  // Track CSS module mappings
  type ElementMapping = {
    elementSelector: string;
    originalClasses: string[];
    knownClasses: string[];
    unknownClasses: string[];
  };
  const elementMappings: Record<string, ElementMapping[]> = {};

  let featureSCSS = '@use "./tailwind.mixins.scss" as *;\n\n'; // Import mixins for SCSS features

  files.forEach((file) => {
    const fileName = path.basename(file, '.tsx');
    const code = fs.readFileSync(file, 'utf8');
    const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    const elementCounters: Record<string, number> = {};
    
    unknownClassesByFile[fileName] = new Set();
    elementMappings[fileName] = [];
    
    // Add filename as comment if there are multiple files
    if (files.length > 1) {
      featureSCSS += `\n  // ${fileName}\n`;
    }

  traverse(ast as unknown, {
    JSXAttribute(path: unknown) {
      const node = (path as any).node;
      if (node.name?.type === 'JSXIdentifier' && node.name?.name === 'className') {
        if (node.value?.type === 'StringLiteral') {
          const classes = node.value.value.split(/\s+/).filter((c: string) => c.trim());

          // --- Find element type and build semantic class ---
          let tagName = 'div';
          
          // JSXAttribute is child of JSXOpeningElement, which is child of JSXElement
          const jsxElement = (path as any).parentPath?.parent;
          if (t.isJSXElement(jsxElement)) {
            const nameNode = jsxElement.openingElement.name;
            if (t.isJSXIdentifier(nameNode)) {
              tagName = nameNode.name;
              // Convert to lowercase for HTML elements
              if (tagName[0] === tagName[0].toLowerCase()) {
                tagName = tagName.toLowerCase();
              }
            }
          }

          // Count elements of the same type
          elementCounters[tagName] = (elementCounters[tagName] || 0) + 1;
          const count = elementCounters[tagName];
          
          // Semantic elements like header, aside, main, nav, footer are used without numbers
          const isSemanticElement = config.semanticElements.includes(tagName);
          
          // Create semantic selector (class selector for CSS Modules compatibility)
          let elementSelector: string;
          if (isSemanticElement) {
            // For semantic elements: .header, .aside, .main, etc.
            elementSelector = `.${tagName}`;
          } else if (count === 1 && !config.commonElements.includes(tagName)) {
            // For unique elements like .button, .h1, .h2, etc. (first of its type)
            elementSelector = `.${tagName}`;
          } else {
            // For common elements that repeat: .div_nth-of-type_1, .span_nth-of-type_2, etc.
            elementSelector = `.${tagName}_nth-of-type_${count}`;
          }
          const line = node.loc?.start.line || 0;
          const result = convertTailwindClasses(
            classes, 
            file, 
            tagName, 
            line, 
            globalClasses, 
            conversionLog,
            unknownClassesByFile[fileName],
            targetFolder
          );
          const { blocks, knownClasses, unknownClasses } = result;

          // Save mapping for this element
          elementMappings[fileName].push({
            elementSelector,
            originalClasses: classes,
            knownClasses,
            unknownClasses
          });

          // If --replace flag is set, update className
          if (shouldReplace && node.value && t.isStringLiteral(node.value)) {
            // Remove leading dot from class selector for CSS Modules key
            const styleKey = elementSelector.slice(1); // Remove the '.' prefix
            
            if (unknownClasses.length > 0) {
              // Hybrid: Use CSS module + keep unknown classes
              // Create: `${styles['header']} unknown-class`
              node.value = t.jsxExpressionContainer(
                t.templateLiteral(
                  [
                    t.templateElement({ raw: '', cooked: '' }, false),
                    t.templateElement({ raw: ` ${unknownClasses.join(' ')}`, cooked: ` ${unknownClasses.join(' ')}` }, true)
                  ],
                  [
                    t.memberExpression(
                      t.identifier('styles'),
                      t.stringLiteral(styleKey),
                      true // computed property access: styles['key']
                    )
                  ]
                )
              );
            } else {
              // Only CSS module: styles['header']
              node.value = t.jsxExpressionContainer(
                t.memberExpression(
                  t.identifier('styles'),
                  t.stringLiteral(styleKey),
                  true // computed property access: styles['key']
                )
              );
            }
          }

          let scssBlock = `${elementSelector} {\n`;
          if (blocks['base__base'] && blocks['base__base'].length > 0) {
            scssBlock += '  ' + blocks['base__base'].join('\n  ') + '\n';
          }

          Object.keys(blocks).forEach((k) => {
            const [resp, pse] = k.split('__');
            if (resp === 'base' && pse !== 'base' && blocks[k].length > 0) {
              scssBlock += `  ${pseudoMap[pse]} {\n    ${blocks[k].join('\n    ')}\n  }\n`;
            }
          });

          Object.keys(blocks).forEach((k) => {
            const [resp, pse] = k.split('__');
            if (resp !== 'base') {
              const hasContent = blocks[k].length > 0;
              if (hasContent) {
                scssBlock += `  ${responsivePrefixes[resp]} {\n`;
                if (pse === 'base') {
                  scssBlock += '    ' + blocks[k].join('\n    ') + '\n';
                } else {
                  scssBlock += `    ${pseudoMap[pse]} {\n      ${blocks[k].join('\n      ')}\n    }\n`;
                }
                scssBlock += '  }\n';
              }
            }
          });

          scssBlock += '}\n';
          
          // Only add the block if it has content
          if (scssBlock !== `${elementSelector} {\n}\n`) {
            // No indentation needed since there's no wrapper
            featureSCSS += scssBlock;
          }
        }
      }
    },
  });
  
  // If --replace, add import and write back the file
  if (shouldReplace) {
    // Check if styles import already exists
    let hasStylesImport = false;
    traverse(ast as unknown, {
      ImportDeclaration(path: unknown) {
        if ((path as any).node.source.value.includes('.module.scss')) {
          hasStylesImport = true;
        }
      }
    });
    
    // Add import if it doesn't exist
    if (!hasStylesImport) {
      const importStatement = t.importDeclaration(
        [t.importDefaultSpecifier(t.identifier('styles'))],
        t.stringLiteral(`./${featureName}.module.scss`)
      );
      ast.program.body.unshift(importStatement);
    }
    
    const output = generate(ast, {}, code);
    fs.writeFileSync(file, output.code);
  }
  });

  // No closing brace needed since there's no wrapper
  
  fs.writeFileSync(path.join(targetFolder, `${featureName}.module.scss`), featureSCSS);

  // -----------------------------
  // Generate Conversion Guide (MD)
  // -----------------------------
  let conversionGuide = `# Conversion Guide for ${featureName}\n\n`;
  conversionGuide += `Generated: ${new Date().toLocaleString('sv-SE')}\n\n`;

  if (Object.keys(unknownClassesByFile).some(f => unknownClassesByFile[f].size > 0)) {
    conversionGuide += `## ⚠️ Unknown Tailwind Classes\n\n`;
    conversionGuide += `The following classes were found but are not in the conversion mapping:\n\n`;
    
    Object.keys(unknownClassesByFile).sort().forEach(fileName => {
      const unknowns = Array.from(unknownClassesByFile[fileName]).sort();
      if (unknowns.length > 0) {
        conversionGuide += `### 📄 ${fileName}.tsx\n\n`;
        unknowns.forEach(cls => {
          conversionGuide += `- \`${cls}\`\n`;
        });
        conversionGuide += `\n`;
      }
    });
  } else {
    conversionGuide += `## ✅ All Classes Converted!\n\n`;
    conversionGuide += `No unknown classes were found.\n\n`;
  }

  // Add mapping table
  conversionGuide += `## 📋 Element Mappings\n\n`;
  Object.keys(elementMappings).sort().forEach(fileName => {
    const mappings = elementMappings[fileName];
    if (mappings.length > 0) {
      conversionGuide += `### 📄 ${fileName}.tsx\n\n`;
      mappings.forEach((mapping, idx) => {
        conversionGuide += `#### ${idx + 1}. \`${mapping.elementSelector}\`\n\n`;
        conversionGuide += `**Original:** \`${mapping.originalClasses.join(' ')}\`\n\n`;
        if (mapping.knownClasses.length > 0) {
          conversionGuide += `**Converted:** \`${mapping.knownClasses.join(' ')}\`\n\n`;
        }
        if (mapping.unknownClasses.length > 0) {
          conversionGuide += `**⚠️ Unknown (kept):** \`${mapping.unknownClasses.join(' ')}\`\n\n`;
        }
        conversionGuide += `**CSS Module:** \`styles["${mapping.elementSelector.slice(1)}"]\`\n\n`;
        conversionGuide += `---\n\n`;
      });
    }
  });

  fs.writeFileSync(path.join(targetFolder, 'CONVERSION_GUIDE.md'), conversionGuide);
  console.log(`📖 Conversion guide created: CONVERSION_GUIDE.md`);

  // -----------------------------
  // Write global SCSS
  // -----------------------------
  if (globalClasses.size > 0) {
    let globalSCSS = '';
    globalClasses.forEach((cls) => {
      const css = tailwindMap[cls] || `/* TODO: ${cls} */`;
      globalSCSS += `.${cls} { ${mapCssToMixin(css, cls)} }\n`;
    });
    fs.writeFileSync(path.join(targetFolder, `${featureName}.global.scss`), globalSCSS);
  }

  // -----------------------------
  // Track conversion log for global report
  // -----------------------------
  if (conversionLog.length > 0) {
    // Parse log entries and add to global tracking
    conversionLog.forEach(entry => {
      const lines = entry.trim().split('\n');
      const fileMatch = lines[0].match(/^(.+):(\d+)$/);
      const elementMatch = lines[1]?.match(/Element: <(.+)>/);
      const classMatch = lines[2]?.match(/Unknown class: (.+)/);
      
      if (fileMatch && elementMatch && classMatch) {
        globalConversionLog.push({
          feature: featureName,
          file: fileMatch[1],
          lineNumber: parseInt(fileMatch[2]),
          element: elementMatch[1],
          unknownClass: classMatch[1]
        });
      }
    });
    console.log(`⚠️  ${conversionLog.length} unknown class occurrence(s) tracked`);
  } else {
    console.log('✅ All classes converted successfully');
  }

  // Track feature summary
  featureSummaries.push({
    feature: featureName,
    filesProcessed: files.length,
    classesConverted: Object.values(elementMappings).reduce((sum, mappings) => 
      sum + mappings.reduce((s, m) => s + m.knownClasses.length, 0), 0),
    unknownClasses: conversionLog.length,
    scssGenerated: true,
    tsxUpdated: shouldReplace
  });

  if (shouldReplace) {
    console.log(`✅ TSX files updated with CSS modules`);
  }

  console.log(`✅ SCSS generated for feature: ${featureName}`);
}

// -----------------------------
// Run conversion for all target folders
// -----------------------------
console.log(`\n🚀 Starting Tailwind → SCSS conversion`);
console.log(`📦 Number of features to convert: ${targetFolders.length}`);
if (shouldReplace) {
  console.log(`⚠️  --replace is enabled: TSX files will be updated`);
}

targetFolders.forEach((folder) => {
  convertFeature(folder);
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✨ Conversion complete! ${targetFolders.length} feature(s) processed.`);
console.log(`${'='.repeat(60)}\n`);

// -----------------------------
// Generate Unified Conversion Report
// -----------------------------
function generateConversionReport(): void {
  let report = `# 🎨 Style Conversion Report\n\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n`;
  report += `**Framework:** ${selectedFramework.toUpperCase()}\n`;
  report += `**Mode:** ${shouldReplace ? 'Replace (TSX Updated)' : 'Generate Only'}\n\n`;
  report += `---\n\n`;
  
  // Executive Summary
  report += `## 📊 Executive Summary\n\n`;
  const totalFiles = featureSummaries.reduce((sum, f) => sum + f.filesProcessed, 0);
  const totalConverted = featureSummaries.reduce((sum, f) => sum + f.classesConverted, 0);
  const totalUnknown = featureSummaries.reduce((sum, f) => sum + f.unknownClasses, 0);
  const successRate = totalConverted + totalUnknown > 0 
    ? ((totalConverted / (totalConverted + totalUnknown)) * 100).toFixed(1)
    : '100.0';
  
  report += `| Metric | Count |\n`;
  report += `|--------|-------|\n`;
  report += `| Features Converted | ${featureSummaries.length} |\n`;
  report += `| TSX Files Processed | ${totalFiles} |\n`;
  report += `| Classes Converted | ${totalConverted} |\n`;
  report += `| Unknown Classes | ${totalUnknown} |\n`;
  report += `| Success Rate | ${successRate}% |\n\n`;
  
  // Feature-by-Feature Breakdown
  report += `## 📦 Feature Breakdown\n\n`;
  featureSummaries.forEach(summary => {
    const statusEmoji = summary.unknownClasses === 0 ? '✅' : '⚠️';
    report += `### ${statusEmoji} ${summary.feature}\n\n`;
    report += `| Detail | Value |\n`;
    report += `|--------|-------|\n`;
    report += `| Files Processed | ${summary.filesProcessed} |\n`;
    report += `| Classes Converted | ${summary.classesConverted} |\n`;
    report += `| Unknown Classes | ${summary.unknownClasses} |\n`;
    report += `| SCSS Generated | ${summary.scssGenerated ? '✅' : '❌'} |\n`;
    report += `| TSX Updated | ${summary.tsxUpdated ? '✅' : '➖'} |\n\n`;
  });
  
  // Unknown Classes Detail
  if (globalConversionLog.length > 0) {
    report += `## ⚠️ Unknown Classes (Requires Attention)\n\n`;
    report += `The following classes were not found in the ${selectedFramework} library and remain in your TSX files.\n`;
    report += `You may need to add these to your custom library or handle them manually.\n\n`;
    
    // Group by feature
    const byFeature: Map<string, ConversionLogEntry[]> = new Map();
    globalConversionLog.forEach(entry => {
      const existing = byFeature.get(entry.feature) || [];
      existing.push(entry);
      byFeature.set(entry.feature, existing);
    });
    
    byFeature.forEach((entries, feature) => {
      report += `### 📁 ${feature}\n\n`;
      
      // Group by file
      const byFile: Map<string, ConversionLogEntry[]> = new Map();
      entries.forEach(entry => {
        const existing = byFile.get(entry.file) || [];
        existing.push(entry);
        byFile.set(entry.file, existing);
      });
      
      byFile.forEach((fileEntries, file) => {
        report += `**${file}**\n\n`;
        fileEntries.forEach(entry => {
          report += `- Line ${entry.lineNumber}: \`<${entry.element}>\` → \`${entry.unknownClass}\`\n`;
        });
        report += `\n`;
      });
    });
  } else {
    report += `## ✅ All Classes Converted\n\n`;
    report += `Great job! All framework classes were successfully converted to SCSS.\n`;
    report += `No unknown classes were found.\n\n`;
  }
  
  // Next Steps
  report += `## 🚀 Next Steps\n\n`;
  
  if (totalUnknown > 0) {
    report += `### 1. Handle Unknown Classes\n\n`;
    report += `Add missing classes to your library files:\n`;
    report += `- For Tailwind: Edit \`script/tailwindLibrary.ts\`\n`;
    report += `- For Bootstrap: Edit \`script/bootstrapLibrary.ts\`\n\n`;
  }
  
  report += `### ${totalUnknown > 0 ? '2' : '1'}. Import SCSS in Your Components\n\n`;
  report += `\`\`\`tsx\n`;
  report += `import styles from './YourFeature.module.scss';\n`;
  report += `\`\`\`\n\n`;
  
  if (!shouldReplace) {
    report += `### ${totalUnknown > 0 ? '3' : '2'}. Update TSX Files (Optional)\n\n`;
    report += `Run with \`--replace\` flag to automatically update your TSX files:\n`;
    report += `\`\`\`bash\n`;
    report += `npm run styleConvert ${targetFolders.length > 1 ? 'all' : featureSummaries[0]?.feature || 'featureName'} -- --replace\n`;
    report += `\`\`\`\n\n`;
  }
  
  report += `### ${totalUnknown > 0 ? (shouldReplace ? '3' : '4') : (shouldReplace ? '2' : '3')}. Test Your Application\n\n`;
  report += `Verify that all styles are working correctly in your app.\n\n`;
  
  if (targetFolders.length > 1) {
    report += `### ${totalUnknown > 0 ? (shouldReplace ? '4' : '5') : (shouldReplace ? '3' : '4')}. Review Duplicate Properties\n\n`;
    report += `Check \`PROPERTY_DUPLICATES_REPORT.md\` for optimization opportunities.\n\n`;
  }
  
  // Footer
  report += `---\n\n`;
  report += `*Generated by Style Converter - Making CSS migration effortless* ✨\n`;
  
  const reportPath = path.join(process.cwd(), 'CONVERSION_REPORT.md');
  fs.writeFileSync(reportPath, report);
  console.log(`📋 Unified conversion report created: ${path.relative(process.cwd(), reportPath)}`);
}

generateConversionReport();

// -----------------------------
// Generate Global Styles (Duplicate Detection)
// -----------------------------
if (targetFolders.length > 1) {
  console.log(`\n🔍 Analyzing SCSS files for duplicate CSS properties...`);
  const globalStyles = generateGlobalStyles(targetFolders);
  
  if (globalStyles) {
    const globalStylesPath = path.join(config.paths.featuresDir, '_global_properties.scss');
    fs.writeFileSync(globalStylesPath, globalStyles);
    console.log(`✅ Property analysis file created: ${path.relative(process.cwd(), globalStylesPath)}`);
    
    // Count duplicate properties
    const duplicateCount = (globalStyles.match(/\/\/ Property: /g) || []).length;
    console.log(`📊 Found ${duplicateCount} duplicate CSS property(ies) across features`);
    
    // Generate detailed report
    let report = `# Duplicate CSS Properties Report\n\n`;
    report += `Generated: ${new Date().toISOString().split('T')[0]}\n`;
    report += `Features analyzed: ${targetFolders.length}\n`;
    report += `Duplicate properties found: ${duplicateCount}\n\n`;
    report += `## Summary\n\n`;
    report += `This report identifies CSS properties that appear in 3 or more different selectors across your features.\n`;
    report += `These duplicates are candidates for extraction into SCSS variables or mixins.\n\n`;
    report += `## Property Analysis\n\n`;
    
    // Parse the global styles to create a detailed report
    const lines = globalStyles.split('\n');
    let currentProp = '';
    let currentUsage = '';
    let currentFeatures = '';
    let locations: string[] = [];
    
    lines.forEach(line => {
      if (line.startsWith('// Property: ')) {
        if (currentProp) {
          // Write previous property
          report += `### ${currentProp}\n\n`;
          report += `${currentUsage}\n`;
          report += `${currentFeatures}\n\n`;
          report += `**Locations:**\n`;
          locations.forEach(loc => report += `${loc}\n`);
          report += `\n`;
        }
        currentProp = line.replace('// Property: ', '').trim();
        locations = [];
      } else if (line.startsWith('// Used ')) {
        currentUsage = line.replace('//', '').trim();
      } else if (line.includes('feature(s):')) {
        currentFeatures = line.replace('//', '').trim();
      } else if (line.startsWith('//   -')) {
        locations.push(line.replace('//', '').trim());
      }
    });
    
    // Write last property
    if (currentProp) {
      report += `### ${currentProp}\n\n`;
      report += `${currentUsage}\n`;
      report += `${currentFeatures}\n\n`;
      report += `**Locations:**\n`;
      locations.forEach(loc => report += `${loc}\n`);
      report += `\n`;
    }
    
    // Add suggestions section
    report += `## Optimization Suggestions\n\n`;
    report += `### Step 1: Add Variables to \`_variables.scss\`\n\n`;
    report += `Based on the duplicates found, add these to your \`_variables.scss\`:\n\n`;
    report += `\`\`\`scss\n`;
    
    // Parse properties from the generated file to create variable suggestions
    const propertyLines = globalStyles.split('\n').filter(l => l.startsWith('// Property: '));
    propertyLines.slice(0, 10).forEach(line => {
      const fullProp = line.replace('// Property: ', '').trim();
      const [property, value] = fullProp.split(': ');
      
      // Generate smart variable names
      let varName = '';
      if (property === 'color') {
        if (value && value.includes('#4b5563')) varName = '$text-gray';
        else if (value && value.includes('#2563eb')) varName = '$text-blue';
        else varName = '$color-primary';
      } else if (property === 'background-color') {
        if (value === '#ffffff') varName = '$bg-white';
        else varName = '$bg-' + (value || 'default').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
      } else if (property && property.includes('padding')) {
        varName = '$spacing-standard';
      } else if (property === 'border-radius') {
        if (value === '0.25rem') varName = '$radius-sm';
        else if (value === '0.5rem') varName = '$radius-md';
        else if (value === '0.75rem') varName = '$radius-lg';
        else varName = '$radius-default';
      } else if (property === 'display') {
        varName = '// display: flex (no variable needed)';
      } else if (property === 'flex-direction') {
        varName = '// flex-direction: column (no variable needed)';
      } else {
        varName = '$' + property.replace(/-/g, '_');
      }
      
      if (!varName.startsWith('//')) {
        report += `${varName}: ${value};\n`;
      }
    });
    
    report += `\`\`\`\n\n`;
  report += `### Step 2: Update Module SCSS Files\n\n`;
  report += `Replace duplicate values with variables. For example:\n\n`;
  report += `**Before:**\n\`\`\`scss\n`;
  report += `a:nth-of-type(1) {\n`;
  report += `  color: #4b5563;\n`;
  report += `}\n`;
  report += `a:nth-of-type(2) {\n`;
  report += `  color: #4b5563;\n`;
  report += `}\n`;
  report += `\`\`\`\n\n`;
  report += `**After:**\n\`\`\`scss\n`;
  report += `a:nth-of-type(1) {\n`;
  report += `  color: $text-gray;\n`;
  report += `}\n`;
  report += `a:nth-of-type(2) {\n`;
  report += `  color: $text-gray;\n`;
  report += `}\n`;
  report += `\`\`\`\n\n`;
  report += `### Step 3: Create Utility Classes (Optional)\n\n`;
  report += `For very common patterns, consider creating utility classes in a new \`_utilities.scss\`:\n\n`;
  report += `\`\`\`scss\n`;
  report += `.text-gray { color: $text-gray; }\n`;
  report += `.bg-white { background-color: $bg-white; }\n`;
  report += `.rounded-md { border-radius: $radius-md; }\n`;
  report += `\`\`\`\n\n`;
  report += `Then use them in your TSX:\n`;
  report += `\`\`\`tsx\n`;
  report += `<p className={\`\${styles["p_nth-of-type_1"]} text-gray\`}>Text</p>\n`;
  report += `\`\`\`\n\n`;
  
  report += `## Benefits of Refactoring\n\n`;
  report += `- **Consistency**: Colors and spacing values defined in one place\n\n`;
  report += `- **Maintainability**: Update a variable once, changes apply everywhere\n\n`;
  report += `- **Smaller CSS**: Reusing variables can reduce bundle size\n\n`;
  report += `- **Design System**: Foundation for a scalable design system\n\n`;    const reportPath = path.join(process.cwd(), 'PROPERTY_DUPLICATES_REPORT.md');
    fs.writeFileSync(reportPath, report);
    console.log(`📋 Detailed report created: ${path.relative(process.cwd(), reportPath)}`);
  } else {
    console.log(`✨ No duplicate CSS properties found (threshold: 3+ occurrences)`);
  }
}
