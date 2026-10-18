// components/landing/adaptiveTier.js

export const TIER_CONFIGS = {
  low: {
    name: 'low',
    totalFrames: 60,
    width: 640,
    height: 360,
    basePath: '/frames/low',
    frameRate: 6,
  },
  medium: {
    name: 'medium',
    totalFrames: 90,
    width: 960,
    height: 540,
    basePath: '/frames/medium',
    frameRate: 9,
  },
  high: {
    name: 'high',
    totalFrames: 130,
    width: 1280,
    height: 720,
    basePath: '/frames/high',
    frameRate: 13,
  },
}

/**
 * Formats frame index (1-based) to 4-digit padded filename (e.g. frame_0042.webp)
 */
export function getFrameUrl(tierConfig, frameIndex) {
  const index = Math.max(1, Math.min(tierConfig.totalFrames, Math.round(frameIndex)))
  const padded = String(index).padStart(4, '0')
  return `${tierConfig.basePath}/frame_${padded}.webp`
}

/**
 * Inspects device CPU cores, memory, network connection, saveData, and viewport
 * to determine the optimal frame tier (low, medium, or high).
 */
export function getAdaptiveTier() {
  if (typeof window === 'undefined') {
    return TIER_CONFIGS.medium // SSR safe default
  }

  try {
    const nav = navigator || {}
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection

    // 1. Data Saver mode explicitly requested by user
    if (conn?.saveData) {
      return TIER_CONFIGS.low
    }

    // 2. Slow network connection (2G / slow 3G)
    const effectiveType = conn?.effectiveType
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return TIER_CONFIGS.low
    }

    // 3. Hardware concurrency (CPU cores)
    // Budget phones and low-end Intel Celerons / old i3s report 2 or 4 logical cores
    const cores = nav.hardwareConcurrency || 4

    // 4. Device Memory API (in GB, capped by browser privacy at 8GB)
    const memory = nav.deviceMemory || 4

    // 5. Screen dimensions & mobile detection
    const screenWidth = window.innerWidth || window.screen?.width || 1280
    const isMobile = screenWidth < 768 || /Android|iPhone|iPad|iPod/i.test(nav.userAgent || '')

    // If constrained memory (< 4GB) or budget dual-core CPU -> always Low tier
    if (memory < 4 || cores <= 2) {
      return TIER_CONFIGS.low
    }

    // Mobile devices:
    // Even high-end mobile phones run smoother with medium tier (960px WebP, 90 frames = 2.3MB total)
    // since screen width is under 500px, 960px is already 2x retina!
    if (isMobile) {
      if (cores <= 4 || memory <= 4 || effectiveType === '3g') {
        return TIER_CONFIGS.low
      }
      return TIER_CONFIGS.medium
    }

    // Desktop:
    // Low-end desktop (e.g. Intel i3 4 cores, 4GB RAM) -> Medium tier
    if (cores <= 4 || memory < 8 || screenWidth < 1200) {
      return TIER_CONFIGS.medium
    }

    // High-end desktop: 8+ cores, 8GB+ RAM, fast network, 1280px+ screen
    return TIER_CONFIGS.high
  } catch (e) {
    console.warn('[ScrollSequence] Error detecting tier, defaulting to medium', e)
    return TIER_CONFIGS.medium
  }
}
