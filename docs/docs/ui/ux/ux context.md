# Acutz UI/UX Context & Design System

This document serves as the single source of truth for all UI, UX, and styling decisions for the Acutz application. Any new screens, components, or features MUST adhere to these guidelines to ensure a consistent, premium user experience that meets the FYP University Rubric standards.

---

## 1. Brand Identity & Color Palette

Acutz aims for a **Premium, High-End Salon Booking Experience**. The color palette bridges an earthy, sophisticated nude aesthetic with high-contrast accessibility and sleek dark mode capabilities (such as the map interface).

### Core Colors
*   **White / Backgrounds:** `#FFFFFF` (Primary light background)
*   **Card/Accent Secondary:** `#E0AAFF` (Soft premium purple/pink accent, used for glows, auras, and secondary buttons)
*   **Primary Brand Accent:** `#10002B` (Very dark, deep purple/black – used for main backgrounds, active states, and heavy emphasis)
*   **Secondary Accent 1:** `#5A189A` (Medium-dark purple – used for borders, tags, and map pin accents)
*   **Secondary Accent 2:** `#7B2CBF` (Lighter vibrant purple – used for glass overlays and secondary borders)

### Neutral & Earthy Tones
*   **True Black:** `#000000` (Used for absolute contrast, premium map pins)
*   **Dark Panel:** `#090014` (Used for bottom sheets, modals, and dark card backgrounds)
*   **Glass Overlay:** `rgba(90, 24, 154, 0.35)` (Translucent purple for floating headers and frosted glass effects)
*   **Muted Text:** `#A0A0A0` or `#888888` (Used for placeholders, subtext, and deactivated states)
*   *Note: For light modes, earthy/nude counterparts like `#F8F5F2` (Light Nude) and `#E0D5C1` (Taupe/Beige) are permitted for filter chips and borders according to previous prompts, but must maintain strict contrast ratios against the dark brand accents.*

---

## 2. Core UI Architecture & Layout Rules

### Floating Elements & Modals
To provide a sleek, modern app feel (especially on map screens):
*   **Header Blocks:** Floating headers (`position: 'absolute'`) wrapped in `SafeAreaView` with a frosted glass (`glassOverlay`) search bar. Avoid chunky, static nav bars.
*   **Bottom Sheets & Modals:** Use smoothly rounded bottom sheets (`borderTopLeftRadius: 30`, `borderTopRightRadius: 30`) with a dark panel background (`#090014`) for filters, options, and results. Sheets should have a subtle handle slider on top.
*   **Carousels:** Use horizontal, swipeable carousels (`ScrollView` or `FlatList` with `snapToInterval`) for cards (e.g., Stylist Cards) floating above the base layout.

### Stylist & Service Cards
*   Cards must have deep rounded corners (`borderRadius: 20`).
*   Elevation and Shadow: Ensure cards pop off the background with a soft, widespread shadow (`shadowOpacity: 0.3, shadowRadius: 10`).
*   Required Data: Cards must cleanly display Stylist Name, Rating (with a gold star/accent), Starting Price, and visual Tags inside pill-shaped chips.

### Map Interfaces
*   Always use `userInterfaceStyle="dark"` for the `MapView` to fit the premium salon aesthetic.
*   Custom Pins: Use custom `Marker` views with strict borders, utilizing `#000` custom pins with Glowing Auras (`rgba(224, 170, 255, 0.25)`) beneath them to make them "pop" against the dark map.

---

## 3. FYP Academic & Structural Integrity (The "Viva" Rule)

*   **Zero UI Monoliths:** Do not build 500-line screens containing full UI styling. Every distinct visual block (e.g., `HomeHeader`, `FilterModal`, `StylistCard`) MUST be extracted to `src/components/`.
*   **StyleSheet Separation:** Keep styling organized cleanly at the bottom of the component file. 
*   **Readability Prioritized:** UI logic must be easy to read and explain to a university examiner. Name your view containers semantically (e.g., `searchRow`, `cardHeader`, `pinGlow`).
