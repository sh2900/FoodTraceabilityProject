const nodemailer = require('nodemailer');

const sendAlertEmail = async (batchId, temperature, stage, recipientEmail = 'alerts@tracechain.com') => {
  try {
    // Generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();

    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"TraceChain Alerts" <noreply@tracechain.com>',
      to: recipientEmail, 
      subject: `🚨 CRITICAL ALERT: Batch ${batchId} Temperature Breach`,
      text: `Warning: Batch ${batchId} has reached a critical temperature of ${temperature}°C during the ${stage} stage. Immediate action is required to prevent spoilage.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ef4444;">🚨 Critical Temperature Alert</h2>
          <p><strong>Batch ID:</strong> ${batchId}</p>
          <p><strong>Current Stage:</strong> ${stage}</p>
          <p><strong>Recorded Temp:</strong> <span style="color: #ef4444; font-weight: bold;">${temperature}°C</span></p>
          <hr />
          <p>This temperature exceeds the maximum safe threshold. Immediate corrective action is required to prevent product spoilage and maintain cold-chain integrity.</p>
        </div>
      `,
    });

    console.log("-----------------------------------------");
    console.log("📩 Alert Email Sent successfully!");
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("Failed to send alert email:", error);
  }
};

module.exports = { sendAlertEmail };
