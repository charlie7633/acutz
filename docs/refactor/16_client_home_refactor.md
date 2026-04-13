# Prompt: Refactoring ClientHomeScreen via Custom Hooks

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We are refactoring `src/screens/ClientHomeScreen.js` to eliminate technical debt and adhere to the Separation of Concerns principle. The file currently acts as a "Fat Controller," handling UI, GPS location fetching, and Appwrite NoSQL querying simultaneously.

## 2. The Task: Create `useStylists` Hook
Create a new file: `src/hooks/useStylists.js`.
* Move the `fetchStylists` logic and its associated states (`stylists`, `isLoading`) from `ClientHomeScreen` into this hook.
* The hook must accept `activeFilters` as an argument.
* It must return `{ stylists, isLoading, fetchStylists }`.
* Ensure all necessary Appwrite imports (`databases`, `Query`, `appwriteConfig`) are moved to this file.

## 3. The Task: Create `useLocation` Hook
Create a new file: `src/hooks/useLocation.js`.
* Move the `expo-location` logic and states (`location`, `errorMsg`) from `ClientHomeScreen` into this hook.
* It must automatically request foreground permissions and fetch the user's current coordinates on mount.
* It must return `{ location, errorMsg }`.

## 4. The Task: Refactor `ClientHomeScreen.js`
* Import the new `useStylists` and `useLocation` hooks into `ClientHomeScreen.js`.
* Remove all the old, bulky `useEffect` and data-fetching logic.
* Initialize the data using the hooks: 
  `const { location } = useLocation();`
  `const { stylists, isLoading } = useStylists(activeFilters);`
* Ensure the `MapView` and `FilterModal` continue to function perfectly using these cleaner, abstracted variables.

## 5. Deliverable
Please provide the complete code for three files:
1. `src/hooks/useStylists.js`
2. `src/hooks/useLocation.js`
3. The newly refactored, much cleaner `src/screens/ClientHomeScreen.js`.