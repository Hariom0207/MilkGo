export function DairyIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-[440px] items-center justify-center py-2 select-none">
      <svg
        viewBox="0 0 520 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full drop-shadow-sm"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f4fcfe" />
            <stop offset="100%" stopColor="#daf4f8" />
          </linearGradient>

          <linearGradient id="hillFar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d5f2f7" />
            <stop offset="100%" stopColor="#c3ebf3" />
          </linearGradient>

          <linearGradient id="hillNear" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b9e7f1" />
            <stop offset="100%" stopColor="#a3dce8" />
          </linearGradient>

          <linearGradient id="milkBottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#f0faff" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d7f1f7" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.02" />
          </linearGradient>

          <filter id="softShadow" x="-10%" y="-10%" width="125%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0f766e" floodOpacity="0.12" />
          </filter>

          <filter id="cardShadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0e7490" floodOpacity="0.14" />
          </filter>
        </defs>

        {/* Background Soft Rolling Hills & Pasture */}
        <path
          d="M 20 280 Q 140 200 300 230 T 520 220 L 520 400 L 0 400 Z"
          fill="url(#hillFar)"
          opacity="0.65"
        />
        <path
          d="M 0 310 Q 160 250 360 270 T 520 260 L 520 400 L 0 400 Z"
          fill="url(#hillNear)"
          opacity="0.5"
        />

        {/* Distant Barn & Farm Silo Silhouettes */}
        <g opacity="0.38" fill="#58a5b5">
          {/* Silo */}
          <rect x="362" y="170" width="16" height="42" rx="3" />
          <ellipse cx="370" cy="170" rx="8" ry="4" />
          {/* Barn */}
          <polygon points="384,178 398,166 412,178" />
          <rect x="384" y="178" width="28" height="34" />
          {/* Small trees/bushes */}
          <circle cx="348" cy="208" r="9" />
          <circle cx="356" cy="204" r="11" />
          <circle cx="420" cy="207" r="8" />
          <circle cx="428" cy="205" r="10" />
        </g>

        {/* Friendly Dairy Cow (Peeking behind analytics card) */}
        <g id="dairyCow">
          {/* Cow Body behind */}
          <ellipse cx="360" cy="235" rx="55" ry="38" fill="#1e293b" />
          <circle cx="325" cy="245" r="16" fill="#f8fafc" />

          {/* Cow Head */}
          <ellipse cx="350" cy="180" rx="30" ry="26" fill="#1e293b" />
          
          {/* Cow Horns */}
          <path d="M 334 162 Q 330 148 322 150 Q 328 158 335 166 Z" fill="#94a3b8" />
          <path d="M 366 162 Q 370 148 378 150 Q 372 158 365 166 Z" fill="#94a3b8" />

          {/* Cow Ears */}
          <ellipse cx="316" cy="174" rx="14" ry="7" transform="rotate(-20 316 174)" fill="#1e293b" />
          <ellipse cx="316" cy="174" rx="10" ry="4.5" transform="rotate(-20 316 174)" fill="#fbcfe8" />
          <ellipse cx="384" cy="174" rx="14" ry="7" transform="rotate(20 384 174)" fill="#1e293b" />
          <ellipse cx="384" cy="174" rx="10" ry="4.5" transform="rotate(20 384 174)" fill="#fbcfe8" />

          {/* White face patch */}
          <path
            d="M 342 156 Q 350 162 358 156 Q 364 172 360 190 Q 350 196 340 190 Q 336 172 342 156 Z"
            fill="#ffffff"
          />

          {/* Cute Eyes */}
          <circle cx="338" cy="175" r="3.2" fill="#0f172a" />
          <circle cx="339" cy="174" r="1" fill="#ffffff" />
          <circle cx="362" cy="175" r="3.2" fill="#0f172a" />
          <circle cx="363" cy="174" r="1" fill="#ffffff" />

          {/* Cheerful Pink Muzzle */}
          <ellipse cx="350" cy="195" rx="17" ry="11" fill="#fed7aa" />
          {/* Nostrils */}
          <ellipse cx="344" cy="194" rx="2.5" ry="3" fill="#ea580c" opacity="0.6" />
          <ellipse cx="356" cy="194" rx="2.5" ry="3" fill="#ea580c" opacity="0.6" />
          {/* Smile */}
          <path d="M 347 200 Q 350 203 353 200" stroke="#c2410c" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </g>

        {/* Fresh Milk Bottle (Left) */}
        <g id="milkBottle" filter="url(#softShadow)">
          {/* Bottle Body */}
          <path
            d="M 120 180 
               L 120 156 
               Q 120 148 128 144 
               L 128 128 
               Q 124 126 124 122 
               L 124 116 
               L 156 116 
               L 156 122 
               Q 156 126 152 128 
               L 152 144 
               Q 160 148 160 156 
               L 160 300 
               Q 160 316 148 318 
               L 132 318 
               Q 120 316 120 300 
               Z"
            fill="url(#milkBottleGrad)"
            stroke="#bae6fd"
            strokeWidth="2.5"
          />

          {/* Cyan Bottle Cap */}
          <rect x="122" y="112" width="36" height="12" rx="4" fill="#0891b2" />
          <rect x="126" y="108" width="28" height="5" rx="2" fill="#0e7490" />

          {/* Milk Inside Level (white creamy fill) */}
          <path
            d="M 122 170 
               Q 140 166 158 170 
               L 158 298 
               Q 158 314 146 316 
               L 134 316 
               Q 122 314 122 298 
               Z"
            fill="#ffffff"
            opacity="0.95"
          />

          {/* Bottle Highlights & Glass Reflections */}
          <path d="M 126 180 L 126 295" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <path d="M 131 188 L 131 230" stroke="#f0f9ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </g>

        {/* Botanical Leaves & Foliage (Framing Left & Right) */}
        <g id="botanicals">
          {/* Left Foliage */}
          <path
            d="M 86 310 C 65 290 60 260 72 240 C 82 258 88 285 86 310 Z"
            fill="#0891b2"
          />
          <path
            d="M 88 285 C 68 280 50 292 45 310 C 62 310 78 300 88 285 Z"
            fill="#0e7490"
          />
          <path
            d="M 94 320 C 82 300 78 280 84 265 C 92 278 98 302 94 320 Z"
            fill="#06b6d4"
            opacity="0.85"
          />

          {/* Right Foliage */}
          <path
            d="M 390 320 C 410 300 422 270 416 250 C 402 268 392 295 390 320 Z"
            fill="#0891b2"
          />
          <path
            d="M 392 290 C 414 285 432 298 438 318 C 420 316 404 306 392 290 Z"
            fill="#0e7490"
          />
          <path
            d="M 380 328 C 396 308 402 286 394 270 C 386 286 378 310 380 328 Z"
            fill="#06b6d4"
            opacity="0.85"
          />
        </g>

        {/* High-Tech Analytics Tablet Card (Foreground Center) */}
        <g id="analyticsCard" filter="url(#cardShadow)">
          {/* Main Card */}
          <rect
            x="130"
            y="200"
            width="235"
            height="145"
            rx="16"
            fill="#ffffff"
            stroke="#cffafe"
            strokeWidth="2"
          />

          {/* Card Top Window Bar */}
          <path
            d="M 130 216 Q 130 200 146 200 L 349 200 Q 365 200 365 216 L 365 224 L 130 224 Z"
            fill="#0e7490"
          />
          {/* Window control dots */}
          <circle cx="144" cy="212" r="3" fill="#67e8f9" />
          <circle cx="153" cy="212" r="3" fill="#a5f3fc" />
          <circle cx="162" cy="212" r="3" fill="#cffafe" />

          {/* Left: Line Graph Chart */}
          <g transform="translate(145, 235)">
            {/* Chart Area background */}
            <path
              d="M 5 65 L 20 48 L 40 55 L 65 32 L 90 38 L 110 18 L 110 70 L 5 70 Z"
              fill="url(#chartGrad)"
            />
            {/* Upward Line Chart */}
            <path
              d="M 5 65 L 20 48 L 40 55 L 65 32 L 90 38 L 110 18"
              fill="none"
              stroke="#0891b2"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Data Dots */}
            <circle cx="20" cy="48" r="2.5" fill="#0891b2" />
            <circle cx="40" cy="55" r="2.5" fill="#0891b2" />
            <circle cx="65" cy="32" r="2.5" fill="#0891b2" />
            <circle cx="90" cy="38" r="2.5" fill="#0891b2" />
            <circle cx="110" cy="18" r="3.5" fill="#0e7490" stroke="#ffffff" strokeWidth="1.5" />

            {/* Micro Bar Chart Below */}
            <g transform="translate(5, 78)">
              <rect x="0" y="8" width="5" height="12" rx="1.5" fill="#a5f3fc" />
              <rect x="9" y="4" width="5" height="16" rx="1.5" fill="#67e8f9" />
              <rect x="18" y="10" width="5" height="10" rx="1.5" fill="#38bdf8" />
              <rect x="27" y="1" width="5" height="19" rx="1.5" fill="#0891b2" />
              <rect x="36" y="6" width="5" height="14" rx="1.5" fill="#0e7490" />
            </g>
          </g>

          {/* Right: Modern Donut / Pie Chart */}
          <g transform="translate(295, 280)">
            {/* Donut slice 1: Teal */}
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="transparent"
              stroke="#0e7490"
              strokeWidth="12"
              strokeDasharray="50 150"
              strokeDashoffset="0"
            />
            {/* Donut slice 2: Cyan */}
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="transparent"
              stroke="#0891b2"
              strokeWidth="12"
              strokeDasharray="45 150"
              strokeDashoffset="-52"
            />
            {/* Donut slice 3: Soft cyan */}
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="transparent"
              stroke="#67e8f9"
              strokeWidth="12"
              strokeDasharray="35 150"
              strokeDashoffset="-99"
            />
            {/* Donut slice 4: Pale blue */}
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="transparent"
              stroke="#cffafe"
              strokeWidth="12"
              strokeDasharray="20 150"
              strokeDashoffset="-136"
            />
            {/* Center inner circle */}
            <circle cx="0" cy="0" r="16" fill="#ffffff" />
          </g>
        </g>
      </svg>
    </div>
  )
}
