/* ============================================================
   HIMANSHU KUMAR — Portfolio JavaScript
   ============================================================ */

'use strict';

/* ── SCROLL REVEAL ─────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ── ACTIVE NAV LINK ──────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
  });
  navLinks.forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });

/* ── MOBILE DRAWER ────────────────────────────────────────── */
const hamburger     = document.getElementById('hamburger');
const mobileDrawer  = document.getElementById('mobileDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');

function openDrawer() {
  hamburger.classList.add('open');
  mobileDrawer.classList.add('open');
  drawerOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  hamburger.classList.remove('open');
  mobileDrawer.classList.remove('open');
  drawerOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  hamburger.classList.contains('open') ? closeDrawer() : openDrawer();
});

drawerOverlay?.addEventListener('click', closeDrawer);

document.querySelectorAll('.drawer-link').forEach((link) => {
  link.addEventListener('click', closeDrawer);
});

/* ── RESUME ACTIONS ───────────────────────────────────────── */
// Replace the alert with your actual resume PDF URL:
// e.g. window.open('https://drive.google.com/your-resume.pdf', '_blank');

function downloadResume(e) {
  e.preventDefault();
  // TODO: Replace with your actual PDF download link
  alert(
    '📄 Resume Download\n\n' +
    'Replace this function in js/main.js:\n\n' +
    'window.open("YOUR_RESUME_URL.pdf", "_blank");'
  );
}

function viewResume(e) {
  e.preventDefault();
  // TODO: Replace with your Google Docs / PDF viewer URL
  alert(
    '👁 View Resume\n\n' +
    'Replace this function in js/main.js:\n\n' +
    'window.open("YOUR_RESUME_VIEW_URL", "_blank");'
  );
}

document.querySelectorAll('[data-resume="download"]').forEach((el) =>
  el.addEventListener('click', downloadResume)
);

document.querySelectorAll('[data-resume="view"]').forEach((el) =>
  el.addEventListener('click', viewResume)
);

/* ── CONTACT FORM ─────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const GOOGLE_SHEETS_WEBHOOK_URL = '';
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
const SUPABASE_TABLE = 'contact_messages';

async function logToGoogleSheets(payload) {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) return { skipped: true };

  const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('Google Sheets logging failed');
  return { skipped: false };
}

async function logToSupabase(payload) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { skipped: true };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: 'return=minimal'
    },
    body: JSON.stringify([payload])
  });

  if (!response.ok) throw new Error('Supabase logging failed');
  return { skipped: false };
}

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('cName').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const message = document.getElementById('cMessage').value.trim();

  if (!name || !email || !message) {
    alert('Please fill in all fields.'); return;
  }

  const btn = contactForm.querySelector('.btn-send');
  const orig = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;

  const payload = {
    name,
    email,
    message,
    source: 'static-portfolio',
    created_at: new Date().toISOString()
  };

  try {
    const response = await fetch('https://formsubmit.co/ajax/rohithimanshu08@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        _subject: `Portfolio message from ${name}`,
        _captcha: 'false'
      })
    });

    if (!response.ok) throw new Error('Message send failed');

    const results = await Promise.allSettled([
      logToGoogleSheets(payload),
      logToSupabase(payload)
    ]);

    const sinkFailed = results.some((result) => result.status === 'rejected');

    btn.textContent = sinkFailed ? 'Sent (partial) ✓' : 'Message Sent ✓';
    contactForm.reset();
  } catch (err) {
    btn.textContent = 'Send Failed';
    alert('Message could not be sent. Please try again.');
  } finally {
    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
    }, 2200);
  }
});

/* ── SMOOTH SCROLL for anchor buttons ────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── NAV HIDE ON SCROLL DOWN ──────────────────────────────── */
let lastScrollY = window.scrollY;
const navEl = document.querySelector('nav');

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  if (currentY > lastScrollY && currentY > 120) {
    navEl.style.transform = 'translateY(-100%)';
  } else {
    navEl.style.transform = 'translateY(0)';
  }
  lastScrollY = currentY;
}, { passive: true });

navEl.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

/* ── CUSTOM CURSOR ────────────────────────────────────────── */
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

