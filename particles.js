/* ─── Homepage Particle + Construction Line System ──────────────────────────
   1. Background drifting particles across the full hero
   2. Name particle cloud (letters assembled from dots)
   3. Architectural construction lines — perspective/section layout
─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* Hide name text immediately so it never flashes before particles build */
  const nameElEarly = document.querySelector('.hero-name');
  if (nameElEarly) nameElEarly.style.color = 'transparent';

  /* ════════════════════════════════════════════════════════════════════════
     PART 1 — BACKGROUND PARTICLE FIELD (full hero canvas)
  ════════════════════════════════════════════════════════════════════════ */
  (function bgParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    const COUNT = 55;
    let dots = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function makeDot() {
      const angle = Math.random() * Math.PI * 2;
      const spd   = 0.15 + Math.random() * 0.25;
      return {
        x:     Math.random() * W,
        y:     Math.random() * H,
        vx:    Math.cos(angle) * spd,
        vy:    Math.sin(angle) * spd,
        r:     0.6 + Math.random() * 1.1,
        alpha: 0.08 + Math.random() * 0.22,
        pulse: Math.random() * Math.PI * 2,
      };
    }

    dots = Array.from({ length: COUNT }, makeDot);

    /* mouse — subtle attraction */
    const mouse = { x: -9999, y: -9999 };
    const hero  = document.getElementById('hero');
    if (hero) {
      hero.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }, { passive: true });
      hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    }

    function bgLoop() {
      ctx.clearRect(0, 0, W, H);

      /* draw connections between nearby dots */
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx   = dots[i].x - dots[j].x;
          const dy   = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const a = (1 - dist / 120) * 0.07;
            ctx.strokeStyle = `rgba(200,184,154,${a})`;
            ctx.lineWidth   = 0.5;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      /* update & draw dots */
      const t = Date.now() * 0.001;
      dots.forEach(d => {
        /* gentle mouse repulsion */
        const dx   = d.x - mouse.x;
        const dy   = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
          d.vx += (dx / dist) * 0.012;
          d.vy += (dy / dist) * 0.012;
        }

        /* speed limit */
        const spd = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
        if (spd > 0.6) { d.vx *= 0.96; d.vy *= 0.96; }
        if (spd < 0.08) {
          d.vx += (Math.random() - 0.5) * 0.04;
          d.vy += (Math.random() - 0.5) * 0.04;
        }

        d.x += d.vx;
        d.y += d.vy;

        /* wrap edges */
        if (d.x < -10) d.x = W + 10;
        if (d.x > W + 10) d.x = -10;
        if (d.y < -10) d.y = H + 10;
        if (d.y > H + 10) d.y = -10;

        const a = d.alpha * (0.7 + 0.3 * Math.sin(t * 0.8 + d.pulse));
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(bgLoop);
    }

    bgLoop();
  })();


  /* ════════════════════════════════════════════════════════════════════════
     PART 2 — NAME PARTICLE CLOUD + CONSTRUCTION LINES
  ════════════════════════════════════════════════════════════════════════ */
  document.fonts.ready.then(function () {
    const nameEl = document.querySelector('.hero-name');
    if (!nameEl) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    /* canvas extends well beyond the name to fit the construction lines */
    const PL = 60;   /* left  */
    const PR = 320;  /* right — large: perspective lines go far right */
    const PT = 110;  /* top   */
    const PB = 80;   /* bottom */

    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d');
    nameEl.style.position = 'relative';
    Object.assign(canvas.style, {
      position:      'absolute',
      top:           -PT + 'px',
      left:          -PL + 'px',
      pointerEvents: 'none',
      zIndex:        '5',
    });
    nameEl.appendChild(canvas);

    const lines = Array.from(nameEl.querySelectorAll('.line')).map(el => el.textContent.trim());

    let CW, CH, W, H, particles = [];

    const AC = (a) => `rgba(200,184,154,${a})`;
    const WC = (a) => `rgba(255,255,255,${a})`;

    /* ── Build ── */
    function build() {
      const rect = nameEl.getBoundingClientRect();
      W  = rect.width;
      H  = rect.height;
      CW = W + PL + PR;
      CH = H + PT + PB;

      canvas.width  = Math.round(CW * DPR);
      canvas.height = Math.round(CH * DPR);
      canvas.style.width  = CW + 'px';
      canvas.style.height = CH + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(DPR, DPR);

      /* rasterise name for pixel sampling */
      const off = document.createElement('canvas');
      off.width  = Math.round(W * DPR);
      off.height = Math.round(H * DPR);
      const oc   = off.getContext('2d');
      const cs   = window.getComputedStyle(nameEl);
      const fs   = parseFloat(cs.fontSize);
      const lh   = fs * 0.92;
      const ls   = (fs * -0.03) * DPR;

      oc.font         = `300 ${fs * DPR}px 'Inter', sans-serif`;
      oc.fillStyle    = '#fff';
      oc.textBaseline = 'top';
      if ('letterSpacing' in oc) oc.letterSpacing = ls + 'px';
      lines.forEach((line, i) => oc.fillText(line, 0, i * lh * DPR));

      const { data } = oc.getImageData(0, 0, off.width, off.height);
      const STEP = 5;
      const pts  = [];
      for (let y = 0; y < off.height; y += STEP) {
        for (let x = 0; x < off.width; x += STEP) {
          if (data[(y * off.width + x) * 4 + 3] > 120) {
            pts.push({ tx: x / DPR + PL, ty: y / DPR + PT });
          }
        }
      }

      particles = pts.map(({ tx, ty }) => {
        const angle = Math.random() * Math.PI * 2;
        const dist  = CW * 0.35 + Math.random() * CW * 0.45;
        return {
          tx, ty,
          x:     CW / 2 + Math.cos(angle) * dist,
          y:     CH / 2 + Math.sin(angle) * dist,
          vx:    (Math.random() - 0.5) * 1.5,
          vy:    (Math.random() - 0.5) * 1.5,
          size:  0.9 + Math.random() * 1.0,
          phase: Math.random() * Math.PI * 2,
          delay: Math.round((tx - PL) * 0.14 + (ty - PT) * 0.05),
        };
      });
    }

    /* ── Mouse for name canvas ── */
    const mouse = { x: -9999, y: -9999 };
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.addEventListener('mousemove', e => {
        const r = nameEl.getBoundingClientRect();
        mouse.x = e.clientX - r.left + PL;
        mouse.y = e.clientY - r.top  + PT;
      }, { passive: true });
      heroEl.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    }

    /* ── Helpers ── */
    let frame = 0;

    function prog(start, dur) {
      return Math.max(0, Math.min(1, (frame - start) / dur));
    }
    function aLine(x1, y1, x2, y2, p) {
      if (p <= 0) return;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p);
      ctx.stroke();
    }
    function mono(text, x, y, alpha, size) {
      if (alpha <= 0) return;
      ctx.save();
      ctx.font      = `400 ${size || 8}px 'Space Mono', monospace`;
      ctx.fillStyle = AC(alpha);
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    /* ── NEW construction line layout — PERSPECTIVE / SECTION CUT ── */
    function drawConstruction() {
      /* name box in canvas space */
      const nx = PL,     ny = PT;           /* top-left of name */
      const nr = PL + W, nb = PT + H;       /* bottom-right */
      const nMx = PL + W / 2;              /* name centre-x */
      const nMy = PT + H / 2;              /* name centre-y */

      /* vanishing point — far right of canvas, vertically centred on name */
      const vx = CW + 60;
      const vy = nMy;

      ctx.lineWidth = 0.5;

      /* ─── A. Bold section-cut horizontal axis ─── */
      /* runs the full canvas width at name mid-height */
      const pAxis = prog(40, 80);
      ctx.strokeStyle = AC(0.30);
      ctx.lineWidth   = 0.6;
      aLine(0, nMy, CW, nMy, pAxis);

      /* section marker triangles at both ends */
      if (pAxis > 0.95) {
        const pMark = prog(120, 20);
        ctx.fillStyle = AC(0.25 * pMark);
        /* left marker */
        ctx.beginPath();
        ctx.moveTo(4, nMy);
        ctx.lineTo(14, nMy - 8);
        ctx.lineTo(14, nMy + 8);
        ctx.fill();
        /* right marker */
        ctx.beginPath();
        ctx.moveTo(CW - 4, nMy);
        ctx.lineTo(CW - 14, nMy - 8);
        ctx.lineTo(CW - 14, nMy + 8);
        ctx.fill();
        mono('A', 6,  nMy - 12, 0.35 * pMark, 9);
        mono('A', CW - 14, nMy - 12, 0.35 * pMark, 9);
      }

      /* ─── B. Perspective rays from vanishing point through name corners ─── */
      const pRays = prog(55, 90);
      ctx.strokeStyle = AC(0.14);
      ctx.lineWidth   = 0.4;

      /* rays to all 4 corners of the name box, extending back to left */
      [[nx, ny], [nx, nb], [nr, ny], [nr, nb]].forEach(([cx, cy]) => {
        /* direction from VP to corner, then extend beyond */
        const dx = cx - vx;
        const dy = cy - vy;
        const len = Math.sqrt(dx * dx + dy * dy);
        /* end point: go until x = 0 */
        const t = (0 - vx) / dx;
        const ex = vx + dx * t;
        const ey = vy + dy * t;
        aLine(vx, vy, ex, ey, pRays);
      });

      /* extra rays — through name midpoints */
      ctx.strokeStyle = AC(0.08);
      [[nMx, ny], [nMx, nb], [nx, nMy], [nr, nMy]].forEach(([cx, cy]) => {
        const dx = cx - vx;
        const dy = cy - vy;
        const t  = (0 - vx) / dx;
        const ex = vx + dx * t;
        const ey = vy + dy * t;
        aLine(vx, vy, ex, ey, pRays);
      });

      /* ─── C. Vertical section lines (parallel to axis) ─── */
      const pVerts = prog(80, 60);
      ctx.lineWidth   = 0.4;

      /* left of name */
      ctx.strokeStyle = AC(0.20);
      aLine(nx - 18, ny - 20, nx - 18, nb + 20, pVerts);

      /* right of name */
      ctx.strokeStyle = AC(0.18);
      aLine(nr + 22, ny - 20, nr + 22, nb + 20, pVerts);

      /* tick marks on these verticals */
      if (pVerts > 0.95) {
        const pTick = prog(140, 25);
        ctx.lineWidth   = 0.5;
        ctx.strokeStyle = AC(0.28 * pTick);
        [ny - 20, nMy, nb + 20].forEach(ty => {
          /* left */
          ctx.beginPath(); ctx.moveTo(nx - 24, ty); ctx.lineTo(nx - 12, ty); ctx.stroke();
          /* right */
          ctx.beginPath(); ctx.moveTo(nr + 16, ty); ctx.lineTo(nr + 28, ty); ctx.stroke();
        });
      }

      /* ─── D. Top frame line + title block elements ─── */
      const pTop = prog(65, 70);
      ctx.strokeStyle = AC(0.18);
      ctx.lineWidth   = 0.4;
      aLine(nx - 18, ny - 36, CW - 10, ny - 36, pTop);

      /* small vertical drops from frame to name corners */
      const pDrops = prog(130, 40);
      ctx.strokeStyle = AC(0.15);
      aLine(nx, ny - 36, nx, ny, pDrops);
      aLine(nr, ny - 36, nr, ny, pDrops);

      /* ─── E. Bottom baseline + ground line ─── */
      const pBase = prog(70, 70);
      ctx.strokeStyle = AC(0.16);
      ctx.lineWidth   = 0.4;
      aLine(0, nb + 32, CW - 10, nb + 32, pBase);

      /* dashed continuation below baseline */
      const pBaseD = prog(140, 50);
      if (pBaseD > 0) {
        ctx.save();
        ctx.strokeStyle = AC(0.09);
        ctx.lineWidth   = 0.35;
        ctx.setLineDash([5, 6]);
        aLine(0, nb + 48, CW - 10, nb + 48, pBaseD);
        ctx.restore();
      }

      /* ─── F. Labels and annotations ─── */
      const pLabel = prog(150, 40);
      mono('SECTION  A–A', PL + 4, nb + 46, 0.28 * pLabel, 8);
      mono('SCALE  1:∞',   PL + 4, nb + 57, 0.20 * pLabel, 7);

      /* elevation mark on left vertical */
      const pElev = prog(160, 35);
      mono('±0.00',  nx - 52, nMy + 3, 0.28 * pElev, 8);
      mono('+H',     nx - 36, ny - 8,  0.22 * pElev, 8);

      /* right annotation */
      mono('VP →', nr + 32, nMy + 3, 0.20 * pLabel, 8);

      /* ─── G. Corner registration crosses ─── */
      const pCross = prog(50, 30);
      if (pCross > 0) {
        ctx.strokeStyle = AC(0.30 * pCross);
        ctx.lineWidth   = 0.5;
        [[nx, ny], [nr, ny], [nx, nb], [nr, nb]].forEach(([cx, cy]) => {
          const arm = 8 * pCross;
          ctx.beginPath();
          ctx.moveTo(cx - arm, cy); ctx.lineTo(cx + arm, cy);
          ctx.moveTo(cx, cy - arm); ctx.lineTo(cx, cy + arm);
          ctx.stroke();
        });
      }

      /* ─── H. Fine grid in the padding area to the right ─── */
      const pGrid = prog(170, 60);
      if (pGrid > 0) {
        ctx.strokeStyle = AC(0.05 * pGrid);
        ctx.lineWidth   = 0.3;
        const gx0 = nr + 40, gx1 = CW - 8;
        const gy0 = ny,      gy1 = nb;
        const cols = 5, rows = 4;
        for (let c = 0; c <= cols; c++) {
          const x = gx0 + (gx1 - gx0) * (c / cols);
          ctx.beginPath(); ctx.moveTo(x, gy0); ctx.lineTo(x, gy1); ctx.stroke();
        }
        for (let r = 0; r <= rows; r++) {
          const y = gy0 + (gy1 - gy0) * (r / rows);
          ctx.beginPath(); ctx.moveTo(gx0, y); ctx.lineTo(gx1, y); ctx.stroke();
        }
      }
    }

    /* ── Main loop ── */
    function loop() {
      ctx.clearRect(0, 0, CW, CH);
      frame++;

      drawConstruction();

      /* name particles */
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (frame < p.delay) continue;

        p.vx += (p.tx - p.x) * 0.055;
        p.vy += (p.ty - p.y) * 0.055;

        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md  = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 100 && md > 0) {
          const f = ((100 - md) / 100) * 6;
          p.vx += (mdx / md) * f;
          p.vy += (mdy / md) * f;
        }

        if (Math.hypot(p.tx - p.x, p.ty - p.y) < 14) {
          p.vx += Math.cos(p.phase + frame * 0.014) * 0.06;
          p.vy += Math.sin(p.phase + frame * 0.014) * 0.06;
        }

        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x  += p.vx;
        p.y  += p.vy;

        const age   = frame - p.delay;
        const alpha = Math.min(0.9, age * 0.035);
        ctx.fillStyle = WC(alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(loop);
    }

    build();
    loop();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    }, { passive: true });
  });

}());
