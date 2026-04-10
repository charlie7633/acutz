# Prompt: Client Map Appwrite Integration & Config Update

**System Role:** Act as an expert Senior React Native Developer and Appwrite Database Architect.

## 1. Project Context
We are building "Acutz", a React Native app connecting clients with complex hair textures (3B-4C) to specialized hair professionals. 
We have successfully restructured our Appwrite database to a highly optimized NoSQL format using the TablesDB API, and the Professional "Write" pipeline is fully functional. 
**Current Goal:** We need to update our environment configuration and engineer the Client Discovery Map to fetch and display live Stylist data from the cloud.

## 2. Step 1: Configuration Update
Our Appwrite database IDs have changed. First, update the `src/config/appwriteConfig.js` file to strictly use these new IDs:
* **Database ID:** `69d8e2130010bd3fbf52`
* **Table/Collection ID:** `stylists`
(Ensure the exported constants reflect these exact string values so our app routes correctly to the new `AcutzDB`).

## 3. Step 2: Client Map Integration (The Task)
Update our existing `src/screens/ClientHomeScreen.js` component to include the following logic:

### A. State Management & Data Fetching
* Import `databases`, along with the updated Database and Collection ID constants from `../config/appwriteConfig`.
* Create state variables: `const [stylists, setStylists] = useState([])` and `const [isLoading, setIsLoading] = useState(true)`.
* Create an asynchronous `fetchStylists` function inside a `useEffect` hook that runs on component mount. Use `databases.listDocuments()` to fetch the entire list of Stylists. 
* Implement robust `try/catch` error handling and ensure `isLoading` is set to `false` in a `finally` block.

### B. Map Markers Integration
* Inside the `MapView` component, map over the fetched `stylists` array.
* For each valid stylist (ensure `latitude` and `longitude` exist), render a `react-native-maps` `<Marker>` component.
* Use the stylist's `latitude` and `longitude` for the `coordinate` prop.
* Set the `title` to `businessName` and the `description` to "Starting at £[startingPrice]".

### C. The Stylist Carousel Integration
* We have a horizontal container at the bottom of the screen rendering `StylistCard` components.
* Pass the fetched `stylists` array into this list. The `StylistCard` component must now accept real props from the database (e.g., `businessName`, `startingPrice`, `hairTypes` array, `services` array) instead of hardcoded mock data.

## 4. Deliverable
Please provide:
1. The updated code for `src/config/appwriteConfig.js`.
2. The complete, production-ready React Native code for `src/screens/ClientHomeScreen.js`. 
Ensure all logic adheres to our `theme.js` styling and standard component architecture.