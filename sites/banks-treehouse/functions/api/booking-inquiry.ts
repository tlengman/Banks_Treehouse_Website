interface Env {
  BREVO_API_KEY?: string;
}

interface BookingInquiry {
  name?: string;
  email?: string;
  phone?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  requests?: string;
  referral?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://bankstreehouse.com',
  };

  try {
    const body = (await request.json()) as BookingInquiry;

    const name = body.name?.trim() || '';
    const email = body.email?.trim() || '';
    const phone = body.phone?.trim() || '';
    const checkin = body.checkin?.trim() || '';
    const checkout = body.checkout?.trim() || '';
    const guests = body.guests ?? 2;
    const requests = body.requests?.trim() || '';
    const referral = body.referral?.trim() || '';

    // Validate required fields
    if (!name) {
      return new Response(JSON.stringify({ error: 'Name is required.' }), {
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

    if (!checkin) {
      return new Response(JSON.stringify({ error: 'Check-in date is required.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!checkout) {
      return new Response(JSON.stringify({ error: 'Check-out date is required.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkin) || !dateRegex.test(checkout)) {
      return new Response(JSON.stringify({ error: 'Invalid date format.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate checkout is after checkin
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid date values.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (checkoutDate <= checkinDate) {
      return new Response(JSON.stringify({ error: 'Check-out date must be after check-in date.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Calculate number of nights
    const nights = Math.round((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));

    // Log the booking inquiry (will appear in CF Pages logs)
    // D1 storage will be added in a future issue
    console.log(
      `Booking inquiry: ${name} <${email}> | phone: ${phone || 'not provided'} | ${checkin} to ${checkout} (${nights} nights) | guests: ${guests} | referral: ${referral || 'not specified'} | requests: ${requests ? requests.substring(0, 100) : 'none'}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you! We'll review your inquiry and get back to you within an hour.",
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Booking inquiry error:', error);
    return new Response(
      JSON.stringify({
        error: 'Something went wrong processing your inquiry. Please try again or contact us at info@bankstreehouse.com.',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
};
