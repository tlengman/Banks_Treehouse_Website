interface Env {
  BREVO_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface BrevoContact {
  email: string;
  attributes?: Record<string, string>;
  listIds?: number[];
  updateEnabled?: boolean;
}

async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = (await response.json()) as { success: boolean };
  return data.success;
}

async function addBrevoContact(apiKey: string, contact: BrevoContact): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: contact.email,
      attributes: contact.attributes || {},
      listIds: contact.listIds || [],
      updateEnabled: contact.updateEnabled ?? true,
    }),
  });

  if (response.ok || response.status === 201) {
    return { success: true };
  }

  const error = await response.text();
  console.error('Brevo API error:', response.status, error);

  if (response.status === 400 && error.includes('already exist')) {
    return { success: true }; // Contact already exists, not an error
  }

  return { success: false, error: `Brevo API error: ${response.status}` };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://bankstreehouse.com',
  };

  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
      'cf-turnstile-response'?: string;
    };
    const email = body.email?.trim();
    const name = body.name?.trim() || '';
    const turnstileToken = body['cf-turnstile-response'] || '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Please provide a valid email address.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Verify Turnstile CAPTCHA if configured
    if (env.TURNSTILE_SECRET_KEY && turnstileToken) {
      const valid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY);
      if (!valid) {
        return new Response(JSON.stringify({ error: 'CAPTCHA verification failed. Please try again.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    // Add to Brevo if configured
    if (env.BREVO_API_KEY) {
      const result = await addBrevoContact(env.BREVO_API_KEY, {
        email,
        attributes: { FIRSTNAME: name },
        listIds: [], // TODO: Set Brevo list ID for "Banks Treehouse Guests" once created
        updateEnabled: true,
      });

      if (!result.success) {
        return new Response(JSON.stringify({ error: 'Unable to subscribe at this time. Please try again later.' }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    } else {
      // Brevo not configured yet — log for now
      console.log(`Email subscribe: ${name} <${email}>`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "You're on the list! Check your email for a confirmation.",
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
