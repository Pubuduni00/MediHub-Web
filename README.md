# 🏥 MediHub Web Application

A modern healthcare management and patient monitoring web application designed to streamline appointment scheduling, patient records, doctor availability, and real-time medical alert management.

---

## ✨ Features

- **📊 Dashboard & Analytics:** Comprehensive overview of daily appointments, patient statistics, and status metrics powered by `Recharts`.
- **📅 Appointment Management:** Interactive calendar system for booking, rescheduling, and viewing doctor & patient appointments.
- **🩺 Doctor Directory & Availability:** Manage doctor profiles, schedule availability, and filter appointments by specialist.
- **📁 Patient Records & Medical Logs:** Maintain patient histories, update status logs, and log symptom updates seamlessly.
- **🚨 Emergency Alert Monitoring:** Real-time symptom alert tracking for doctors and medical staff to respond promptly to patient needs.
- **📄 PDF Export & Reports:** Generate and export medical reports, prescriptions, and appointment receipts using `jsPDF`.
- **🔐 Google Authentication:** Secure login integration via `@react-oauth/google`.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router DOM v6
- **UI & Icons:** Lucide React Icons, Custom CSS
- **Data Visualization & Date Libraries:** Recharts, `react-calendar`, `react-datepicker`, `date-fns`
- **PDF Generation:** `jspdf`, `jspdf-autotable`
- **Authentication:** `@react-oauth/google`

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- `npm` (v8.0.0 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pubuduni00/MediHub-Web.git
   cd MediHub-Web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
MediHub-Web/
├── public/                 # Static assets & HTML template
├── src/
│   ├── components/         # Reusable UI components (alerts, appointments, auth, layout, etc.)
│   ├── pages/              # Main application pages (Dashboard, Patients, Doctors, Alerts, etc.)
│   ├── App.js              # Main application router
│   ├── index.js            # React entry point
│   └── index.css           # Global design system & utility styles
├── package.json            # Project dependencies & scripts
└── README.md               # Project documentation
```

---

## 📄 License

This project is part of the Software Project module (SEM 06). All rights reserved.
