import { format, parseISO } from 'date-fns';

export function exportAppointmentsPDF(appointments, dateStr) {
  import('jspdf').then(({ default: jsPDF }) => {
    import('jspdf-autotable').then(({ default: autoTable }) => {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 18;

      // Header
      doc.setFillColor(10, 110, 189);
      doc.rect(0, 0, pageW, 34, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text('MediHub Care Platform', margin, 14);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      const displayDate = dateStr ? format(parseISO(dateStr), 'EEEE, dd MMMM yyyy') : format(new Date(), 'EEEE, dd MMMM yyyy');
      doc.text(`Appointment Schedule — ${displayDate}`, margin, 23);
      doc.text(`Printed: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageW - margin, 23, { align: 'right' });

      // Sort appointments by time
      const sorted = [...appointments].sort((a, b) => a.time.localeCompare(b.time));

      // Summary
      doc.setTextColor(26, 43, 60);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text(`Total Appointments: ${sorted.length}`, margin, 42);
      const confirmed = sorted.filter(a => a.status === 'Confirmed').length;
      doc.text(`Confirmed: ${confirmed}  |  Pending: ${sorted.length - confirmed}`, margin, 49);

      // Table
      autoTable(doc, {
        startY: 56,
        margin: { left: margin, right: margin },
        head: [['#', 'Time', 'Patient Name', 'Hospital ID', 'Doctor', 'Type', 'Duration', 'Status', 'Details']],
        body: sorted.map((a, i) => [
          i + 1,
          a.time,
          a.patientName,
          a.patientId,
          a.doctorName,
          a.type,
          `${a.duration || 30} min`,
          a.status,
          a.details || '—',
        ]),
        headStyles: { fillColor: [10, 110, 189], fontSize: 8.5, fontStyle: 'bold', textColor: 255 },
        bodyStyles: { fontSize: 8.5, textColor: [26, 43, 60] },
        alternateRowStyles: { fillColor: [248, 251, 255] },
        columnStyles: {
          0: { cellWidth: 8 }, 1: { cellWidth: 14 }, 2: { cellWidth: 30 },
          3: { cellWidth: 18 }, 4: { cellWidth: 30 }, 5: { cellWidth: 20 },
          6: { cellWidth: 16 }, 7: { cellWidth: 18 },
        },
      });

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const fY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(8); doc.setTextColor(140, 160, 180);
        doc.text('MediHub Care Platform — Confidential', margin, fY);
        doc.text(`Page ${i} of ${totalPages}`, pageW - margin, fY, { align: 'right' });
      }

      doc.save(`Appointments_${dateStr || format(new Date(), 'yyyy-MM-dd')}.pdf`);
    });
  });
}
