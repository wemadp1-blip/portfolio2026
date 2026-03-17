/* ─── Custom Cursor ───────────────────────────────────────────────────────── */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  follower.style.left = followerX + 'px';
  follower.style.top  = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// Expand cursor on hover
document.querySelectorAll('a, button, .project-item').forEach(el => {
  el.addEventListener('mouseenter', () => {
    follower.style.width  = '60px';
    follower.style.height = '60px';
  });
  el.addEventListener('mouseleave', () => {
    follower.style.width  = '36px';
    follower.style.height = '36px';
  });
});

/* ─── Smooth Scroll Nav ───────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ─── Nav scroll blend ────────────────────────────────────────────────────── */
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  if (scroll > 80) {
    nav.style.mixBlendMode = 'normal';
  } else {
    nav.style.mixBlendMode = 'difference';
  }
  lastScroll = scroll;
}, { passive: true });

/* ─── Intersection Observer — project items ───────────────────────────────── */
const projectItems = document.querySelectorAll('.project-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
});

projectItems.forEach((item, i) => {
  item.style.transitionDelay = `${i * 0.05}s`;
  observer.observe(item);
});

/* ─── About section fade-in ───────────────────────────────────────────────── */
const aboutEls = document.querySelectorAll('.about-text, .cv-item, .skill, .about-email');

const aboutObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      aboutObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

aboutEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = `opacity 0.6s ease ${i * 0.02}s, transform 0.6s ease ${i * 0.02}s`;
  aboutObserver.observe(el);
});

/* ─── Contact heading stagger ─────────────────────────────────────────────── */
const contactHeading = document.querySelector('.contact-heading');
const contactLinks   = document.querySelectorAll('.contact-link');

const contactObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      contactObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

[contactHeading, ...contactLinks].forEach((el, i) => {
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.7s ease ${i * 0.1}s, transform 0.7s ease ${i * 0.1}s`;
  contactObserver.observe(el);
});

/* ─── Project items — click entire row to navigate ──────────────────────── */
document.querySelectorAll('.project-item[data-href]').forEach(item => {
  item.addEventListener('click', (e) => {
    // Don't navigate if clicking the link itself (let it handle naturally)
    if (e.target.closest('a')) return;
    window.location.href = item.dataset.href;
  });
});

/* ─── Section header line animate ────────────────────────────────────────── */
document.querySelectorAll('.section-header').forEach(header => {
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      header.style.opacity = '1';
      /* also animate the border-top line drawing in */
      header.style.borderTopColor = 'rgba(255,255,255,0.08)';
      obs.unobserve(header);
    }
  }, { threshold: 0.5 });
  header.style.opacity = '0';
  header.style.borderTopColor = 'rgba(255,255,255,0)';
  header.style.transition = 'opacity 0.8s ease, border-top-color 1.2s ease';
  obs.observe(header);
});

/* ─── Tag stagger animate ─────────────────────────────────────────────────── */
document.querySelectorAll('.project-item').forEach(item => {
  const tags = item.querySelectorAll('.tag');
  tags.forEach((tag, i) => {
    tag.style.opacity = '0';
    tag.style.transform = 'translateY(8px)';
    tag.style.transition = `opacity 0.5s ease ${0.3 + i * 0.08}s, transform 0.5s ease ${0.3 + i * 0.08}s`;
  });
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      tags.forEach(tag => {
        tag.style.opacity = '1';
        tag.style.transform = 'translateY(0)';
      });
      obs.unobserve(item);
    }
  }, { threshold: 0.15 });
  obs.observe(item);
});

/* ─── Hero name parallax on scroll ───────────────────────────────────────── */
const heroName = document.querySelector('.hero-name');
const heroLabel = document.querySelector('.hero-label');
if (heroName) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const max = window.innerHeight;
    if (y < max) {
      const t = y / max;
      heroName.style.transform  = `translateY(${y * 0.22}px)`;
      heroLabel.style.transform = `translateY(${y * 0.12}px)`;
      heroName.style.opacity    = 1 - t * 1.2;
    }
  }, { passive: true });
}

/* ─── Project image scale-in (tied to parent .visible so no compound opacity) */
document.querySelectorAll('.project-item').forEach(item => {
  const wrap = item.querySelector('.project-image-wrap');
  if (!wrap) return;
  wrap.style.transform = 'scale(1.06)';
  wrap.style.transition = 'transform 1.1s cubic-bezier(0.16,1,0.3,1)';
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      wrap.style.transform = 'scale(1)';
      obs.unobserve(item);
    }
  }, { threshold: 0.1 });
  obs.observe(item);
});
