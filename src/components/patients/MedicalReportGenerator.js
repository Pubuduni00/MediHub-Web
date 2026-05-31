import React from 'react';
import { FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { format } from 'date-fns';

export default function MedicalReportGenerator({ patient }) {
  const { isDoctor, user } = useAuth();
  const { getLogsForPatient, getPrescriptionsForPatient } = useData();

  const handleGenerate = () => {
    if (!isDoctor) return;
    const logs = getLogsForPatient(patient.id);
    const prescriptions = getPrescriptionsForPatient(patient.id);
    generatePDF(patient, logs, prescriptions, user);
  };

  return (
    <div className="tooltip-wrapper">
      <button
        className="btn btn-primary btn-sm"
        onClick={handleGenerate}
        disabled={!isDoctor}
        title={!isDoctor ? 'Only doctors can generate medical reports' : 'Generate Medical Report'}
        style={{ opacity: isDoctor ? 1 : 0.5, cursor: isDoctor ? 'pointer' : 'not-allowed' }}
      >
        <FileText size={14}/> Generate Medical Report
      </button>
      {!isDoctor && <span className="tooltip">Only doctors can generate medical reports</span>}
    </div>
  );
}

function generatePDF(patient, logs, prescriptions, doctor) {
  // Dynamic import for jsPDF to avoid bundle issues
  import('jspdf').then(({ default: jsPDF }) => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin;

      // ── Header ──
      doc.setFillColor(10, 110, 189);
      doc.rect(0, 0, pageW, 38, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20); doc.setFont('helvetica','bold');
      doc.text('MediHub Care Platform', margin, 16);
      doc.setFontSize(10); doc.setFont('helvetica','normal');
      doc.text('CONFIDENTIAL MEDICAL REPORT', margin, 24);
      doc.text(`Generated: ${format(new Date(),'dd MMMM yyyy, HH:mm')}`, margin, 31);
      doc.text(`Issued by: ${doctor?.name || 'N/A'}`, pageW - margin, 31, { align:'right' });

      y = 50;
      doc.setTextColor(26, 43, 60);

      // ── Patient Details ──
      doc.setFillColor(232, 244, 253);
      doc.roundedRect(margin, y, pageW - margin*2, 44, 4, 4, 'F');
      doc.setFontSize(12); doc.setFont('helvetica','bold');
      doc.text('PATIENT INFORMATION', margin+6, y+9);
      doc.setFontSize(10); doc.setFont('helvetica','normal');
      const col1x = margin+6, col2x = pageW/2;
      const rows = [
        ['Full Name', patient.name, 'Hospital ID', patient.id],
        ['Date of Birth', patient.dob || 'N/A', 'Age', `${patient.age} years`],
        ['Gender', patient.gender, 'Blood Group', patient.bloodGroup],
        ['NIC', patient.nic || 'N/A', 'Phone', patient.phone],
      ];
      rows.forEach((row, i) => {
        const rowY = y + 16 + i*7;
        doc.setFont('helvetica','bold'); doc.text(row[0]+':', col1x, rowY);
        doc.setFont('helvetica','normal'); doc.text(row[1]||'N/A', col1x+32, rowY);
        doc.setFont('helvetica','bold'); doc.text(row[2]+':', col2x, rowY);
        doc.setFont('helvetica','normal'); doc.text(row[3]||'N/A', col2x+32, rowY);
      });
      y += 52;

      // ── Visit History ──
      if (logs.length > 0) {
        doc.setFontSize(12); doc.setFont('helvetica','bold');
        doc.setTextColor(10,110,189);
        doc.text('VISIT HISTORY & CLINICAL NOTES', margin, y);
        doc.setTextColor(26,43,60);
        y += 6;

        logs.slice().reverse().forEach((log, idx) => {
          if (y > 240) { doc.addPage(); y = 20; }

          // Visit header bar
          doc.setFillColor(248, 251, 255);
          doc.setDrawColor(200,218,236);
          doc.roundedRect(margin, y, pageW-margin*2, 8, 2, 2, 'FD');
          doc.setFontSize(9.5); doc.setFont('helvetica','bold');
          doc.text(`Visit ${logs.length - idx}: ${log.date} — ${log.doctorName}`, margin+4, y+5.5);
          y += 11;

          const exam = log.examination || {};
          if (exam.diagnosis) {
            doc.setFontSize(9); doc.setFont('helvetica','bold');
            doc.text('Diagnosis: ', margin+4, y);
            doc.setFont('helvetica','normal');
            doc.setTextColor(231,76,60);
            doc.text(exam.diagnosis, margin+26, y);
            doc.setTextColor(26,43,60);
            y += 6;
          }
          if (exam.chiefComplaint) {
            doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.text('Complaint: ', margin+4, y);
            doc.setFont('helvetica','normal'); doc.text(exam.chiefComplaint, margin+26, y); y += 6;
          }
          if (exam.bp || exam.pulse || exam.temp) {
            doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.text('Vitals: ', margin+4, y);
            doc.setFont('helvetica','normal');
            let vitals = [];
            if (exam.bp) vitals.push(`BP: ${exam.bp} mmHg`);
            if (exam.pulse) vitals.push(`Pulse: ${exam.pulse} bpm`);
            if (exam.temp) vitals.push(`Temp: ${exam.temp}°C`);
            if (exam.spo2) vitals.push(`SpO₂: ${exam.spo2}%`);
            if (exam.weight) vitals.push(`Wt: ${exam.weight}kg`);
            doc.text(vitals.join('  |  '), margin+20, y); y += 6;
          }
          if (exam.clinicalFindings) {
            doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.text('Findings: ', margin+4, y);
            doc.setFont('helvetica','normal');
            const lines = doc.splitTextToSize(exam.clinicalFindings, pageW-margin*2-34);
            doc.text(lines, margin+24, y); y += lines.length*5+2;
          }
          if (exam.plan) {
            doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.text('Plan: ', margin+4, y);
            doc.setFont('helvetica','normal');
            const lines = doc.splitTextToSize(exam.plan, pageW-margin*2-22);
            doc.text(lines, margin+18, y); y += lines.length*5+2;
          }
          // Drugs
          if (log.drugs && log.drugs.length > 0) {
            doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(10,110,189);
            doc.text('Medications:', margin+4, y); y += 5;
            doc.setTextColor(26,43,60);
            log.drugs.forEach(d => {
              doc.setFont('helvetica','normal'); doc.setFontSize(8.5);
              doc.text(`• ${d.drug} ${d.dose} — ${d.frequency} for ${d.duration} (${d.mealInstruction})`, margin+8, y); y+=5;
            });
          }
          y += 4;
        });
      }

      // ── Current Prescriptions ──
      if (prescriptions.length > 0 && y < 260) {
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFontSize(12); doc.setFont('helvetica','bold');
        doc.setTextColor(10,110,189);
        doc.text('CURRENT PRESCRIPTIONS', margin, y);
        doc.setTextColor(26,43,60);
        y += 8;
        const latest = prescriptions[prescriptions.length-1];
        if (latest.drugs) {
          latest.drugs.forEach(d => {
            doc.setFontSize(9); doc.setFont('helvetica','normal');
            doc.text(`• ${d.drug} ${d.dose} — ${d.frequency} for ${d.duration} (${d.mealInstruction})`, margin+4, y); y+=6;
          });
        }
      }

      // ── Footer ──
      const totalPages = doc.internal.getNumberOfPages();
      for (let i=1; i<=totalPages; i++) {
        doc.setPage(i);
        const fY = doc.internal.pageSize.getHeight() - 12;
        doc.setFillColor(240,245,252);
        doc.rect(0, fY-4, pageW, 16, 'F');
        doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(90,113,132);
        doc.text('This report is confidential and intended for the named recipient only. MediHub Care Platform.', margin, fY+2);
        doc.text(`Page ${i} of ${totalPages}`, pageW-margin, fY+2, { align:'right' });
        doc.setDrawColor(10,110,189,0.3);
        doc.line(margin, fY-4, pageW-margin, fY-4);
      }

      doc.save(`Medical_Report_${patient.name.replace(/\s+/g,'_')}_${patient.id}.pdf`);
    });
  });
}
