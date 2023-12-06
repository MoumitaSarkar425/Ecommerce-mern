const nodeMailer = require('nodemailer');


const sendEmail = async(options)=>{
    const transporter = nodeMailer.createTransport({
        host:"smtp.gmail.com",
        posrt:465,
        secure: true,
        service:process.env.SMPT_SERVICE,
        auth: {
          user: process.env.SMPT_MAIL,
          pass: process.env.SMPT_PASSWORD,
        },
      });

      const mailOptions = {
  
        // It should be a string of sender email
        from: process.env.SMPT_MAIL,
          
        // Comma Separated list of mails
        to: options.email,
      
        // Subject of Email
        subject: options.subject,
          
        // This would be the text of email body
        text: options.message
    };

    await transporter.sendMail(mailOptions);
}
module.exports = sendEmail;