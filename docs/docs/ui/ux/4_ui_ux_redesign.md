# Prompt: UI/UX Redesign for Acutz Client Discovery Screen

**System Role:** Act as an expert Senior UX/UI Designer and React Native Developer. 

## 1. Project Context
I am building "Acutz", a premium mobile application in React Native. The platform connects clients with complex hair textures (specifically 3B, 3C, 4A, 4B, 4C) to verified hair professionals who specialize in those textures. 

## 2. The Task
I need you to completely redesign the "Client Discovery Screen" (the main homepage with the map). I need a sleek, high-end, highly functional interface that feels like a premium salon booking experience.

## 3. Strict Color Palette (Do Not Deviate)
Do NOT invent new color schemes. You must stick strictly to this specific earthy/nude brand identity, alongside standard Black and White to ensure high-contrast accessibility:

* **App Backgrounds & Cards:** `#FFFFFF` (White) and `[E0AAFF]`
* **Primary Text & High-Contrast Icons:** `#000000` (Black)
* **Primary Brand Accents (Main Buttons, Active States):** `[10002B]`
* **Secondary Accents (Filter Chips, Borders, Secondary Text):** `[5A189A]` and `[7B2CBF]`

## 4. Required UI Architecture
The screen must be composed of these specific layers:

### A. The Header & Search Layer (Floating)
* A clean top area floating over the map.
* A prominent search bar ("Search location or stylist...").
* Next to the search bar, a distinct **"Filter" button** (icon) using the Primary Brand Accent color. 
* *Crucial UX Rule:* Do NOT put a messy, unorganized scrolling list of tags on the main screen. 

### B. The Map Layer (Background)
* The map should be the full-screen background or a very large, elegantly rounded card.
* Elements (Search, Stylist Cards) should float on top of it.
* Map pins should be styled to look premium, utilizing the Darkest Brown or Black from the palette.

### C. The Stylist Results Layer (Bottom)
* An elegant, horizontal swipeable carousel of "Stylist Cards" floating at the bottom of the map.
* Each card MUST display: Stylist Name, Rating (★ 4.8), Starting Price, and visual "Tags" of their specialties.

### D. The Filter Modal (Bottom Sheet)
* When the user clicks the "Filter" button, a clean Bottom Sheet modal slides up.
* This modal must contain a **Structured Filtering System**.
* **Section 1: Hair Texture:** Selectable chips for `1A-2C`, `3A`, `3B`, `3C`, `4A`, `4B`, `4C`.
* **Section 2: Service Needed:** Selectable chips for `Barber`, `Loctician`, `Hairdresser`, `Braider`, `Colorist`.
* *Interaction Design:* Unselected chips should use the Light Beige/White with a Taupe border. Selected chips should fill with the Darkest Brown or Black, with White text.

## 5. Deliverable
Please generate the complete, production-ready React Native code (`StyleSheet` preferred) for this screen and its accompanying Filter Modal. Ensure the code is clean, well-commented, and applies the color palette exactly as specified.