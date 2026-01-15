// Helper utilities
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// App state
const app = {
  isLoaded: false,
  isMenuOpen: false,
  currentTheme: 'dark',
  scrollY: 0,
  ticking: false,
  projectFilter: 'all',
  formSubmitting: false
};

// DOM Elements
const elements = {
  hamburger: $('.hamburger'),
  nav: $('.main-nav'),
  navLinks: $$('.nav-link'),
  themeToggle: $('#theme-toggle'),
  body: document.documentElement,
  yearEl: $('#year'),
  filterBtns: $$('.filter-btn'),
  projectCards: $$('.project-card'),
  tiltEls: $$('[data-tilt]'),
  heroBg: document.querySelector('.hero-bg'),
  form: $('#contact-form'),
  formNote: $('#form-note'),
  backToTop: $('#back-to-top'),
  sections: $$('section'),
  skillBars: $$('.skill-bar span')
};

// Initialize app
function init() {
  // Set current year
  if (elements.yearEl) elements.yearEl.textContent = new Date().getFullYear();
  
  // Initialize theme
  initTheme();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize intersection observer
  initIntersectionObserver();
  
  // Initialize skills animation
  initSkillsAnimation();
  
  // Mark app as loaded
  app.isLoaded = true;
  
  // Add loaded class to body for potential CSS transitions
  document.body.classList.add('loaded');
}

// Initialize theme
function initTheme() {
  const THEME_KEY = 'portfolio_theme';
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  app.currentTheme = saved;
  applyTheme(saved);
}

// Apply theme
function applyTheme(theme) {
  if (theme === 'light') {
    elements.body.classList.add('light');
  } else {
    elements.body.classList.remove('light');
  }
  
  // Update icon
  const icon = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
  if (elements.themeToggle) {
    elements.themeToggle.innerHTML = `<i class="${icon}"></i>`;
  }
  
  // Save preference
  localStorage.setItem('portfolio_theme', theme);
  app.currentTheme = theme;
}

// Setup event listeners
function setupEventListeners() {
  // Mobile nav toggle
  if (elements.hamburger) {
    elements.hamburger.addEventListener('click', toggleMobileNav);
    
    // Keyboard navigation
    elements.hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMobileNav();
      }
    });
  }
  
  // Close mobile nav when clicking links
  elements.navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (app.isMenuOpen) {
        toggleMobileNav();
      }
    });
  });
  
  // Theme toggle
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', () => {
      const newTheme = app.currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }
  
  // Scroll events
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Project filtering
  if (elements.filterBtns.length) {
    elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterProjects(btn.dataset.filter);
        updateActiveFilterBtn(btn);
      });
    });
  }
  
  // 3D tilt effect
  if (elements.tiltEls.length) {
    elements.tiltEls.forEach(el => setupTiltEffect(el));
  }
  
  // Contact form
  if (elements.form) {
    elements.form.addEventListener('submit', handleFormSubmit);
  }
  
  // Back to top button
  if (elements.backToTop) {
    elements.backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Project card clicks for analytics
  if (elements.projectCards.length) {
    elements.projectCards.forEach(card => {
      card.addEventListener('click', () => {
        const title = card.querySelector('.project-body h3')?.textContent || 'project';
        console.log('Project clicked:', title);
        // In a real app, you might send this to analytics
      });
    });
  }
  
  // Keyboard navigation for main content
  document.addEventListener('keydown', handleKeyboardNavigation);
}

// Toggle mobile navigation
function toggleMobileNav() {
  app.isMenuOpen = !app.isMenuOpen;
  
  if (elements.hamburger) {
    elements.hamburger.setAttribute('aria-expanded', String(app.isMenuOpen));
    elements.hamburger.classList.toggle('open');
  }
  
  if (elements.nav) {
    elements.nav.classList.toggle('open');
  }
}

// Handle scroll events with throttling
function onScroll() {
  app.scrollY = window.scrollY;
  
  if (!app.ticking) {
    window.requestAnimationFrame(updateScrollEffects);
    app.ticking = true;
  }
}

// Update scroll-based effects
function updateScrollEffects() {
  // Update active navigation
  updateActiveNav();
  
  // Parallax hero background
  updateParallax();
  
  // Show/hide back to top button
  updateBackToTop();
  
  app.ticking = false;
}

// Update active navigation based on scroll position
function updateActiveNav() {
  if (!elements.sections.length || !elements.navLinks.length) return;
  
  let current = '';
  const scrollPosition = app.scrollY + 200;
  
  elements.sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });
  
  elements.navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href').slice(1) === current);
  });
}

// Update parallax effect for hero background
function updateParallax() {
  if (!elements.heroBg) return;
  
  const speed = 0.15;
  const yPos = -(app.scrollY * speed);
  const scale = 1 + Math.min(app.scrollY / 5000, 0.03);
  
  elements.heroBg.style.transform = `translateY(${yPos}px) scale(${scale})`;
}

