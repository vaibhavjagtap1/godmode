import jsPDF from 'jspdf';

export const exportPdf = (title: string, payload: object) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFontSize(16);
  doc.text('BehindTheEmail Intelligence Report', 40, 40);
  doc.setFontSize(10);
  doc.text(new Date().toISOString(), 40, 58);
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(JSON.stringify(payload, null, 2), 515);
  doc.text(lines, 40, 80);
  doc.save(`${title}.pdf`);
};
