# Prompt: Client-Side Stylist Profile & Booking Engine

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We are bridging the Client and Professional user flows. We need to create a new screen where Clients can view a Stylist's full profile and send a booking request directly to our Appwrite `Appointments` table.

## 2. Technical Requirements: The Profile Screen
* **Create File:** `src/screens/StylistProfileScreen.js`.
* **Data Intake:** The screen receives the selected stylist object via React Navigation params (`route.params.stylist`).
* **UI Layout:**
  * Top: The stylist's cover photo (if `stylist.image` exists, else a placeholder).
  * Middle: `businessName`, `startingPrice`, and mapped chips for `hairTypes` and `services`.
  * Bottom: A prominent "Request Appointment" button (using `theme.colors.primary`).

## 3. Technical Requirements: The Booking Modal
* When the user clicks "Request Appointment", open a `Modal`.
* **Modal State:** `serviceRequested` (TextInput), `appointmentDate` (TextInput - e.g., YYYY-MM-DD), `appointmentTime` (TextInput - e.g., 14:00).
* **Appwrite Integration:** * Import `useAuth` to get the logged-in Client's data (`user.$id`, `user.name` or email).
  * Import `databases`, `DATABASE_ID`, and `APPOINTMENTS_COLLECTION_ID`.
  * Create a `handleBookingSubmit` function. It calls `databases.createDocument(DATABASE_ID, APPOINTMENTS_COLLECTION_ID, ID.unique(), payload)`.
  * **The Payload:** ```javascript
    {
      professionalId: stylist.$id,
      clientId: user.$id,
      clientName: user.name || 'Acutz Client',
      serviceRequested: serviceRequested,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      status: 'Pending'
    }
    ```
  * On success, close the modal and show an `Alert.alert('Success', 'Booking request sent!')`.

## 4. Technical Requirements: Navigation Update
* Update `src/components/StylistCard.js` (and/or Map Markers in `ClientHomeScreen`) so that wrapping it in a `TouchableOpacity` navigates to `StylistProfileScreen`, passing the `stylist` object as a param.

## 5. Deliverable
Please provide the complete `src/screens/StylistProfileScreen.js` code, and the snippet required to make `StylistCard.js` clickable for navigation. Ensure robust `try/catch` error handling during the Appwrite document creation.