// Update back to top button visibility
function updateBackToTop() {
  if (!elements.backToTop) return;
  
  const showThreshold = 500;
  const shouldShow = app.scrollY > showThreshold;
  
  elements.backToTop.classList.toggle('show', shouldShow);
}

// Initialize intersection observer for reveal animations
function initIntersectionObserver() {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        
        // If it's a skill bar, trigger animation
        if (entry.target.classList.contains('skill-bar')) {
          const span = entry.target.querySelector('span');
          if (span) {
            const progress = span.getAttribute('data-progress') || span.dataset.progress || 0;
            setTimeout(() => {
              span.style.width = progress + '%';
            }, 200);
          }
        }
      }
    });
  }, options);
  
  // Observe all hidden elements
  $$('.hidden').forEach(el => observer.observe(el));
}

// Initialize skills animation
function initSkillsAnimation() {
  // This is handled by the intersection observer now
  // Keeping this function for reference and potential future enhancements
}

// Filter projects
function filterProjects(filter) {
  app.projectFilter = filter;
  
  if (!elements.projectCards.length) return;
  
  elements.projectCards.forEach(card => {
    const category = card.dataset.category;
    const shouldShow = filter === 'all' || filter === category;
    
    // Use visibility instead of display to maintain layout
    card.style.opacity = shouldShow ? '1' : '0';
    card.style.transform = shouldShow ? 'scale(1)' : 'scale(0.8)';
    card.style.pointerEvents = shouldShow ? 'auto' : 'none';
    
    // Add transition if not already present
    if (!card.style.transition) {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }
  });
}

// Update active filter button
function updateActiveFilterBtn(activeBtn) {
  if (!elements.filterBtns.length) return;
  
  elements.filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn === activeBtn);
  });
}

// Setup 3D tilt effect
function setupTiltEffect(el) {
  const inner = el;
  
  const handleMouseMove = (ev) => {
    const rect = inner.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;
    
    const tiltX = (deltaY * 8).toFixed(2);
    const tiltY = (deltaX * -8).toFixed(2);
    
    inner.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(8px)`;
    inner.classList.add('is-tilting');
  };
  
  const handleMouseLeave = () => {
    inner.style.transform = '';
    inner.classList.remove('is-tilting');
  };
  
  const handleMouseDown = () => {
    inner.style.transform += ' scale(0.995)';
  };
  
  const handleMouseUp = () => {
    inner.style.transform = inner.style.transform.replace(' scale(0.995)', '');
  };
  
  // Add event listeners
  el.addEventListener('mousemove', handleMouseMove);
  el.addEventListener('mouseleave', handleMouseLeave);
  el.addEventListener('mousedown', handleMouseDown);
  el.addEventListener('mouseup', handleMouseUp);
  
  // Clean up function (not used in this example but good practice)
  el._tiltCleanup = () => {
    el.removeEventListener('mousemove', handleMouseMove);
    el.removeEventListener('mouseleave', handleMouseLeave);
    el.removeEventListener('mousedown', handleMouseDown);
    el.removeEventListener('mouseup', handleMouseUp);
  };
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  
  if (app.formSubmitting) return;
  
  app.formSubmitting = true;
  
  const formData = new FormData(elements.form);
  const data = Object.fromEntries(formData.entries());
  
  // Basic validation
  if (!data.name || !data.email || !data.message) {
    showFormNote('Please fill in all required fields.', 'error');
    app.formSubmitting = false;
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showFormNote('Please enter a valid email address.', 'error');
    app.formSubmitting = false;
    return;
  }
  
  // Show sending message
  showFormNote('Sending…', 'info');
  
  // Simulate form submission (replace with actual implementation)
  setTimeout(() => {
    showFormNote('Thanks! Your message was sent — I will reply within 2 business days.', 'success');
    elements.form.reset();
    app.formSubmitting = false;
    
    // In a real app, you would send the data to a server here
    console.log('Form submitted:', data);
  }, 1500);
}

// Show form note with different styles
function showFormNote(message, type = 'info') {
  if (!elements.formNote) return;
  
  elements.formNote.textContent = message;
  elements.formNote.className = 'form-note';
  
  if (type === 'error') {
    elements.formNote.style.color = 'var(--error, #ff6b6b)';
  } else if (type === 'success') {
    elements.formNote.style.color = 'var(--success, #51cf66)';
  } else {
    elements.formNote.style.color = 'var(--muted)';
  }
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      elements.formNote.textContent = '';
    }, 5000);
  }
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
  // ESC key to close mobile menu
  if (e.key === 'Escape' && app.isMenuOpen) {
    toggleMobileNav();
  }
  
  // Tab key to ensure focus stays within menu when open
  if (e.key === 'Tab' && app.isMenuOpen) {
    const focusableElements = elements.nav.querySelectorAll('a, button');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Performance optimization: Debounce function for future use
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Performance optimization: Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Error handling for JavaScript errors
window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.error);
  // In a production app, you might send this to an error tracking service
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}