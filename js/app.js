/**
 * Hafiz Fahad Iqbal — Link-in-Bio Website
 * Main Application JavaScript
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // DOM Elements
  // ─────────────────────────────────────────────
  const header = document.getElementById('header');
  const navMenu = document.getElementById('navMenu');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelectorAll('.nav__link');
  const backToTopBtn = document.getElementById('backToTop');
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const sections = document.querySelectorAll('section[id]');

  // ─────────────────────────────────────────────
  // Mobile Navigation Toggle
  // ─────────────────────────────────────────────
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
      document.body.classList.toggle('nav-open');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.classList.remove('nav-open');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.classList.remove('nav-open');
      }
    });
  }

  // ─────────────────────────────────────────────
  // Sticky Header on Scroll
  // ─────────────────────────────────────────────
  function handleHeaderScroll() {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // ─────────────────────────────────────────────
  // Active Nav Link Highlight
  // ─────────────────────────────────────────────
  function highlightActiveNav() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ─────────────────────────────────────────────
  // Back to Top Button
  // ─────────────────────────────────────────────
  function handleBackToTop() {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─────────────────────────────────────────────
  // Smooth Scrolling for Anchor Links
  // ─────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ─────────────────────────────────────────────
  // Scroll Reveal Animation (Intersection Observer)
  // ─────────────────────────────────────────────
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  }

  // ─────────────────────────────────────────────
  // Testimonial Carousel
  // ─────────────────────────────────────────────
  function initTestimonialCarousel() {
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');

    if (!track || !dotsContainer) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const totalCards = cards.length;
    let currentIndex = 0;
    let autoPlayInterval;
    let cardsPerView = getCardsPerView();

    function getCardsPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function getTotalPages() {
      return Math.max(1, totalCards - cardsPerView + 1);
    }

    function createDots() {
      dotsContainer.innerHTML = '';
      const pages = getTotalPages();
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.classList.add('testimonials__dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.testimonials__dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function goToSlide(index) {
      const pages = getTotalPages();
      currentIndex = Math.max(0, Math.min(index, pages - 1));

      const cardWidth = cards[0].offsetWidth;
      const gap = 24; // matches CSS gap
      const offset = currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;

      updateDots();
      resetAutoPlay();
    }

    function nextSlide() {
      const pages = getTotalPages();
      goToSlide(currentIndex >= pages - 1 ? 0 : currentIndex + 1);
    }

    function prevSlide() {
      const pages = getTotalPages();
      goToSlide(currentIndex <= 0 ? pages - 1 : currentIndex - 1);
    }

    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }

    function handleResize() {
      const newCardsPerView = getCardsPerView();
      if (newCardsPerView !== cardsPerView) {
        cardsPerView = newCardsPerView;
        currentIndex = 0;
        createDots();
        goToSlide(0);
      }
    }

    // Initialize
    createDots();
    startAutoPlay();

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Pause auto-play on hover
    const carousel = document.getElementById('testimonialCarousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
      carousel.addEventListener('mouseleave', startAutoPlay);
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });

    window.addEventListener('resize', handleResize);
  }

  // ─────────────────────────────────────────────
  // Contact Form (Formspree)
  // ─────────────────────────────────────────────
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formStatus.className = 'form-status form-status--success';
          formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message sent successfully! I\'ll get back to you soon.';
          contactForm.reset();
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        formStatus.className = 'form-status form-status--error';
        formStatus.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Something went wrong. Please try again or email me directly.';
      }

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      setTimeout(() => {
        formStatus.className = 'form-status';
        formStatus.innerHTML = '';
      }, 6000);
    });
  }

  // ─────────────────────────────────────────────
  // Combined Scroll Handler
  // ─────────────────────────────────────────────
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleHeaderScroll();
        highlightActiveNav();
        handleBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ─────────────────────────────────────────────
  // Initialize Everything
  // ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initTestimonialCarousel();
    handleHeaderScroll();
  });

})();