if (cursorDot && cursorOutline) {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  if (isTouch) {
    cursorDot.style.display = 'none';
    cursorOutline.style.display = 'none';
  }

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let outlineX = targetX;
  let outlineY = targetY;
  let lastTrailAt = 0;
  let prevX = targetX;
  let prevY = targetY;

  const spawnTrailParticle = (x, y, speed) => {
    const particle = document.createElement('span');
    particle.className = 'cursor-spark';
    const size = Math.min(10, 4 + speed * 0.08 + Math.random() * 2.4);
    particle.style.width = `${size.toFixed(2)}px`;
    particle.style.height = `${size.toFixed(2)}px`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.background = 'radial-gradient(circle, rgba(200, 255, 255, 0.95) 0%, rgba(0, 229, 255, 0.85) 42%, rgba(0, 229, 255, 0.05) 76%)';
    particle.style.boxShadow = '0 0 12px rgba(0, 229, 255, 0.95), 0 0 26px rgba(0, 229, 255, 0.5)';
    const driftX = (Math.random() - 0.5) * 46;
    const driftY = (Math.random() - 0.5) * 46;
    particle.style.setProperty('--tx', `${driftX.toFixed(1)}px`);
    particle.style.setProperty('--ty', `${driftY.toFixed(1)}px`);
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 760);
  };

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    cursorDot.style.left = `${targetX}px`;
    cursorDot.style.top = `${targetY}px`;

    prevX = targetX;
    prevY = targetY;
  }, { passive: true });

  const animateCursor = () => {
    let distX = targetX - outlineX;
    let distY = targetY - outlineY;
    outlineX += distX * 0.11;
    outlineY += distY * 0.11;
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;
    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

  document.querySelectorAll('a, button, input, .nav__link, .projects__button, .contact__button, .scrollup, .qualification__button').forEach((el) => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hovered'));
  });

  // Switch cursor to a glowing cyan 12px circle when hovering buttons.
  document.querySelectorAll('.button, .projects__button, .qualification__button, .btn-send, button, [type="button"], [type="submit"]').forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      cursorDot.classList.add('button-hover');
      cursorOutline.classList.add('button-hover');
    });
    btn.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('button-hover');
      cursorOutline.classList.remove('button-hover');
    });
  });
}

/* ── CARD TILT + SPOTLIGHT ───────────────────────────────── */
const cardSelectors = [
  '.about__box',
  '.skills__content',
  '.projects__card',
  '.contact__item'
].join(', ');

const tiltCards = document.querySelectorAll(cardSelectors);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  const cardStates = new Map();
  const magneticRange = 210;
  const maxPull = 7;
  const maxTilt = 12;

  tiltCards.forEach((card) => {
    card.classList.add('cursor-tilt-card');
    cardStates.set(card, { hovered: false });

    card.addEventListener('mousemove', (event) => {
      const state = cardStates.get(card);
      state.hovered = true;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;

      const tiltY = (px - 0.5) * (maxTilt * 2);
      const tiltX = (0.5 - py) * (maxTilt * 2);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const pullX = Math.max(-maxPull, Math.min(maxPull, ((x - centerX) / (centerX || 1)) * maxPull * 0.55));
      const pullY = Math.max(-maxPull, Math.min(maxPull, ((y - centerY) / (centerY || 1)) * maxPull * 0.55));

      card.style.setProperty('--spot-x', `${(px * 100).toFixed(2)}%`);
      card.style.setProperty('--spot-y', `${(py * 100).toFixed(2)}%`);
      card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
      card.style.setProperty('--pull-x', `${pullX.toFixed(2)}px`);
      card.style.setProperty('--pull-y', `${pullY.toFixed(2)}px`);
      card.classList.add('card-nearby');
    });

    card.addEventListener('mouseleave', () => {
      const state = cardStates.get(card);
      state.hovered = false;

      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--spot-x', '50%');
      card.style.setProperty('--spot-y', '50%');
    });
  });

  window.addEventListener('mousemove', (event) => {
    tiltCards.forEach((card) => {
      const state = cardStates.get(card);
      if (state.hovered) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance < magneticRange) {
        const influence = 1 - distance / magneticRange;
        const normX = dx / (rect.width / 2 || 1);
        const normY = dy / (rect.height / 2 || 1);
        const pullX = Math.max(-maxPull, Math.min(maxPull, normX * maxPull * influence));
        const pullY = Math.max(-maxPull, Math.min(maxPull, normY * maxPull * influence));

        card.style.setProperty('--pull-x', `${pullX.toFixed(2)}px`);
        card.style.setProperty('--pull-y', `${pullY.toFixed(2)}px`);
        card.classList.add('card-nearby');
      } else {
        card.style.setProperty('--pull-x', '0px');
        card.style.setProperty('--pull-y', '0px');
        card.classList.remove('card-nearby');
      }
    });
  }, { passive: true });
}

/* ── MAGNETIC BUTTON + RIPPLE ────────────────────────────── */
const magneticButtons = document.querySelectorAll(
  '.button, .projects__button, .qualification__button, .btn-send, button, [type="button"], [type="submit"]'
);

