# Duplicate Styles Report

Generated: 2025-11-16
Features analyzed: 8
Duplicate patterns found: 3

## Details

The following styles appear in multiple features and have been extracted to `_global.scss`:

### .common-style-1

Used in: duplicateTest1, duplicateTest2, duplicateTest3

Elements: duplicateTest1/DuplicateTest1 (div:nth-of-type(1)), duplicateTest2/DuplicateTest2 (div:nth-of-type(1)), duplicateTest3/DuplicateTest3 (div:nth-of-type(1))

```scss
  display: flex;; flex-direction: column;; @include gap($spacing-gap-4);; @include p($spacing-4);; background-color: #ffffff;; border-radius: 0.5rem;; @include shadow-xl;
```

### .common-style-2

Used in: duplicateTest1, duplicateTest2, duplicateTest3

Elements: duplicateTest1/DuplicateTest1 (p:nth-of-type(1)), duplicateTest2/DuplicateTest2 (p:nth-of-type(1)), duplicateTest3/DuplicateTest3 (p:nth-of-type(1))

```scss
  color: #4b5563;
```

### .common-style-3

Used in: duplicateTest1, duplicateTest2

Elements: duplicateTest1/DuplicateTest1 (button), duplicateTest2/DuplicateTest2 (button)

```scss
  padding-left: 1rem; padding-right: 1rem;; padding-top: 0.5rem; padding-bottom: 0.5rem;; @include bg($blue-500);; @include text($white);; border-radius: 0.25rem;
```

