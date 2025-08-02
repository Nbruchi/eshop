import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ejs from 'ejs';
import path from 'path';

dotenv.config();

const port = Number(process.env.SMTP_PORT || 587);
const secure = port === 465; // true for 465, false for other ports

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure, // auto-detect based on port
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const renderTemplatee = (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    'apps',
    'auth-service',
    'src',
    'utils',
    'emails',
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, data);
};

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    const html = await renderTemplatee(templateName, data);
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.log(`Error sending email:`, error);
    return false;
  }
};
