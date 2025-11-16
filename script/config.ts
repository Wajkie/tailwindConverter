// Configuration for the converter
export const config = {
  // Path configuration
  paths: {
    featuresDir: './src/features',
    outputExtension: '.module.scss',
  },
  
  // Semantic elements that use element name directly (without nth-of-type)
  semanticElements: ['header', 'footer', 'aside', 'nav', 'main', 'section', 'article'],
  
  // Common elements that get nth-of-type when repeated
  commonElements: ['div', 'span', 'a', 'p', 'ul', 'li'],
  
  // Framework to use: 'tailwind' or 'bootstrap'
  framework: 'tailwind' as 'tailwind' | 'bootstrap',
};

// SCSS Variables
export const variablesScss = `// Colors
$slate-50: #f8fafc;
$slate-200: #e2e8f0;
$slate-300: #cbd5e1;
$blue-400: #60a5fa;
$blue-500: #3b82f6;
$blue-600: #2563eb;
$purple-100: #f3e8ff;
$orange-200: #fed7aa;
$orange-800: #9a3412;
$red-300: #fca5a5;
$white: #ffffff;

// Bootstrap colors
$primary: #0d6efd;
$secondary: #6c757d;
$success: #198754;
$danger: #dc3545;
$warning: #ffc107;
$info: #0dcaf0;
$light: #f8f9fa;
$dark: #212529;

// Spacing
$spacing-1: 0.25rem;
$spacing-2: 0.5rem;
$spacing-3: 0.75rem;
$spacing-4: 1rem;
$spacing-5: 1.25rem;
$spacing-pt-4: 1rem;
$spacing-mt-2: 0.5rem;
$spacing-mt-3: 0.75rem;
$spacing-mb-2: 0.5rem;
$spacing-mb-4: 1rem;
$spacing-ml-5: 1.25rem;
$spacing-gap-1: 0.25rem;
$spacing-gap-3: 0.75rem;
$spacing-gap-4: 1rem;
$spacing-gap-5: 1.25rem;
`;

// SCSS Mixins template
export const mixinsScss = `@use './_variables.scss' as *;
@mixin bg($color){background-color:$color;}
@mixin text($color){color:$color;}
@mixin p($value){padding:$value;}
@mixin m($value){margin:$value;}
@mixin gap($value){gap:$value;}
@mixin shadow-xl{box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);}
@mixin shadow-sm{box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);}
@mixin rounded($value){border-radius:$value;}
`;

// Responsive breakpoints
export const responsivePrefixes: Record<string, string> = {
  // Tailwind breakpoints
  sm: '@media (min-width: 640px)',
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 1024px)',
  xl: '@media (min-width: 1280px)',
  '2xl': '@media (min-width: 1536px)',
};

// Pseudo-class selectors
export const pseudoMap: Record<string, string> = {
  hover: '&:hover',
  focus: '&:focus',
  active: '&:active',
  disabled: '&:disabled',
  visited: '&:visited',
};
