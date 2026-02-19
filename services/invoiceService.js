const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateInvoice = (player, payment) => {
  return new Promise((resolve) => {
    const fileName = `invoice_${player._id}.pdf`;
    const filePath = path.join(
      __dirname,
      "../invoices",
      fileName
    );

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(18).text("Cricket Tournament Invoice");
    doc.moveDown();

    doc.text(`Player: ${player.name}`);
    doc.text(`Team: ${player.teamName}`);
    doc.text(`Payment ID: ${payment.paymentId}`);
    doc.text(`Amount: ₹${payment.amount}`);

    doc.end();

    resolve(filePath);
  });
};
