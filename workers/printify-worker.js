/**
 * MilestoneMe — Cloudflare Worker : Printify order proxy
 *
 * Variables d'environnement à définir dans Cloudflare Dashboard
 * Workers > printify-worker > Settings > Variables & Secrets :
 *   PRINTIFY_TOKEN   — clé API Printify (secret)
 *   SHOP_ID          — ID du shop Printify
 *   MUG_PRODUCT_ID   — ID du produit mug dans le catalogue
 *   MUG_VARIANT_ID   — ID de la variante (ex: taille/couleur)
 *
 * Mode mock automatique si PRINTIFY_TOKEN est absent ou si ?mock=true
 */
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://statsme.org',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Seules les requêtes POST sont acceptées
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Mode mock : pas de token Printify OU param ?mock=true dans l'URL
    const url = new URL(request.url);
    const isMock = !env.PRINTIFY_TOKEN || url.searchParams.get('mock') === 'true';

    if (isMock) {
      // Simuler un délai réseau réaliste
      await new Promise(r => setTimeout(r, 800));

      return new Response(JSON.stringify({
        id: `mock-${Date.now()}`,
        status: 'pending',
        mock: true,
        message: 'Mode test — aucune commande réelle créée',
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // ── Mode production ────────────────────────────────────────────────────────
    try {
      const body = await request.json();
      const { customerName, milestone, milestoneDate, imageBase64, address } = body;

      // Validation minimale
      if (!imageBase64 || !customerName) {
        return new Response(JSON.stringify({ error: 'Champs requis manquants' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 1. Upload de l'image du mug vers Printify
      const uploadRes = await fetch('https://api.printify.com/v1/uploads/images.json', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.PRINTIFY_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: `mug_${customerName.replace(/\s+/g, '_')}_${Date.now()}.png`,
          // Printify attend uniquement le contenu base64, sans le préfixe data:image/...
          contents: imageBase64.split(',')[1],
        }),
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Upload image échoué (${uploadRes.status}): ${errText}`);
      }

      const { id: imageId } = await uploadRes.json();

      // 2. Création de la commande Printify
      const orderRes = await fetch(
        `https://api.printify.com/v1/shops/${env.SHOP_ID}/orders.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.PRINTIFY_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            external_id: `milestoneme-${Date.now()}`,
            line_items: [
              {
                product_id: env.MUG_PRODUCT_ID,
                variant_id: env.MUG_VARIANT_ID,
                quantity: 1,
                print_areas: {
                  front: [
                    {
                      src: imageId,
                      scale: 1,
                      x: 0.5,
                      y: 0.5,
                      angle: 0,
                    },
                  ],
                },
              },
            ],
            shipping_method: 1,
            address_to: address,
          }),
        }
      );

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        throw new Error(`Création commande échouée (${orderRes.status}): ${errText}`);
      }

      const order = await orderRes.json();

      return new Response(JSON.stringify(order), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
