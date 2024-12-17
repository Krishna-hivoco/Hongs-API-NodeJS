import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export default async function sendmail(msg) {
  await transporter.sendMail({
    from: '"Hongs Kitchen alerts" <hongskitchenalerts@gmail.com>',
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
  });
}