if (!reduceMotion) {
  magneticButtons.forEach((button) => {
    button.classList.add('magnetic-button');

    button.addEventListener('mousemove', (event) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normX = (event.clientX - centerX) / (rect.width / 2 || 1);
      const normY = (event.clientY - centerY) / (rect.height / 2 || 1);
      const moveX = Math.max(-8, Math.min(8, normX * 8));
      const moveY = Math.max(-8, Math.min(8, normY * 8));

      button.style.setProperty('--mag-x', `${moveX.toFixed(2)}px`);
      button.style.setProperty('--mag-y', `${moveY.toFixed(2)}px`);
    });

    button.addEventListener('mouseleave', () => {
      button.style.setProperty('--mag-x', '0px');
      button.style.setProperty('--mag-y', '0px');
    });

    button.addEventListener('click', (event) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.className = 'magnetic-ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;

      button.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ── CURSOR PARTICLE TRAIL CANVAS ────────────────────────── */
const cursorTrailCanvas = document.getElementById('cursor-trail-canvas');

if (cursorTrailCanvas) {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  if (isTouch) {
    cursorTrailCanvas.style.display = 'none';
  } else {
    const trailCtx = cursorTrailCanvas.getContext('2d');
    const trailParticles = [];
    const trailColors = ['#FFD060', '#FF9A00', '#FFF0C0'];
    const gravity = 0.04;
    const maxParticles = 420;
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let prevX = cursorX;
    let prevY = cursorY;
    let hasCursor = false;
    let mouseSpeed = 0;

    const resizeTrailCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cursorTrailCanvas.width = Math.floor(window.innerWidth * dpr);
      cursorTrailCanvas.height = Math.floor(window.innerHeight * dpr);
      cursorTrailCanvas.style.width = `${window.innerWidth}px`;
      cursorTrailCanvas.style.height = `${window.innerHeight}px`;
      trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnTrailBurst = (x, y) => {
      const count = 8 + Math.floor(Math.random() * 5);

      for (let i = 0; i < count; i++) {
        const radius = 4 + Math.random() * 4;
        const color = trailColors[Math.floor(Math.random() * trailColors.length)];
        const vx = Math.random() * 3 - 1.5;
        const vy = Math.random() * 3 - 1.5;

        trailParticles.push({
          x,
          y,
          vx,
          vy,
          radius,
          color,
          bornAt: performance.now(),
          ttl: 800
        });

        if (trailParticles.length > maxParticles) {
          trailParticles.shift();
        }
      }
    };

    const spawnClickBurst = (x, y) => {
      const burstCount = 25;

      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.35;
        const speed = 1.8 + Math.random() * 2.8;
        const radius = 4 + Math.random() * 4;
        const color = trailColors[Math.floor(Math.random() * trailColors.length)];

        trailParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius,
          color,
          bornAt: performance.now(),
          ttl: 800
        });

        if (trailParticles.length > maxParticles) {
          trailParticles.shift();
        }
      }
    };

    const renderTrail = (now) => {
      trailCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        const age = now - p.bornAt;

        if (age >= p.ttl) {
          trailParticles.splice(i, 1);
          continue;
        }

        const alpha = 1 - age / p.ttl;
        p.x += p.vx;
        p.vy += gravity;
        p.y += p.vy;

        trailCtx.globalAlpha = alpha;
        trailCtx.shadowBlur = 12;
        trailCtx.shadowColor = p.color;
        const gradient = trailCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.35, p.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        trailCtx.fillStyle = gradient;
        trailCtx.beginPath();
        trailCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        trailCtx.fill();
      }

      // Bright warm source glow at the exact cursor position
      if (hasCursor) {
        trailCtx.globalAlpha = 1;
        trailCtx.shadowBlur = 22;
        trailCtx.shadowColor = '#FFB800';
        const source = trailCtx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, 14);
        source.addColorStop(0,   'rgba(255, 255, 230, 1)');
        source.addColorStop(0.3, 'rgba(255, 200, 50, 0.95)');
        source.addColorStop(0.7, 'rgba(255, 130, 0, 0.50)');
        source.addColorStop(1,   'rgba(255, 80, 0, 0)');
        trailCtx.fillStyle = source;
        trailCtx.beginPath();
        trailCtx.arc(cursorX, cursorY, 14, 0, Math.PI * 2);
        trailCtx.fill();
      }

      // Ensure high visibility on fast movement.
      if (mouseSpeed > 9 && trailParticles.length < 36 && hasCursor) {
        spawnTrailBurst(cursorX, cursorY);
      }

      trailCtx.globalAlpha = 1;
      trailCtx.shadowBlur = 0;
      requestAnimationFrame(renderTrail);
    };

    resizeTrailCanvas();
    requestAnimationFrame(renderTrail);

    window.addEventListener('resize', resizeTrailCanvas);
    window.addEventListener('mousemove', (event) => {
      const x = event.clientX;
      const y = event.clientY;
      const dx = x - prevX;
      const dy = y - prevY;
      const dist = Math.hypot(dx, dy);

      mouseSpeed = dist;
      cursorX = x;
      cursorY = y;
      hasCursor = true;

      const steps = Math.max(1, Math.min(4, Math.floor(dist / 16)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const sx = prevX + dx * t;
        const sy = prevY + dy * t;
        spawnTrailBurst(sx, sy);
      }

      prevX = x;
      prevY = y;
    }, { passive: true });

    window.addEventListener('click', (event) => {
      spawnClickBurst(event.clientX, event.clientY);
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      hasCursor = false;
    });
  }
}

