# MediHub Web Application

MediHub is a web-based healthcare management application built for doctors and medical staff to manage appointments, patient records, doctor availability, and symptom alerts. This project was developed as part of the Year 3 Semester 6 Software Project module.

## Features

- **Dashboard:** Overview of appointment statistics and patient activity.
- **Appointments Management:** Schedule, edit, view, and manage doctor and patient appointments.
- **Doctor Availability:** Set and manage daily available time slots for doctors.
- **Patient Records & History:** View patient profiles, medical logs, and clinical history.
- **Symptom Alerts:** Track patient-reported symptoms and alert levels in real time.
- **PDF Export:** Download appointment schedules and patient reports as PDF documents.

## Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express, PostgreSQL
- **Authentication:** Google OAuth
- **Libraries:** Recharts, Lucide Icons, jsPDF

## How to Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pubuduni00/MediHub-Web.git
   cd MediHub-Web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend server:**
   ```bash
   npm start
   ```

4. **Start the backend server:**
   ```bash
   cd server
   npm install
   npm start
   ```

## Project Structure

```text
MediHub-Web/
├── public/                 # Static assets
├── server/                 # Backend Node.js / Express API & Database
├── src/
│   ├── components/         # UI components
│   ├── context/            # React Context (Auth, Data)
│   ├── pages/              # Main application pages
│   ├── App.js              # Main App Router
│   └── index.js            # React entry point
└── package.json
```
