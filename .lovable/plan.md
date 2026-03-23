

## 5 Corrections to the Landing Page

### 1. Remove hero right-side decorative shape
In `HeroSection.tsx`, remove the entire right column `div` (lines 69-82) containing the image and the blurred circle. This removes the abstract shape/wave. The hero becomes single-column with just the text content on the left. Also remove the `heroPattern` import (line 3) and the `lg:grid-cols-2` grid layout since there's no second column.

### 2. Remove headline gradient
In `HeroSection.tsx`, replace the `<span className="text-gradient">unica plataforma</span>` with plain text. The full h1 becomes one continuous string styled with `text-[#0F172A]` (or keep `text-foreground` since it maps to the same color).

### 3. Remove badge
In `HeroSection.tsx`, delete the entire badge wrapper div (lines 17-25) containing "Produtividade pessoal reinventada". No replacement.

### 4. Simplify feature card icons
In `FeaturesSection.tsx`, replace the icon container div (the `h-10 w-10 rounded-xl bg-accent/10` wrapper) with just the icon directly. Icon gets `h-6 w-6 text-[#00B4D8]` (24px) with `mb-4`, no background circle.

### 5. Update CTA texts
In `CTASection.tsx`:
- Title: "Tudo que você precisa. Em um lugar só."
- Subtitle: "Produtividade, família, negócios e bem-estar — organizados do seu jeito, no seu ritmo."
- Button stays unchanged.

### Files modified
- `src/components/landing/HeroSection.tsx` — changes 1, 2, 3
- `src/components/landing/FeaturesSection.tsx` — change 4
- `src/components/landing/CTASection.tsx` — change 5

