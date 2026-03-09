// ═══════════════════════════════════════════════════════════════════════════
// WHEEL PICKER — iOS-style scroll wheel for date & time selection
// Pure vanilla JS, zero dependencies
// ═══════════════════════════════════════════════════════════════════════════

class WheelPicker {
  /**
   * @param {HTMLElement} colEl       — the .wheel-col container
   * @param {string[]}    items       — display labels for each position
   * @param {number}      initialIndex — 0-based starting index
   * @param {Function}    onChange    — called with (index, value) on change
   * @param {object}      [opts]      — { itemH: number } override (default 40)
   */
  constructor(colEl, items, initialIndex, onChange, opts = {}) {
    this.el      = colEl;
    this.items   = items;
    this.index   = Math.max(0, Math.min(initialIndex, items.length - 1));
    this.onChange = onChange;

    this.itemH        = opts.itemH ?? 40;
    this.visibleItems = 5;
    this.centerOffset = Math.floor(this.visibleItems / 2) * this.itemH; // 80 or 72px

    this._y         = -this.index * this.itemH;
    this._dragging  = false;
    this._startY    = 0;
    this._startOffset = 0;
    this._velocity  = 0;
    this._lastY     = 0;
    this._lastTime  = 0;
    this._raf       = null;

    this._build();
    this._attachEvents();
    this._render();
  }

  // ── Build DOM ──────────────────────────────────────────────────────────────
  _build() {
    this.track = document.createElement('div');
    this.track.className = 'wheel-track';
    this.track.style.top = this.centerOffset + 'px';

    this.itemEls = this.items.map((item, i) => {
      const div = document.createElement('div');
      div.className = 'wheel-item';
      div.textContent = item;
      div.dataset.index = i;
      this.track.appendChild(div);
      return div;
    });

    this.el.appendChild(this.track);
    this.el.setAttribute('aria-valuemin', '0');
    this.el.setAttribute('aria-valuemax', String(this.items.length - 1));
    this.el.setAttribute('aria-valuenow',  String(this.index));
    this.el.setAttribute('aria-valuetext', String(this.items[this.index] ?? ''));
  }

  // ── Render — apply 3D transforms to all items ─────────────────────────────
  _render() {
    const y = this._y;
    this.track.style.transform = `translateY(${y}px)`;

    const containerMid = this.centerOffset + this.itemH / 2;

    this.itemEls.forEach((el, i) => {
      // Distance of this item's centre from the picker's centre line
      const itemMid = i * this.itemH + this.centerOffset + this.itemH / 2;
      const offset  = (itemMid + y) - containerMid;
      const maxOff  = this.centerOffset + this.itemH;
      const ratio   = Math.abs(offset) / maxOff;

      // 3D tilt — clamped to ±60° so items far away look "around the wheel"
      const rotX    = Math.max(-60, Math.min(60, -offset * 0.4));
      const scale   = Math.max(0.70, 1 - ratio * 0.25);
      const opacity = Math.max(0.08, 1 - ratio * 0.78);

      el.style.transform = `perspective(500px) rotateX(${rotX}deg) scale(${scale})`;
      el.style.opacity    = opacity;
      el.classList.toggle('is-selected', i === this.index);
    });

    this.el.setAttribute('aria-valuenow',  String(this.index));
    this.el.setAttribute('aria-valuetext', String(this.items[this.index] ?? ''));
  }

  // ── Snap to a given (possibly fractional) index with momentum easing ──────
  _snapTo(rawIndex) {
    const newIndex = Math.max(0, Math.min(this.items.length - 1, Math.round(rawIndex)));
    const targetY  = -newIndex * this.itemH;

    if (newIndex !== this.index) {
      this.index = newIndex;
      this.onChange(newIndex, this.items[newIndex]);
    } else {
      this.index = newIndex;
    }

    this._animateTo(targetY);
  }

  // ── Smooth animation to a target Y using ease-out cubic ───────────────────
  _animateTo(targetY) {
    if (this._raf) cancelAnimationFrame(this._raf);

    const startY    = this._y;
    const diff      = targetY - startY;
    const duration  = 320; // ms
    const startTime = performance.now();

    // Ease-out cubic
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      this._y = startY + diff * ease(t);
      this._render();
      if (t < 1) this._raf = requestAnimationFrame(tick);
    };

