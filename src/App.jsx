import React, { useEffect, useMemo, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'

function App() {
  const splineContainerRef = useRef(null)
  const usernameRef = useRef(null)
  const passwordRef = useRef(null)
  const activeFieldRef = useRef(null)
  const rafRef = useRef(0)
  const targetPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sceneUrl = useMemo(
    () => 'https://prod.spline.design/M4yE7MTeWshitQbr/scene.splinecode',
    []
  )

  // Utility: get caret pixel position inside an input relative to viewport
  const getCaretViewportPosition = (inputEl) => {
    if (!inputEl) return null
    const { selectionStart, value } = inputEl
    const textBeforeCaret = value.slice(0, selectionStart ?? 0)

    // Create a measuring canvas to approximate text width
    const measure = document.createElement('canvas').getContext('2d')
    const style = window.getComputedStyle(inputEl)
    measure.font = `${style.fontWeight} ${style.fontSize} / ${style.lineHeight} ${style.fontFamily}`
    const metrics = measure.measureText(textBeforeCaret)
    const textWidth = metrics.width

    const rect = inputEl.getBoundingClientRect()
    const paddingLeft = parseFloat(style.paddingLeft || '0')
    const paddingTop = parseFloat(style.paddingTop || '0')
    const lineHeight = parseFloat(style.lineHeight || style.fontSize || '16')

    const x = rect.left + paddingLeft + textWidth
    const y = rect.top + paddingTop + lineHeight * 0.65 // roughly caret midline

    return { x, y }
  }

  const dispatchSyntheticPointerMove = (x, y) => {
    const container = splineContainerRef.current
    if (!container) return
    const canvas = container.querySelector('canvas')
    if (!canvas) return

    const evt = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      screenX: x,
      screenY: y,
      view: window
    })
    canvas.dispatchEvent(evt)
  }

  // Smoothly move the synthetic pointer towards target
  const animatePointer = () => {
    const lerp = 0.12 // subtle, slightly robotic
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerp
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerp
    dispatchSyntheticPointerMove(currentPos.current.x, currentPos.current.y)
    rafRef.current = requestAnimationFrame(animatePointer)
  }

  useEffect(() => {
    // Start animation loop
    rafRef.current = requestAnimationFrame(animatePointer)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateGazeToField = (el) => {
    if (!el) return
    const pos = getCaretViewportPosition(el)
    if (!pos) return
    targetPos.current = pos
  }

  const handleFocus = (e) => {
    activeFieldRef.current = e.target
    updateGazeToField(e.target)
  }

  const handleInput = (e) => {
    updateGazeToField(e.target)
  }

  const handleBlur = () => {
    activeFieldRef.current = null
  }

  // On resize/scroll keep gaze aligned with active field
  useEffect(() => {
    const onRecalc = () => {
      if (activeFieldRef.current) updateGazeToField(activeFieldRef.current)
    }
    window.addEventListener('resize', onRecalc)
    window.addEventListener('scroll', onRecalc, { passive: true })
    return () => {
      window.removeEventListener('resize', onRecalc)
      window.removeEventListener('scroll', onRecalc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen w-full bg-[#0b0c0f] text-white relative overflow-hidden">
      {/* Subtle radial highlight background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full opacity-30 blur-3xl"
             style={{
               background:
                 'radial-gradient(closest-side, rgba(60,80,255,0.25), rgba(60,80,255,0.06), transparent)'
             }}
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Login form column */}
        <div className="flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3">
                <div className="size-9 rounded-md bg-white/10 ring-1 ring-white/15 grid place-content-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l3 4-3 4-3-4 3-4zm0 12l3 4-3 4-3-4 3-4z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/60">CYGNUS SYSTEM</p>
                  <h1 className="text-2xl font-semibold tracking-tight">Cyborg Access Console</h1>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm text-white/70">Identifier</label>
                <input
                  id="username"
                  ref={usernameRef}
                  onFocus={handleFocus}
                  onInput={handleInput}
                  onBlur={handleBlur}
                  placeholder="unit.alpha-09"
                  className="w-full bg-white/[0.06] focus:bg-white/[0.09] transition-colors ring-1 ring-white/15 focus:ring-2 focus:ring-indigo-400/60 rounded-lg px-4 py-3 outline-none placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-white/70">Access Key</label>
                <input
                  id="password"
                  type="password"
                  ref={passwordRef}
                  onFocus={handleFocus}
                  onInput={handleInput}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.06] focus:bg.white/[0.09] transition-colors ring-1 ring-white/15 focus:ring-2 focus:ring-indigo-400/60 rounded-lg px-4 py-3 outline-none placeholder:text-white/30"
                />
              </div>

              <button
                className="w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 py-3 font-medium tracking-wide ring-1 ring-white/10 hover:brightness-110 transition"
              >
                Authenticate
              </button>

              <p className="text-xs text-white/40 text-center">Robot will track your input focus and keystrokes in real-time.</p>
            </div>
          </div>
        </div>

        {/* 3D column */}
        <div className="relative min-h-[60vh] lg:min-h-screen">
          {/* 3D Scene */}
          <div ref={splineContainerRef} className="absolute inset-0">
            {mounted && (
              <Spline scene={sceneUrl} style={{ width: '100%', height: '100%' }} />
            )}
          </div>

          {/* Gradient overlay for contrast, non-blocking */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0c0f] via-transparent to-transparent" />

          {/* Minimal sci-fi UI accents */}
          <div className="pointer-events-none absolute bottom-6 right-6 text-right text-white/50 text-xs tracking-wider">
            <div className="font-mono">PROTOCOL: SIGMA-NECK-SEGMENT v2.4</div>
            <div className="font-mono">FOREHEAD: DIAMOND EMBLEM LOCKED</div>
            <div className="font-mono">AUDIO: PASSIVE | VISUAL: ACTIVE</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
