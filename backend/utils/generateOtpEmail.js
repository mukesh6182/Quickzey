const generateOtpEmail = (name, otp) => {
  return `
  <div style="max-width: 600px; margin: auto; font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">

    <!-- Header (PURE TEAL) -->
    <div style="background: #009688; color: #fff; text-align: center; padding: 30px;">
      <h1 style="margin: 0; font-size: 32px; letter-spacing: 1px;">Quickzey</h1>
      <p style="margin: 8px 0 0; font-size: 16px; font-weight: 400;">Your Delivery, Our Priority</p>
    </div>

    <!-- Body -->
    <div style="background-color: #f0fdfd; padding: 35px; text-align: center;">
      <p style="font-size: 18px; color: #004d4d; margin-bottom: 15px;">
        Hello <strong>${name}</strong>,
      </p>
      <p style="font-size: 15px; color: #006666; line-height: 1.7; margin-bottom: 30px;">
        Welcome to <strong>Quickzey</strong>! Use the OTP below to verify your email and start enjoying seamless deliveries.
      </p>
      
      <div style="margin-bottom: 30px;">
        <span style="
          display: inline-block;
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, #004d40 0%, #009688 50%, #4db6ac 100%);
          padding: 18px 35px;
          border-radius: 12px;
          letter-spacing: 5px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.25);
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size: 14px; color: #004d4d; margin-bottom: 0;">
        This OTP is valid for 10 minutes. Keep it confidential.
      </p>
    </div>

    <!-- Footer (PURE TEAL) -->
    <div style="background: #009688; color: #fff; text-align: center; padding: 25px; font-size: 13px;">
      <p style="margin: 5px 0;">If you did not request this, please ignore this email.</p>
      <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Quickzey. All rights reserved.</p>
    </div>
  </div>
  `;
};



const generateForgotPasswordEmail = (name, otp) => {
  return `
    <div style="max-width: 600px; margin: auto; font-family: 'Arial', sans-serif; border: 1px solid #e0e0e0; padding: 25px; background-color: #fefefe; border-radius: 12px;">
        <div style="text-align: center; padding-bottom: 15px;">
            <h1 style="color: #2c3e50; margin: 0;">Quickzey</h1>
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0;">Fast. Reliable. Smart.</p>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

        <p style="font-size: 16px; color: #34495e;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 15px; color: #555;">
          We received a request to reset your Quickzey password. Use the OTP below to reset it securely.
        </p>

        <div style="text-align: center; margin: 25px 0;">
            <div style="font-size: 26px; font-weight: bold; color: #c0392b; background-color: #f2d7d5; display: inline-block; padding: 12px 22px; border-radius: 8px; letter-spacing: 4px;">
                ${otp}
            </div>
        </div>

        <p style="font-size: 13px; color: #7f8c8d;">
          OTP valid for 10 minutes. If you didn’t request this, no changes were made.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

        <p style="font-size: 12px; color: #95a5a6; text-align: center;">
          Contact Quickzey support for any questions.
        </p>
    </div>
  `;
};

module.exports = {
  generateOtpEmail,
  generateForgotPasswordEmail
};
