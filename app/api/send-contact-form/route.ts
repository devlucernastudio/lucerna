import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 }) // 1 minute
    return true
  }

  if (limit.count >= 2) {
    // Rate limit exceeded
    return false
  }

  // Increment count
  limit.count++
  return true
}

// Validation functions
function validateName(name: string): boolean {
  // Only letters, spaces, and hyphens
  return /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s-]+$/.test(name.trim())
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

function validatePhone(phone: string): boolean {
  if (!phone) return true // Phone is optional
  // Only digits and optional + at the start
  return /^\+?[0-9]+$/.test(phone.trim())
}

function validateMessage(message: string): boolean {
  // Text and allowed punctuation: . , - _ + = ( ) * ? % ; : № @ # & ! /
  return /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9\s.,\-_+=()*?%;:№@#&!/]+$/.test(message.trim())
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "unknown"

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, phone, message, comment } = body

    // Honeypot check - if comment field is filled, it's a bot
    if (comment && comment.trim() !== "") {
      // Return 200 OK without sending email
      return NextResponse.json({ success: true })
    }

    // Server-side validation
    if (!name || !validateName(name)) {
      return NextResponse.json(
        { success: false, error: "Invalid name. Only letters, spaces, and hyphens are allowed." },
        { status: 400 }
      )
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address." },
        { status: 400 }
      )
    }

    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number. Only digits and optional + at the start are allowed." },
        { status: 400 }
      )
    }

    if (!message || !validateMessage(message)) {
      return NextResponse.json(
        { success: false, error: "Invalid message. Only text and allowed punctuation are allowed." },
        { status: 400 }
      )
    }

    // Get notification settings from database
    const supabase = await createClient()
    const { data: settings } = await supabase
      .from("site_contact_settings")
      .select("notification_email, resend_api_key")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single()

    if (!settings?.notification_email) {
      return NextResponse.json(
        { success: false, error: "Notification email not configured" },
        { status: 500 }
      )
    }

    if (!settings?.resend_api_key) {
      return NextResponse.json(
        { success: false, error: "Resend API key not configured" },
        { status: 500 }
      )
    }

    // Format date and time
    const now = new Date()
    const dateTime = now.toLocaleString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    // Email subject
    const subject = `Нове повідомлення з форми "Напишіть нам" - Lucerna Studio`

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
            .info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .message { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Нове повідомлення з форми "Напишіть нам"</h1>
            </div>
            <div class="content">
              <div class="info">
                <h2>Інформація про відправника:</h2>
                <p><strong>Ім'я:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Телефон:</strong> ${phone}</p>` : ""}
                <p><strong>Дата та час:</strong> ${dateTime}</p>
              </div>
              
              <div class="message">
                <h2>Повідомлення:</h2>
                <p style="white-space: pre-wrap;">${message}</p>
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
Нове повідомлення з форми "Напишіть нам"

Інформація про відправника:
Ім'я: ${name}
Email: ${email}
${phone ? `Телефон: ${phone}` : ""}
Дата та час: ${dateTime}

Повідомлення:
${message}
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
      console.log("Contact form email sent:", result)

      return NextResponse.json({ success: true, message: "Message sent successfully" })
    } catch (resendError) {
      console.error("Error sending email via Resend:", resendError)
      return NextResponse.json(
        { success: false, error: "Failed to send email", details: resendError },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    )
  }
}

