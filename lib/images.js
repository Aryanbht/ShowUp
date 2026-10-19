/**
 * Injects Cloudinary transformations into an image URL to optimize delivery.
 * Applies f_auto (format), q_auto (quality), and width limiting.
 */
export function getOptimizedImageUrl(src, width = 800) {
  if (!src || typeof src !== 'string') return src

  // Cloudinary optimization
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    // If transformations already present, do not duplicate
    if (src.includes('/upload/f_auto') || src.includes('/upload/q_auto')) {
      return src
    }
    const transform = `f_auto,q_auto,w_${width},c_limit`
    return src.replace('/upload/', `/upload/${transform}/`)
  }

  return src
}
