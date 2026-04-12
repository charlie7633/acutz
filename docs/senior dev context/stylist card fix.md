Root Cause
The react-native-appwrite SDK's storage.createFile() method is fundamentally broken for React Native file uploads — it doesn't properly handle mobile file objects, resulting in either undefined returns, [object Object] string uploads, or corrupt 13-byte files.

The Fix
Bypassed the SDK entirely and used React Native's native fetch + FormData to POST directly to the Appwrite REST API. This is the standard, reliable way to upload files from React Native — it properly streams real image bytes with correct MIME types.