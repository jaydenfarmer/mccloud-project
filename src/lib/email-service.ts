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