    this._raf = requestAnimationFrame(tick);
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  _attachEvents() {
    // Mouse drag
    this.el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._onStart(e.clientY);
    });
    // Use window so drag continues outside the column
    this._boundMouseMove = (e) => this._onMove(e.clientY);
    this._boundMouseUp   = ()  => this._onEnd();
    window.addEventListener('mousemove', this._boundMouseMove);
    window.addEventListener('mouseup',   this._boundMouseUp);

    // Touch
    this.el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._onStart(e.touches[0].clientY);
    }, { passive: false });
    this.el.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this._onMove(e.touches[0].clientY);
    }, { passive: false });
    this.el.addEventListener('touchend',   () => this._onEnd());
    this.el.addEventListener('touchcancel',() => this._onEnd());

    // Wheel scroll — one notch at a time, no native page scroll
    this.el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      this._snapTo(this.index + dir);
    }, { passive: false });

    // Keyboard — spinbutton pattern
    this.el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp')   { e.preventDefault(); this._snapTo(this.index - 1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); this._snapTo(this.index + 1); }
      if (e.key === 'Home')      { e.preventDefault(); this._snapTo(0); }
      if (e.key === 'End')       { e.preventDefault(); this._snapTo(this.items.length - 1); }
      if (e.key === 'PageUp')    { e.preventDefault(); this._snapTo(this.index - 5); }
      if (e.key === 'PageDown')  { e.preventDefault(); this._snapTo(this.index + 5); }
    });

    // Click directly on a visible item
    this.el.addEventListener('click', (e) => {
      const item = e.target.closest('.wheel-item');
      if (!item) return;
      const i = parseInt(item.dataset.index, 10);
      this._snapTo(i);
    });
  }

  // ── Drag helpers ───────────────────────────────────────────────────────────
  _onStart(clientY) {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._dragging    = true;
    this._startY      = clientY;
    this._startOffset = this._y;
    this._velocity    = 0;
    this._lastY       = clientY;
    this._lastTime    = performance.now();
    this.el.style.cursor = 'grabbing';
  }

  _onMove(clientY) {
    if (!this._dragging) return;
    const dy  = clientY - this._startY;
    const now = performance.now();
    const dt  = now - this._lastTime;

    if (dt > 0) this._velocity = (clientY - this._lastY) / dt;
    this._lastY   = clientY;
    this._lastTime = now;

    // Apply rubber-band resistance at edges
    let newY = this._startOffset + dy;
    const minY = -(this.items.length - 1) * this.itemH;
    const maxY = 0;
    if (newY > maxY) newY = maxY + (newY - maxY) * 0.18;
    if (newY < minY) newY = minY + (newY - minY) * 0.18;

    this._y = newY;

    // Snap index while dragging so onChange fires continuously
    const liveIndex = Math.max(0, Math.min(this.items.length - 1, Math.round(-newY / this.itemH)));
    if (liveIndex !== this.index) {
      this.index = liveIndex;
      this.onChange(liveIndex, this.items[liveIndex]);
    }

    this._render();
  }

  _onEnd() {
    if (!this._dragging) return;
    this._dragging       = false;
    this.el.style.cursor = 'grab';

    // Project forward with momentum (velocity * decay constant)
    const momentum      = this._velocity * 80;
    const projectedY    = this._y + momentum;
    const projectedIndex = -projectedY / this.itemH;

    this._snapTo(projectedIndex);
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  setIndex(index, animate = true) {
    const newIndex = Math.max(0, Math.min(this.items.length - 1, index));
    if (newIndex === this.index) return;
    this.index = newIndex;
    this._y    = -newIndex * this.itemH;
    if (animate) {
      this._animateTo(this._y);
    } else {
      this._render();
    }
  }

  // Rebuild the list of items (used when days-in-month changes)
  rebuildItems(newItems, keepIndex = true) {
    this.items = newItems;
    const clampedIndex = Math.min(this.index, newItems.length - 1);

    // Update or hide existing item elements
    this.itemEls.forEach((el, i) => {
      if (i < newItems.length) {
        el.textContent   = newItems[i];
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // If we need more items than originally built, add them
    for (let i = this.itemEls.length; i < newItems.length; i++) {
      const div = document.createElement('div');
      div.className    = 'wheel-item';
      div.textContent  = newItems[i];
      div.dataset.index = i;
      this.track.appendChild(div);
      this.itemEls.push(div);
    }

    this.el.setAttribute('aria-valuemax', String(newItems.length - 1));

    if (keepIndex && clampedIndex !== this.index) {
      this.index = clampedIndex;
      this._y    = -clampedIndex * this.itemH;
    }
    this._render();
  }

  getValue()  { return this.items[this.index]; }
  getIndex()  { return this.index; }
}


// ═══════════════════════════════════════════════════════════════════════════
// INIT — create & wire up all wheel pickers after DOM is ready
// ═══════════════════════════════════════════════════════════════════════════

function initWheelPickers() {
  // ── Responsive item height ─────────────────────────────────────────────────
  // On narrow screens iOS uses slightly smaller rows — we match the CSS value.
  const isMobile = window.innerWidth <= 480;
  const ITEM_H   = isMobile ? 36 : 40;
  const pickerOpts = { itemH: ITEM_H };

  // ── Data arrays ───────────────────────────────────────────────────────────
  const today       = new Date();
  const currentYear = today.getFullYear();

  const days   = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = [
    'janvier','février','mars','avril','mai','juin',
    'juillet','août','septembre','octobre','novembre','décembre'
  ];
  // Years in descending order (newest first, like iOS)
  const years  = Array.from(
    { length: currentYear - 1920 + 1 },
    (_, i) => String(currentYear - i)
  );
  const hours   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // ── State ──────────────────────────────────────────────────────────────────
  // Default: 1 January 1990
  let dateState = { day: 1, month: 0, year: 1990 };
  // Time state: null means "not set" → #bt stays empty → calculate() uses '12:00' default
  let timeState = { hour: null, minute: null };

  // ── Hidden input sync helpers ──────────────────────────────────────────────
  function syncDateInput() {
    const bd = document.getElementById('bd');
    if (!bd) return;
    const d = String(dateState.day).padStart(2, '0');
    const m = String(dateState.month + 1).padStart(2, '0');
    bd.value = `${dateState.year}-${m}-${d}`;
    // Dispatch change so any existing listeners react
    bd.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function syncTimeInput() {
    const bt = document.getElementById('bt');
    if (!bt || timeState.hour === null) return;
    const h = String(timeState.hour).padStart(2, '0');
    const m = String(timeState.minute ?? 0).padStart(2, '0');
    bt.value = `${h}:${m}`;
    bt.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ── Days-in-month update ───────────────────────────────────────────────────
  function updateDaysInMonth() {
    const daysInMonth = new Date(dateState.year, dateState.month + 1, 0).getDate();
    const newDays = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

    if (dayPicker) {
      const prevDay = dateState.day;
      dayPicker.rebuildItems(newDays, true);

      // If the chosen day exceeds the new max, clamp it
      if (prevDay > daysInMonth) {
        dateState.day = daysInMonth;
        dayPicker.setIndex(daysInMonth - 1);
      }
    }
  }

  // ── Instantiate pickers ────────────────────────────────────────────────────
  const dayPicker = new WheelPicker(
    document.getElementById('wcol-day'),
    days,
    dateState.day - 1,  // index 0 = day 1
    (i) => {
      dateState.day = i + 1;
      syncDateInput();
    },
    pickerOpts
  );

  const monthPicker = new WheelPicker(
    document.getElementById('wcol-month'),
    months,
    dateState.month,
    (i) => {
      dateState.month = i;
      updateDaysInMonth();
      syncDateInput();
    },
    pickerOpts
  );

  const yearPicker = new WheelPicker(
    document.getElementById('wcol-year'),
    years,
    years.indexOf(String(dateState.year)),
    (i) => {
      dateState.year = parseInt(years[i], 10);
      updateDaysInMonth();
      syncDateInput();
    },
    pickerOpts
  );

  const hourPicker = new WheelPicker(
    document.getElementById('wcol-hour'),
    hours,
    12, // default 12:00
    (i) => {
      timeState.hour = i;
      if (timeState.minute === null) timeState.minute = 0;
      syncTimeInput();
    },
    pickerOpts
  );

  const minutePicker = new WheelPicker(
    document.getElementById('wcol-min'),
    minutes,
    0,
    (i) => {
      timeState.minute = i;
      // Only write to #bt if user has also touched the hour wheel
      if (timeState.hour !== null) syncTimeInput();
    },
    pickerOpts
  );

  // ── Expose on window for external sync (prefillMilestone, URL restore) ─────
  window._wheelPickers = {
    dayPicker, monthPicker, yearPicker, hourPicker, minutePicker,
    years, months,
    setDate(isoDateStr) {
      // isoDateStr: "YYYY-MM-DD"
      const d = new Date(isoDateStr + 'T12:00:00');
      if (isNaN(d)) return;
      dateState.day   = d.getDate();
      dateState.month = d.getMonth();
      dateState.year  = d.getFullYear();
      dayPicker.setIndex(dateState.day - 1);
      monthPicker.setIndex(dateState.month);
      const yIdx = years.indexOf(String(dateState.year));
      if (yIdx !== -1) yearPicker.setIndex(yIdx);
      syncDateInput();
    },
    setTime(hhmm) {
      // hhmm: "HH:MM"
      const parts = hhmm.split(':');
      if (parts.length < 2) return;
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (isNaN(h) || isNaN(m)) return;
      timeState.hour   = h;
      timeState.minute = m;
      hourPicker.setIndex(h);
      minutePicker.setIndex(m);
      syncTimeInput();
    }
  };

  // ── Initial sync so #bd has a value on page load ───────────────────────────
  syncDateInput();
}

// Boot after DOM is ready
document.addEventListener('DOMContentLoaded', initWheelPickers);
