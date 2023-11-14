import * as nodeMailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

const transporterDetails = smtpTransport({
  host: "mail.ghorbany.dev",
  port: 465,
  secure: true,
  auth: {
    user: "toplearn@ghorbany.dev",
    pass: "toplearn123456"
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendEmail = (
  email: string,
  fullname: string,
  subject: string,
  message: string
): void => {
  const transporter = nodeMailer.createTransport(transporterDetails);
  transporter.sendMail({
    from: "toplearn@ghorbany.dev",
    to: email,
    subject: subject,
    html: `<h1> سلام ${fullname}</h1>
            <p>${message}</p>`
  });
};
