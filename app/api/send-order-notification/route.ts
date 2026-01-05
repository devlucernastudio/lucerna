import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { orderNumber, customerName, customerEmail, customerPhone, total, items } = body

    // Get notification settings from database
    const { data: settings } = await supabase
      .from("site_contact_settings")
      .select("notification_email, resend_api_key")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single()

    if (!settings?.notification_email) {
      // No notification email configured, skip sending
      return NextResponse.json({ success: true, message: "No notification email configured" })
    }

    if (!settings?.resend_api_key) {
      // No API key configured, skip sending
      console.log("Resend API key not configured")
      return NextResponse.json({ success: true, message: "Resend API key not configured" })
    }

    // Format order items for email
    const itemsList = items
      .map(
        (item: any) =>
          `- ${item.product_name} (${item.quantity} шт.) × ${item.product_price.toLocaleString("uk-UA")} грн = ${item.subtotal.toLocaleString("uk-UA")} грн`
      )
      .join("\n")

    // Format characteristics if present
    const itemsWithChars = items.map((item: any) => {
      let itemText = `- ${item.product_name} (${item.quantity} шт.) × ${item.product_price.toLocaleString("uk-UA")} грн = ${item.subtotal.toLocaleString("uk-UA")} грн`
      if (item.characteristics && Object.keys(item.characteristics).length > 0) {
        const chars = Object.entries(item.characteristics)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")
        itemText += `\n  Характеристики: ${chars}`
      }
      if (item.comment) {
        itemText += `\n  Коментар: ${item.comment}`
      }
      return itemText
    }).join("\n\n")

    // Email subject
    const subject = `Нове замовлення ${orderNumber} - Lucerna Studio`

    // Email body (HTML format)
    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #D4834F; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .order-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .items { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .total { font-size: 18px; font-weight: bold; color: #D4834F; margin-top: 15px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Нове замовлення ${orderNumber}</h1>
            </div>
            <div class="content">
              <div class="order-info">
                <h2>Інформація про клієнта:</h2>
                <p><strong>Ім'я:</strong> ${customerName}</p>
                <p><strong>Телефон:</strong> ${customerPhone}</p>
                ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ""}
              </div>
              
              <div class="items">
                <h2>Товари:</h2>
                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsWithChars}</pre>
              </div>
              
              <div class="total">
                Загальна сума: ${total.toLocaleString("uk-UA")} грн
              </div>
            </div>
            <div class="footer">
              <p>Це автоматичне сповіщення з сайту Lucerna Studio</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Plain text version
    const textBody = `
Нове замовлення ${orderNumber}

Інформація про клієнта:
Ім'я: ${customerName}
Телефон: ${customerPhone}
${customerEmail ? `Email: ${customerEmail}` : ""}

Товари:
${itemsWithChars}

Загальна сума: ${total.toLocaleString("uk-UA")} грн
    `

    // Send email using Resend API
    try {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.resend_api_key}`,
        },
        body: JSON.stringify({
          from: "Lucerna Studio <noreply@lucerna-studio.com>",
          to: [settings.notification_email],
          subject: subject,
          html: emailBody,
          text: textBody,
        }),
      })

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json()
        console.error("Resend API error:", errorData)
        return NextResponse.json(
          { success: false, error: "Failed to send email via Resend", details: errorData },
          { status: 500 }
        )
      }

      const result = await resendResponse.json()
      console.log("Order notification email sent:", result)

      return NextResponse.json({ success: true, message: "Notification sent", result })
    } catch (resendError) {
      console.error("Error sending email via Resend:", resendError)
      return NextResponse.json(
        { success: false, error: "Failed to send email", details: resendError },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    )
  }
}

