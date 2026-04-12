# Prompt: Implementing Appwrite Storage for Portfolio Images

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We are adding image upload functionality to our recently refactored `src/screens/ProfessionalProfileSetup.js`. We want Professionals to upload a "Cover Image" of their work. We are operating within an Appwrite free-tier constraint, so we must utilize our existing storage bucket ID defined in `appwriteConfig.js`.

## 2. Technical Requirements
* **Library:** We have installed `expo-image-picker`.
* **State Management:** Add a state variable `const [portfolioImage, setPortfolioImage] = useState(null)`.
* **UI Integration:** * Add a styled touchable area (using `theme.colors`) at the top of the form. 
  * If `portfolioImage` is null, display placeholder text like "Tap to upload cover photo". 
  * If it has a URI, display the actual `<Image />`.
* **Upload & Save Logic:** * Create a helper function `pickImage` to launch the image library.
  * Update the `handleSave` function:
    1. First, check if `portfolioImage` exists.
    2. If yes, convert the local URI into an Appwrite-compatible file object format (e.g., `{ name: 'photo.jpg', type: 'image/jpeg', uri: portfolioImage }`).
    3. Use `storage.createFile(appwriteConfig.photosBucketId, ID.unique(), file)` to upload it to the cloud.
    4. Retrieve the public view URL using `storage.getFileView(appwriteConfig.photosBucketId, fileId)`.
    5. Append this `imageUrl` to the `documentData` payload *before* calling `databases.createDocument()`.

## 3. Deliverable
Please provide the updated code for `src/screens/ProfessionalProfileSetup.js`. Ensure you include robust `try/catch` error handling for both the image picking phase and the Appwrite storage upload phase. Provide loading state indicators while the image is uploading.


also please implement this aswell
Go to src/config/appwriteConfig.js. We need to add the Storage service and your exact Bucket ID. Update it to look like this:

import { Client, Account, Databases, Storage, ID } from 'react-native-appwrite'; // Added Storage and ID

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'my_PROJECT_ID', 
    databaseId: 'my_DATABASE_ID', 
    stylistsCollectionId: 'my_TABLE_ID', 
    photosBucketId: '699b5359003c85dc59ce', // <-- Your exact bucket ID
};

// ... existing client setup ...

export const databases = new Databases(client);
export const storage = new Storage(client); // <-- Export the storage module