/* ─── Custom Cursor ───────────────────────────────────────────────────────── */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

if (cursor && follower) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  (function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.style.width  = '60px';
      follower.style.height = '60px';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.width  = '36px';
      follower.style.height = '36px';
    });
  });
}

/* ─── Intersection Observer — frames ─────────────────────────────────────── */
const frames = document.querySelectorAll('.frame, .frame-image');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

frames.forEach((frame, i) => {
  frame.style.transitionDelay = '0s';
  observer.observe(frame);
});

/* ─── Frame number counter ────────────────────────────────────────────────── */
const allFrames = document.querySelectorAll('.frame, .frame-image, .frame-hero, .frame-next');
const navIndex  = document.querySelector('.proj-nav-index');

if (navIndex && allFrames.length) {
  const frameObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(allFrames).indexOf(entry.target) + 1;
        const pad = String(idx).padStart(2, '0');
        const tot = String(allFrames.length).padStart(2, '0');
        navIndex.textContent = `${pad} / ${tot}`;
      }
    });
  }, { threshold: 0.4 });

  allFrames.forEach(f => frameObserver.observe(f));
}

/* ─── Nav scroll ──────────────────────────────────────────────────────────── */
const nav = document.getElementById('proj-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    nav.style.background = 'rgba(10,10,10,0.85)';
    nav.style.backdropFilter = 'blur(12px)';
    nav.style.webkitBackdropFilter = 'blur(12px)';
  } else {
    nav.style.background = 'transparent';
    nav.style.backdropFilter = 'none';
  }
}, { passive: true });
