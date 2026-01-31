import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, institute } = body;

    // 1. Forward to Formspree (Admin Notification) - Non-blocking
    fetch("https://formspree.io/f/myzwaopp", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5s timeout to avoid hanging resources
    }).catch(err => console.error("Formspree submission failed:", err));

    // 2. Send Confirmation Email to User via Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: '"Question Hive" <support@questionhive.in>', // sender address
        to: email, // list of receivers
        subject: "Thank you for contacting Question Hive! 🐝", // Subject line
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Question Hive</title>
              <style>
                  body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
                  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-top: 40px; margin-bottom: 40px; }
                  .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 40px; text-align: center; }
                  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
                  .content { padding: 40px; color: #334155; line-height: 1.6; }
                  .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 20px; }
                  .message-box { background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; border-radius: 4px; margin: 20px 0; color: #475569; }
                  .cta-container { text-align: center; margin: 35px 0; }
                  .button { background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: background-color 0.2s; }
                  .button:hover { background-color: #1d4ed8; }
                  .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
                  .links { margin: 15px 0; }
                  .links a { color: #2563eb; text-decoration: none; margin: 0 10px; font-weight: 500; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                       <!-- If you have a hosted logo URL, replace 'Question Hive' text with an <img> -->
                      <h1>Question Hive</h1>
                  </div>
                  <div class="content">
                      <div class="greeting">Hello ${name},</div>
                      
                      <p>Thank you for reaching out to us! We have successfully received your inquiry regarding <strong>${institute}</strong>.</p>
                      
                      <p>Our team is reviewing your details and will get back to you shortly to discuss how we can help you save hours each week on assessment creation.</p>
                      
                      <div class="message-box">
                          "Question Hive handles the formatting so you can focus on the teaching."
                      </div>
                      
                      <p>In the meantime, did you know you can start creating papers right away completely for free?</p>
                      
                      <div class="cta-container">
                          <a href="https://questionhive.in" class="button">Start Creating for Free</a>
                      </div>
                      
                      <p>Best regards,<br>The Question Hive Team</p>
                  </div>
                  <div class="footer">
                      <p>&copy; ${new Date().getFullYear()} Question Hive. All rights reserved.</p>
                      <div class="links">
                          <a href="https://questionhive.in">Website</a> • 
                          <a href="https://questionhive.in/privacy">Privacy</a> • 
                          <a href="https://questionhive.in/terms">Terms</a>
                      </div>
                      <p>You received this email because you contacted us via our website.</p>
                  </div>
              </div>
          </body>
          </html>
        `,
      });
    } catch (mailError) {
      console.error("Nodemailer failed:", mailError);
      // We might return a success for the form submission even if the confirmation email fails,
      // but alerting the user is helpful. For now, we log it.
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
