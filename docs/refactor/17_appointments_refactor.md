# Prompt: Refactoring Appointment Logic via Custom Hooks

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We are continuing our structural refactoring to enforce Separation of Concerns. Both `ClientAppointmentsScreen.js` and `ProfessionalHomeScreen.js` contain redundant Appwrite NoSQL querying logic for the `Appointments` table. We need to abstract this business logic into a single Custom Hook.

## 2. The Task: Create `useAppointments.js` Hook
Create a new file: `src/hooks/useAppointments.js`.
* **Dependencies:** Import `databases`, `Query`, `appwriteConfig`.
* **State:** `appointments` (array), `isLoading` (boolean), `error` (string/null).
* **Fetching Logic:** * Create a function `fetchAppointments(role, userId)`. 
  * If `role === 'client'`, use `Query.equal('clientId', userId)`.
  * If `role === 'professional'`, use `Query.equal('professionalId', userId)`.
* **Mutation Logic:** Move the `updateAppointmentStatus(appointmentId, newStatus)` function from `ProfessionalHomeScreen` into this hook so it can manage its own state updates.
* **Return:** `{ appointments, isLoading, error, fetchAppointments, updateAppointmentStatus }`.

## 3. The Task: Refactor the Screens
**Refactor `src/screens/ClientAppointmentsScreen.js`:**
* Import `useAppointments`.
* Remove all local Appwrite fetching logic. Initialize the hook, passing `'client'` and the `user.$id` to fetch the data. 

**Refactor `src/screens/ProfessionalHomeScreen.js`:**
* Import `useAppointments`.
* Remove all local Appwrite Appointment fetching and updating logic. Initialize the hook, passing `'professional'` and the `user.$id`. Use the returned `updateAppointmentStatus` for the Accept/Decline buttons.
* *(Note: Keep the Professional Profile fetching logic intact in this file for now, only abstract the Appointments).*

## 4. Deliverable
Please provide the complete, updated code for THREE files:
1. `src/hooks/useAppointments.js`
2. `src/screens/ClientAppointmentsScreen.js`
3. `src/screens/ProfessionalHomeScreen.js`
Ensure the UI components in both screens continue to render perfectly using the abstracted hook data.