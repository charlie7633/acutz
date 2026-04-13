# Prompt: Client Appointments Dashboard

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We are completing the Client user flow. Clients can currently create bookings in the `Appointments` table. We now need a dedicated screen for them to view the status of their bookings (Pending, Confirmed, or Declined).

## 2. Technical Requirements: Fetching
* **Create File:** `src/screens/ClientAppointmentsScreen.js`
* **Dependencies:** Import `databases`, `DATABASE_ID`, `APPOINTMENTS_COLLECTION_ID` from `appwriteConfig`. Import `Query` from `react-native-appwrite`. Import `useAuth` to get the logged-in Client's `user.$id`.
* **State Management:** `const [appointments, setAppointments] = useState([])` and `const [isLoading, setIsLoading] = useState(true)`.
* **Data Fetching:** * Use a `useEffect` to fetch documents from the `Appointments` table where `clientId` equals the current `user.$id` (`Query.equal('clientId', user.$id)`).
  * Order the results by date if possible, or just standard list order.

## 3. UI Requirements
* **Screen Header:** "My Appointments"
* **Loading State:** Standard `ActivityIndicator` centered.
* **Empty State:** If `appointments` is empty, show text: "You have no booking requests."
* **The List:** Map over the `appointments` array and render an `AppointmentCard` for each.
  * Display `serviceRequested`, `appointmentDate`, and `appointmentTime`.
  * **Status Badge:** Display the `status` prominently. 
    * If `Pending`, color the text/badge Orange/Warning.
    * If `Confirmed`, color it Green/Success.
    * If `Declined`, color it Red/Danger.
    * *(Use our `theme.js` colors where applicable).*

## 4. Navigation Integration
* Update `src/screens/ClientHomeScreen.js` (The Map Screen). Add a prominent button or icon in the top header (or a floating action button) that says "My Appointments" or uses a calendar icon.
* Clicking this should navigate the user to the new `ClientAppointmentsScreen`.

## 5. Deliverable
Provide the complete code for `src/screens/ClientAppointmentsScreen.js` and the updated code snippet for `ClientHomeScreen.js` showing how to navigate to it. Ensure error handling and clean UI.