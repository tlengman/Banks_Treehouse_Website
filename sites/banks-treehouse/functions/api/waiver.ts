interface Env {
  BREVO_API_KEY?: string;
}

interface WaiverSubmission {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  signature?: string;
  agreed?: boolean;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://bankstreehouse.com',
  };

  try {
    const body = (await request.json()) as WaiverSubmission;

    const name = body.name?.trim() || '';
    const email = body.email?.trim() || '';
    const phone = body.phone?.trim() || '';
    const date = body.date?.trim() || '';
    const signature = body.signature || '';
    const agreed = body.agreed;

    // Validate required fields
    if (!name) {
      return new Response(JSON.stringify({ error: 'Full name is required.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'A valid email address is required.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!date) {
      return new Response(JSON.stringify({ error: 'Date is required.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!signature || signature.length < 100) {
      return new Response(JSON.stringify({ error: 'A valid signature is required.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (agreed !== true) {
      return new Response(JSON.stringify({ error: 'You must agree to the waiver terms.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Log the waiver submission (will appear in CF Pages logs)
    // D1 storage will be added in issue #15
    console.log(
      `Waiver signed: ${name} <${email}> | phone: ${phone || 'not provided'} | date: ${date} | signature length: ${signature.length}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Waiver signed successfully. Thank you!',
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Waiver submission error:', error);
    return new Response(
      JSON.stringify({
        error: 'Something went wrong processing your waiver. Please try again or contact us at info@bankstreehouse.com.',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
};
