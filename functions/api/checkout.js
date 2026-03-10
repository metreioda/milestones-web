// Cloudflare Pages Function — statsme.org/api/checkout
// Crée une session Stripe Checkout pour un mug personnalisé
// Secrets : STRIPE_SECRET_KEY dans Cloudflare Dashboard env vars

const CORS = {
  'Access-Control-Allow-Origin': 'https://statsme.org',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  const isMock = !env.STRIPE_SECRET_KEY;

  // ── MODE TEST (pas encore de clé Stripe) ──────────────────────────────────
  if (isMock) {
    await new Promise(r => setTimeout(r, 600));
    return json({
      mock: true,
      url: null,
      message: 'Mode test — aucun paiement réel',
    });
  }

  // ── MODE PRODUCTION ────────────────────────────────────────────────────────
  try {
    const { customerName, milestone, orderId } = await request.json();

    const origin = 'https://statsme.org';
    const successUrl = `${origin}/mug-customizer?success=1&session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(orderId)}`;
    const cancelUrl  = `${origin}/mug-customizer?cancelled=1`;

    // Stripe Checkout Session via REST (pas besoin du SDK)
    const params = new URLSearchParams({
      mode: 'payment',
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][product_data][name]': `Mug MilestoneMe — ${customerName}`,
      'line_items[0][price_data][product_data][description]': `Milestone : ${milestone}`,
      'line_items[0][price_data][unit_amount]': '1990', // 19,90 €
      'line_items[0][quantity]': '1',
      'payment_method_types[0]': 'card',
      success_url: successUrl,
      cancel_url:  cancelUrl,
      'metadata[customer_name]': customerName,
      'metadata[milestone]': milestone,
      'metadata[order_id]': orderId,
    });

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await res.json();

    if (!session.url) {
      return json({ error: session.error?.message || 'Stripe error' }, 400);
    }

    return json({ url: session.url, session_id: session.id });

  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
