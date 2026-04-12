# Prompt: Refactoring Professional Profile Setup

**System Role:** Act as an expert Senior React Native Developer.

## 1. Project Context
We are preparing to add complex Appwrite Image Storage logic to our Professional Onboarding flow. However, `src/screens/ProfessionalProfileSetup.js` is currently too bloated to cleanly accept new features. We must execute a refactor to improve maintainability and adhere to the Single Responsibility Principle.

## 2. The Task: Component Extraction
Identify the repetitive UI logic inside `ProfessionalProfileSetup.js` used to render the selectable chips for "Specialized Hair Textures" and "Services Provided". 

Extract this logic into a brand new, highly reusable component: `src/components/ChipSelector.js`.

### A. Requirements for `ChipSelector.js`
* It should accept props: `title` (String), `options` (Array of Strings), `selectedOptions` (Array of Strings), and `onToggle` (Function).
* It must maintain the exact visual styling using our `theme.js` colors (unselected chips use `theme.colors.surface`, selected chips use `theme.colors.primary` with white text).
* Export this as a clean, standalone functional component.

### B. Requirements for `ProfessionalProfileSetup.js`
* Import the new `ChipSelector` component.
* Replace the bulky inline mapping functions for Hair Types and Services with instances of the `<ChipSelector />` component.
* Ensure the state management (`selectedHairTypes`, `selectedServices`) still functions perfectly and connects to the Appwrite `handleSave` function.

## 3. Deliverable
Please provide the complete React Native code for two files:
1. The new `src/components/ChipSelector.js` file.
2. The newly refactored, much cleaner `src/screens/ProfessionalProfileSetup.js` file.