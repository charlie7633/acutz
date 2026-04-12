# Prompt: Profile Edit Mode & Interactive Map Location

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We are upgrading `src/screens/ProfessionalProfileSetup.js`. It must now handle real GPS coordinates via an interactive Map Modal, and serve as both a "Create" and "Edit" screen (the 'U' in CRUD).

## 2. Interactive Map Requirements (Location Selection)
* **Dependencies:** Import `MapView`, `Marker` from `react-native-maps`. Import `* as Location from 'expo-location'`.
* **State:** Add `[location, setLocation] = useState(null)`, `[isMapVisible, setIsMapVisible] = useState(false)`, `[searchQuery, setSearchQuery] = useState('')`, and `[mapRegion, setMapRegion] = useState(null)`.
* **The UI Trigger:** Add a styled button: "📍 Set Business Location". When pressed, it opens a `Modal` containing the map.
* **Inside the Map Modal:**
  * **Search Bar:** A `TextInput` at the top for an address. Include a "Search" button next to it. On press, use `Location.geocodeAsync(searchQuery)`. If successful, update the `mapRegion` and `location` state to those coordinates.
  * **The Map:** A `<MapView>` that takes up the remaining modal space.
  * **The Pin:** A `<Marker>` that is `draggable`. When the user drags and drops the pin (`onDragEnd`), update the `location` state with the new coordinate.
  * **Default Center:** When the modal opens, attempt to grab the user's current device location (`Location.getCurrentPositionAsync`) just to center the map on their city, but let them drag the pin to the exact salon spot.
  * **Confirm Button:** A button at the bottom to close the modal. Change the main form button to "✅ Location Saved" once coordinates exist.

## 3. Technical Requirements: Edit Mode
* The screen will receive optional params via React Navigation: `route.params?.existingProfile`.
* **State Initialization:** If `existingProfile` exists, pre-fill ALL `useState` hooks with that data (e.g., `businessName`, pre-select the chips, pre-set the `portfolioImage` URL, and importantly, set the `location` state to `{latitude: existingProfile.latitude, longitude: existingProfile.longitude}`).
* **Save Logic Update:** Modify the `handleSave` function. 
  * Ensure the payload includes the `latitude` and `longitude` from state.
  * If `existingProfile` exists: use `databases.updateDocument(DATABASE_ID, STYLISTS_COLLECTION_ID, existingProfile.$id, documentData)`.
  * If it does NOT exist: keep the existing `createDocument` logic.

## 4. Deliverable
Provide the fully updated `src/screens/ProfessionalProfileSetup.js`. Ensure the Map Modal is styled cleanly (using `theme.js` where applicable) and does not permanently block the UI if permissions are denied.