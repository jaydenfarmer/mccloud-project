import { Resend } from "resend";
import {
  orderConfirmationEmail,
  orderShippedEmail,
  orderDeliveredEmail,
} from "./email-templates";
import { Order } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(order: Order) {
  if (!process.env.RESEND_API_KEY) {
    console.log(
      "📧 Would send order confirmation email to:",
      order.customerEmail
    );
    return { success: true, message: "Email service not configured" };
  }

  try {
    const template = orderConfirmationEmail(order);

    const { data, error } = await resend.emails.send({
      from: "Fresh Mushroom Farm <orders@yourdomain.com>",
      to: [order.customerEmail],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error("Email sending error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Order confirmation sent to:", order.customerEmail);
    return { success: true, data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendOrderStatusUpdate(order: Order, newStatus: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`📧 Would send ${newStatus} email to:`, order.customerEmail);
    return { success: true, message: "Email service not configured" };
  }

  try {
    let template;

    switch (newStatus) {
      case "shipped":
        template = orderShippedEmail(order);
        break;
      case "delivered":
        template = orderDeliveredEmail(order);
        break;
      default:
        console.log(`No email template for status: ${newStatus}`);
        return { success: true, message: "No email template for this status" };
    }

    const { data, error } = await resend.emails.send({
      from: "Fresh Mushroom Farm <orders@yourdomain.com>",
      to: [order.customerEmail],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error("Email sending error:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ ${newStatus} email sent to:`, order.customerEmail);
    return { success: true, data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendContactFormEmail(contactData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 Would send contact form email:", contactData);
    return { success: true, message: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Contact Form <noreply@yourdomain.com>",
      to: ["jcfarmer420@gmail.com"], // YOUR BUSINESS EMAIL HERE
      replyTo: contactData.email,
      subject: `Contact Form: ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📝 New Contact Form Message</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px;">
                <h2 style="margin: 0; color: #374151;">Contact Details</h2>
              </div>

              <div style="space-y: 15px;">
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151;">Name:</strong>
                  <p style="margin: 5px 0; color: #6b7280;">${contactData.name}</p>
                </div>

                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151;">Email:</strong>
                  <p style="margin: 5px 0; color: #6b7280;">${contactData.email}</p>
                </div>

                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151;">Subject:</strong>
                  <p style="margin: 5px 0; color: #6b7280;">${contactData.subject}</p>
                </div>

                <div style="margin-bottom: 20px;">
                  <strong style="color: #374151;">Message:</strong>
                  <div style="margin: 10px 0; padding: 15px; background: #f3f4f6; border-radius: 6px; color: #374151; white-space: pre-wrap;">${contactData.message}</div>
                </div>
              </div>

              <div style="text-align: center; margin-top: 25px; padding: 20px; background: #f0fdf4; border-radius: 6px; border-left: 4px solid #16a34a;">
                <p style="margin: 0; color: #166534;">
                  💡 You can reply directly to this email to respond to ${contactData.name}
                </p>
              </div>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
            <p>This message was sent from your website contact form.</p>
            <p style="margin: 5px 0;">🍄 Fresh Mushroom Farm</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Contact email error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Contact form email sent successfully");
    return { success: true, data };
  } catch (error) {
    console.error("Contact email service error:", error);
    return { success: false, error: "Failed to send email" };
  }
}
