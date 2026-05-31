import { format } from 'date-fns';

export function exportDoctorsPDF(doctors) {
  import('jspdf').then(({ default: jsPDF }) => {
    import('jspdf-autotable').then(({ default: autoTable }) => {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 18;

      // Header
      doc.setFillColor(10, 110, 189);
      doc.rect(0, 0, pageW, 34, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text('MediHub Care Platform', margin, 14);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text('Doctor Directory Report', margin, 23);
      doc.text(`Generated: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}`, pageW - margin, 23, { align: 'right' });

      doc.setTextColor(26, 43, 60);
      doc.setFontSize(10);
      doc.text(`Total Doctors: ${doctors.length}  |  Active: ${doctors.filter(d=>d.status==='Active').length}`, margin, 42);

      autoTable(doc, {
        startY: 48,
        margin: { left: margin, right: margin },
        head: [['Employee ID', 'Name', 'Specialty', 'Department', 'Email', 'Phone', 'Qualification', 'Schedule', 'Join Date', 'Status']],
        body: doctors.map(d => [
          d.employeeId, d.name, d.specialty, d.department,
          d.email, d.phone || '—', d.qualification || '—',
          d.schedule || '—', d.joinDate, d.status,
        ]),
        headStyles: { fillColor: [10, 110, 189], fontSize: 8, fontStyle: 'bold', textColor: 255 },
        bodyStyles: { fontSize: 8, textColor: [26, 43, 60] },
        alternateRowStyles: { fillColor: [248, 251, 255] },
        didDrawCell: (data) => {
          // Color the status cell
          if (data.section === 'body' && data.column.index === 9) {
            const status = data.cell.raw;
            const color = status === 'Active' ? [39, 174, 96] : [140, 160, 180];
            doc.setTextColor(...color);
            doc.setFontSize(8);
            doc.text(status, data.cell.x + 2, data.cell.y + data.cell.height / 2 + 1);
          }
        },
      });

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const fY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(8); doc.setTextColor(140, 160, 180);
        doc.text('MediHub Care Platform — Doctor Directory', margin, fY);
        doc.text(`Page ${i} of ${totalPages}`, pageW - margin, fY, { align: 'right' });
      }

      doc.save(`Doctor_Directory_${format(new Date(),'yyyy-MM-dd')}.pdf`);
    });
  });
}
