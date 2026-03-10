// Cloudflare Pages Function — statsme.org/api/order
// Secrets à définir dans : Cloudflare Dashboard → Pages → statsme.org → Settings → Environment Variables
// PRINTIFY_TOKEN, SHOP_ID, MUG_PRODUCT_ID, MUG_VARIANT_ID

const CORS = {
  'Access-Control-Allow-Origin': 'https://statsme.org',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  const isMock = !env.PRINTIFY_TOKEN;

  // ── MODE TEST (pas encore de clés Printify) ──────────────────────────────
  if (isMock) {
    await new Promise(r => setTimeout(r, 800));
    return json({ id: `mock-${Date.now()}`, status: 'pending', mock: true,
                  message: 'Mode test — aucune commande réelle créée' });
  }

  // ── MODE PRODUCTION ───────────────────────────────────────────────────────
  try {
    const { customerName, milestone, milestoneDate, imageBase64, address, session_id } = await request.json();

    // Vérification paiement Stripe avant de créer la commande Printify
    if (env.STRIPE_SECRET_KEY && session_id) {
      const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
        headers: { 'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}` },
      });
      const session = await stripeRes.json();
      if (session.payment_status !== 'paid') {
        return json({ error: 'Paiement non confirmé' }, 402);
      }
    }

    if (!imageBase64) {
      return json({ error: 'Image manquante' }, 400);
    }

    // 1. Upload image sur Printify
    const upload = await printify(env, 'POST', '/uploads/images.json', {
      file_name: `mug_${customerName}_${Date.now()}.png`,
      contents: imageBase64.split(',')[1],
    });

    // 2. Créer la commande
    const order = await printify(env, 'POST', `/shops/${env.SHOP_ID}/orders.json`, {
      external_id: `ms-${Date.now()}`,
      line_items: [{
        product_id: env.MUG_PRODUCT_ID,
        variant_id: parseInt(env.MUG_VARIANT_ID),
        quantity: 1,
        print_areas: {
          front: [{ src: upload.preview_url, scale: 1, x: 0.5, y: 0.5, angle: 0 }]
        }
      }],
      shipping_method: 1,
      send_shipping_notification: true,
      address_to: address,
    });

    return json(order);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function printify(env, method, path, body) {
  return fetch(`https://api.printify.com/v1${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${env.PRINTIFY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(r => r.json());
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
