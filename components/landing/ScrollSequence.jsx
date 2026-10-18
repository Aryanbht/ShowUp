'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getAdaptiveTier, getFrameUrl } from './adaptiveTier'

/**
 * ScrollSequence Component
 * Replaces heavy scroll-scrubbed <video> with a high-performance Canvas Image Sequence.
 * Features:
 *  - Adaptive resolution & frame count based on CPU, RAM, connection, and screen size
 *  - Progressive preloading with off-thread createImageBitmap decoding
 *  - Single rAF lerp loop (damping physics) with zero setState on scroll
 *  - Nearest-loaded-frame fallback to prevent any black/blank flashes
 *  - DPR-clamped (max 2) aspect ratio 'cover' rendering
 *  - Visibility & IntersectionObserver auto-pausing (saves battery & CPU)
 *  - prefers-reduced-motion support
 *  - Static poster fallback on error
 */
export default function ScrollSequence({
  driverRef,
  onProgressChange,
  className = '',
  posterSrc = '/frames/poster.webp',
}) {
  const canvasRef = useRef(null)
  const [tier, setTier] = useState(null)
  const [isInitialReady, setIsInitialReady] = useState(false)
  const [hasCanvasError, setHasCanvasError] = useState(false)

  // Animation & Frame tracking refs
  const framesRef = useRef([])
  const isFrameLoadingRef = useRef([])
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const lastEmittedProgressRef = useRef(0)
  const renderedFrameRef = useRef(-1)
  const rAFRef = useRef(null)
  const isLoopActiveRef = useRef(false)
  const isVisibleRef = useRef(true)
  const isIntersectingRef = useRef(true)
  const prefersReducedMotionRef = useRef(false)

  // 1. Initialize Adaptive Tier on client mount
  useEffect(() => {
    const selectedTier = getAdaptiveTier()
    setTier(selectedTier)
    framesRef.current = new Array(selectedTier.totalFrames + 1)
    isFrameLoadingRef.current = new Array(selectedTier.totalFrames + 1).fill(false)

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotionRef.current = mediaQuery.matches
      const handleMotionChange = (e) => {
        prefersReducedMotionRef.current = e.matches
      }
      mediaQuery.addEventListener?.('change', handleMotionChange)
      return () => mediaQuery.removeEventListener?.('change', handleMotionChange)
    }
  }, [])

  // Helper to load and decode a single frame
  const loadSingleFrame = useCallback(async (tierConfig, frameIndex) => {
    if (framesRef.current[frameIndex] || isFrameLoadingRef.current[frameIndex]) {
      return framesRef.current[frameIndex]
    }
    isFrameLoadingRef.current[frameIndex] = true

    const url = getFrameUrl(tierConfig, frameIndex)
    try {
      const res = await fetch(url, { cache: 'force-cache' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()

      let decoded
      if ('createImageBitmap' in window) {
        decoded = await createImageBitmap(blob)
      } else {
        decoded = await new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = URL.createObjectURL(blob)
        })
      }

      framesRef.current[frameIndex] = decoded
      return decoded
    } catch (err) {
      // Fallback direct Image element
      try {
        const decoded = await new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = url
        })
        framesRef.current[frameIndex] = decoded
        return decoded
      } catch (e2) {
        // If image completely fails, keep null so nearest frame fallback takes over
        console.warn(`[ScrollSequence] Failed to load frame ${frameIndex}`, e2)
        return null
      }
    } finally {
      isFrameLoadingRef.current[frameIndex] = false
    }
  }, [])

  // Draw frame to canvas with object-fit: cover math
  const renderCanvasFrame = useCallback((frameObj) => {
    const canvas = canvasRef.current
    if (!canvas || !frameObj) return

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!ctx) return

    const cw = canvas.width
    const ch = canvas.height
    const iw = frameObj.width
    const ih = frameObj.height

    if (!iw || !ih || !cw || !ch) return

    // Scale aspect ratio to cover canvas
    const scale = Math.max(cw / iw, ch / ih)
    const sw = iw * scale
    const sh = ih * scale
    const sx = (cw - sw) / 2
    const sy = (ch - sh) / 2

    ctx.drawImage(frameObj, 0, 0, iw, ih, sx, sy, sw, sh)
  }, [])

  // Resize canvas to match display size × DPR (clamped to max 2 for memory efficiency)
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const targetW = Math.round(rect.width * dpr)
    const targetH = Math.round(rect.height * dpr)

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW
      canvas.height = targetH
      renderedFrameRef.current = -1 // Force redraw on resize
    }
  }, [])

  // 2. Preloading pipeline: Frame 1 -> Priority Batch -> Background Chunks
  useEffect(() => {
    if (!tier) return
    let isCancelled = false

    const startPreload = async () => {
      // Step A: Load first frame immediately for instant poster display
      const firstFrame = await loadSingleFrame(tier, 1)
      if (isCancelled) return

      if (firstFrame) {
        resizeCanvas()
        renderCanvasFrame(firstFrame)
        renderedFrameRef.current = 1
        setIsInitialReady(true)
      }

      // Step B: Load initial priority chunk (first 15 frames) so initial scrub is instant
      const priorityCount = Math.min(15, tier.totalFrames)
      const priorityPromises = []
      for (let i = 2; i <= priorityCount; i++) {
        priorityPromises.push(loadSingleFrame(tier, i))
      }
      await Promise.all(priorityPromises)
      if (isCancelled) return

      // Step C: Progressive chunked loading of remaining frames
      // Load in small concurrent batches to prevent network congestion
      const batchSize = 5
      for (let start = priorityCount + 1; start <= tier.totalFrames; start += batchSize) {
        if (isCancelled) return
        const batch = []
        for (let i = start; i < start + batchSize && i <= tier.totalFrames; i++) {
          batch.push(loadSingleFrame(tier, i))
        }
        await Promise.all(batch)

        // Yield slightly between batches to keep the main thread & network open for other requests
        await new Promise((r) => setTimeout(r, 20))
      }
    }

    startPreload()

    return () => {
      isCancelled = true
    }
  }, [tier, loadSingleFrame, renderCanvasFrame, resizeCanvas])

  // 3. Resize handler
  useEffect(() => {
    window.addEventListener('resize', resizeCanvas, { passive: true })
    resizeCanvas()
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  // 4. Smooth Animation Loop + Scroll Sync
  useEffect(() => {
    if (!tier) return

    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    const damping = isMobile ? 0.12 : 0.15

    // Passive scroll listener (zero setState)
    const handleScroll = () => {
      const driver = driverRef?.current || document.querySelector('.scroll-driver')
      if (!driver) return
      const rect = driver.getBoundingClientRect()
      const total = driver.offsetHeight - window.innerHeight
      if (total <= 0) return
      const scrolled = Math.max(0, -rect.top)
      targetProgressRef.current = Math.min(1, Math.max(0, scrolled / total))
    }

    // Nearest loaded frame finder
    const getNearestFrame = (targetIndex) => {
      const frames = framesRef.current
      if (frames[targetIndex]) return { frame: frames[targetIndex], index: targetIndex }
      for (let offset = 1; offset < tier.totalFrames; offset++) {
        const lower = targetIndex - offset
        if (lower >= 1 && frames[lower]) return { frame: frames[lower], index: lower }
        const upper = targetIndex + offset
        if (upper <= tier.totalFrames && frames[upper]) return { frame: frames[upper], index: upper }
      }
      return null
    }

    // Main rAF loop
    const tick = () => {
      if (!isLoopActiveRef.current) return

      // Physics lerp (or instant if user prefers reduced motion)
      if (prefersReducedMotionRef.current) {
        currentProgressRef.current = targetProgressRef.current
      } else {
        const diff = targetProgressRef.current - currentProgressRef.current
        if (Math.abs(diff) < 0.0001) {
          currentProgressRef.current = targetProgressRef.current
        } else {
          currentProgressRef.current += diff * damping
        }
      }

      // Calculate target frame index
      const targetFrame = Math.min(
        tier.totalFrames,
        Math.max(1, Math.round(currentProgressRef.current * (tier.totalFrames - 1)) + 1)
      )

      // Only draw when the frame changed or canvas was resized
      if (renderedFrameRef.current !== targetFrame) {
        const nearest = getNearestFrame(targetFrame)
        if (nearest) {
          renderCanvasFrame(nearest.frame)
          // If we got the exact frame, mark it rendered
          if (nearest.index === targetFrame) {
            renderedFrameRef.current = targetFrame
          }
        }
      }

      // Throttled notification to parent component (e.g. for text overlay opacities)
      const progDiff = Math.abs(currentProgressRef.current - lastEmittedProgressRef.current)
      if (progDiff > (isMobile ? 0.003 : 0.002)) {
        lastEmittedProgressRef.current = currentProgressRef.current
        if (onProgressChange) {
          onProgressChange(currentProgressRef.current)
        }
      }

      rAFRef.current = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (!isLoopActiveRef.current && isVisibleRef.current && isIntersectingRef.current) {
        isLoopActiveRef.current = true
        rAFRef.current = requestAnimationFrame(tick)
      }
    }

    const stopLoop = () => {
      isLoopActiveRef.current = false
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current)
        rAFRef.current = null
      }
    }

    // Visibility change handler (tab switch)
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible'
      if (isVisibleRef.current) {
        startLoop()
      } else {
        stopLoop()
      }
    }

    // IntersectionObserver (off-screen scroll pause)
    let observer = null
    const driverEl = driverRef?.current || document.querySelector('.scroll-driver')
    if (driverEl && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          isIntersectingRef.current = entry?.isIntersecting ?? true
          if (isIntersectingRef.current) {
            startLoop()
          } else {
            stopLoop()
          }
        },
        { rootMargin: '100px 0px' }
      )
      observer.observe(driverEl)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initial sync and start
    handleScroll()
    startLoop()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (observer && driverEl) observer.unobserve(driverEl)
      stopLoop()
    }
  }, [tier, driverRef, onProgressChange, renderCanvasFrame])

  // Context error / recovery fallback
  const handleContextLost = (e) => {
    e.preventDefault()
    console.warn('[ScrollSequence] Canvas context lost')
    setHasCanvasError(true)
  }

  return (
    <div
      className={`scroll-sequence-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* 1. Static Poster Background (instant visual before first frame renders) */}
      <img
        src={posterSrc}
        alt="ShowUp Demo Preview"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isInitialReady && !hasCanvasError ? 0 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          willChange: 'opacity',
        }}
        fetchPriority="high"
        loading="eager"
      />

      {/* 2. High-performance GPU Canvas Sequence */}
      {!hasCanvasError && (
        <canvas
          ref={canvasRef}
          onContextMenu={(e) => e.preventDefault()}
          onWebglcontextlost={handleContextLost}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            opacity: isInitialReady ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        />
      )}

      {/* 3. Static fallback if canvas fails or context is lost */}
      {hasCanvasError && (
        <div
          className="canvas-static-fallback"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${posterSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
    </div>
  )
}
