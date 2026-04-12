# Prompt: Professional Dashboard & Profile Routing

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We are finalizing the Professional user flow for the "Acutz" app. Currently, professionals can write to the Appwrite `Stylists` table via `ProfessionalProfileSetup.js`. 
**Current Goal:** We need to update `src/screens/ProfessionalHomeScreen.js` to act as a dynamic dashboard. It must check if the logged-in user has a profile, prompt them to create one if they don't, or display their profile if they do.

## 2. Technical Requirements
* **Target File:** `src/screens/ProfessionalHomeScreen.js`
* **Dependencies:** Import `databases`, `DATABASE_ID`, `STYLISTS_COLLECTION_ID` from `appwriteConfig`. Import `Query` from `react-native-appwrite`. Import `useAuth` to get the current user.
* **State Management:**
  * `const [profile, setProfile] = useState(null)`
  * `const [isLoading, setIsLoading] = useState(true)`
* **Data Fetching (`useEffect`):**
  * On mount, fetch from the `Stylists` table where the `userId` column equals the current logged-in user's `$id` (`Query.equal('userId', user.$id)`).
  * If a document is found, set it to `profile`. If empty, keep `profile` as null.
  * Stop the loading spinner.

## 3. UI/UX Requirements
**Condition A: Loading**
* Show an `ActivityIndicator` centered on the screen.

**Condition B: No Profile Found (`profile === null`)**
* Display a welcome message ("Welcome to Acutz Professional").
* Display a primary call-to-action button: "Complete Your Business Profile".
* On press, navigate to the `ProfessionalProfileSetup` screen.

**Condition C: Profile Exists (`profile !== null`)**
* Build a clean "Dashboard" view.
* If `profile.image` exists, render it at the top as a large cover photo.
* Render the `profile.businessName` as a large header.
* Display their `startingPrice`.
* Map out their `hairTypes` and `services` as visual chips or comma-separated text.
* Include an "Edit Profile" button at the bottom (for now, this can just `console.log('Edit clicked')` or navigate to the setup screen).

## 4. Deliverable
Provide the complete, production-ready code for `src/screens/ProfessionalHomeScreen.js`. Ensure graceful error handling (e.g., if the network fails during the fetch) and strict adherence to our `theme.js` styling.