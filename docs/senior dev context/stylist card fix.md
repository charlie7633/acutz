# Stylist Card Image Upload — Debugging Journey

## Overview
This document details the full debugging process for integrating cloud-hosted portfolio images into the Acutz Stylist Cards via Appwrite Storage. What appeared to be a straightforward image upload feature revealed a chain of five distinct bugs, each masking the next, ultimately caused by an incompatibility between the `react-native-appwrite` SDK and React Native's file handling system.

**Duration:** ~1.5 hours of active debugging  
**Files Affected:** `ProfessionalProfileSetup.js`, `StylistCard.js`, `appwriteConfig.js`  
**Stack:** React Native (Expo SDK 54), react-native-appwrite v0.24.1, Appwrite Cloud (Frankfurt)

---

## The Goal
Allow professionals to upload a cover photo during onboarding. The image would be stored in an Appwrite Storage bucket, and the resulting public URL would be saved as a string in the `image` field of the `stylists` collection. The `StylistCard.js` component on the Client Map would then render these images dynamically.

---

## Bug #1: `storage.getFileView()` Returns an Object, Not a String

### Symptom
After a professional uploaded an image and saved their profile, the Stylist Card on the Client Map showed nothing — a completely transparent space where the image should be.

### Investigation
A red debug `<Text>` element was injected into `StylistCard.js` to display the raw value of `stylist.image`. It rendered:
```
URL: [object Object]
```

### Root Cause
The `react-native-appwrite` SDK's `storage.getFileView()` method does not return a plain URL string. Instead, it returns a **URL polyfill object**. When this object was saved to the Appwrite database, it was serialised as the literal string `"[object Object]"`.

React Native's `<Image source={{ uri: ... }} />` component requires a plain string URI. Receiving `"[object Object]"` caused it to look for a local file called `[object Object].png` inside the Expo Go app bundle, which obviously didn't exist.

### Fix Applied
Replaced the SDK's `getFileView()` call with a manually constructed REST URL string:
```javascript
// Before (broken)
const fileViewUrl = storage.getFileView(bucketId, uploadedFile.$id);
finalImageUrl = fileViewUrl.href || fileViewUrl.toString();

// After (fixed)
finalImageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${uploadedFile.$id}/view?project=PROJECT_ID`;
```

---

## Bug #2: Hardcoded File Size Corrupting Uploads

### Symptom
After fixing Bug #1, new uploads still produced invisible images. The Appwrite Storage bucket showed files being created, but with suspiciously small file sizes (e.g., 21 bytes for what should be a 700KB photo).

### Root Cause
The initial implementation hardcoded `size: 1024` in the file upload object:
```javascript
const file = {
  uri: portfolioImage,
  name: `cover_${Date.now()}.jpg`,
  type: 'image/jpeg',
  size: 1024,  // ← Hardcoded! Appwrite truncated the file at 1KB
};
```
Appwrite used this `size` value to determine how many bytes to read from the upload stream, resulting in a truncated, corrupt file.

### Fix Applied
First attempted to use `expo-file-system` to read the true file size dynamically:
```javascript
const fileInfo = await FileSystem.getInfoAsync(portfolioImage.uri);
size: fileInfo.size
```
This was later superseded by removing the `size` property entirely (see Bug #3).

---

## Bug #3: Extra `size` Property Causing React Native to Serialise the Object

### Symptom
Even with the correct file size, uploaded files were exactly **13 bytes** — the length of the string `"[object File]"`.

### Root Cause
React Native's native HTTP networking layer has an undocumented behaviour: when a FormData file descriptor object contains properties beyond the standard three (`uri`, `name`, `type`), it falls back to calling `.toString()` on the object instead of streaming the binary file data. Adding `size` as a fourth property triggered this fallback, causing React Native to literally upload the text string `"[object File]"` instead of the image bytes.

### Fix Applied
Removed the `size` property entirely:
```javascript
const file = {
  uri: portfolioImage.uri,
  name: portfolioImage.fileName || `cover_${Date.now()}.jpg`,
  type: portfolioImage.mimeType || 'image/jpeg'
  // No size property — React Native handles this natively
};
```

---

## Bug #4: `storage.createFile()` Returns `undefined`

### Symptom
After cleaning up the file object, calling `storage.createFile()` no longer threw an error, but `uploadedFile` was `undefined`. Accessing `uploadedFile.$id` then crashed with:
```
Cannot read property '$id' of undefined
```

### Root Cause
The `react-native-appwrite` SDK's `storage.createFile()` method is not properly adapted for React Native's file handling. When passed a plain `{uri, name, type}` object, it silently fails and returns `undefined`. When passed a `Blob` (created via `fetch(uri).then(r => r.blob())`), it uploads *something* but strips the MIME type metadata, causing Appwrite to store the file as `application/octet-stream`.

### Fix Applied
This was the critical realisation — the SDK's `createFile()` could not be trusted for React Native file uploads under any input format. See Bug #5 for the final solution.

---

## Bug #5: Blob Uploads Stored Without MIME Type

### Symptom
Using the Blob approach, `createFile()` returned a valid file ID and the URL was correctly constructed and stored in the database. However, the iOS `<Image>` component reported:
```
IMAGE ERROR: Unknown image download error
```

### Investigation
`curl` confirmed the `/view` endpoint returned `HTTP 200`, proving the file existed. However, because the Blob was uploaded without filename or content-type metadata, Appwrite served the file with incorrect response headers. iOS's image decoder rejected it as an unrecognised format.

Additionally, the `/preview` endpoint (which generates server-side thumbnails) returned `HTTP 403 Forbidden` due to stricter permission requirements than the `/view` endpoint.

### Root Cause
The `react-native-appwrite` SDK's `createFile()` method fundamentally cannot handle React Native file uploads correctly. It fails across all input formats:
- Plain `{uri, name, type}` object → returns `undefined`  
- `Blob` from `fetch().blob()` → uploads bytes but loses MIME type
- Adding `size` property → triggers `.toString()` serialisation

### Final Fix — Bypass the SDK Entirely
Replaced the SDK's `storage.createFile()` with a direct `fetch` POST to the Appwrite REST API using React Native's native `FormData`:

```javascript
const formData = new FormData();
formData.append('fileId', ID.unique());
formData.append('file', {
  uri: portfolioImage.uri,
  name: portfolioImage.fileName || `cover_${Date.now()}.jpg`,
  type: portfolioImage.mimeType || 'image/jpeg',
});

