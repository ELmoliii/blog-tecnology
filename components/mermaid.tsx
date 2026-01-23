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

  useEffect(() => {
    // Determine the current theme (light or dark), default to 'default' (light) if undefined
    const currentTheme = resolvedTheme === "dark" ? "dark" : "default"
    
    // Custom colors based on the application theme
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
          fontSize: "16px", // Configured size
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
          fontSize: "16px", // Configured size
        }

    mermaid.initialize({
      startOnLoad: false,
      theme: currentTheme,
      themeVariables,
      securityLevel: "loose",
      fontFamily: "arial, sans-serif",
      fontSize: 16, // Metric calculation size
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 30, // Keeping user preference
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

        const riskyColor = resolvedTheme === "dark" ? "#7f1d1d" : "#fee2e2" 
        const riskyBorder = resolvedTheme === "dark" ? "#fca5a5" : "#ef4444" 
        const riskyText = resolvedTheme === "dark" ? "#fef2f2" : "#991b1b"
        
        const safeColor = resolvedTheme === "dark" ? "#14532d" : "#dcfce7" 
        const safeBorder = resolvedTheme === "dark" ? "#86efac" : "#16a34a" 
        const safeText = resolvedTheme === "dark" ? "#f0fdf4" : "#166534"
        
        const bkgColor = resolvedTheme === 'dark' ? '#1e293b' : '#ffffff'

        const cssFixes = `
          /* --- FIX PARA ENTIDADES (CAJAS) --- */
          .node foreignObject {
            overflow: visible !important;
          }
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

          /* --- FIX PARA FLECHAS (EDGE LABELS) --- */
          .edgeLabel foreignObject {
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          .edgeLabel foreignObject div, 
          .edgeLabel foreignObject span {
            font-size: 14px !important;
            white-space: nowrap !important;
            width: auto !important;
            padding: 2px 5px !important;
            background-color: ${bkgColor} !important;
            border-radius: 4px;
          }
          
          g.edgeLabel > g > rect {
             fill: ${bkgColor} !important;
             stroke: none !important;
          }

          /* Responsive SVG strategy: Scrollable */
          /* We allow the SVG to be its natural size (or at least 100% of container) */
          /* This prevents wide diagrams from shrinking to unreadable sizes */
          svg[id^="mermaid-"] {
            width: auto !important; 
            min-width: 100% !important;
            height: auto !important;
            max-width: none !important; /* Allow growing beyond container for scrolling */
            display: block !important;
            margin: 0 auto !important;
          }
        `

        const classDefs = `
          classDef risky fill:${riskyColor},stroke:${riskyBorder},color:${riskyText},stroke-width:2px;
          classDef safe fill:${safeColor},stroke:${safeBorder},color:${safeText},stroke-width:2px;
        `
        
        const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        const processedChart = `${chart}\n${classDefs}`

        const { svg } = await mermaid.render(uniqueId, processedChart)
        
        if (ref.current) {
          ref.current.innerHTML = svg
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

  }, [chart, resolvedTheme])

  return (
    <div
      key={`${chart}-${resolvedTheme}`}
      ref={ref}
      // Re-added overflow-x-auto to allow scrolling if diagram is wider than screen
      className={`flex justify-center items-center my-8 w-full overflow-x-auto ${rendered ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
    />
  )
}