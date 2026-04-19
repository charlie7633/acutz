# Acutz ✂️

A full-stack, two-sided marketplace mobile application connecting clients with specialized hair professionals. Built with React Native, Expo, and Appwrite.

## 📱 Project Overview

This application was developed as a final year dissertation project to solve the friction in discovering and booking specialized hair services. It features a complete lifecycle for two distinct user types: Professionals and Clients. 

### 🚀 Live Demo & Walkthrough
> **Note to Recruiters:** https://canva.link/cn9dn98e6vokmsn

## ✨ Core Features
### 🧠 Architecture Highlights
* **Strategic NoSQL Denormalization:** Engineered the `Appointments` collection to embed relational client data, guaranteeing O(1) query speeds for the mobile UI without costly SQL-style client-side joins.
* **REST API Storage Bypass:** Overcame leaky SDK abstractions by engineering a direct native `fetch` HTTP bypass to securely push `multipart/form-data` binary image assets to Appwrite Cloud Storage.
* **Custom Hook Data Layer:** Strictly enforced the Separation of Concerns (SoC) and DRY principles by abstracting all asynchronous NoSQL mutations and hardware interfacing (GPS) into polymorphic React Hooks (e.g., `useAppointments`, `useLocation`).

* 
### For Clients
* **Interactive Map Discovery:** Locate nearby stylists using map integration.
* **Smart Filtering:** Filter professionals based on specific hair types, services, and location.
* **Seamless Booking:** View stylist portfolios and book available time slots in real-time.
* **Appointment Management:** Track upcoming and past appointments.

### For Professionals
* **Custom Onboarding:** Set up working hours, location (GPS), and specific service offerings.
* **Profile Management:** Manage a public-facing portfolio and dashboard.
* **Real-Time Schedule:** Receive and manage client bookings instantly through the appointment dashboard.

## 🛠 Tech Stack

* **Frontend:** React Native, Expo
* **Backend as a Service (BaaS):** Appwrite (Authentication, Databases, Storage)
* **Navigation:** React Navigation
* **Maps:** React Native Maps

## ⚙️ Getting Started (Running Locally)

To run this project locally on your machine, follow these steps:

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [Git](https://git-scm.com/) installed
* [Expo Go](https://expo.dev/go) app installed on your iOS or Android device (or an emulator)
* An active [Appwrite](https://appwrite.io/) instance/cloud account

### 1. Clone the repository
git clone https://github.com/charlie7633/acutz.git
cd acutz
2. Install dependencies
npm install
3. Run the application and scan the qr code presents
npx expo start
👨‍💻 Author
Charles Ogunsanya * https://www.linkedin.com/in/charles-ogunsanya-b7954a206/


