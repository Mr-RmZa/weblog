import * as nodeMailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

const transporterDetails = smtpTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT!),
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = (
  email: string,
  fullName: string,
  subject: string,
  message: string
): void => {
  const transporter = nodeMailer.createTransport(transporterDetails);
  transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: subject,
    html: `<h1> سلام ${fullName}</h1>
            <p>${message}</p>`,
  });
};