const uploadResponse = await fetch(
  `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files`,
  {
    method: 'POST',
    headers: { 'X-Appwrite-Project': 'PROJECT_ID' },
    body: formData,
  }
);

const uploadedFile = await uploadResponse.json();
finalImageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${uploadedFile.$id}/view?project=PROJECT_ID`;
```

**Why this works:** React Native's native `fetch` implementation has special handling for `FormData` file descriptors with `{uri, name, type}`. It directly streams the binary file data from the device filesystem to the server, preserving the filename and MIME type in the multipart form headers. This is the standard, battle-tested approach for file uploads in React Native.

---

## StylistCard.js — Conditional Image Rendering

The `StylistCard.js` component was updated with conditional rendering to handle both states:

```jsx
{stylist.image && typeof stylist.image === 'string' ? (
  <Image source={{ uri: stylist.image }} style={styles.cardImage} />
) : (
  <View style={styles.placeholderImage}>
    <Ionicons name="image-outline" size={40} color={COLORS.cardSecondary} />
  </View>
)}
```

- **With image URL:** Renders the cloud-hosted photo with `resizeMode: 'cover'`
- **Without image URL:** Shows a styled purple placeholder with an icon

---

## Key Takeaways

1. **SDK abstractions can be leaky.** The `react-native-appwrite` SDK appeared to work (no errors thrown) but silently produced corrupt outputs. Always verify end-to-end with real data.

2. **React Native file uploads have strict requirements.** The `FormData` file descriptor must contain exactly `{uri, name, type}` — no more, no less. Extra properties trigger a serialisation fallback.

3. **Direct REST APIs are more reliable than SDKs in cross-platform contexts.** When an SDK doesn't work, dropping down to the raw HTTP API with `fetch` gives you full control and predictable behaviour.

4. **Debug visually in the UI, not just the console.** Injecting visible debug text directly into the component (`<Text style={{color:'red'}}>`) was what finally revealed the `[object Object]` bug that console logs alone couldn't surface.

5. **Appwrite's `/view` and `/preview` endpoints have different permission requirements.** The `/preview` endpoint (server-side image resizing) returned `403 Forbidden` while `/view` (raw file) returned `200 OK` under the same bucket permissions.

---

## Appwrite Bucket Configuration (Required)

For the image upload pipeline to work, the Storage bucket must have:
- **File Security:** OFF (disabled)
- **Permissions:**
  - `Users` → Create (allows logged-in professionals to upload)
  - `Any` → Read (allows the image URLs to be publicly accessible on the Client Map)