"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import { useTheme } from "next-themes"

interface MermaidProps {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState(false)
  const { resolvedTheme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)

  // Detección de móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches)
    }
    checkMobile()
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    const currentTheme = resolvedTheme === "dark" ? "dark" : "default"
    
    // Configuración de colores (Tu configuración original)
    const themeVariables = resolvedTheme === "dark" 
      ? {
          primaryColor: '#6366f1', 
          mainBkg: '#1e293b',      
          textColor: '#f8fafc',    
          lineColor: '#cbd5e1',    
          primaryBorderColor: '#818cf8',
          clusterBkg: '#0f172a',   
          clusterBorder: '#475569',
          fontFamily: "arial, sans-serif",
          fontSize: "16px",
        }
      : {
          primaryColor: '#4f46e5',
          mainBkg: '#ffffff',
          textColor: '#0f172a',
          lineColor: '#475569',
          primaryBorderColor: '#4f46e5',
          clusterBkg: '#f8fafc',    
          clusterBorder: '#cbd5e1',
          fontFamily: "arial, sans-serif",
          fontSize: "16px",
        }

    mermaid.initialize({
      startOnLoad: false,
      theme: currentTheme,
      themeVariables,
      securityLevel: "loose",
      fontFamily: "arial, sans-serif",
      fontSize: 16,
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 30,
      },
      sequence: {
        actorMargin: 50,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
      }
    })

    const renderDiagram = async () => {
      if (!ref.current) return
      
      try {
        await document.fonts.ready

        const bkgColor = resolvedTheme === 'dark' ? '#1e293b' : '#ffffff'

        // CSS Fixes: Eliminé el zoom forzado (150%) y añadí reglas para respetar el tamaño natural
        const cssFixes = `
          .node foreignObject { overflow: visible !important; }
          .node foreignObject div {
            font-family: arial, sans-serif !important;
            font-size: 16px !important; 
            line-height: 1.5 !important;
            text-align: center !important;
            white-space: nowrap !important; 
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .edgeLabel foreignObject { width: auto !important; height: auto !important; overflow: visible !important; }
          .edgeLabel foreignObject div, .edgeLabel foreignObject span {
            font-size: 14px !important;
            white-space: nowrap !important;
            width: auto !important;
            padding: 2px 5px !important;
            background-color: ${bkgColor} !important;
            border-radius: 4px;
          }
          g.edgeLabel > g > rect { fill: ${bkgColor} !important; stroke: none !important; }

          /* ESTRATEGIA RESPONSIVE CORREGIDA */
          svg[id^="mermaid-"] {
            /* Por defecto en escritorio ocupa el 100% disponible pero no más */
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
            margin: 0 auto !important;
          }
        `

        // Definición de clases risky/safe
        const riskyColor = resolvedTheme === "dark" ? "#7f1d1d" : "#fee2e2" 
        const riskyBorder = resolvedTheme === "dark" ? "#fca5a5" : "#ef4444" 
        const riskyText = resolvedTheme === "dark" ? "#fef2f2" : "#991b1b"
        const safeColor = resolvedTheme === "dark" ? "#14532d" : "#dcfce7" 
        const safeBorder = resolvedTheme === "dark" ? "#86efac" : "#16a34a" 
        const safeText = resolvedTheme === "dark" ? "#f0fdf4" : "#166534"

        const classDefs = `
          classDef risky fill:${riskyColor},stroke:${riskyBorder},color:${riskyText},stroke-width:2px;
          classDef safe fill:${safeColor},stroke:${safeBorder},color:${safeText},stroke-width:2px;
        `
        
        const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        
        // Cambio de dirección en móvil (TB vs LR)
        let finalChart = chart
        if (isMobile) {
          finalChart = finalChart.replace(/((?:flowchart|graph)\s+)(LR|RL)/gi, '$1TB')
        }

        const processedChart = `${finalChart}\n${classDefs}`
        const { svg } = await mermaid.render(uniqueId, processedChart)
        
        if (ref.current) {
          ref.current.innerHTML = svg
          
          const svgEl = ref.current.querySelector('svg')
          if (svgEl) {
            // --- FIX CRÍTICO ---
            // Leemos el tamaño REAL (viewBox) que calculó Mermaid
            const viewBox = svgEl.getAttribute('viewBox')
            if (viewBox) {
              const parts = viewBox.split(/\s+/)
              if (parts.length >= 4) {
                 const width = parseFloat(parts[2])
                 
                 // EN MÓVIL:
                 // Si detectamos móvil, forzamos que el SVG tenga SU ANCHO REAL en píxeles.
                 // Esto evita que se encoja (texto ilegible) y evita que se estire (texto gigante).
                 // Si el diagrama es más ancho que la pantalla, el div contenedor hará scroll.
                 if (isMobile && !isNaN(width)) {
                    svgEl.style.width = `${width}px` // Ancho fijo en px
                    svgEl.style.maxWidth = 'none'    // Permitir desbordamiento
                    svgEl.style.minWidth = '100%'    // Para que diagramas muy pequeños al menos ocupen el ancho de pantalla
                 }
              }
            }
          }

          const styleInfo = document.createElement('style')
          styleInfo.textContent = cssFixes
          ref.current.prepend(styleInfo)
          
          setRendered(true)
        }
      } catch (error) {
        console.error("Mermaid rendering failed:", error)
      }
    }

    renderDiagram()

  }, [chart, resolvedTheme, isMobile])

  return (
    <div
      key={`${chart}-${resolvedTheme}`}
      ref={ref}
      // Usamos flex y justify-center para que si el diagrama es pequeño, quede centrado.
      // overflow-x-auto permite el scroll si el diagrama es grande.
      className={`flex justify-center overflow-x-auto my-8 w-full p-4 ${rendered ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
    />
  )
}