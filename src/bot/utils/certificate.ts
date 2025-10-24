import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

export async function generateCertificate(fullName: string) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([600, 400]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawText('SERTIFIKAT', {
    x: 220,
    y: 320,
    size: 28,
    color: rgb(0, 0.3, 0.8),
    font,
  });
  page.drawText(`${fullName}`, {
    x: 200,
    y: 260,
    size: 20,
    color: rgb(0, 0, 0),
    font,
  });
  page.drawText('Siz 100 ball to‘plab, ajoyib natijaga erishdingiz!', {
    x: 100,
    y: 220,
    size: 14,
    color: rgb(0, 0, 0),
  });
  page.drawText('Kelgusi faoliyatingizda omad tilaymiz!', {
    x: 140,
    y: 180,
    size: 12,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdf.save();
  const pdfPath = path.resolve(
    `./certificate_${fullName.replace(/\s/g, '_')}.pdf`,
  );
  fs.writeFileSync(pdfPath, pdfBytes);
  return pdfPath;
}
