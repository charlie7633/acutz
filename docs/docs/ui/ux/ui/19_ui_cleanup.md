# Prompt: UI Cleanup - Replacing Quick Filters with Appointments Button

**System Role:** Act as a Senior React Native Developer.

## 1. Context
We are performing a final UI polish on the Client Map view. We need to remove the non-functional "Quick Filters" chip row (the horizontal list showing "All", "4c Expert", etc.) and replace it with the main navigation button for the Client's Appointments dashboard.

## 2. The Task: Remove Quick Filters
* Locate the code rendering the horizontal `ScrollView` or `FlatList` containing the quick filter chips ("All", "4C Expert", "3b Locs", etc.). This might be inside `src/components/HomeHeader.js` or `src/screens/ClientHomeScreen.js`.
* Completely delete this UI element and its associated hardcoded mock data array.

## 3. The Task: Add "My Appointments" Button
* In the exact space where the chips used to be, add a prominent, styled `TouchableOpacity` button.
* **Text:** "📅 View My Appointments"
* **Styling:** Use our `theme.js` to make it look like a primary or secondary action button (e.g., `theme.colors.primary` background, white text, nice border radius, and padding). Ensure it fits cleanly below the search bar.
* **Action:** `onPress={() => navigation.navigate('ClientAppointments')}` *(Ensure the navigation prop is passed down or accessed via `useNavigation` if this is inside the Header component).*

## 4. Deliverable
Please provide the updated React Native code for the file that contained the Quick Filters (either `HomeHeader.js` or `ClientHomeScreen.js`). Ensure the new button renders beautifully and hooks up to the navigation system.