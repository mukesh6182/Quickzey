// utils/sendMail.js
const nodemailer = require('nodemailer');
require('dotenv').config();
const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Quickzey Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Failed to send email:', err);
    throw err;
  }
};

module.exports = sendMail;
