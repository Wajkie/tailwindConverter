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
import { tailwindMap, tailwindColorMap, tailwindSpacingMap } from './tailwindLibrary';
import { bootstrapMap, bootstrapColorMap, bootstrapSpacingMap } from './bootstrapLibrary';

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
const activeColorMap = selectedFramework === 'tailwind' ? tailwindColorMap : bootstrapColorMap;
const activeSpacingMap = selectedFramework === 'tailwind' ? tailwindSpacingMap : bootstrapSpacingMap;

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
  if (!css) return '';
  if (activeColorMap[cls])
    return cls.startsWith('text')
      ? `@include text(${activeColorMap[cls]});`
      : `@include bg(${activeColorMap[cls]});`;
  if (activeSpacingMap[cls]) {
    if (cls.startsWith('p')) return `@include p(${activeSpacingMap[cls]});`;
    if (cls.startsWith('m') || cls.startsWith('mt') || cls.startsWith('mb') || cls.startsWith('ms') || cls.startsWith('me')) 
      return `@include m(${activeSpacingMap[cls]});`;
    if (cls.startsWith('space') || cls.startsWith('gap')) return `@include gap(${activeSpacingMap[cls]});`;
  }
  if (css.includes('box-shadow')) return '@include shadow-xl;';
  return css;
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
  unknownClasses: Set<string>
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
      log.push(`[${file}:${line}] Element <${element}> - unknown ${selectedFramework} class: ${rawClass}`);
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

  let featureSCSS = `.${featureName} {\n`;

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
            unknownClassesByFile[fileName]
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
            featureSCSS += indent(scssBlock, 2);
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

  featureSCSS += '}\n';
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
  // Write log
  // -----------------------------
  if (conversionLog.length > 0) {
    fs.writeFileSync(path.join(targetFolder, 'conversion.log'), conversionLog.join('\n'));
    console.log(`⚠️ Conversion log created: conversion.log (${conversionLog.length} unknown classes)`);
  } else console.log('✅ All classes converted successfully');

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
