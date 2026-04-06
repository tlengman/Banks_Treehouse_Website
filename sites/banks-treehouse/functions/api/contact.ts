interface Env {
  DB?: D1Database;
  BREVO_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await response.json()) as { success: boolean };
  return data.success;
}

function generateId(): string {
  return crypto.randomUUID();
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://bankstreehouse.com',
  };

  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const message = formData.get('message')?.toString().trim() || '';
    const turnstileToken = formData.get('cf-turnstile-response')?.toString() || '';
    const clientIp = request.headers.get('CF-Connecting-IP') || '';

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Please provide a valid email address.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Verify Turnstile CAPTCHA if configured
    if (env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return new Response(JSON.stringify({ error: 'Please complete the CAPTCHA.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      const valid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, clientIp);
      if (!valid) {
        return new Response(JSON.stringify({ error: 'CAPTCHA verification failed. Please try again.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    // Store in D1 if configured
    if (env.DB) {
      const id = generateId();
      await env.DB.prepare(
        'INSERT INTO contact_messages (id, name, email, message, created_at, status) VALUES (?, ?, ?, ?, datetime(\'now\'), \'new\')'
      )
        .bind(id, name, email, message)
        .run();
      console.log(`Contact message stored in D1: ${id}`);
    }

    // Send auto-reply via Brevo if configured
    if (env.BREVO_API_KEY) {
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Banks Treehouse', email: 'info@bankstreehouse.com' },
            to: [{ email, name }],
            subject: 'We received your message — Banks Treehouse',
            htmlContent: `<p>Hi ${name},</p><p>Thank you for reaching out to Banks Treehouse! We received your message and typically respond within an hour.</p><p>In the meantime, you can browse our <a href="https://bankstreehouse.com/faq">FAQ page</a> or <a href="https://bankstreehouse.com/the-treehouse">explore the property</a>.</p><p>Warm regards,<br>Rusty & The Banks Treehouse Team</p>`,
          }),
        });
      } catch (emailError) {
        console.error('Auto-reply email failed:', emailError);
        // Don't fail the form submission if email fails
      }
    }

    // Log the submission
    console.log(`Contact form submission from ${name} <${email}>: ${message.substring(0, 100)}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for your message! We typically respond within an hour.',
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try emailing us directly at info@bankstreehouse.com.' }),
      { status: 500, headers: corsHeaders }
    );
  }
};
