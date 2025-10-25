import React, { useRef, useState, useLayoutEffect } from 'react'

// CategoryTitle: scale text to fit a single line inside its container by shrinking font-size.
// Uses ResizeObserver + binary search to find largest font-size that fits within container width.
export default function CategoryTitle({ children, className = '' }) {
  const containerRef = useRef(null)
  const measurerRef = useRef(null)
  const [fontPx, setFontPx] = useState(null)
  const [twoLine, setTwoLine] = useState(false)

  useLayoutEffect(() => {
    const container = containerRef.current
    const measurer = measurerRef.current
    if (!container || !measurer) return

    let raf = null

  const rootFontPx = parseFloat(getComputedStyle(document.documentElement).fontSize || '16') || 16
  const minRem = 0.7
  const minPx = minRem * rootFontPx

    const fit = () => {
      const cs = window.getComputedStyle(container)
      const padLeft = parseFloat(cs.paddingLeft || '0') || 0
      const padRight = parseFloat(cs.paddingRight || '0') || 0
      const available = Math.max(8, container.clientWidth - padLeft - padRight - 2)

  // prepare measurer with same font metrics as visible text
  const fontStack = '"Swiss 911 BT", "Arial Black", "Helvetica Neue", Arial, sans-serif'
  measurer.style.fontFamily = fontStack
  measurer.style.fontWeight = '900'
  measurer.style.letterSpacing = '0.02em'
  measurer.style.textTransform = 'uppercase'

  // Attempt single-line fit first
      let lo = Math.floor(minPx)
      let hi = Math.max(lo + 1, 64)
      let best = lo

      measurer.style.whiteSpace = 'nowrap'
      measurer.style.display = 'inline-block'

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2)
        measurer.style.fontSize = mid + 'px'
        const sw = measurer.scrollWidth
        if (sw <= available) {
          best = mid
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }

      if (best >= minPx) {
        // single-line fit succeeded within minPx -> use it
        setFontPx(best)
        setTwoLine(false)
      } else {
        // single-line would be too small — fall back to two-line scaling
        // Measure container height/width and compute a font-size that fits in two lines
        const cs = window.getComputedStyle(container)
        const padTop = parseFloat(cs.paddingTop || '0') || 0
        const padBottom = parseFloat(cs.paddingBottom || '0') || 0
        const padLeft2 = parseFloat(cs.paddingLeft || '0') || 0
        const padRight2 = parseFloat(cs.paddingRight || '0') || 0
        const availableHeight = Math.max(10, container.clientHeight - padTop - padBottom - 2)
        const availableWidth = Math.max(10, container.clientWidth - padLeft2 - padRight2 - 2)

        // start with font that fits height-wise for two lines
        let finalSize = Math.floor(availableHeight / 2)
        finalSize = Math.max(Math.floor(minPx), Math.min(64, finalSize))

        // now ensure the text wraps into two lines without overflowing height by measuring
        measurer.style.whiteSpace = 'normal'
        measurer.style.width = availableWidth + 'px'
        measurer.style.display = 'block'

        // decrease finalSize until measured height fits into availableHeight (or reach minPx)
        while (finalSize >= Math.floor(minPx)) {
          measurer.style.fontSize = finalSize + 'px'
          // Allow the browser to measure
          const sh = measurer.scrollHeight
          if (sh <= availableHeight) break
          finalSize = finalSize - 1
        }

        finalSize = Math.max(Math.floor(minPx), finalSize)
        setFontPx(finalSize)
        setTwoLine(true)
      }
    }

    fit()

    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(fit)
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [children])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center text-center ${className}`}
      style={{ textTransform: 'uppercase', padding: '12px 8px', minHeight: '100px' }}
    >
      <span
        style={{
          color: '#fff',
          fontWeight: 900,
          lineHeight: 1.05,
          whiteSpace: twoLine ? 'normal' : 'nowrap',
          overflow: 'hidden',
          fontSize: fontPx ? fontPx + 'px' : undefined,
          fontFamily: '"Swiss 911 BT", "Arial Black", "Helvetica Neue", Arial, sans-serif',
          letterSpacing: '0.02em',
          display: 'inline-block',
          width: twoLine ? '100%' : 'auto',
          textAlign: 'center',
          wordBreak: 'break-word',
        }}
        className="category-title-fit"
      >
        {children}
      </span>

      <span
        ref={measurerRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          height: 'auto',
          width: 'auto',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {children}
      </span>
    </div>
  )
}
