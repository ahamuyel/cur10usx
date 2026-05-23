"use client"

import { motion } from "framer-motion"

export default function HeroIllustration() {
  const africaPath = [
    "M120 68",
    "Q140 62,165 60",     // Morocco north coast
    "Q190 58,215 58",     // Algeria coast
    "Q240 60,265 62",     // Tunisia
    "Q285 65,305 70",     // Libya/Egypt coast
    "Q315 78,312 88",     // Sinai
    "Q318 100,322 115",   // Red Sea coast
    "Q325 130,328 145",   // Sudan/Eritrea
    "Q335 158,342 172",   // Djibouti/Somalia
    "Q348 188,355 202",   // Horn of Africa
    "Q358 216,348 232",   // Somalia east coast
    "Q340 248,332 262",   // Somalia south
    "Q325 275,318 288",   // Kenya
    "Q312 302,305 315",   // Tanzania
    "Q298 328,288 342",   // Mozambique
    "Q278 356,268 368",   // Mozambique south
    "Q258 380,248 390",   // South Africa east
    "Q238 396,228 392",   // Cape tip
    "Q220 382,212 368",   // South Africa west
    "Q205 352,198 336",   // Namibia
    "Q192 320,186 304",   // Namibia north
    "Q180 288,175 272",   // Angola
    "Q170 256,166 240",   // DRC coast
    "Q162 226,158 214",   // Congo/Gabon
    "Q152 204,146 198",   // Equatorial Guinea
    "Q140 204,134 210",   // Gulf of Guinea (east side)
    "Q128 218,124 228",   // Gulf of Guinea (north)
    "Q120 238,116 244",   // Ghana
    "Q112 246,108 242",   // Côte d'Ivoire
    "Q104 236,100 228",   // Liberia
    "Q96 218,92 208",     // Sierra Leone
    "Q88 198,84 188",     // Guinea
    "Q80 178,76 168",     // Senegal
    "Q78 158,82 148",     // Mauritania
    "Q88 138,94 128",
    "Q100 118,106 108",
    "Q112 98,116 88",
    "Q118 78,120 68Z",    // Back to start
  ].join(" ")

  return (
    <div className="relative w-full aspect-[4/5] max-w-[420px] mx-auto">
      <svg viewBox="60 30 400 460" fill="none" className="w-full h-full">
        {/* Background glow rings */}
        <circle cx="250" cy="280" r="220" stroke="url(#ring1)" strokeWidth="0.5" />
        <circle cx="250" cy="280" r="180" stroke="url(#ring2)" strokeWidth="0.5" />
        <circle cx="250" cy="280" r="140" stroke="url(#ring3)" strokeWidth="0.5" />

        {/* Madagascar */}
        <path
          d="M365 340 Q372 350,368 365 Q362 378,355 370 Q350 358,355 342 Z"
          className="fill-growth-500/[0.07] stroke-growth-500/30"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Africa continent */}
        <path
          d={africaPath}
          className="fill-sun-500/[0.06] stroke-sun-500/30"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Internal contour lines for depth */}
        <path
          d="M150 85 Q185 80,225 82 Q260 85,290 90 Q300 100,305 115 Q310 135,315 155 Q320 175,325 195 Q330 210,325 225 Q318 240,310 255 Q302 270,292 285 Q282 300,270 315 Q258 330,245 345 Q235 355,225 360 Q218 350,212 335 Q206 318,200 300 Q195 285,190 270 Q185 255,180 240 Q175 225,168 212 Q162 200,155 195 Q148 200,142 210 Q138 220,135 230 Q132 238,128 240 Q124 238,120 230 Q116 220,112 210 Q108 200,104 190 Q100 180,96 172 Q92 165,90 158 Q92 148,96 138 Q102 126,110 116 Q118 106,128 98 Q140 90,150 85Z"
          className="fill-sun-500/[0.04] stroke-sun-500/15"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Network connection lines */}
        <g className="text-sun-500/25">
          <line x1="200" y1="180" x2="140" y2="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="200" y1="180" x2="310" y2="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="200" y1="220" x2="120" y2="240" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="200" y1="220" x2="330" y2="260" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="200" y1="270" x2="170" y2="350" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="200" y1="270" x2="280" y2="350" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="200" y1="220" x2="200" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        </g>

        {/* Network dots */}
        <motion.circle
          cx="140" cy="120" r="3.5" className="fill-growth-500"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="310" cy="120" r="3" className="fill-sun-400"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.circle
          cx="120" cy="240" r="3" className="fill-growth-400"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.circle
          cx="330" cy="260" r="3" className="fill-sun-500"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        <motion.circle
          cx="170" cy="350" r="3" className="fill-growth-500"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        <motion.circle
          cx="280" cy="350" r="3" className="fill-sun-400"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.circle
          cx="200" cy="100" r="3" className="fill-growth-400"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />

        {/* Angola highlight marker */}
        <g transform="translate(178, 280)">
          <motion.circle
            cx="0" cy="0" r="12" className="fill-sun-400/20"
            animate={{ r: [12, 16, 12] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx="0" cy="0" r="5" className="fill-sun-400"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx="0" cy="0" r="2.5" className="fill-white" />
        </g>

        {/* Graduation cap (mortarboard) */}
        <g transform="translate(210, 175)">
          <path d="M-32 2 L-38 8 L38 8 L32 2Z" className="fill-growth-400" />
          <path d="M-45 2 C-45 -6, -34 -10, 0 -14 C34 -10, 45 -6, 45 2Z" className="fill-growth-500" />
          <path d="M28 -8 C32 -4, 36 0, 40 6 C43 12, 41 14, 38 12 C34 10, 36 6, 34 0 C32 -4, 30 -6, 28 -8Z" className="fill-sun-400" />
        </g>

        {/* Open book below cap */}
        <g transform="translate(210, 230)">
          <path d="M-35 -2 C-35 -8, -24 -12, 0 -14 L0 6 C-24 8, -35 4, -35 -2Z" className="fill-growth-400/40 stroke-growth-500/30" strokeWidth="1" />
          <path d="M35 -2 C35 -8, 24 -12, 0 -14 L0 6 C24 8, 35 4, 35 -2Z" className="fill-growth-400/40 stroke-growth-500/30" strokeWidth="1" />
          <line x1="0" y1="-14" x2="0" y2="6" className="stroke-growth-500/40" strokeWidth="1" />
        </g>

        {/* Small floating caps */}
        <g transform="translate(120, 150) scale(0.4)" className="opacity-40">
          <path d="M-40 2 C-40 -6, -30 -10, 0 -14 C30 -10, 40 -6, 40 2Z" className="fill-growth-500" />
          <path d="M-28 2 L-34 8 L34 8 L28 2Z" className="fill-growth-400" />
        </g>
        <g transform="translate(330, 165) scale(0.35)" className="opacity-30">
          <path d="M-40 2 C-40 -6, -30 -10, 0 -14 C30 -10, 40 -6, 40 2Z" className="fill-sun-400" />
          <path d="M-28 2 L-34 8 L34 8 L28 2Z" className="fill-sun-400" />
        </g>
        <g transform="translate(170, 330) scale(0.25)" className="opacity-35">
          <path d="M-40 2 C-40 -6, -30 -10, 0 -14 C30 -10, 40 -6, 40 2Z" className="fill-growth-500" />
          <path d="M-28 2 L-34 8 L34 8 L28 2Z" className="fill-growth-500" />
        </g>

        {/* Defs */}
        <defs>
          <linearGradient id="ring1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" className="text-growth-500/10" />
            <stop offset="100%" stopColor="currentColor" className="text-sun-400/5" />
          </linearGradient>
          <linearGradient id="ring2" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="currentColor" className="text-sun-500/8" />
            <stop offset="100%" stopColor="currentColor" className="text-growth-500/5" />
          </linearGradient>
          <linearGradient id="ring3" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" className="text-growth-400/8" />
            <stop offset="100%" stopColor="currentColor" className="text-sun-500/5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
