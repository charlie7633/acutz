# Prompt: Updating Stylist Card with Cloud Images

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We have successfully implemented a cloud storage pipeline. Our Appwrite `Stylists` database table now includes an optional `image` column, which contains a direct URL to a professional's cover photo.
**Current Goal:** We need to update the `src/components/StylistCard.js` component to render these live images on the Client Map carousel.

## 2. Technical Requirements
* **Target File:** `src/components/StylistCard.js`
* **Data Source:** The component receives a `stylist` prop (which contains the row data from Appwrite). We must extract the `image` string from this object.
* **UI Updates:**
  * Import the `Image` component from `react-native`.
  * Locate the existing avatar/placeholder view inside the card.
  * Implement conditional rendering: 
    * If `stylist.image` exists and is a valid string, render `<Image source={{ uri: stylist.image }} style={styles.avatar} />` (or whatever your image style is named). Ensure the `resizeMode` is set appropriately (e.g., `'cover'`).
    * If `stylist.image` is null or undefined, gracefully fall back to the existing placeholder UI (using our `theme.colors`).
* **Styling:** Ensure the image fits perfectly within the existing layout of the card without breaking the boundaries or pushing the text off-screen. Add a subtle border radius to the image if necessary to match the theme.

## 3. Deliverable
Please provide the updated, production-ready React Native code for `src/components/StylistCard.js`. Ensure the conditional rendering logic is robust and prevents crashes if an image URL is missing.