import React, { useRef, useState, useLayoutEffect } from 'react';

// List of "orphan" words: avoid them alone on a line
const ORPHAN_WORDS = [
  'THE','A','AN','OF','IN','ON','TO','FOR','AND','OR','BY','AS','AT','IS','IT','BE','BUT','SO','UP','OUT','IF','NOR','YET'
];
function isOrphan(word) {
  return ORPHAN_WORDS.includes(word.replace(/[^A-Z]/gi, '').toUpperCase()) || word.length <= 3;
}

function splitTitleToTwoLines(text) {
  // Clean up excessive whitespace and normalize
  const clean = text.trim().replace(/\s+/g, ' ');
  
  // If very short (single word or very few characters), don't split
  if (clean.length <= 12 || !clean.includes(' ')) return [clean];
  
  const words = clean.split(' ');
  
  // If only 2 words, split them
  if (words.length === 2) return [words[0], words[1]];
  
  // Calculate ideal split point (closest to middle by character count)
  const totalChars = clean.length;
  const targetChars = totalChars / 2;
  
  let best = null;
  let bestScore = Infinity;
  
  // Try every possible split point
  for (let i = 1; i < words.length; i++) {
    const left = words.slice(0, i).join(' ');
    const right = words.slice(i).join(' ');
    
    // Skip if either side is empty
    if (!left || !right) continue;
    
    // Skip if left side would be a single orphan word
    if (i === 1 && isOrphan(words[0])) continue;
    
    // Skip if right side would be a single orphan word
    if (i === words.length - 1 && isOrphan(words[words.length - 1])) continue;
    
    // Calculate balance score (lower is better)
    const leftChars = left.length;
    const rightChars = right.length;
    const balance = Math.abs(leftChars - rightChars);
    
    // Calculate score: balance + penalties for awkward splits
    let score = balance;
    
    // Penalize splits that break after punctuation (except spaces)
    if (/[,;:!?]$/.test(left)) score += 3;
    if (/^[,;:!?]/.test(right)) score += 3;
    
    // Penalize splits that break hyphenated words awkwardly
    if (left.endsWith('-') && !right.startsWith('-')) score += 2;
    
    // Slight preference for splits near the middle
    const splitRatio = i / words.length;
    if (splitRatio < 0.3 || splitRatio > 0.7) score += 1;
    
    // Prefer splits that don't leave very short lines
    if (leftChars < 3 || rightChars < 3) score += 5;
    
    if (score < bestScore) {
      best = [left, right];
      bestScore = score;
    }
  }
  
  // If no good split found, force a split at the word midpoint
  if (!best) {
    const mid = Math.floor(words.length / 2);
    if (mid > 0 && mid < words.length) {
      return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
    }
    return [clean]; // fallback
  }
  
  return best;
}

export default function CategoryTitle({ children }) {
  const containerRef = useRef(null);
  const measurerRef = useRef(null);
  const [fontPx, setFontPx] = useState(null);
  const lines = splitTitleToTwoLines('' + children);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measurer = measurerRef.current;
    if (!container || !measurer) return;
    let raf = null;
    const rootFontPx = parseFloat(getComputedStyle(document.documentElement).fontSize || '16') || 16;
    const minRem = 0.7; // Minimum readable size
    const minPx = minRem * rootFontPx;
    const maxPx = 48; // Match Jeopardy's large, bold category text
    const fit = () => {
      const cs = window.getComputedStyle(container);
      const padLeft = parseFloat(cs.paddingLeft || '0') || 0;
      const padRight = parseFloat(cs.paddingRight || '0') || 0;
      const padTop = parseFloat(cs.paddingTop || '0') || 0;
      const padBottom = parseFloat(cs.paddingBottom || '0') || 0;
      const availableWidth = Math.max(10, container.clientWidth - padLeft - padRight - 4);
      const availableHeight = Math.max(10, container.clientHeight - padTop - padBottom - 4);
      
      // Create individual line measurers for accurate width/height measurement
      const fontStack = '"Swiss 911 BT", "Arial Black", Arial, Helvetica, sans-serif';
      measurer.style.fontFamily = fontStack;
      measurer.style.fontWeight = '900';
      measurer.style.letterSpacing = '0.03em';
      measurer.style.textTransform = 'uppercase';
      measurer.style.lineHeight = '1.1';
      measurer.style.whiteSpace = 'nowrap';
      measurer.style.position = 'absolute';
      measurer.style.visibility = 'hidden';
      
      // Start from preferred minimum, but allow going smaller if needed
      let lo = Math.floor(minPx);
      let hi = maxPx;
      let best = lo; // Start with minimum
      
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        measurer.style.fontSize = mid + 'px';
        
        // Measure each line individually for width
        let maxLineWidth = 0;
        let allLinesFit = true;
        
        for (const line of lines) {
          measurer.textContent = line;
          // Force a reflow to get accurate measurements
          void measurer.offsetWidth;
          const lineWidth = measurer.offsetWidth;
          maxLineWidth = Math.max(maxLineWidth, lineWidth);
          
          if (lineWidth > availableWidth) {
            allLinesFit = false;
            break;
          }
        }
        
        // Check if total height fits (accounting for line spacing)
        const lineHeightPx = mid * 1.1;
        const totalHeightNeeded = lines.length * lineHeightPx;
        const spacingBuffer = (lines.length - 1) * 1;
        const totalHeightWithSpacing = totalHeightNeeded + spacingBuffer;
        
        if (allLinesFit && maxLineWidth <= availableWidth && totalHeightWithSpacing <= availableHeight) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      // Set the best fitting font size (will be at least the minimum we found)
      setFontPx(best);
    };
    fit();
    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    ro.observe(container);
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [children]);
  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center text-center"
      style={{ textTransform: 'uppercase', padding: '8px 6px', overflow: 'hidden' }}
    >
      {lines.map((line, i) => (
        <span
          key={i}
          style={{
            color: '#fff',
            fontWeight: 900,
            lineHeight: 1.1,
            fontSize: fontPx ? fontPx + 'px' : undefined,
            fontFamily: '"Swiss 911 BT", "Arial Black", Arial, Helvetica, sans-serif',
            letterSpacing: '0.03em',
            textAlign: 'center',
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '100%',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {line}
        </span>
      ))}
      <div
        ref={measurerRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          height: 'auto',
          width: 'auto',
          pointerEvents: 'none',
          whiteSpace: 'normal',
          zIndex: -1,
          padding: 0,
        }}
      />
    </div>
  );
}
