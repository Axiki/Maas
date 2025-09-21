# Codex Task Board

## Global Rules
- Never delete or overwrite working code. Only improve or extend.
- Always update **this file** after each analysis or patch.
- Each agent has its own scope. Never cross into another agent’s section.
- If a task is complete, mark it **DONE**. If pending, mark **TODO**.
- If you encounter errors, log them clearly under the correct agent.

---

## Agent 1 — Layout
**Scope:** Analyze and fix page layouts (grid, spacing, alignment, responsiveness).  
**Tasks:**  
- Review current layout structure.  
- Fix misaligned sections, spacing, and grid inconsistencies.  
- Improve responsiveness (mobile/tablet/desktop).  
- Keep existing functionality untouched.  
**Status:** TODO  
**Log:**  

---

## Agent 2 — Palette
**Scope:** Apply and enforce color palette (#EE766D, #24242E, #D6D6D6).  
**Tasks:**  
- Identify current colors in use.  
- Replace off-palette values with correct ones.  
- Ensure Tailwind config and global tokens are updated.  
- Verify consistency across all components.  
**Status:** TODO  
**Log:**  

---

## Agent 3 — Typography
**Scope:** Fonts, sizes, weights, and readability.  
**Tasks:**  
- Analyze current font stack.  
- Apply consistent font sizes for headings, body, buttons.  
- Fix line-height and spacing issues.  
- Document changes here.  
**Status:** TODO  
**Log:**  

---

## Agent 4 — Animations & Transitions
**Scope:** Smooth motion, hover states, page transitions.  
**Tasks:**  
- Review current animations.  
- Add smooth transitions to navbar, buttons, hero, and modals.  
- Ensure performance is preserved.  
- Document all changes here.  
**Status:** TODO  
**Log:**  

---

## Agent 5 — Navbar
**Scope:** Header, navigation bar, logo, menu.  
**Tasks:**  
- Apply palette + typography.  
- Add hover/active states.  
- Keep routing intact.  
- Document changes.  
**Status:** TODO  
**Log:**  

---

## Agent 6 — Hero Section
**Scope:** Main landing section (logo, slogan, CTA).  
**Tasks:**  
- Center logo properly.  
- Add slogan text with correct typography.  
- Add primary CTA button with hover state.  
- Document changes.  
**Status:** TODO  
**Log:**  

---

## Agent 7 — Footer
**Scope:** Footer layout, links, alignment.  
**Tasks:**  
- Redesign footer with minimal style.  
- Align links center or justified as needed.  
- Apply palette + typography rules.  
- Document changes.  
**Status:** TODO  
**Log:**  

---

## Agent 8 — Buttons & CTAs
**Scope:** Button styles across site.
**Tasks:**
- Standardize button size, radius, and hover states.
- Apply palette colors correctly.
- Ensure accessibility contrast ratios.
- Document changes.
**Status:** DONE
**Log:**
- Updated `src/packages/ui/button.tsx` to apply the MAS palette, add a `cta` variant, and unify transitions/focus rings for consistency.
- Lint run blocked by pre-existing issues in other components (POS, Portal, PaperShader, StatusIndicator, themeStore); no changes applied to stay within scope.
- Variant matrix:
  - Primary — default `bg-[#EE766D] text-[#24242E]` · hover `bg-[#e55e54]` · focus offset `#D6D6D6` · disabled tone reductions.
  - Secondary — default `bg-[#D6D6D6] text-[#24242E]` · hover `bg-[#c6c6c6]` · focus offset `#D6D6D6` · softened disabled palette.
  - Outline — default `border/text #24242E` on transparent · hover fills `#24242E` with `#D6D6D6` text · focus offset `#D6D6D6` · muted disabled border/text.
  - Ghost — default text `#24242E` · hover surface `#D6D6D6`/70 · focus offset `#D6D6D6` · low-emphasis disabled text.
  - CTA — default `bg-[#24242E] text-[#D6D6D6]` with shadow · hover swaps to `bg-[#EE766D] text-[#24242E]` · focus offset `#24242E` · dimmed disabled state.

---

## Agent 9 — Forms & Inputs
**Scope:** Input fields, contact forms, search bars.  
**Tasks:**  
- Style inputs and textareas.  
- Apply palette + typography.  
- Add focus states and validation feedback.  
- Document changes.  
**Status:** TODO  
**Log:**  

---

## Agent 10 — Database/Functionality Checks
**Scope:** Ensure functional logic and DB integration still work after UI changes.  
**Tasks:**  
- Verify forms still submit correctly.  
- Confirm API/data fetching unaffected.  
- Log any issues needing backend fixes.  
**Status:** TODO  
**Log:**  
