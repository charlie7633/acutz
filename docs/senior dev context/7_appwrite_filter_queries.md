# Prompt: Implementing Appwrite Queries for Client Map Filters

**System Role:** Act as an expert Senior React Native Developer and Appwrite Database Architect.

## 1. Project Context
We are building "Acutz", a React Native app connecting clients with complex hair textures (3B-4C) to specialized hair professionals. 
Currently, our `ClientHomeScreen.js` successfully fetches ALL stylists from the Appwrite `Stylists` table and plots them on the map. We also have a `FilterModal` component built in the UI.
**Current Goal:** We need to connect the `FilterModal` state to the Appwrite `listDocuments` call using Appwrite `Query` methods, so the map updates dynamically based on user selection.

## 2. Technical Requirements (Appwrite Queries)
We are querying the Appwrite `Stylists` table.
* The columns `hairTypes` and `services` are stored as **Text Arrays**.
* We must import `Query` from `react-native-appwrite`.
* If a user selects a filter, we must pass an array of queries to `databases.listDocuments()`.
* We should use `Query.contains('hairTypes', selectedHairType)` and `Query.contains('services', selectedService)` to filter the arrays.

## 3. The Task: Update `ClientHomeScreen.js`
Modify the existing `ClientHomeScreen.js` to implement this logic:

### A. State Management
* Ensure there is state to hold the active filters: `const [activeFilters, setActiveFilters] = useState({ hairType: null, service: null })`.
* Ensure the `FilterModal` component's `onApplyFilters` prop correctly updates this `activeFilters` state.

### B. Dynamic Fetching Function
* Update the `fetchStylists` function to accept the `activeFilters` as an argument (or rely on the state).
* Build the Appwrite query array dynamically:
  ```javascript
  const queries = [];
  if (activeFilters.hairType) {
    queries.push(Query.contains('hairTypes', activeFilters.hairType));
  }
  if (activeFilters.service) {
    queries.push(Query.contains('services', activeFilters.service));
  }
  Pass this queries array into databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries)
  C. UI Reactivity
Add activeFilters to the dependency array of the useEffect hook that calls fetchStylists(). This ensures that every time the user applies a new filter, the map automatically re-fetches and re-renders only the matching pins.

4. Deliverable
Please provide the updated, production-ready React Native code for ClientHomeScreen.js. Ensure the Appwrite Query import is included and the useEffect logic cleanly handles the dynamic re-fetching.