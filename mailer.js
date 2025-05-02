import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const getMailerConfig = (code) => {
  const host = process.env[`MAIL_${code}_HOST`];
  const port = process.env[`MAIL_${code}_PORT`];
  const user = process.env[`MAIL_${code}_USER`];
  const pass = process.env[`MAIL_${code}_PASS`];

  if (!host || !port || !user || !pass) {
    throw new Error(`Missing SMTP config for code: ${code}`);
  }

  return { host, port, user, pass };
};

export const sendEmail = async ({ to, subject, html, text, code }) => {
  const { host, port, user, pass } = getMailerConfig(code);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port == 465,
    auth: { user, pass },
  });

  return await transporter.sendMail({
    from: user,
    to,
    subject,
    text,
    html,
  });
};
