import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { orderNumber, customerName, customerEmail, customerPhone, customerCity, customerAddress, notes, total, items } = body

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

    // Format order items for HTML email
    const formatItemCharacteristics = (characteristics: any): string => {
      if (!characteristics || Object.keys(characteristics).length === 0) return ""
      
      let result = ""
      if (Array.isArray(characteristics)) {
        characteristics.forEach((char: any) => {
          const charName = char?.name || "Характеристика"
          const charValue = char?.value || char || ""
          result += `<div style="margin-left: 15px; margin-top: 5px;"><strong>${charName}:</strong> ${String(charValue)}</div>`
        })
      } else {
        Object.entries(characteristics).forEach(([key, value]) => {
          const valueStr = typeof value === "object" && value !== null && "value" in value
            ? String((value as any).value)
            : String(value)
          result += `<div style="margin-left: 15px; margin-top: 5px;"><strong>${key}:</strong> ${valueStr}</div>`
        })
      }
      return result
    }

    const itemsHtml = items.map((item: any, index: number) => {
      const characteristicsHtml = formatItemCharacteristics(item.characteristics)
      const commentHtml = item.comment ? `<div style="margin-left: 15px; margin-top: 5px; font-style: italic; color: #666;"><strong>Коментар:</strong> ${item.comment}</div>` : ""
      
      return `
        <div style="padding: 12px; margin-bottom: 10px; background-color: #fafafa; border-left: 3px solid #D4834F; border-radius: 4px;">
          <div style="font-weight: 600; color: #333; margin-bottom: 8px;">${index + 1}. ${item.product_name}</div>
          <div style="color: #666; font-size: 14px; margin-bottom: 5px;">
            Кількість: ${item.quantity} шт. × ${item.product_price.toLocaleString("uk-UA")} грн = <strong>${item.subtotal.toLocaleString("uk-UA")} грн</strong>
          </div>
          ${characteristicsHtml}
          ${commentHtml}
        </div>
      `
    }).join("")

    // Format order items for plain text email
    const itemsText = items.map((item: any, index: number) => {
      let itemText = `${index + 1}. ${item.product_name}\n`
      itemText += `   Кількість: ${item.quantity} шт. × ${item.product_price.toLocaleString("uk-UA")} грн = ${item.subtotal.toLocaleString("uk-UA")} грн\n`
      
      if (item.characteristics && Object.keys(item.characteristics).length > 0) {
        if (Array.isArray(item.characteristics)) {
          item.characteristics.forEach((char: any) => {
            const charName = char?.name || "Характеристика"
            const charValue = char?.value || char || ""
            itemText += `   ${charName}: ${String(charValue)}\n`
          })
        } else {
          Object.entries(item.characteristics).forEach(([key, value]) => {
            const valueStr = typeof value === "object" && value !== null && "value" in value
              ? String((value as any).value)
              : String(value)
            itemText += `   ${key}: ${valueStr}\n`
          })
        }
      }
      
      if (item.comment) {
        itemText += `   Коментар: ${item.comment}\n`
      }
      
      return itemText
    }).join("\n")

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
            .order-info p { margin: 8px 0; }
            .items { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .total { font-size: 18px; font-weight: bold; color: #D4834F; margin-top: 15px; text-align: right; padding: 15px; background-color: white; border-radius: 5px; }
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
                ${customerCity ? `<p><strong>Місто:</strong> ${customerCity}</p>` : ""}
                ${customerAddress ? `<p><strong>Адреса:</strong> ${customerAddress}</p>` : ""}
                ${notes ? `<p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;"><strong>Коментар до замовлення:</strong><br>${notes.replace(/\n/g, "<br>")}</p>` : ""}
              </div>
              
              <div class="items">
                <h2>Товари:</h2>
                ${itemsHtml}
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
${customerCity ? `Місто: ${customerCity}` : ""}
${customerAddress ? `Адреса: ${customerAddress}` : ""}
${notes ? `\nКоментар до замовлення:\n${notes}` : ""}

Товари:
${itemsText}

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
        console.error("API error:", errorData)
        return NextResponse.json(
          { success: false, error: "Failed to send email", details: errorData },
          { status: 500 }
        )
      }

      const result = await resendResponse.json()
      console.log("Order notification email sent:", result)

      return NextResponse.json({ success: true, message: "Notification sent", result })
    } catch (resendError) {
      console.error("Error sending email:", resendError)
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

