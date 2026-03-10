/**
 * MilestoneMe — Mug Preview Canvas
 * Dessine un aperçu stylisé d'un mug personnalisé en Canvas 2D pur.
 * Aucune dépendance externe — fonctionne offline.
 *
 * API publique (window.MugPreview) :
 *   .init(canvasId, data?)   — initialise le canvas et dessine
 *   .update(canvasId, data)  — redessine avec de nouvelles données
 *   .toBase64(canvasId)      — retourne la dataURL PNG pour l'envoi
 *
 * data : { name, milestone, date }
 */
(function () {
  'use strict';

  /* ── Polyfill roundRect pour Chrome < 99 / Firefox < 112 ─────────────────── */
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const rad = Array.isArray(r) ? r[0] : (typeof r === 'number' ? r : 0);
      this.beginPath();
      this.moveTo(x + rad, y);
      this.arcTo(x + w, y,     x + w, y + h, rad);
      this.arcTo(x + w, y + h, x,     y + h, rad);
      this.arcTo(x,     y + h, x,     y,     rad);
      this.arcTo(x,     y,     x + w, y,     rad);
      this.closePath();
    };
  }

  /* ── Palette ─────────────────────────────────────────────────────────────── */
  const P = {
    bg:          '#F4F1EC',   // beige chaud, fond du canvas
    mugBody:     '#FFFFFF',   // corps blanc du mug
    mugShadow:   'rgba(0,0,0,0.07)',
    mugStroke:   '#DDE1EA',   // contour léger
    accent:      '#6366F1',   // indigo MilestoneMe
    accentLight: '#818CF8',   // indigo clair pour sous-titres
    textPrimary: '#1A1A2E',   // texte principal sombre
    textDate:    '#64748B',   // date, gris slate
    handleFill:  '#F8F8F8',   // intérieur de l'anse
    handleStroke:'#DDE1EA',
    decoLine:    '#E8EAF0',   // séparateur déco
    dots:        '#CBD5E1',   // points décoratifs
  };

  /* ── Dimensions canoniques du canvas ────────────────────────────────────── */
  const W = 640;
  const H = 320;

  /* ── Géométrie du mug ────────────────────────────────────────────────────── */
  const MUG = {
    x: 80, y: 28, w: 420, h: 256,
    r: 20,   // rayon des coins arrondis
    bandH: 48, // hauteur de la bande accent en haut
  };

  /* ─────────────────────────────────────────────────────────────────────────── */
  function drawMug(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, W, H);

    /* 1. Fond du canvas avec léger grain ──────────────────────────────────── */
    ctx.fillStyle = P.bg;
    ctx.fillRect(0, 0, W, H);

    /* Léger vignettage sur les bords */
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    /* 2. Ombre portée sous le mug ──────────────────────────────────────────── */
    ctx.beginPath();
    ctx.ellipse(
      MUG.x + MUG.w / 2,
      MUG.y + MUG.h + 16,
      MUG.w / 2 - 10,
      16,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = 'rgba(0,0,0,0.09)';
    ctx.fill();

    /* 3. Corps du mug ───────────────────────────────────────────────────────── */
    // Remplissage blanc
    ctx.roundRect(MUG.x, MUG.y, MUG.w, MUG.h, MUG.r);
    ctx.fillStyle = P.mugBody;
    ctx.fill();

    // Légère ombre interne gauche (effet 3D subtil)
    const innerGrad = ctx.createLinearGradient(MUG.x, 0, MUG.x + 60, 0);
    innerGrad.addColorStop(0, 'rgba(0,0,0,0.04)');
    innerGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.roundRect(MUG.x, MUG.y, MUG.w, MUG.h, MUG.r);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    // Contour
    ctx.roundRect(MUG.x, MUG.y, MUG.w, MUG.h, MUG.r);
    ctx.strokeStyle = P.mugStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* 4. Anse du mug ────────────────────────────────────────────────────────── */
    const handleCX = MUG.x + MUG.w + 38;
    const handleCY = MUG.y + MUG.h / 2;
    const handleRY = 60;
    const handleRX = 42;

    // Anse extérieure (épaisseur)
    ctx.beginPath();
    ctx.ellipse(handleCX, handleCY, handleRX, handleRY, 0, -Math.PI * 0.62, Math.PI * 0.62);
    ctx.strokeStyle = P.handleStroke;
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Anse intérieure (fond)
    ctx.beginPath();
    ctx.ellipse(handleCX, handleCY, handleRX, handleRY, 0, -Math.PI * 0.62, Math.PI * 0.62);
    ctx.strokeStyle = P.handleFill;
    ctx.lineWidth = 18;
    ctx.stroke();
    ctx.lineCap = 'butt';

    /* 5. Bande accent en haut du mug ────────────────────────────────────────── */
    // Clip dans le contour arrondi du mug pour la bande
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(MUG.x, MUG.y, MUG.w, MUG.h, MUG.r);
    ctx.clip();

    const bandGrad = ctx.createLinearGradient(MUG.x, 0, MUG.x + MUG.w, 0);
    bandGrad.addColorStop(0,   '#4F46E5');
    bandGrad.addColorStop(0.5, '#6366F1');
    bandGrad.addColorStop(1,   '#8B5CF6');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(MUG.x, MUG.y, MUG.w, MUG.bandH);

    /* Reflet sur la bande */
    const reflet = ctx.createLinearGradient(0, MUG.y, 0, MUG.y + MUG.bandH);
    reflet.addColorStop(0, 'rgba(255,255,255,0.22)');
    reflet.addColorStop(1, 'rgba(255,255,255,0.00)');
    ctx.fillStyle = reflet;
    ctx.fillRect(MUG.x, MUG.y, MUG.w, MUG.bandH);

    ctx.restore();

    /* 6. Texte dans la bande : logo ─────────────────────────────────────────── */
    const cx = MUG.x + MUG.w / 2;
    ctx.font = '600 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MilestoneMe', cx, MUG.y + MUG.bandH / 2);

    /* 7. Ligne séparatrice sous la bande ────────────────────────────────────── */
    const lineY = MUG.y + MUG.bandH + 22;
    ctx.beginPath();
    ctx.moveTo(MUG.x + 36, lineY);
    ctx.lineTo(MUG.x + MUG.w - 36, lineY);
    ctx.strokeStyle = P.decoLine;
    ctx.lineWidth = 1;
    ctx.stroke();

    /* 8. Contenu textuel personnalisé ───────────────────────────────────────── */
    const textTop = MUG.y + MUG.bandH + 44;

    // Prénom
    const name = (data && data.name) ? data.name.trim() : 'Ton prénom';
    ctx.font = 'bold 30px "Georgia", "Playfair Display", serif';
    ctx.fillStyle = P.textPrimary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Tronquer si trop long
    let displayName = name;
    while (ctx.measureText(displayName).width > MUG.w - 60 && displayName.length > 1) {
      displayName = displayName.slice(0, -1);
    }
    if (displayName !== name) displayName += '…';
    ctx.fillText(displayName, cx, textTop);

    // Milestone
    const milestone = (data && data.milestone) ? data.milestone : '10 000 jours';
    ctx.font = '700 20px "Space Grotesk", sans-serif';
    ctx.fillStyle = P.accent;
    ctx.fillText(milestone, cx, textTop + 36);

    // Date
    const date = (data && data.date) ? data.date.trim() : 'bientôt…';
    ctx.font = '400 14px "Inter", sans-serif';
    ctx.fillStyle = P.textDate;
    ctx.fillText(date, cx, textTop + 64);

    // Points déco
    ctx.font = '12px sans-serif';
    ctx.fillStyle = P.dots;
    ctx.fillText('· · ·', cx, textTop + 88);

    /* 9. Reflet en haut à gauche du corps (effet céramique) ─────────────────── */
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(MUG.x, MUG.y, MUG.w, MUG.h, MUG.r);
    ctx.clip();

    const shimmer = ctx.createLinearGradient(MUG.x, MUG.y, MUG.x + MUG.w * 0.35, MUG.y + MUG.h * 0.6);
    shimmer.addColorStop(0, 'rgba(255,255,255,0.18)');
    shimmer.addColorStop(0.4, 'rgba(255,255,255,0.04)');
    shimmer.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shimmer;
    ctx.fillRect(MUG.x, MUG.y + MUG.bandH, MUG.w * 0.35, MUG.h - MUG.bandH);

    ctx.restore();
  }

  /* ── API publique ────────────────────────────────────────────────────────── */
  window.MugPreview = {
    /**
     * Initialise le canvas et dessine un premier aperçu.
     * @param {string} canvasId  — id de l'élément <canvas>
     * @param {object} [data]    — { name, milestone, date }
     */
    init(canvasId, data) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      canvas.width  = W;
      canvas.height = H;
      drawMug(canvas, data || {});
    },

    /**
     * Redessine avec de nouvelles données (appel live sur input).
     * @param {string} canvasId
     * @param {object} data — { name, milestone, date }
     */
    update(canvasId, data) {
      const canvas = document.getElementById(canvasId);
      if (canvas) drawMug(canvas, data);
    },

    /**
     * Retourne la dataURL PNG du canvas pour envoi au worker.
     * @param {string} canvasId
     * @returns {string|null}
     */
    toBase64(canvasId) {
      const canvas = document.getElementById(canvasId);
      return canvas ? canvas.toDataURL('image/png') : null;
    },
  };
})();
