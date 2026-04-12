# Prompt: Professional Booking Dashboard

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We are implementing the "Booking Engine" for the Acutz Professional flow. We have created an `Appointments` table in Appwrite. We need to update `src/screens/ProfessionalHomeScreen.js` to display a list of incoming booking requests beneath the Professional's profile, and allow them to "Accept" or "Decline" pending requests.

## 2. Technical Requirements: Fetching Bookings
* **Dependencies:** Import the `APPOINTMENTS_COLLECTION_ID` (or equivalent) from `appwriteConfig`.
* **State:** Add `[appointments, setAppointments] = useState([])`.
* **Data Fetching:** * Inside the existing `fetchProfile` logic (or a new `fetchAppointments` function called after the profile is loaded), query the `Appointments` table.
  * Use `Query.equal('professionalId', user.$id)` to only fetch bookings meant for this specific professional.
  * Sort them by date or just display them as fetched. Set them to the `appointments` state.

## 3. Technical Requirements: Update Status Logic
* Create a function `updateAppointmentStatus(appointmentId, newStatus)`.
* It should call `databases.updateDocument(DATABASE_ID, APPOINTMENTS_COLLECTION_ID, appointmentId, { status: newStatus })`.
* Upon a successful update, modify the local `appointments` state to reflect the new status so the UI updates instantly without needing a full screen refresh.

## 4. UI Requirements
* Beneath the existing profile details on the dashboard, add a section title: "Upcoming Appointments".
* Map over the `appointments` array. For each appointment, render an `AppointmentCard` (you can build this inline or as a separate component).
* **Card Details:** Show `clientName`, `serviceRequested`, `appointmentDate`, and `appointmentTime`.
* **Card Actions (Conditional):**
  * If `status === 'Pending'`, show two buttons: "✅ Accept" and "❌ Decline". Pressing them triggers `updateAppointmentStatus`.
  * If `status === 'Confirmed'`, show a green text badge: "Confirmed".
  * If `status === 'Declined'`, show a red text badge: "Declined".
* If `appointments` is empty, show a fallback text: "You have no upcoming appointments."

## 5. Deliverable
Provide the fully updated `src/screens/ProfessionalHomeScreen.js` file. Ensure the UI remains clean, uses our `theme.js`, and gracefully handles the asynchronous status updates.