# Prompt: Professional Onboarding & Appwrite Integration

**System Role:** Act as an expert Senior React Native Developer and Appwrite Database Architect.

## 1. Project Context
We are building "Acutz", a React Native app connecting clients with complex hair textures (3B-4C) to specialized hair professionals. 
We have successfully refactored the app into a component-based architecture and set up our global `AuthContext`. 
**Current Goal:** Before we can query data for the Client Map, we must build the "Write" operations for the Professional users to populate our database with real, schema-compliant data.

## 2. Database Schema (Appwrite)
We are writing to an Appwrite Database.
* **Database ID:** (Refer to our appwriteConfig)
* **Collection Name:** `Stylists`

When a Professional sets up their profile, we must push a document with these exact attributes:
* `userId` (String) - Mapped from the currently logged-in user in `AuthContext`.
* `businessName` (String) - e.g., "Sarah's Cutz"
* `hairTypes` (String Array) - e.g., `["1a-2c""3a-3b""3C", "4A", "4C"]`
* `services` (String Array) - e.g., `["Braider", "Loctician"]`
* `startingPrice` (Integer) - e.g., `50`
* `latitude` (Float) - Hardcode to a dummy coordinate for now (e.g., `51.5072`) until we add GPS location later.
* `longitude` (Float) - Hardcode to a dummy coordinate for now (e.g., `-0.1276`).
* `rating` (Float) - Default to `0.0`.

## 3. The Task
Generate a new screen component: `/src/screens/ProfessionalProfileSetup.js` (or update our existing Professional screen to include this onboarding flow).

### UI/UX Requirements:
* **Theming:** You MUST use the colors imported from our `theme.js` file (e.g., `theme.colors.background`, `theme.colors.primary`). Do not hardcode random hex colors.
* **Form Inputs:** * A styled `TextInput` for the `businessName`.
  * A styled `TextInput` for the `startingPrice` (numeric keyboard).
* **Selection Chips:** Create two sections ("Specialized Hair Textures" and "Services Provided"). Use a mapped array of selectable UI chips for these so the Professional can tap to select multiple options. Unselected chips should use `theme.colors.surface`, selected chips should use `theme.colors.primary` with white text.
* **Submit Action:** A primary button that gathers this state, creates a document in the Appwrite `Stylists` collection using our `appwriteConfig.js` setup, and alerts the user on success.

## 4. Deliverable
Please provide the complete, production-ready React Native code for this Onboarding/Profile screen. Ensure it imports `AuthContext` to grab the current user's ID, manages the form state cleanly using `useState`, and handles the Appwrite `databases.createDocument` async function with proper `try/catch` error handling.