/* ── PARTICLE NETWORK BACKGROUND — disabled, replaced by water bubbles ── */
const particleCanvas = document.getElementById('particle-network');
if (particleCanvas) particleCanvas.style.display = 'none';

/* ── REPEL EFFECT: Content pushes away from cursor ────────── */
const repelCards = document.querySelectorAll(
  '.about__box, .skills__content, .projects__card, .contact__item'
);

const repelRange = 140;
const maxRepel = 12;

if (repelCards && repelCards.length > 0) {
  repelCards.forEach((card) => {
    card.classList.add('card-repel');
  });

  window.addEventListener('mousemove', (event) => {
    repelCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance < repelRange) {
        const influence = 1 - distance / repelRange;
        const angle = Math.atan2(dy, dx);
        const repelDist = influence * maxRepel;
        const repelX = -Math.cos(angle) * repelDist;
        const repelY = -Math.sin(angle) * repelDist;

        card.style.setProperty('--repel-x', `${repelX.toFixed(2)}px`);
        card.style.setProperty('--repel-y', `${repelY.toFixed(2)}px`);
      } else {
        card.style.setProperty('--repel-x', '0px');
        card.style.setProperty('--repel-y', '0px');
      }
    });
  }, { passive: true });
}

/* ── X-RAY REVEAL: Flashlight effect reveals hidden info ──── */
const xrayCards = document.querySelectorAll(
  '.about__box, .skills__content, .projects__card, .contact__item'
);

const xrayData = {
  Experience: '7 years+',
  'Current Role': 'Manager-Design',
  Hobby: '📚 Knowledge',
  'Siemens NX (CAD)': 'Advanced',
  'Teamcenter Enterprise (PLM)': 'Advanced',
  'MATLAB': '3D Sims',
  'COMSOL': 'Thermal',
  'ANSYS': 'Stress',
  'Engine and Aggregates Development': '+50 Projects',
  'BSIII to BSIV and BSV Engine Transition': '+10 Variants',
  'Performance and System Optimization': '+25 Tests',
  'Standards and Emission Compliance Validation': '+60 Reports',
  'Address': '📍 Bihar',
  'Phone': '📞 Active',
  'Email': '📧 Available'
};

if (xrayCards && xrayCards.length > 0) {
  xrayCards.forEach((card) => {
    const titleEl = card.querySelector('h3');
    if (titleEl) {
      const title = titleEl.textContent.trim();
      const xrayValue = xrayData[title];
      
      if (xrayValue) {
        card.classList.add('card-xray');
        card.setAttribute('data-xray', xrayValue);
      }
    }
  });

  window.addEventListener('mousemove', (event) => {
    xrayCards.forEach((card) => {
      if (!card.classList.contains('card-xray')) return;

      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty('--xray-x', `${x.toFixed(2)}%`);
      card.style.setProperty('--xray-y', `${y.toFixed(2)}%`);
    });
  }, { passive: true });
}

/* ── CURSOR SPOTLIGHT ─────────────────────────────────────── */
(function initCursorSpotlight() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const spotlight = document.createElement('div');
  spotlight.id = 'cursor-spotlight';
  document.body.appendChild(spotlight);

  let targetX = -9999;
  let targetY = -9999;
  let currentX = -9999;
  let currentY = -9999;
  let isActive = false;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!isActive) {
      isActive = true;
      spotlight.classList.add('active');
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    isActive = false;
    spotlight.classList.remove('active');
  });

  const tickSpotlight = () => {
    // Smooth lerp: spotlight trails the cursor slightly for a fluid feel
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    spotlight.style.setProperty('--sx', `${currentX.toFixed(2)}px`);
    spotlight.style.setProperty('--sy', `${currentY.toFixed(2)}px`);
    requestAnimationFrame(tickSpotlight);
  };

  requestAnimationFrame(tickSpotlight);
}());
