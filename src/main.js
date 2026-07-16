const WHATSAPP_NUMBER = "50670030321";

const WHATSAPP_MESSAGES = {
  navbar: 'Hola, vi la página de Brava Web Studio y quisiera recibir información para crear o mejorar la página web de mi negocio.',
  hero: 'Hola, vi la página de Brava Web Studio y quisiera recibir información para crear o mejorar la página web de mi negocio.',
  basic: 'Hola, estoy interesado en el plan Página Básica de ₡60.000. Quisiera contarles sobre mi negocio.',
  professional: 'Hola, estoy interesado en el plan Página Profesional de ₡100.000. Quisiera contarles sobre mi negocio.',
  premium: 'Hola, estoy interesado en el plan Página Premium de ₡140.000. Quisiera contarles sobre mi negocio.',
  final: 'Hola, vi la página de Brava Web Studio. Quisiera recibir una cotización para crear o mejorar la página web de mi negocio.',
  floating: 'Hola, vi la página de Brava Web Studio. Quisiera recibir una cotización para crear o mejorar la página web de mi negocio.',
}

function createWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

document.querySelectorAll('[data-whatsapp]').forEach((link) => {
  const message = WHATSAPP_MESSAGES[link.dataset.whatsapp]
  if (!message) return
  link.href = createWhatsAppUrl(message)
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
})

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear())
})

const menuButton = document.querySelector('.menu-toggle')
const mobileMenu = document.querySelector('.mobile-menu')

function setMenu(open) {
  if (!menuButton || !mobileMenu) return
  menuButton.setAttribute('aria-expanded', String(open))
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú')
  mobileMenu.setAttribute('aria-hidden', String(!open))
  mobileMenu.classList.toggle('open', open)
  document.body.classList.toggle('menu-open', open)

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.tabIndex = open ? 0 : -1
  })
}

if (menuButton && mobileMenu) {
  setMenu(false)
  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true')
  })

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false))
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false)
      menuButton.focus()
    }
  })

  const desktopQuery = window.matchMedia('(min-width: 769px)')
  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) setMenu(false)
  })
}

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const revealItems = document.querySelectorAll('.reveal')

if (motionQuery.matches || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'))
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -50px' })

  revealItems.forEach((item) => revealObserver.observe(item))
}

const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

const heroSection = document.querySelector('.hero')
const heroMedia = document.querySelector('.hero-media')
const heroVideo = document.querySelector('.hero-video')
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
const lowVideoCapability = Boolean(connection?.saveData)
  || (navigator.deviceMemory && navigator.deviceMemory < 4)

function updateHeroVideoPlayback() {
  if (!heroVideo || !heroMedia) return
  const useStaticFrame = motionQuery.matches || lowVideoCapability
  heroMedia.classList.toggle('video-static', useStaticFrame)

  if (useStaticFrame || document.hidden) {
    heroVideo.pause()
    return
  }

  heroVideo.play().catch(() => heroMedia.classList.add('video-static'))
}

updateHeroVideoPlayback()
motionQuery.addEventListener('change', updateHeroVideoPlayback)
document.addEventListener('visibilitychange', updateHeroVideoPlayback)

if (heroSection && precisePointer.matches && !motionQuery.matches) {
  let pointerFrame = 0
  let pendingPointer = { x: 0.5, y: 0.5 }

  const renderHeroPointer = () => {
    const x = pendingPointer.x
    const y = pendingPointer.y
    heroSection.style.setProperty('--hero-pointer-x', `${(x * 100).toFixed(2)}%`)
    heroSection.style.setProperty('--hero-pointer-y', `${(y * 100).toFixed(2)}%`)
    heroSection.style.setProperty('--hero-video-x', `${((x - 0.5) * -22).toFixed(2)}px`)
    heroSection.style.setProperty('--hero-video-y', `${((y - 0.5) * -14).toFixed(2)}px`)
    pointerFrame = 0
  }

  heroSection.addEventListener('pointermove', (event) => {
    const rect = heroSection.getBoundingClientRect()
    pendingPointer = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    }
    if (!pointerFrame) pointerFrame = requestAnimationFrame(renderHeroPointer)
  })

  heroSection.addEventListener('pointerleave', () => {
    pendingPointer = { x: 0.5, y: 0.5 }
    if (!pointerFrame) pointerFrame = requestAnimationFrame(renderHeroPointer)
  })
}

if (precisePointer.matches && !motionQuery.matches) {
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      card.style.setProperty('--rotate-x', `${(-y * 3.5).toFixed(2)}deg`)
      card.style.setProperty('--rotate-y', `${(x * 4).toFixed(2)}deg`)
    })

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rotate-x', '0deg')
      card.style.setProperty('--rotate-y', '0deg')
    })
  })
}

function supportsWebGL() {
  try {
    const testCanvas = document.createElement('canvas')
    return Boolean(testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'))
  } catch {
    return false
  }
}

async function initializeTubes() {
  const canvas = document.querySelector('#canvas')
  if (!canvas || motionQuery.matches || !supportsWebGL()) {
    canvas?.classList.add('canvas-disabled')
    return
  }

  const lowCapability = (navigator.deviceMemory && navigator.deviceMemory < 4)
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)

  if (lowCapability) {
    canvas.classList.add('canvas-disabled')
    return
  }

  const mobile = window.matchMedia('(max-width: 768px)').matches

  try {
    const { default: TubesCursor } = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')
    const tubes = TubesCursor(canvas, {
      bloom: { threshold: 0.25, strength: mobile ? 0.65 : 0.9, radius: 0.45 },
      tubes: {
        count: mobile ? 5 : 10,
        colors: ['#ff008a', '#8b5cf6', '#3b82f6', '#ffffff'],
        minRadius: mobile ? 0.003 : 0.004,
        maxRadius: mobile ? 0.018 : 0.026,
        minTubularSegments: 32,
        maxTubularSegments: mobile ? 56 : 88,
        lerp: mobile ? 0.35 : 0.42,
        noise: mobile ? 0.025 : 0.035,
        material: { metalness: 0.85, roughness: 0.32 },
        lights: {
          intensity: 50,
          colors: ['#ff008a', '#8b5cf6', '#3b82f6', '#ffffff'],
        },
      },
      sleepRadiusX: mobile ? 90 : 220,
      sleepRadiusY: mobile ? 55 : 115,
      sleepTimeScale1: 0.12,
      sleepTimeScale2: 0.17,
    })

    canvas.classList.add('canvas-ready')

    motionQuery.addEventListener('change', (event) => {
      if (event.matches) {
        tubes.dispose()
        canvas.classList.add('canvas-disabled')
      }
    }, { once: true })
  } catch (error) {
    canvas.classList.add('canvas-disabled')
    console.info('El fondo 3D no está disponible; se mantiene el fondo estático.', error instanceof Error ? error.message : '')
  }
}

initializeTubes()
