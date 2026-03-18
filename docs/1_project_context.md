# Project Context: Acutz

## 1. Project Overview
**Acutz** is a high-fidelity mobile application prototype designed for a Final Year Project (FYP) in Computer Science. Its primary goal is to match clients who have complex hair types (specifically 3B-4C textures) with verified hair professionals who specialize in those exact textures.

## 2. Core Stakeholders
The application has two distinct user journeys:
- **Clients:** Users looking for specialized hair care. They need to be able to search, filter by hair type (e.g., 4C), view verified portfolios, and book appointments.
- **Professionals (Stylists):** Users providing hair care. They need a dashboard to upload portfolio images, tag their work with specific hair types, and manage client bookings.

## 3. Technology Stack & Architecture
- **Frontend Framework:** React Native (using Expo for rapid cross-platform development on a Windows environment testing on an iOS device).
- **Backend-as-a-Service (BaaS):** Appwrite (Switched from Firebase to accommodate budget constraints regarding storage for portfolio images).
- **IDE:** Google Project IDX, utilizing an AI-assisted "Building Block" development methodology.
- **Architecture Pattern:** Component-based architecture with strict Separation of Concerns (UI components, Screens, and API config separated).

## 4. Current State & Immediate Goals
- **Current State:** Role Selection and Appwrite initialization are complete. Currently refactoring a monolithic `App.js` into separated components.
- **Next Phase:** Implementing Appwrite Authentication (Login/Register) and the Database schema for Professional portfolios.