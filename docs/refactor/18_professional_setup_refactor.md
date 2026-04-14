# Prompt: Refactoring Professional Setup via Custom Hooks

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We are executing our final structural refactor. `src/screens/ProfessionalProfileSetup.js` is currently a monolith handling complex UI state, local file system access (`expo-image-picker`), Appwrite Storage multipart uploads, and NoSQL mutations. We must abstract the cloud integration logic into a custom hook.

## 2. The Task: Create `useProfileManager.js`
Create a new file: `src/hooks/useProfileManager.js`.
* **Dependencies:** Import `databases`, `storage`, `ID`, `appwriteConfig` from your config file.
* **State:** `const [isSaving, setIsSaving] = useState(false)`.
* **The Core Function:** Create a `saveProfile` function that accepts parameters: `(profileData, portfolioImageUri, location, existingProfile)`.
* **The Logic (Moved from Setup Screen):**
  1. Set `isSaving` to true.
  2. If `portfolioImageUri` exists AND is a local file (doesn't start with 'http'), convert it to a file object and upload it to the `photos` bucket using `storage.createFile`. Get the resulting View URL.
  3. Construct the `documentData` payload (combining `profileData`, the image URL, and `location` coordinates).
  4. If `existingProfile` exists, call `databases.updateDocument`.
  5. If it does not exist, call `databases.createDocument`.
  6. Return `{ success: true }` or throw an error.
  7. Set `isSaving` to false in a `finally` block.
* **Return:** `{ isSaving, saveProfile }`.

## 3. The Task: Refactor the Setup Screen
* Refactor `src/screens/ProfessionalProfileSetup.js`.
* Import the new `useProfileManager` hook.
* Remove all the Appwrite storage and database imports and logic from this file.
* Update the `handleSave` function in the UI to simply call `await saveProfile(...)`.
* If successful, show the success alert and navigate as usual.

## 4. Deliverable
Please provide the complete, updated code for TWO files:
1. `src/hooks/useProfileManager.js`
2. `src/screens/ProfessionalProfileSetup.js`
Ensure the UI maintains its exact functionality, just with the data layer cleanly abstracted.