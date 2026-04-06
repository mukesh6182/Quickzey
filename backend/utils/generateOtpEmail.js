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
  <div style="max-width: 600px; margin: auto; font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: #009688; color: #fff; text-align: center; padding: 30px;">
      <h1 style="margin: 0; font-size: 32px; letter-spacing: 1px;">Quickzey</h1>
      <p style="margin: 8px 0 0; font-size: 16px;">Secure Password Reset</p>
    </div>

    <!-- Body -->
    <div style="background-color: #f0fdfd; padding: 35px; text-align: center;">
      <p style="font-size: 18px; color: #004d4d;">
        Hello <strong>${name}</strong>,
      </p>

      <p style="font-size: 15px; color: #006666; line-height: 1.7; margin-bottom: 30px;">
        We received a request to reset your <strong>Quickzey</strong> password.  
        Please use the OTP below to continue securely.
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

      <p style="font-size: 14px; color: #004d4d;">
        This OTP is valid for <strong>10 minutes</strong>.  
        If you did not request a password reset, please ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #009688; color: #fff; text-align: center; padding: 25px; font-size: 13px;">
      <p style="margin: 5px 0;">Your security is our priority.</p>
      <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Quickzey. All rights reserved.</p>
    </div>

  </div>
  `;
};

const generateOrderConfirmationEmail = (name, orderId, products, totalAmount, address) => {

  const productRows = products.map(p => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e0f2f1;">${p.name}</td>
      <td style="padding:12px;border-bottom:1px solid #e0f2f1;text-align:center;">${p.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #e0f2f1;text-align:right;">₹${p.price}</td>
      <td style="padding:12px;border-bottom:1px solid #e0f2f1;text-align:right;">₹${p.price * p.quantity}</td>
    </tr>
  `).join('');

  return `
  <div style="max-width:600px;margin:auto;font-family:'Poppins','Helvetica Neue',Helvetica,Arial,sans-serif;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#009688;color:#fff;text-align:center;padding:30px;">
      <h1 style="margin:0;font-size:32px;letter-spacing:1px;">Quickzey</h1>
      <p style="margin:8px 0 0;font-size:16px;">Your Delivery, Our Priority</p>
    </div>

    <!-- Body -->
    <div style="background:#f0fdfd;padding:35px;">

      <p style="font-size:18px;color:#004d4d;">
        Hello <strong>${name}</strong>,
      </p>

      <p style="font-size:15px;color:#006666;line-height:1.7;margin-bottom:25px;">
        🎉 Your order has been <strong>successfully placed</strong> with <strong>Quickzey</strong>.
        We're preparing your items and will deliver them soon.
      </p>

      <p style="font-size:14px;color:#004d4d;margin-bottom:20px;">
        <strong>Order ID:</strong> ${orderId}
      </p>

      <!-- Product Table -->
      <table style="width:100%;border-collapse:collapse;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <thead>
          <tr style="background:#009688;color:white;">
            <th style="padding:12px;text-align:left;">Product</th>
            <th style="padding:12px;text-align:center;">Qty</th>
            <th style="padding:12px;text-align:right;">Price</th>
            <th style="padding:12px;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <!-- Total -->
      <div style="margin-top:20px;text-align:right;">
        <p style="font-size:18px;color:#004d4d;">
          <strong>Total Amount: ₹${totalAmount}</strong>
        </p>
      </div>

      <!-- Address -->
      <div style="margin-top:25px;padding:15px;background:#ffffff;border-radius:10px;border:1px solid #e0f2f1;">
        <p style="margin:0;font-size:14px;color:#004d4d;">
          <strong>Delivery Address:</strong><br>
          ${address.addressLine}<br>
          ${address.landmark ? address.landmark + "<br>" : ""}
          ${address.city}, ${address.state} - ${address.pincode}
        </p>
      </div>

      <p style="margin-top:25px;font-size:14px;color:#006666;">
        Thank you for choosing <strong>Quickzey</strong>. We appreciate your trust and look forward to delivering your order quickly.
      </p>

    </div>

    <!-- Footer -->
    <div style="background:#009688;color:#fff;text-align:center;padding:25px;font-size:13px;">
      <p style="margin:5px 0;">Need help? Contact Quickzey Support.</p>
      <p style="margin:5px 0;">&copy; ${new Date().getFullYear()} Quickzey. All rights reserved.</p>
    </div>

  </div>
  `;
};
const generateDeliveryAssignmentEmail = (name, otp, partnerName, partnerPhone, orderId) => {
  return `
  <div style="max-width: 600px; margin: auto; font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">

    <div style="background: #009688; color: #fff; text-align: center; padding: 30px;">
      <h1 style="margin: 0; font-size: 32px; letter-spacing: 1px;">Quickzey</h1>
      <p style="margin: 8px 0 0; font-size: 16px;">Your Order is on its way!</p>
    </div>

    <div style="background-color: #f0fdfd; padding: 35px; text-align: center;">
      <p style="font-size: 18px; color: #004d4d; margin-bottom: 15px;">
        Great news, <strong>${name}</strong>!
      </p>
      <p style="font-size: 15px; color: #006666; line-height: 1.7; margin-bottom: 25px;">
        Your order <strong>#${orderId.slice(-6).toUpperCase()}</strong> has been picked up and is now <strong>Out for Delivery</strong>.
      </p>

      <div style="background: #ffffff; border: 1px solid #b2dfdb; border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: left;">
        <h4 style="margin: 0 0 10px 0; color: #00796b; font-size: 16px; border-bottom: 1px solid #e0f2f1; padding-bottom: 8px;">Delivery Partner Details</h4>
        <p style="margin: 8px 0; color: #004d40;"><strong>Name:</strong> ${partnerName}</p>
        <p style="margin: 8px 0; color: #004d40;"><strong>Contact:</strong> ${partnerPhone}</p>
      </div>
      
      <p style="font-size: 14px; color: #004d4d; margin-bottom: 10px; font-weight: 600;">Share this OTP with the partner at the door:</p>
      <div style="margin-bottom: 30px;">
        <span style="
          display: inline-block;
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, #004d40 0%, #009688 50%, #4db6ac 100%);
          padding: 15px 40px;
          border-radius: 12px;
          letter-spacing: 8px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size: 13px; color: #00796b;">
        Please do not share this OTP over the phone. Only provide it when the partner arrives.
      </p>
    </div>

    <div style="background: #009688; color: #fff; text-align: center; padding: 25px; font-size: 13px;">
      <p style="margin: 5px 0;">Track your order live in the Quickzey app.</p>
      <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} Quickzey. All rights reserved.</p>
    </div>
  </div>
  `;
};


module.exports = {
  generateOtpEmail,
  generateForgotPasswordEmail,
  generateOrderConfirmationEmail,
  generateDeliveryAssignmentEmail
};

