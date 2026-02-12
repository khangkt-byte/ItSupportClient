# Hard-Coded Colors Audit Report

> **Generated for:** `src/` directory  
> **Excluded:** `src/utils/`, `src/constants/palettes.ts`, `src/styles/`, `scripts/`, `Guide/`, `Ref/`, `build/`, `node_modules/`

---

## Summary

| Category | Files Affected | Approximate Instances |
|----------|---------------|----------------------|
| Tailwind bg-{color}-{shade} | 22 | 300+ |
| Tailwind text-{color}-{shade} | 22 | 250+ |
| Tailwind border-{color}-{shade} | 20 | 200+ |
| Tailwind text-white / bg-white / bg-black | 22 | 140+ |
| Tailwind divide-{color}-{shade} | 7 | 14 |
| Tailwind ring-{color}-{shade} | 2 | 8 |
| Tailwind placeholder-{color}-{shade} | 9 | 34 |
| Tailwind hover:{color} variants | 20+ | 144+ |
| Tailwind from-/to- gradients | 2 | 3 |
| Tailwind accent-{color} | 1 | 1 |
| Hex colors (#RRGGBB) in TSX | 3 | 12 |
| Hex colors (#RRGGBB) in TS | 1 | 6 |
| Hex colors in index.css (non-variable) | 1 | 10+ |
| @apply with hard-coded colors in CSS | 1 | 50+ |
| rgba() in CSS | 1 | 3 |

**Total unique files with hard-coded colors: ~25**

---

## Findings by File

---

### 1. `src/features/theme/components/ThemeSelector.tsx`

#### Hex Colors
| Line | Content | Color | Context |
|------|---------|-------|---------|
| 64 | `previewColor: '#FFFFFF'` | `#FFFFFF` | Object literal |
| 71 | `previewColor: '#121212'` | `#121212` | Object literal |
| 465 | `return option.previewColor \|\| '#FFFFFF';` | `#FFFFFF` | Fallback value |
| 469 | `option.previewColor === '#FFFFFF'` | `#FFFFFF` | Comparison |

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 266 | `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700` | DialogContent className |
| 268 | `text-gray-900 dark:text-gray-50` | Title className |
| 275 | `text-gray-600 dark:text-gray-300` | Description className |
| 280 | `bg-gray-100 dark:bg-gray-700` | Tab trigger className |
| 288 | `border-gray-200 dark:border-gray-700` | Separator className |
| 296 | `text-gray-600 dark:text-gray-300` | Label className |
| 305 | `bg-gray-50 dark:bg-gray-700/50` | Grid container className |
| 325 | `bg-gray-200 dark:bg-gray-600` | Color swatch fallback |
| 345 | `text-gray-500 dark:text-gray-400` | Empty state text |
| 348 | `text-gray-900 dark:text-gray-50` | Category label |
| 359 | `border-gray-300 dark:border-gray-600` | Swatch border |
| 367 | `text-gray-600 dark:text-gray-300` | Swatch label |
| 369 | `text-gray-500 dark:text-gray-400` | Swatch description |
| 379 | `bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800` | Info box |
| 382 | `text-blue-900 dark:text-blue-200` | Info text |
| 398 | `bg-primary-600 text-white` | Active button |
| 399 | `bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300` | Inactive button |
| 413–414 | `text-gray-500 dark:text-gray-400` | Help text |
| 484 | `border-gray-200 dark:border-gray-700` | Option border |
| 493 | `bg-black/40 text-white` | Overlay |
| 495 | `text-white` | Label text |
| 497 | `text-white/80` | Description text |
| 503 | `bg-green-500 border-white` | Active indicator dot |
| 509 | `border-white` | Color indicator dot |

#### style={{ }}
| Line | Content | Context |
|------|---------|---------|
| 360 | `style={{ backgroundColor: ... }}` | Dynamic preview (uses variable) |
| 486 | `style={{ backgroundColor: getPreviewColor(option) }}` | Preview swatch |
| 510 | `style={{ backgroundColor: ... }}` | Color dot |

---

### 2. `src/features/theme/components/ThemeValidationTest.tsx`

#### Hex Colors
| Line | Content | Color | Context |
|------|---------|-------|---------|
| 263 | `getCSSVariable(bgVar) \|\| '#ffffff'` | `#ffffff` | Fallback value |

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 132 | `bg-gray-50 dark:bg-gray-900` | Page background |
| 136–137 | `bg-white dark:bg-gray-800` | Card background |
| 140 | `text-gray-900 dark:text-gray-100` | Heading |
| 147–149 | `bg-white dark:bg-gray-800, text-gray-600 dark:text-gray-400` | Section card |
| 155 | `bg-gray-100 dark:bg-gray-700` | Color preview container |
| 158 | `text-gray-500` | Label |
| 165–167 | `bg-white dark:bg-gray-800, text-gray-600 dark:text-gray-400` | Section card |
| 172 | `bg-blue-500 text-white hover:bg-blue-600` | Button |
| 178–180 | `bg-white dark:bg-gray-800, text-gray-700 dark:text-gray-300` | Section |
| 183 | `text-gray-500` | Sub-label |
| 191–192 | `bg-white dark:bg-gray-800, text-gray-600 dark:text-gray-400` | Section |
| 197–198 | `text-gray-700 dark:text-gray-300, text-gray-500 dark:text-gray-400` | Labels |
| 201 | `border-gray-200 dark:border-gray-700` | Divider |
| 207–208 | `text-green-600, text-red-600` | Pass/fail indicators |
| 213–214 | `text-green-600, text-amber-600` | Result indicators |
| 219–220 | `text-green-600, text-red-600` | Result indicators |
| 229–230 | `bg-white dark:bg-gray-800` | Card |
| 240–241 | `text-gray-700 dark:text-gray-300` | Header |
| 251–252 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Card |
| 271 | `bg-gray-50 dark:bg-gray-700` | Token row |
| 277 | `text-gray-500 dark:text-gray-400` | Token name |
| 280 | `text-white` | On-color text |
| 287 | `text-gray-600 dark:text-gray-300` | Token value |
| 299 | `text-gray-500` | CSS var text |
| 303–304 | `text-green-600, text-red-500` | Status |
| 309–310 | `border-blue-500, border-blue-300` | Focus indicator |
| 321–322 | `text-gray-600 dark:text-gray-300, border-gray-300 dark:border-gray-600` | Radio section |
| 327–329 | `border-gray-300, border-blue-500, text-gray-700 dark:text-gray-300` | Radio input |
| 338 | `text-gray-600 dark:text-gray-300` | Link text |
| 345–346 | `bg-white dark:bg-gray-800` | Card |
| 357–359 | `text-gray-600 dark:text-gray-300, text-blue-900 dark:text-blue-100` | Info card |
| 372 | `bg-white dark:bg-gray-800` | Card |
| 374 | `text-gray-600 dark:text-gray-300` | Label |
| 379 | `bg-blue-500 text-white hover:bg-blue-600` | Button |
| 388–389 | `text-gray-500, text-red-500` | Status message |
| 404 | `text-gray-500` | Timestamp |
| 416–417 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Card |
| 421 | `text-gray-600 dark:text-gray-300` | Section title |
| 427 | `text-blue-800 dark:text-blue-200, bg-blue-50 dark:bg-blue-900/20, border-blue-200 dark:border-blue-800` | Info panel |
| 433–463 | Multiple `text-gray-*` patterns | Token checklist rows |
| 473–474 | `text-gray-500, text-gray-900 dark:text-gray-100` | Current theme display |
| 477 | `text-gray-500` | Footer text |

#### style={{ }}
| Line | Content | Context |
|------|---------|---------|
| 156 | `style={{ display: 'flex', gap: ... }}` | Layout (no color) |
| 278 | `style={{ backgroundColor: value, ... }}` | Dynamic token preview |
| 288 | `style={{ backgroundColor: ... }}` | Dynamic swatch |
| 396–399 | `style={{ width, height, backgroundColor ... }}` | Dynamic color blocks |

---

### 3. `src/features/theme/components/CustomColorBuilder.tsx`

#### Hex Colors
| Line | Content | Color | Context |
|------|---------|-------|---------|
| 195 | `placeholder="#2563eb"` | `#2563eb` | Input placeholder |
| 218 | `placeholder="#ffffff"` | `#ffffff` | Input placeholder |
| 238 | `placeholder="#1f2937"` | `#1f2937` | Input placeholder |

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 99 | `bg-green-100, border-green-300` | Success message |
| 105 | `bg-black/0 group-hover:bg-black/20` | Overlay hover |
| 107 | `text-white` | Icon color |
| 109 | `text-white` | Icon color |
| 115–116 | `bg-yellow-100, border-yellow-300, text-yellow-800` | Warning message |
| 131–132 | `bg-green-50, border-green-300, text-green-800` | Success section |
| 149 | `bg-red-50, border-red-300` | Error section |
| 170 | `border-gray-300 dark:border-gray-600` | Divider |
| 182 | `text-gray-700 dark:text-gray-300` | Label |
| 205 | `text-gray-500 dark:text-gray-400` | Helper text |
| 225 | `text-gray-500 dark:text-gray-400` | Helper text |
| 270 | `border-gray-400` | Input border |
| 290–332 | Multiple `bg-blue-50, border-blue-200, text-blue-900, bg-gray-50, text-gray-700, text-gray-600, text-gray-500, border-blue-500` | Palette display sections |
| 340–382 | Multiple `border-gray-300, text-gray-600, text-green-600, text-red-600` | Contrast results |
| 400–414 | `text-gray-700, text-gray-500, text-gray-600` | Accessibility recommendations |
| 422 | `text-gray-700 dark:text-gray-300` | Label |
| 453–454 | `text-gray-700 dark:text-gray-300, border-gray-400` | Input section |
| 457 | `text-gray-500 dark:text-gray-400` | Helper text |
| 462–464 | `bg-primary-600, text-white` | Button |
| 475–476 | `text-gray-600 dark:text-gray-400` | Preview label |
| 508–509 | `text-gray-600 dark:text-gray-400` | Info text |
| 513 | `border-gray-200 dark:border-gray-700` | Section divider |
| 520–521 | `text-gray-500 dark:text-gray-400` | Helper text |
| 525–529 | Multiple `bg-gray-50 dark:bg-gray-700` | Code preview block |
| 566–568 | `text-gray-700 dark:text-gray-300, border-gray-200 dark:border-gray-700` | Reset button |
| 573 | `text-gray-500` | Tip text |
| 590 | `text-red-600 dark:text-red-400` | Error message |

---

### 4. `src/features/theme/components/ThemeScheduler.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 130 | `bg-slate-800 border-slate-700 text-white` / `bg-blue-50 border-blue-200` | Dark mode status card |
| 134 | `text-yellow-400` / `text-gray-600` | Icon color |
| 136 | `text-amber-500` | "Active" label |
| 189–191 | `bg-gray-50, text-gray-900 dark:text-gray-50, text-gray-700 dark:text-gray-400` | Schedule form |
| 202 | `text-gray-700 dark:text-gray-300` | Label |
| 209 | `text-gray-500 dark:text-gray-400` | Helper text |
| 219–221 | `text-gray-700 dark:text-gray-300, text-gray-500 dark:text-gray-400` | Labels |
| 227 | `text-gray-500 dark:text-gray-400` | Helper text |
| 237–239 | `text-gray-700 dark:text-gray-300, text-gray-500 dark:text-gray-400` | Labels |
| 247–248 | `text-gray-700 dark:text-gray-300, text-gray-500 dark:text-gray-400` | Labels |
| 251 | `text-blue-600 dark:text-blue-400` | Link text |
| 255 | `text-gray-500` | Status text |
| 289 | `text-gray-500 dark:text-gray-400` | Empty state |
| 296 | `border-gray-200 dark:border-gray-700` | Schedule item border |
| 319 | `text-gray-600 dark:text-gray-400` | Delete button |
| 332 | `text-gray-600 dark:text-gray-400` | Info text |
| 350 | `from-blue-50 to-orange-50 border-blue-200` | Gradient card |
| 351 | `text-blue-900 dark:text-blue-200` | Card text |
| 356–357 | `text-gray-700 dark:text-gray-300, text-gray-500 dark:text-gray-400` | Labels |
| 363–364 | `text-gray-700 dark:text-gray-300, text-gray-500 dark:text-gray-400` | Labels |
| 370 | `text-gray-500 dark:text-gray-400` | Tip text |
| 403–404 | `text-gray-600 dark:text-gray-400` | Manual override section |

---

### 5. `src/features/workLogs/components/WorkLogManagement.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 291 | `ring-gray-500/10` | Status badge ring |
| 293 | `ring-gray-400/20, ring-gray-600/20` | Status badge ring variants |
| 502–505 | `bg-gray-50 dark:bg-gray-800, bg-gray-400/10` | Filter section |
| 509 | `text-gray-400 dark:text-gray-500, border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50, placeholder-gray-400 dark:placeholder-gray-500` | Search input |
| 510 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50` | Select |
| 519 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Table container |
| 521–529 | `bg-gray-50 dark:bg-gray-700, text-gray-500 dark:text-gray-400, text-gray-600 dark:text-gray-300, border-gray-200 dark:border-gray-700` | Table header |
| 532 | `divide-gray-200 dark:divide-gray-700` | Table body divider |
| 535–540 | `bg-gray-100 dark:bg-gray-600, text-gray-700 dark:text-gray-300, text-gray-500 dark:text-gray-400` | Table cells |
| 574 | `text-gray-600 dark:text-gray-400, text-red-600 dark:text-red-500` | Action buttons |
| 584–591 | `text-gray-600 dark:text-gray-400` | Pagination |
| 615 | `bg-black/50` | Modal backdrop |
| 616 | `bg-white` | Modal |
| 619 | `bg-gray-600 text-white hover:bg-gray-700` | Close button |
| 624 | `bg-black/50` | Modal backdrop |
| 625 | `bg-white dark:bg-gray-800` | Modal |
| 626 | `border-gray-200 dark:border-gray-700, bg-white dark:bg-gray-800, text-gray-900 dark:text-gray-50` | Modal header |
| 630–639 | `text-gray-700 dark:text-gray-300, border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50` | Form fields |
| 647–648 | `text-gray-700 dark:text-gray-300` | Field labels |
| 661 | `text-gray-700 dark:text-gray-300` | Field labels |
| 672–673 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700` | Input fields |
| 684–685 | `text-gray-700 dark:text-gray-300` | Field labels |
| 720–729 | `text-gray-700 dark:text-gray-300, border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50, placeholder-gray-400 dark:placeholder-gray-500` | Textarea fields |
| 744–748 | `bg-green-600 text-white hover:bg-green-700` | Submit button |
| 756 | `bg-primary-600 text-white` | Primary button |
| 772 | `bg-gray-600 text-white hover:bg-gray-700` | Cancel button |
| 785–795 | `bg-black/50, bg-white` | Detail modal |

---

### 6. `src/features/accounts/components/AccountManagement.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 393 | `text-gray-500 dark:text-gray-400` | Empty state text |
| 430 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Table container |
| 436 | `bg-gray-50 dark:bg-gray-700` | Table header |
| 443–447 | `text-gray-500 dark:text-gray-400, border-gray-200 dark:border-gray-700` | Header cells |
| 455–472 | Multiple `text-gray-600 dark:text-gray-300, text-gray-900 dark:text-gray-50, text-gray-500 dark:text-gray-400` + status colors: `text-green-600, text-green-700, text-green-800, text-orange-600, text-orange-800, text-red-600, text-red-700, bg-green-100, bg-red-100` | Table cells |
| 477 | `divide-gray-200 dark:divide-gray-700` | Table body divider |
| 480–487 | Multiple `text-gray-900 dark:text-gray-50, text-gray-600 dark:text-gray-300, text-gray-500 dark:text-gray-400` | Data cells |
| 493–498 | `bg-red-50 dark:bg-red-900/20, border-red-200 dark:border-red-800, text-red-600 dark:text-red-400, text-red-900 dark:text-red-300, text-red-700 dark:text-red-500` | Error status |
| 525–526 | `bg-gray-100, text-gray-600 dark:text-gray-300` | Badge |
| 541 | `text-gray-500 dark:text-gray-400` | Action text |
| 553–554 | `text-gray-500 dark:text-gray-400` | Pagination text |
| 568 | `border-gray-300 dark:border-gray-600, bg-gray-50 dark:bg-gray-700` | Page input |
| 582 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, hover:bg-gray-100 dark:hover:bg-gray-600, text-gray-900 dark:text-gray-50` | Pagination button |
| 601 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50` | Page number input |
| 612 | Same as 582 | Pagination button |
| 623–626 | `bg-black/50, bg-white, border-gray-200 dark:border-gray-700, bg-white dark:bg-gray-800` | Edit modal |
| 628–632 | `text-gray-600 dark:text-gray-300, text-gray-500 dark:text-gray-400` | Modal form section |
| 640–652 | `text-gray-700 dark:text-gray-300, border-gray-200 dark:border-gray-700` | Form labels/fields |
| 656 | `bg-gray-50 dark:bg-gray-700, text-gray-500 dark:text-gray-400` | Readonly field |
| 668 | `text-gray-700 dark:text-gray-300` | Label |
| 676 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50, placeholder-gray-400 dark:placeholder-gray-500` | Input |
| 687–693 | `text-gray-700 dark:text-gray-300` | Labels |
| 703 | Same as 676 | Input |
| 708–709 | `text-gray-700 dark:text-gray-300` | Label |
| 719 | Same as 676 | Input |
| 722 | `text-gray-600 dark:text-gray-300` | Permission section |
| 763 | `text-gray-400 dark:text-gray-500` | Disabled text |
| 778 | `border-white border-t-transparent` | Loading spinner |
| 796–797 | `bg-black/50, bg-white` | Delete modal |
| 803–807 | `text-gray-900 dark:text-gray-50, text-gray-600 dark:text-gray-300` | Delete confirmation |
| 814–822 | `bg-gray-100 dark:bg-gray-700, text-gray-600 dark:text-gray-300, bg-red-600 text-white hover:bg-red-700` | Delete buttons |

---

### 7. `src/features/workLogs/components/ImportWizard.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 172 | `bg-black/50` | Modal backdrop |
| 173 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Modal container |
| 175 | `border-gray-200 dark:border-gray-700, bg-white dark:bg-gray-800` | Sticky header |
| 177–178 | `text-gray-900 dark:text-gray-50, text-gray-600 dark:text-gray-400` | Header text |
| 182 | `hover:text-gray-600 dark:hover:text-gray-400` | Close button |
| 195 | `text-gray-500 dark:text-gray-400` | Step indicator |
| 202–203 | `bg-gray-200, text-gray-600 dark:text-gray-400` | Step connector |
| 206 | `text-gray-600 dark:text-gray-400` | Step description |
| 211 | `bg-primary-600 text-white hover:bg-primary-700` | CTA button |
| 236 | `bg-gray-50 dark:bg-gray-700` | Upload area |
| 254 | `bg-primary-600 text-white` | Upload button |
| 270 | `text-gray-500 dark:text-gray-400` | Helper text |
| 280–290 | `bg-red-50 dark:bg-red-900/20, border-red-400 dark:border-red-700, text-red-600 dark:text-red-400, text-red-800 dark:text-red-200` | Error message |
| 300–303 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700, text-gray-900 dark:text-gray-50 , text-gray-500 dark:text-gray-400` | Data table |
| 309 | `bg-gray-50 dark:bg-gray-700` | Table header |
| 311–315 | `text-gray-700 dark:text-gray-300, border-gray-200 dark:border-gray-700` | Table header cells |
| 318 | `divide-gray-200 dark:divide-gray-700` | Table body divider |
| 322–323 | `bg-yellow-50 dark:bg-yellow-900/20, text-gray-900 dark:text-gray-50` | Warning row |
| 329 | `text-gray-600 dark:text-gray-400, text-purple-600 dark:text-purple-400` | Cell data |
| 339 | `text-gray-500 dark:text-gray-400` | Extra rows indicator |
| 345 | `border-gray-300 dark:border-gray-600` | Column mapping border |
| 357 | `bg-primary-600 text-white hover:bg-primary-700` | Apply button |
| 366–367 | `text-gray-600 dark:text-gray-300, border-gray-400 dark:border-gray-500` | Column mapping select |
| 387–389 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700, text-gray-600 dark:text-gray-400` | Validation table |
| 393 | `bg-gray-50 dark:bg-gray-700` | Table header |
| 395–400 | `text-gray-700 dark:text-gray-300, border-gray-200 dark:border-gray-700, text-gray-900 dark:text-gray-50` | Table cells |
| 403 | `divide-gray-200 dark:divide-gray-700` | Table body divider |
| 408 | `text-gray-500 dark:text-gray-400` | Summary text |
| 411–416 | `text-gray-600 dark:text-gray-300, border-gray-300 dark:border-gray-600` | Stats row |
| 423–424 | `text-gray-700 dark:text-gray-300` | Stats label |
| 445–446 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Import settings card |
| 487 | `text-gray-500 dark:text-gray-400` | Checkbox label |
| 495 | `bg-primary-600 text-white` | Import button |
| 517 | `text-gray-500 dark:text-gray-400` | Summary section |
| 522–536 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700, text-gray-900 dark:text-gray-50` | Result cards (4 cards) |
| 542 | `text-gray-600 dark:text-gray-400` | Result stats |
| 543–544 | `text-gray-500 dark:text-gray-400` | Result info |
| 559 | `bg-primary-600 text-white hover:bg-primary-700` | Close button |

---

### 8. `src/features/workLogs/components/ImportValidation.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 31 | `bg-gray-50 dark:bg-gray-800` | Container |
| 34 | `text-gray-600 dark:text-gray-400` | Description |
| 62 | `text-gray-600 dark:text-gray-400` | Stat label |
| 73 | `text-gray-700 dark:text-gray-300` | Section header |
| 84 | `bg-white, border-gray-200` | Card |
| 91 | `text-yellow-700, border-yellow-400` | Warning section |
| 104 | `text-gray-600 dark:text-gray-400` | Field label |
| 112 | `text-red-700, border-red-400` | Error section |
| 132 | `bg-gray-200` | Divider |
| 152 | `text-gray-700 dark:text-gray-300` | Section header |
| 177–178 | `bg-white, border-gray-200` | Table container |
| 187 | `bg-gray-50, text-gray-600` | Table header |
| 196 | `divide-gray-200` | Table body divider |
| 198 | `border-gray-200, text-gray-700` | Table cells |
| 215 | `text-gray-600` | Cell data |
| 235–236 | `bg-white, border-gray-200` | Error table |
| 245 | `bg-gray-50, text-gray-600` | Table header |
| 252 | `divide-gray-200` | Divider |
| 254 | `border-gray-200, text-gray-700` | Table cells |
| 269–270 | `text-gray-600, border-blue-300` | Info |
| 287–289 | `text-gray-700, border-gray-200` | Labels |
| 295 | `bg-primary-600 text-white hover:bg-primary-700` | Action button |

---

### 9. `src/features/roles/components/RoleManagement.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 232 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Role card |
| 234 | `text-gray-900 dark:text-gray-50` | Role name |
| 242 | `text-gray-600 dark:text-gray-300` | Description |
| 252 | `bg-primary-50 dark:bg-primary-100, text-primary-600 dark:text-primary-400` | Permission count |
| 261 | `text-gray-400 dark:text-gray-500` | Timestamp |
| 283–286 | `bg-black/50, bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700, bg-white dark:bg-gray-800` | Edit modal |
| 298 | `text-gray-900 dark:text-gray-50` | Modal title |
| 306 | `hover:text-gray-600 dark:hover:text-gray-400` | Close button |
| 312 | `text-gray-600 dark:text-gray-300` | Error/info message |
| 331 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50, placeholder-gray-400 dark:placeholder-gray-500` | Input field |
| 341 | Same as 331 | Textarea field |
| 354 | `text-gray-700 dark:text-gray-300` | Section label |
| 363 | `border-gray-200 dark:border-gray-700` | Border |
| 365 | `bg-white dark:bg-gray-800, hover:bg-gray-50 dark:hover:bg-gray-700` | Permission row |
| 374 | `text-gray-600 dark:text-gray-300` | Permission name |
| 383 | `text-gray-500 dark:text-gray-400` | Description |
| 397 | `bg-gray-50 dark:bg-gray-700, divide-gray-200 dark:divide-gray-600` | Grouped permissions |
| 403 | `bg-gray-50 dark:bg-gray-700, text-gray-700 dark:text-gray-300` | Category header |
| 409 | `text-gray-500 dark:text-gray-400` | Toggle label |
| 433 | `bg-red-50 dark:bg-red-900/20, border-red-200 dark:border-red-800, text-red-600 dark:text-red-400` | Error message |
| 437 | `bg-primary-600 text-white hover:bg-primary-700` | Save button |
| 441 | `border-white border-t-transparent` | Loading spinner |

---

### 10. `src/features/employees/components/EmployeeManagement.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 95 | `bg-gray-50 dark:bg-gray-700` | Table header |
| 105 | `divide-gray-200 dark:divide-gray-700` | Table body divider |
| 114 | `text-gray-600 dark:text-gray-300` | Cell text |
| 130 | `text-red-600, text-red-800` | Status colors |
| 155 | `bg-black/50` | Modal backdrop |
| 157 | `border-gray-200 dark:border-gray-700` | Modal border |
| 159 | `text-gray-600` | Description |
| 220 | `bg-primary-600 text-white hover:bg-primary-700` | Submit button |

---

### 11. `src/features/employees/components/EmployeeDashboard.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 30 | `text-gray-600` | Loading text (⚠ missing dark:) |
| 42 | `text-gray-900 dark:text-gray-50` | Page heading |
| 43 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Info card |
| 44 | `text-gray-900 dark:text-gray-50` | Welcome heading |
| 45 | `text-gray-600 dark:text-gray-400` | Description |
| 50 | `text-gray-600 dark:text-gray-400` | Stat label |
| 53 | `bg-green-50 dark:bg-green-900/20, border-green-200 dark:border-green-800` | Status card |
| 54 | `text-gray-600 dark:text-gray-400` | Stat label |
| 55 | `text-green-600 dark:text-green-400` | Stat value |
| 77 | `text-gray-900 dark:text-gray-50` | Default heading |
| 78 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Details card |
| 79 | `text-gray-600 dark:text-gray-400` | Prompt text |
| 91 | `text-gray-500` | Login info (⚠ missing dark:) |
| 96 | `bg-red-600 text-white hover:bg-red-700` | Logout button |
| 113 | `text-red-600` | Logout icon |

---

### 12. `src/features/dashboard/components/AdminDashboard.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 35 | `text-gray-600 dark:text-gray-400` | Loading text |
| 50 | `text-gray-600 dark:text-gray-400` | Description |
| 55 | `text-gray-600 dark:text-gray-400` | Stat label |
| 58 | `bg-green-100 dark:bg-green-900/20` | Success indicator |
| 59 | `text-gray-600 dark:text-gray-400` | Stat label |
| 60 | `text-green-600` | Employee count (⚠ missing dark:) |
| 63 | `text-gray-600 dark:text-gray-400` | Stat label |
| 125 | `text-gray-600 dark:text-gray-400` | Prompt text |
| 137 | `text-gray-600 dark:text-gray-400` | Login info |
| 142 | `bg-red-600 text-white hover:bg-red-700` | Logout button |
| 159 | `text-red-600` | Logout icon |

---

### 13. `src/features/auth/components/LoginPage.tsx`

> **⚠ WARNING: This file has NO dark: variants.** All Tailwind colors are light-mode only.

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 43 | `bg-white` | Form card |
| 46 | `text-white` | Logo icon |
| 48 | `text-gray-900` | App title |
| 49 | `text-gray-500` | Subtitle |
| 54 | `text-gray-700` | Username label |
| 63 | `border-gray-300` | Username input border |
| 69 | `text-gray-700` | Password label |
| 79 | `border-gray-300` | Password input border |
| 85 | `text-gray-400 hover:text-gray-600` | Show/hide password toggle |
| 94 | `bg-red-50 border-red-200` | Error container |
| 95 | `text-red-600` | Error message |
| 101 | `bg-primary-600 text-white hover:bg-primary-700` | Submit button |
| 108 | `bg-gray-50` | Demo credentials box |
| 109 | `text-gray-600` | Demo credentials label |
| 110 | `text-gray-500` | Demo credentials text |

---

### 14. `src/features/areas/components/DepartmentManagement.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 135 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Dept card |
| 146 | `text-gray-600 dark:text-gray-300` | Description |
| 154 | `text-gray-400 dark:text-gray-500` | Timestamp |
| 166–167 | `bg-black/50, bg-white dark:bg-gray-800` | Modal |
| 168 | `text-gray-900 dark:text-gray-50` | Title |
| 175 | `text-gray-700 dark:text-gray-300` | Label |
| 192 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50, placeholder-gray-400 dark:placeholder-gray-500` | Input |
| 206 | Same as 192 | Textarea |
| 215 | `bg-primary-600 text-white hover:bg-primary-700` | Save button |

---

### 15. `src/features/areas/components/AreaManagement.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 55 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Area card |
| 61 | `text-gray-900 dark:text-gray-50` | Area name |
| 65 | `text-gray-600 dark:text-gray-300` | Description |
| 74–76 | `bg-black/50, bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Modal |
| 78 | `text-gray-900 dark:text-gray-50` | Title |
| 89 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50, placeholder-gray-400 dark:placeholder-gray-500` | Input |
| 96 | Same as 89 | Textarea |

---

### 16. `src/features/accessibility/components/AccessibilityReportViewer.tsx`

> **⚠ WARNING: This file has NO dark: variants.** All Tailwind colors are light-mode only.

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 68 | `bg-red-100 text-red-800 border-red-300` | Critical severity |
| 70 | `bg-orange-100 text-orange-800 border-orange-300` | Serious severity |
| 72 | `bg-yellow-100 text-yellow-800 border-yellow-300` | Moderate severity |
| 74 | `bg-blue-100 text-blue-800 border-blue-300` | Minor severity |
| 76 | `bg-gray-100 text-gray-800 border-gray-300` | Default severity |
| 99 | `border-gray-300` | Color swatch border |
| 103 | `text-gray-700` | Hex code text |
| 116 | `hover:bg-gray-50` | Violation row hover |
| 127 | `bg-gray-200` | Rule ID badge |
| 131 | `text-gray-600` | Description text |
| 145 | `bg-gray-50` | Details panel background |
| 159 | `text-gray-600` | Ratio label |
| 165 | `text-gray-600` | Required label |
| 171 | `text-gray-600` | Shortfall label |
| 172 | `text-red-600` | Shortfall value |
| 184 | `text-gray-700` | Suggestion text |
| 197 | `border-blue-600` | Loading spinner |
| 198 | `text-gray-600` | Loading text |
| 206 | `bg-red-50 border-red-200` | Error card |
| 208 | `text-red-600` | Error icon |
| 210 | `text-red-900` | Error heading |
| 211 | `text-red-700` | Error message |
| 221 | `text-gray-600` | Empty state |
| 232 | `text-gray-600` | Subtitle |
| 262 | `bg-green-50 border-green-200` / `bg-red-50 border-red-200` | AA pass/fail card |
| 263 | `text-gray-600` | Label |
| 269 | `text-gray-700` | Description |
| 275 | `bg-green-50 border-green-200` / `bg-yellow-50 border-yellow-200` | AAA pass/warn card |
| 276 | `text-gray-600` | Label |
| 282 | `text-gray-700` | Description |
| 289 | `bg-green-50 border-green-200` / `bg-orange-50 border-orange-200` | Violation count card |
| 291 | `text-gray-600` | Label |
| 295 | `text-gray-700` | Description |
| 302 | `bg-green-50 border-green-200` / `bg-red-50 border-red-200` | Critical issues card |
| 304 | `text-gray-600` | Label |
| 308 | `text-gray-700` | Description |
| 331 | `bg-green-50 border-green-200` | All-pass celebration |
| 332 | `text-green-600` | Check icon |
| 333 | `text-green-900` | Heading |
| 336 | `text-green-700` | Subtitle |
| 345 | `text-gray-700` | Filter label |
| 363 | `text-gray-700` | Filter label |
| 381 | `bg-blue-50 border-blue-200` | No violations for severity |
| 382 | `text-blue-600` | Check icon |
| 383 | `text-blue-700` | Message |
| 408 | `border-gray-200` | Color swatch border |
| 412 | `text-gray-900` | Color name |
| 413 | `text-gray-700` | Color value |
| 414 | `text-gray-600` | Usage info |
| 418 | `text-gray-600` | AA/AAA info |
| 437 | `bg-gray-50 border-gray-200` | Total summary card |
| 438 | `text-gray-600` | Total label |
| 439 | `text-gray-900` | Total count |
| 443 | `bg-red-50 border-red-200` | Critical summary |
| 444 | `text-red-600` | Critical label |
| 445 | `text-red-700` | Critical count |
| 449 | `bg-orange-50 border-orange-200` | High summary |
| 450 | `text-orange-600` | High label |
| 451 | `text-orange-700` | High count |
| 455 | `bg-yellow-50 border-yellow-200` | Medium summary |
| 456 | `text-yellow-600` | Medium label |
| 457 | `text-yellow-700` | Medium count |
| 461 | `bg-blue-50 border-blue-200` | Low summary |
| 462 | `text-blue-600` | Low label |
| 463 | `text-blue-700` | Low count |
| 474 | `text-gray-900` | WCAG AA label |
| 475 | `text-gray-600` | WCAG AA description |
| 481 | `text-gray-900` | WCAG AAA label |
| 482 | `text-gray-600` | WCAG AAA description |
| 492 | `text-blue-600 hover:text-blue-700` | WCAG link |

#### style={{ }}
| Line | Content | Context |
|------|---------|---------|
| 100 | `style={{ backgroundColor: color }}` | Dynamic severity color |
| 409 | `style={{ backgroundColor: color.value }}` | Dynamic palette swatch |

---

### 17. `src/components/layout/Sidebar.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 105 | `text-white, hover:text-white` | Active/hover nav items |
| 143 | `bg-primary-600 text-white` | Subnav active state |
| 144 | `bg-gray-200 dark:bg-gray-600, text-gray-900 dark:text-gray-50, hover:bg-gray-300 dark:hover:bg-gray-500` | Subnav inactive state |
| 153 | `bg-primary-600 text-white` | Subnav active (collapsed) |
| 154 | `bg-gray-200 dark:bg-gray-600, text-gray-900 dark:text-gray-50, hover:bg-gray-300 dark:hover:bg-gray-500` | Subnav inactive (collapsed) |
| 160 | `text-gray-600 dark:text-gray-400` | Reduced motion note |

#### style={{ }}
| Line | Content | Context |
|------|---------|---------|
| 69 | `style={{ ... }}` | Sidebar container (uses CSS vars — OK) |
| 79 | `style={{ color: 'var(--color-primary-500)' }}` | Logo color (uses CSS var — OK) |
| 95 | `style={{ scrollbarColor: 'var(--sidebar-color-text-placeholder) transparent' }}` | Scrollbar (uses CSS var — OK) |

---

### 18. `src/components/common/Pagination.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 57 | `border-gray-200, bg-white` | Container |
| 62 | `border-gray-300, bg-white, text-gray-700, hover:bg-gray-50` | Prev button |
| 69 | Same as 62 | Next button |
| 87 | `ring-gray-300, text-gray-700, hover:bg-gray-50` | Page button |
| 96 | `ring-gray-300, text-gray-400` | Ellipsis |
| 104 | `ring-gray-300, text-gray-700, hover:bg-gray-50` | Page button |
| 106 | `bg-primary-600 text-white` | Active page |
| 117 | `ring-gray-300, text-gray-700, hover:bg-gray-50` | Page button |

---

### 19. `src/components/common/SearchFilterBar.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 160–161 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Container |
| 177 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50, placeholder-gray-400 dark:placeholder-gray-500` | Search input |
| 182 | `text-gray-400 dark:text-gray-500` | Search icon |
| 202 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50` | Filter select |
| 219 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50, hover:bg-gray-50 dark:hover:bg-gray-600` | Sort button |
| 237 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Sort dropdown |
| 242 | `hover:bg-gray-100 dark:hover:bg-gray-700, text-gray-600 dark:text-gray-300` | Sort options |
| 275 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50` | Page size select |

---

### 20. `src/components/common/SearchableCombobox.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 53–54 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50` | Trigger button |
| 64 | `bg-white dark:bg-gray-800, border-gray-300 dark:border-gray-700` | Dropdown |
| 73 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50, placeholder-gray-400 dark:placeholder-gray-500` | Search input |
| 87 | `bg-gray-100 dark:bg-gray-600, text-gray-400 dark:text-gray-500` | Option hover/disabled |

---

### 21. `src/components/common/FlexibleMultiSelect.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 133 | `text-red-500` | Required asterisk |
| 139 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700` | Main container |
| 169 | `text-gray-900 dark:text-gray-50, placeholder-gray-400 dark:placeholder-gray-500` | Input text/placeholder |
| 177 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Dropdown |
| 187 | `hover:bg-gray-100 dark:hover:bg-gray-700` | Option hover |
| 190 | `text-gray-900 dark:text-gray-50` | Option label |
| 205 | `border-gray-200 dark:border-gray-700, bg-gray-50 dark:bg-gray-700, hover:bg-gray-100 dark:hover:bg-gray-600` | Create new option |
| 208 | `text-green-600 dark:text-green-400` | Plus icon |
| 209 | `text-gray-700 dark:text-gray-300` | Create text |
| 218 | `text-gray-500 dark:text-gray-400` | No results text |
| 227 | `text-gray-500 dark:text-gray-400` | Help text |

---

### 22. `src/components/common/ConfirmDialog.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 39 | `text-red-600` | Delete icon |
| 41 | `text-orange-600` | Lock icon |
| 43 | `text-green-600` | Unlock icon |
| 52 | `bg-red-600 dark:bg-red-600, hover:bg-red-700 dark:hover:bg-red-700` | Danger button |
| 54 | `bg-orange-600 dark:bg-orange-600, hover:bg-orange-700 dark:hover:bg-orange-700` | Warning button |
| 56 | `bg-green-600 dark:bg-green-600, hover:bg-green-700 dark:hover:bg-green-700` | Success button |
| 58 | `bg-red-600 dark:bg-red-600, hover:bg-red-700 dark:hover:bg-red-700` | Default confirm |
| 81 | `bg-black/50` | Backdrop |
| 82 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Dialog |
| 84 | `border-gray-200 dark:border-gray-700` | Header border |
| 86 | `text-gray-900 dark:text-gray-50` | Title |
| 93 | `text-gray-900 dark:text-gray-50, hover:text-gray-600 dark:hover:text-gray-400` | Close button |
| 101 | `text-gray-700 dark:text-gray-300` | Description |
| 105 | `border-gray-200 dark:border-gray-700` | Footer border |
| 114 | `text-white` | Confirm button text |

---

### 23. `src/components/common/AutocompleteInput.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 136 | `text-red-500` | Required asterisk |
| 138 | `bg-green-600 text-white` | Match badge |
| 154 | `border-gray-300 dark:border-gray-600, bg-white dark:bg-gray-700, text-gray-900 dark:text-gray-50, placeholder-gray-400 dark:placeholder-gray-500` | Input |
| 161 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Dropdown |
| 165 | `bg-gray-50 dark:bg-gray-700, border-gray-200 dark:border-gray-700, text-gray-600 dark:text-gray-400` | Results header |
| 175 | `border-gray-100 dark:border-gray-700` | Option border |
| 178 | `hover:bg-gray-100 dark:hover:bg-gray-700` | Option hover |
| 181 | `text-gray-900 dark:text-gray-50` | Option text |
| 189 | `text-gray-500 dark:text-gray-400` | Secondary text |
| 198 | `bg-gray-50 dark:bg-gray-700, text-gray-500 dark:text-gray-400` | Results footer |
| 214 | `bg-green-50, border-green-500` | Validation success |
| 217 | `text-green-600` | Success icon |
| 218 | `text-gray-700` | Validation text (⚠ missing dark:) |

---

### 24. `src/components/common/PermissionEditor.tsx`

#### Tailwind Hard-Coded Classes
| Line | Hard-Coded Classes | Context |
|------|-------------------|---------|
| 281 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700, divide-gray-200 dark:divide-gray-700` | Container |
| 283 | `text-gray-500 dark:text-gray-400` | Empty state text |
| 284 | `text-gray-300` | Empty state icon (⚠ missing dark:) |
| 295 | `hover:bg-gray-50 dark:hover:bg-gray-700` | Role row hover |
| 304 | `border-gray-300` | Checkbox border (⚠ missing dark:) |
| 307 | `text-gray-900 dark:text-gray-50` | Role name |
| 309 | `text-gray-500 dark:text-gray-400` | Role description |
| 312 | `text-gray-400` | Permission count (⚠ missing dark:) |
| 364 | `bg-white dark:bg-gray-800, border-gray-200 dark:border-gray-700` | Category card |
| 368 | `hover:bg-gray-50 dark:hover:bg-gray-700` | Category header hover |
| 372 | `text-gray-900 dark:text-gray-50` | Category title |
| 373 | `text-gray-500 dark:text-gray-400` | Permission count |
| 392 | `text-gray-400` | Chevron icon (⚠ missing dark:) |
| 394 | `text-gray-400` | Chevron icon (⚠ missing dark:) |
| 416 | `text-gray-700 dark:text-gray-300, hover:bg-gray-50 dark:hover:bg-gray-700` | Permission label |
| 430 | `accent-green-600` | Checkbox accent |
| 446 | `from-primary-50 to-green-50, border-primary-200` | Success gradient card |
| 447 | `text-gray-900` | Summary heading (⚠ missing dark:) |
| 453 | `text-gray-500` | No permissions text (⚠ missing dark:) |
| 464 | `bg-green-100 text-green-700 border-green-200` | Permission badge (⚠ missing dark:) |

---

### 25. `src/components/ui/chart.tsx`

#### Hex Colors
| Line | Content | Color | Context |
|------|---------|-------|---------|
| 58 | `[stroke='#ccc']` (×3) | `#ccc` | Recharts CSS selectors |
| 58 | `[stroke='#fff']` (×2) | `#fff` | Recharts CSS selectors |

---

### 26. `src/components/ui/` (shadcn/ui components)

#### `text-white`, `bg-black/50`, `bg-destructive`
| File | Line | Hard-Coded Classes | Context |
|------|------|-------------------|---------|
| alert-dialog.tsx | 39 | `bg-black/50` | Overlay |
| badge.tsx | 17 | `text-white, bg-destructive` | Destructive variant |
| button.tsx | 14 | `text-white, bg-destructive` | Destructive variant |
| drawer.tsx | 40 | `bg-black/50` | Overlay |
| sheet.tsx | 40 | `bg-black/50` | Overlay |
| dialog.tsx | 41 | `bg-black/50` | Overlay |

> **Note:** These are standard shadcn/ui patterns using Tailwind semantic tokens (`destructive`). The `bg-black/50` overlays and `text-white` are intentional design constants.

---

### 27. `src/features/theme/hooks/useColorBuilder.ts`

#### Hex Colors
| Line | Content | Color | Context |
|------|---------|-------|---------|
| 27 | `useState('#2563eb')` | `#2563eb` | Default base color |
| 29 | `useState('#ffffff')` | `#ffffff` | Default light background |
| 30 | `useState('#1f2937')` | `#1f2937` | Default dark background |
| 190 | `setBaseColor('#2563eb')` | `#2563eb` | Reset to default |
| 192 | `setLightBg('#ffffff')` | `#ffffff` | Reset to default |
| 193 | `setDarkBg('#1f2937')` | `#1f2937` | Reset to default |

---

### 28. `src/index.css` — Non-Variable-Definition Hard-Coded Colors

#### Hard-Coded Hex in High-Contrast Overrides (NOT inside var definitions)
| Line | Content | Color | Context |
|------|---------|-------|---------|
| 172 | `color: #000000 !important;` | `#000000` | HC text override |
| 186 | `background-color: #ffffff !important;` | `#ffffff` | HC bg override |
| 193 | `border-color: #000000 !important;` | `#000000` | HC border override |
| 201 | `background-color: #f5f5f5 !important;` | `#f5f5f5` | HC hover bg |
| 207 | `color: #000000 !important;` | `#000000` | HC hover text |
| 259 | `color: #ffffff !important;` | `#ffffff` | Dark HC text override |
| 275 | `background-color: #000000 !important;` | `#000000` | Dark HC bg override |
| 286 | `border-color: #ffffff !important;` | `#ffffff` | Dark HC border override |
| 293 | `background-color: #1a1a1a !important;` | `#1a1a1a` | Dark HC hover bg |
| 299 | `color: #ffffff !important;` | `#ffffff` | Dark HC hover text |

#### Hard-Coded Tailwind Classes via @apply
| Line | Content | Context |
|------|---------|---------|
| 429 | `@apply bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50;` | Body background |
| 495 | `@apply bg-gray-100 dark:bg-gray-800;` | Scrollbar track |
| 499 | `@apply bg-gray-300 dark:bg-gray-600 rounded-full;` | Scrollbar thumb |
| 503 | `@apply bg-gray-400 dark:bg-gray-500;` | Scrollbar thumb hover |
| 524 | `@apply bg-primary-600 text-white hover:bg-primary-700;` | .btn-primary |
| 533 | `@apply bg-gray-100 text-gray-900 hover:bg-gray-200;` | .btn-secondary |
| 534 | `@apply focus-visible:ring-gray-500;` | .btn-secondary focus ring |
| 535 | `@apply dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600;` | .btn-secondary dark |
| 542 | `@apply bg-red-600 text-white hover:bg-red-700;` | .btn-danger |
| 543 | `@apply focus-visible:ring-red-500;` | .btn-danger focus ring |
| 544 | `@apply dark:bg-red-500 dark:hover:bg-red-600;` | .btn-danger dark |
| 551 | `@apply bg-green-600 text-white hover:bg-green-700;` | .btn-success |
| 552 | `@apply focus-visible:ring-green-500;` | .btn-success focus ring |
| 553 | `@apply dark:bg-green-500 dark:hover:bg-green-600;` | .btn-success dark |
| 560 | `@apply bg-orange-600 text-white hover:bg-orange-700;` | .btn-warning |
| 561 | `@apply focus-visible:ring-orange-500;` | .btn-warning focus ring |
| 562 | `@apply dark:bg-orange-500 dark:hover:bg-orange-600;` | .btn-warning dark |
| 579 | `@apply bg-red-50 text-red-600 hover:bg-red-100;` | .btn-outline-danger |
| 580 | `@apply focus-visible:ring-red-400;` | .btn-outline-danger focus ring |
| 581 | `@apply dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30;` | .btn-outline-danger dark |
| 588 | `@apply bg-green-50 text-green-600 hover:bg-green-100;` | .btn-outline-success |
| 589 | `@apply focus-visible:ring-green-400;` | .btn-outline-success focus ring |
| 590 | `@apply dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30;` | .btn-outline-success dark |
| 596 | `@apply border-gray-300 bg-white placeholder:text-gray-400;` | .input-base |
| 597 | `@apply focus:border-primary-500 focus:ring-primary-500;` | .input-base focus |
| 599 | `@apply dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500;` | .input-base dark |
| 606 | `@apply border-gray-200 bg-white;` | .card |
| 607 | `@apply dark:border-gray-700 dark:bg-gray-800;` | .card dark |
| 622 | `@apply bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300;` | .badge-success |
| 627 | `@apply bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300;` | .badge-warning |
| 632 | `@apply bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300;` | .badge-danger |
| 684 | `@apply backdrop-blur-md bg-white/80 dark:bg-gray-900/80;` | .glass utility |
| 797 | `@apply bg-white text-black;` | Print styles |

#### rgba() Colors
| Line | Content | Context |
|------|---------|---------|
| 720 | `rgba(0, 0, 0, 0.05)` | Sidebar shadow (light) |
| 721 | `rgba(0, 0, 0, 0.3)` | Sidebar shadow (dark) |
| 740 | `rgba(0, 0, 0, 0.6)` | Mobile backdrop overlay |

---

## Top Offenders by Hard-Coded Color Instance Count

| Rank | File | Approx. Instances |
|------|------|-------------------|
| 1 | WorkLogManagement.tsx | 80+ |
| 2 | AccountManagement.tsx | 75+ |
| 3 | ThemeValidationTest.tsx | 70+ |
| 4 | ThemeSelector.tsx | 50+ |
| 5 | ImportWizard.tsx | 50+ |
| 6 | CustomColorBuilder.tsx | 45+ |
| 7 | index.css (@apply) | 40+ |
| 8 | RoleManagement.tsx | 40+ |
| 9 | ThemeScheduler.tsx | 35+ |
| 10 | ImportValidation.tsx | 30+ |

---

## Most Common Hard-Coded Color Patterns

| Pattern | Occurrences | Purpose |
|---------|-------------|---------|
| `bg-white dark:bg-gray-800` | ~30 | Card/modal backgrounds |
| `text-gray-900 dark:text-gray-50` | ~25 | Primary text |
| `border-gray-200 dark:border-gray-700` | ~25 | Card/table borders |
| `text-gray-600 dark:text-gray-300` | ~20 | Secondary text |
| `text-gray-500 dark:text-gray-400` | ~20 | Muted/helper text |
| `border-gray-300 dark:border-gray-600` | ~20 | Input borders |
| `bg-white dark:bg-gray-700` | ~15 | Input backgrounds |
| `text-gray-700 dark:text-gray-300` | ~15 | Label text |
| `bg-gray-50 dark:bg-gray-700` | ~12 | Subtle backgrounds |
| `placeholder-gray-400 dark:placeholder-gray-500` | ~10 | Placeholder colors |
| `bg-black/50` | ~10 | Modal backdrops |
| `text-white` | ~30 | Button/overlay text |
| `bg-red-600 text-white hover:bg-red-700` | ~5 | Danger buttons |
| `bg-green-600 text-white hover:bg-green-700` | ~4 | Success buttons |
| `divide-gray-200 dark:divide-gray-700` | ~7 | Table row dividers |

---

## Recommendations

1. **Create semantic Tailwind classes** (or use existing ones in index.css like `.card`, `.input-base`, `.btn-*`) to replace the most common patterns.
2. **Card backgrounds** (`bg-white dark:bg-gray-800`) — replace with the existing `.card` class or a `bg-surface` token.
3. **Text colors** (`text-gray-900/600/500 dark:text-gray-50/300/400`) — map to semantic tokens like `text-foreground`, `text-muted`, `text-subtle`.
4. **Borders** (`border-gray-200/300 dark:border-gray-600/700`) — map to `border-default`, `border-input` tokens.
5. **Status colors** (`text-red-600`, `bg-green-100`, etc.) — use the existing semantic CSS variables (`--color-success`, `--color-error`).
6. **Modal backdrops** (`bg-black/50`) — already acceptable as design constants, but could be a utility token.
7. **Theme components** (ThemeSelector, ThemeValidationTest, CustomColorBuilder) — these may legitimately need hard-coded colors for preview/demo purposes.
