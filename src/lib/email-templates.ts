import { Order } from "@/types";

export const orderConfirmationEmail = (order: Order) => ({
  subject: `Order Confirmation #${order.id.slice(-8).toUpperCase()}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🍄 Order Confirmed!</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Thank you for your mushroom order</p>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #374151; margin: 0 0 20px 0;">Order Details</h2>
          
          <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 15px;">
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> #${order.id
              .slice(-8)
              .toUpperCase()}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Status:</strong> <span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px;">PENDING</span></p>
          </div>

          <h3 style="color: #374151; margin: 20px 0 10px 0;">Items Ordered</h3>
          ${order.items
            .map(
              (item: Order["items"][number]) => `
            <div style="border-bottom: 1px solid #f3f4f6; padding: 10px 0; display: flex; justify-content: space-between;">
              <div>
                <p style="margin: 0; font-weight: 500; color: #374151;">${
                  item.product.name
                }</p>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Quantity: ${
                  item.quantity
                }</p>
              </div>
              <p style="margin: 0; font-weight: 500; color: #374151;">$${(
                item.product.price * item.quantity
              ).toFixed(2)}</p>
            </div>
          `
            )
            .join("")}

          <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #16a34a;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #16a34a;">
              Total: $${order.totalAmount.toFixed(2)}
            </p>
          </div>

          <div style="margin-top: 25px; padding: 20px; background: #f0fdf4; border-radius: 6px; border-left: 4px solid #16a34a;">
            <h3 style="margin: 0 0 10px 0; color: #16a34a;">What's Next?</h3>
            <p style="margin: 0; color: #166534; line-height: 1.5;">
              We're preparing your fresh mushrooms! You'll receive another email when your order ships. 
              Expected processing time: 1-2 business days.
            </p>
          </div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
        <p>Questions about your order? Reply to this email or contact us.</p>
        <p style="margin: 5px 0;">🍄 Fresh Mushroom Farm | Growing Quality Since 2024</p>
      </div>
    </div>
  `,
});

export const orderShippedEmail = (order: Order) => ({
  subject: `Your Order is On Its Way! #${order.id.slice(-8).toUpperCase()}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📦 Order Shipped!</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your mushrooms are on their way</p>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #374151; margin: 0 0 20px 0;">Shipping Update</h2>
          
          <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 15px;">
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> #${order.id
              .slice(-8)
              .toUpperCase()}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Status:</strong> <span style="background: #ddd6fe; color: #7c3aed; padding: 4px 8px; border-radius: 4px; font-size: 12px;">SHIPPED</span></p>
          </div>

          <div style="margin: 25px 0; padding: 20px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #0ea5e9;">
            <h3 style="margin: 0 0 10px 0; color: #0ea5e9;">Estimated Delivery</h3>
            <p style="margin: 0; color: #075985; font-size: 16px; font-weight: 500;">
              ${new Date(
                Date.now() + 3 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()} - ${new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000
  ).toLocaleDateString()}
            </p>
            <p style="margin: 5px 0 0 0; color: #0c4a6e; font-size: 14px;">
              Standard shipping (3-5 business days)
            </p>
          </div>

          <div style="margin-top: 25px; padding: 20px; background: #fefce8; border-radius: 6px; border-left: 4px solid #eab308;">
            <h3 style="margin: 0 0 10px 0; color: #eab308;">Care Instructions</h3>
            <p style="margin: 0; color: #713f12; line-height: 1.5;">
              Your mushrooms are packed fresh! Store them in the refrigerator immediately upon arrival. 
              Best consumed within 5-7 days for optimal freshness.
            </p>
          </div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
        <p>Thank you for choosing our fresh mushrooms!</p>
        <p style="margin: 5px 0;">🍄 Fresh Mushroom Farm | Growing Quality Since 2024</p>
      </div>
    </div>
  `,
});

export const orderDeliveredEmail = (order: Order) => ({
  subject: `Order Delivered! How did we do? #${order.id
    .slice(-8)
    .toUpperCase()}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">✅ Order Delivered!</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">We hope you love your fresh mushrooms</p>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #374151; margin: 0 0 20px 0;">Order Complete!</h2>
          
          <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 15px;">
            <p style="margin: 5px 0; color: #6b7280;"><strong>Order ID:</strong> #${order.id
              .slice(-8)
              .toUpperCase()}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Delivered:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Status:</strong> <span style="background: #d1fae5; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-size: 12px;">DELIVERED</span></p>
          </div>

          <div style="margin: 25px 0; padding: 20px; background: #f0fdf4; border-radius: 6px; border-left: 4px solid #16a34a;">
            <h3 style="margin: 0 0 10px 0; color: #16a34a;">Enjoy Your Fresh Mushrooms!</h3>
            <p style="margin: 0; color: #166534; line-height: 1.5;">
              Your premium mushrooms have been delivered fresh to your door. We hope you enjoy cooking with them!
            </p>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="${
              process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
            }/products" 
               style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Order Again
            </a>
          </div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
        <p>Thank you for choosing our fresh mushrooms!</p>
        <p style="margin: 5px 0;">🍄 Fresh Mushroom Farm | Growing Quality Since 2024</p>
      </div>
    </div>
  `,
});
