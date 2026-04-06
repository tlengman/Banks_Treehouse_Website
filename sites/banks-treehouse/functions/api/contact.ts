interface Env {
  CONTACT_EMAIL?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const message = formData.get('message')?.toString().trim() || '';

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Please provide a valid email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Log the contact submission (will appear in CF Pages logs)
    console.log(`Contact form submission from ${name} <${email}>: ${message.substring(0, 100)}`);

    // TODO: Send email notification via Brevo or CF Email Workers when configured
    // For now, submissions are logged and can be viewed in Cloudflare Pages logs

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for your message! We typically respond within an hour.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try emailing us directly at info@bankstreehouse.com.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
