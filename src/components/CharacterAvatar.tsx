'use client';

import { useState, useEffect } from 'react';

export type AvatarState = 'idle' | 'talking' | 'listening';

interface Props {
  character: 'leo' | 'mia';
  state: AvatarState;
  className?: string;
}

// React-state blink — avoids CSS scaleY transform origin issues in SVG
function useBlink(initialDelay = 1800) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const blink = () => {
      setClosed(true);
      t = setTimeout(() => {
        setClosed(false);
        t = setTimeout(blink, 2400 + Math.random() * 2200);
      }, 115);
    };
    t = setTimeout(blink, initialDelay);
    return () => clearTimeout(t);
  }, [initialDelay]);
  return closed;
}

// ── LEO ──────────────────────────────────────────────────────────────────────
function LeoSVG({ state }: { state: AvatarState }) {
  const [mouthOpen, setMouthOpen] = useState(false);
  const eyesClosed = useBlink(1600);

  useEffect(() => {
    if (state !== 'talking') { setMouthOpen(false); return; }
    const t = setInterval(() => setMouthOpen(o => !o), 145);
    return () => clearInterval(t);
  }, [state]);

  // Eye ry values — close = 2 (thin line), open = 19
  const eyeRY = eyesClosed ? 2 : 19;

  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="L-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#FFDA9C" />
          <stop offset="40%" stopColor="#F09050" />
          <stop offset="100%" stopColor="#8B3010" />
        </linearGradient>
        <linearGradient id="L-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8C89C" />
          <stop offset="100%" stopColor="#E8A870" />
        </linearGradient>
        <linearGradient id="L-hair" x1="0.2" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C1812" />
          <stop offset="100%" stopColor="#120A06" />
        </linearGradient>
        <linearGradient id="L-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A9CB8" />
          <stop offset="100%" stopColor="#2E6E90" />
        </linearGradient>
        <radialGradient id="L-iris" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#7A4828" />
          <stop offset="50%" stopColor="#3C1E0C" />
          <stop offset="100%" stopColor="#120806" />
        </radialGradient>
        <filter id="L-blur">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="400" height="600" fill="url(#L-bg)" />
      <circle cx="340" cy="80" r="130" fill="#FFE4B0" opacity="0.28" filter="url(#L-blur)" />
      <circle cx="55" cy="510" r="150" fill="#AA3010" opacity="0.22" filter="url(#L-blur)" />

      {/* Shirt */}
      <path d="M -60 600 Q 20 495 98 462 L 140 442 L 170 432 L 200 436 L 230 432 L 260 442 L 302 462 Q 380 495 460 600 Z"
        fill="url(#L-shirt)" />
      {/* Collar */}
      <path d="M 170 432 L 166 458 Q 180 469 190 471 L 200 475 L 210 471 Q 220 469 234 458 L 230 432 Q 217 445 207 449 L 200 451 L 193 449 Q 183 445 170 432 Z"
        fill="#3E7A95" />
      <line x1="200" y1="475" x2="200" y2="514" stroke="#367088" strokeWidth="2" opacity="0.5" />

      {/* Neck */}
      <path d="M 178 392 Q 175 428 177 432 Q 188 440 200 438 Q 212 440 223 432 Q 225 428 222 392 Z"
        fill="url(#L-skin)" />

      {/* Ears — drawn before face oval so oval covers inner ear */}
      <ellipse cx="97" cy="274" rx="13" ry="18" fill="#ECBA88" />
      <ellipse cx="100" cy="274" rx="9" ry="12" fill="#D8A070" />
      <ellipse cx="303" cy="274" rx="13" ry="18" fill="#ECBA88" />
      <ellipse cx="300" cy="274" rx="9" ry="12" fill="#D8A070" />

      {/* Face oval */}
      <ellipse cx="200" cy="268" rx="103" ry="122" fill="url(#L-skin)" />

      {/* Hair — drawn after face to cover forehead */}
      <ellipse cx="200" cy="152" rx="107" ry="62" fill="url(#L-hair)" />
      <path d="M 93 198 Q 88 232 97 268 Q 104 248 108 224 Q 110 210 108 198 Z" fill="#1E1008" />
      <path d="M 307 198 Q 312 232 303 268 Q 296 248 292 224 Q 290 210 292 198 Z" fill="#1E1008" />
      <path d="M 108 198 Q 140 165 200 159 Q 260 165 292 198 Q 265 182 200 176 Q 135 182 108 198 Z"
        fill="#2A1810" />
      <path d="M 152 163 Q 182 150 215 148"
        stroke="#5A3020" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.5" />

      {/* Eyebrows */}
      <path d="M 130 236 Q 152 226 177 230"
        stroke="#1A0E06" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M 223 230 Q 248 226 270 236"
        stroke="#1A0E06" strokeWidth="5.5" fill="none" strokeLinecap="round" />

      {/* LEFT EYE — ry driven by React state, no CSS transform */}
      <ellipse cx="163" cy="255" rx="27" ry={eyeRY} fill="white" />
      {!eyesClosed && (
        <>
          <circle cx="165" cy="257" r="14" fill="url(#L-iris)" />
          <circle cx="165" cy="257" r="9" fill="#100806" />
          <circle cx="157" cy="250" r="5.5" fill="white" opacity="0.95" />
          <circle cx="167" cy="262" r="2" fill="white" opacity="0.45" />
        </>
      )}
      {/* Left eyelid line — always visible */}
      <path d="M 136 252 Q 163 240 190 252"
        stroke="#1A0E06" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 138 251 L 132 241" stroke="#1A0E06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 149 245 L 145 234" stroke="#1A0E06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 163 241 L 162 230" stroke="#1A0E06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 177 245 L 180 234" stroke="#1A0E06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 188 251 L 194 241" stroke="#1A0E06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 138 262 Q 163 272 188 262" stroke="#2A1810" strokeWidth="1" fill="none" opacity="0.3" />

      {/* RIGHT EYE */}
      <ellipse cx="237" cy="255" rx="27" ry={eyeRY} fill="white" />
      {!eyesClosed && (
        <>
          <circle cx="235" cy="257" r="14" fill="url(#L-iris)" />
          <circle cx="235" cy="257" r="9" fill="#100806" />
          <circle cx="227" cy="250" r="5.5" fill="white" opacity="0.95" />
          <circle cx="237" cy="262" r="2" fill="white" opacity="0.45" />
        </>
      )}
      <path d="M 210 252 Q 237 240 264 252"
        stroke="#1A0E06" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 212 251 L 206 241" stroke="#1A0E06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 223 245 L 219 234" stroke="#1A0E06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 237 241 L 236 230" stroke="#1A0E06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 251 245 L 254 234" stroke="#1A0E06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 262 251 L 268 241" stroke="#1A0E06" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 212 262 Q 237 272 262 262" stroke="#2A1810" strokeWidth="1" fill="none" opacity="0.3" />

      {/* NOSE */}
      <path d="M 197 300 Q 188 318 183 324 Q 200 331 217 324 Q 212 318 203 300"
        stroke="#CCA070" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 186 323 Q 200 329 214 323"
        stroke="#CCA070" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* MOUTH */}
      {mouthOpen ? (
        <g>
          <path d="M 165 338 Q 200 356 235 338 L 235 348 Q 200 368 165 348 Z" fill="#A04838" />
          <path d="M 172 341 Q 200 349 228 341 L 228 354 Q 200 354 172 354 Z" fill="white" opacity="0.92" />
          <path d="M 175 354 Q 200 362 225 354 L 225 361 Q 200 370 175 361 Z" fill="#6E2015" />
          <path d="M 165 338 Q 200 350 235 338" stroke="#C06050" strokeWidth="1.5" fill="none" />
        </g>
      ) : (
        <g>
          <path d="M 166 338 Q 200 356 234 338"
            stroke="#B05540" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 175 338 Q 200 344 225 338"
            stroke="#C87060" strokeWidth="1.8" fill="none" opacity="0.5" />
        </g>
      )}
      <path d="M 161 334 Q 165 341 168 338" stroke="#C88060" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M 239 334 Q 235 341 232 338" stroke="#C88060" strokeWidth="2" fill="none" opacity="0.6" />

      {/* Cheek blush */}
      <ellipse cx="106" cy="286" rx="30" ry="16" fill="#FFB898" opacity="0.22" />
      <ellipse cx="294" cy="286" rx="30" ry="16" fill="#FFB898" opacity="0.22" />

      {/* Listening rings */}
      {state === 'listening' && (
        <>
          <ellipse cx="200" cy="268" rx="107" ry="126" fill="none" stroke="#78D4FF" strokeWidth="4"
            style={{ transformOrigin: '200px 268px', transformBox: 'fill-box', animation: 'listening-ring 1.5s ease-out infinite' }} />
          <ellipse cx="200" cy="268" rx="113" ry="132" fill="none" stroke="#78D4FF" strokeWidth="2" opacity="0.4"
            style={{ transformOrigin: '200px 268px', transformBox: 'fill-box', animation: 'listening-ring 1.5s ease-out 0.5s infinite' }} />
        </>
      )}
    </svg>
  );
}

// ── MIA ──────────────────────────────────────────────────────────────────────
function MiaSVG({ state }: { state: AvatarState }) {
  const [mouthOpen, setMouthOpen] = useState(false);
  const eyesClosed = useBlink(2200);

  useEffect(() => {
    if (state !== 'talking') { setMouthOpen(false); return; }
    const t = setInterval(() => setMouthOpen(o => !o), 145);
    return () => clearInterval(t);
  }, [state]);

  const eyeRY = eyesClosed ? 2 : 21;

  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="M-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B4EDE8" />
          <stop offset="35%" stopColor="#C8B8F0" />
          <stop offset="70%" stopColor="#F0C8DC" />
          <stop offset="100%" stopColor="#F8E8A0" />
        </linearGradient>
        <linearGradient id="M-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FAE0C4" />
          <stop offset="100%" stopColor="#ECC8A4" />
        </linearGradient>
        <linearGradient id="M-hair" x1="0.1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1C3A54" />
          <stop offset="55%" stopColor="#0E2030" />
          <stop offset="100%" stopColor="#060E18" />
        </linearGradient>
        <linearGradient id="M-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8AD8D0" />
          <stop offset="100%" stopColor="#60B8B0" />
        </linearGradient>
        <radialGradient id="M-iris" cx="33%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#4A1C60" />
          <stop offset="50%" stopColor="#1C0A28" />
          <stop offset="100%" stopColor="#08040E" />
        </radialGradient>
        <filter id="M-blur">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* Pastel geometric background */}
      <rect width="400" height="600" fill="url(#M-bg)" />
      <rect x="240" y="0" width="160" height="220" fill="#9ED8D0" opacity="0.45" />
      <rect x="0" y="0" width="140" height="160" fill="#F4E890" opacity="0.38" />
      <rect x="265" y="205" width="135" height="260" fill="#D8A8C8" opacity="0.42" />
      <rect x="0" y="360" width="155" height="240" fill="#98D8D0" opacity="0.38" />
      <rect x="130" y="470" width="270" height="130" fill="#C4B8EC" opacity="0.32" />
      <circle cx="200" cy="280" r="180" fill="white" opacity="0.06" filter="url(#M-blur)" />

      {/* Mint top */}
      <path d="M -60 600 Q 25 505 102 474 L 142 454 L 170 444 L 200 448 L 230 444 L 258 454 L 298 474 Q 375 505 460 600 Z"
        fill="url(#M-top)" />
      <path d="M 102 474 Q 93 458 90 440 Q 112 452 142 454 Z" fill="#6AC0B8" />
      <path d="M 298 474 Q 307 458 310 440 Q 288 452 258 454 Z" fill="#6AC0B8" />
      <path d="M 170 444 Q 200 452 230 444" stroke="#58B0A8" strokeWidth="2.5" fill="none" />

      {/* Neck */}
      <path d="M 178 385 Q 175 422 177 444 Q 188 452 200 450 Q 212 452 223 444 Q 225 422 222 385 Z"
        fill="url(#M-skin)" />

      {/* Long hair panels — behind face */}
      <path d="M 98 185 Q 62 260 55 380 Q 58 480 68 560 Q 80 500 84 420 Q 88 330 90 252 Q 92 218 96 188 Z"
        fill="#162A40" />
      <path d="M 302 185 Q 338 260 345 380 Q 342 480 332 560 Q 320 500 316 420 Q 312 330 310 252 Q 308 218 304 188 Z"
        fill="#162A40" />

      {/* Ears */}
      <ellipse cx="100" cy="270" rx="12" ry="16" fill="#ECC8A4" />
      <ellipse cx="102" cy="270" rx="8" ry="11" fill="#DDB898" />
      <ellipse cx="300" cy="270" rx="12" ry="16" fill="#ECC8A4" />
      <ellipse cx="298" cy="270" rx="8" ry="11" fill="#DDB898" />

      {/* Face oval */}
      <ellipse cx="200" cy="264" rx="101" ry="119" fill="url(#M-skin)" />

      {/* Hair dome — drawn after face to cover forehead */}
      <ellipse cx="200" cy="150" rx="104" ry="63" fill="url(#M-hair)" />
      <line x1="200" y1="102" x2="200" y2="175" stroke="#0A1820" strokeWidth="3" opacity="0.65" />
      <path d="M 100 188 Q 134 158 200 152 Q 266 158 300 188 Q 272 170 200 164 Q 128 170 100 188 Z"
        fill="#1C3A54" />
      <path d="M 150 158 Q 176 144 198 141"
        stroke="#2E5878" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M 202 141 Q 224 144 250 158"
        stroke="#2E5878" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* Front hair strands over ears */}
      <path d="M 98 190 Q 96 218 98 255" stroke="#243C54" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M 302 190 Q 304 218 302 255" stroke="#243C54" strokeWidth="10" fill="none" strokeLinecap="round" />

      {/* Eyebrows */}
      <path d="M 125 232 Q 148 220 172 225"
        stroke="#1A2030" strokeWidth="3.8" fill="none" strokeLinecap="round" />
      <path d="M 228 225 Q 252 220 275 232"
        stroke="#1A2030" strokeWidth="3.8" fill="none" strokeLinecap="round" />

      {/* LEFT EYE — ry driven by React state */}
      <ellipse cx="165" cy="252" rx="29" ry={eyeRY} fill="white" />
      {!eyesClosed && (
        <>
          <circle cx="167" cy="254" r="15" fill="url(#M-iris)" />
          <circle cx="167" cy="254" r="10" fill="#080410" />
          <circle cx="158" cy="247" r="6" fill="white" opacity="0.95" />
          <circle cx="169" cy="259" r="2.2" fill="white" opacity="0.5" />
        </>
      )}
      {/* Left lashes — always visible */}
      <path d="M 136 248 Q 165 234 194 248"
        stroke="#1A2030" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 138 247 L 131 236" stroke="#1A2030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 150 240 L 147 229" stroke="#1A2030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 165 237 L 164 226" stroke="#1A2030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 180 240 L 183 229" stroke="#1A2030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 192 247 L 198 236" stroke="#1A2030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 138 260 Q 165 270 192 260" stroke="#1A2030" strokeWidth="0.9" fill="none" opacity="0.32" />

      {/* RIGHT EYE */}
      <ellipse cx="235" cy="252" rx="29" ry={eyeRY} fill="white" />
      {!eyesClosed && (
        <>
          <circle cx="233" cy="254" r="15" fill="url(#M-iris)" />
          <circle cx="233" cy="254" r="10" fill="#080410" />
          <circle cx="224" cy="247" r="6" fill="white" opacity="0.95" />
          <circle cx="235" cy="259" r="2.2" fill="white" opacity="0.5" />
        </>
      )}
      <path d="M 206 248 Q 235 234 264 248"
        stroke="#1A2030" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 208 247 L 201 236" stroke="#1A2030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 220 240 L 217 229" stroke="#1A2030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 235 237 L 234 226" stroke="#1A2030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 250 240 L 253 229" stroke="#1A2030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 262 247 L 268 236" stroke="#1A2030" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 208 260 Q 235 270 262 260" stroke="#1A2030" strokeWidth="0.9" fill="none" opacity="0.32" />

      {/* NOSE */}
      <path d="M 197 296 Q 189 314 185 320 Q 200 326 215 320 Q 211 314 203 296"
        stroke="#CCA885" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 188 319 Q 200 325 212 319"
        stroke="#CCA885" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* MOUTH */}
      {mouthOpen ? (
        <g>
          <path d="M 170 330 Q 200 347 230 330 L 230 340 Q 200 358 170 340 Z" fill="#B06878" />
          <path d="M 177 333 Q 200 341 223 333 L 223 344 Q 200 344 177 344 Z" fill="white" opacity="0.9" />
          <path d="M 179 344 Q 200 352 221 344 L 221 350 Q 200 358 179 350 Z" fill="#882848" />
          <path d="M 170 330 Q 200 342 230 330" stroke="#C07888" strokeWidth="1.5" fill="none" />
        </g>
      ) : (
        <g>
          <path d="M 172 330 Q 200 346 228 330"
            stroke="#C07888" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 176 329 Q 190 323 200 325 Q 210 323 224 329"
            stroke="#D090A0" strokeWidth="1.8" fill="none" opacity="0.6" />
        </g>
      )}

      {/* Cheek blush */}
      <ellipse cx="108" cy="282" rx="28" ry="15" fill="#FFB8C8" opacity="0.25" />
      <ellipse cx="292" cy="282" rx="28" ry="15" fill="#FFB8C8" opacity="0.25" />

      {/* Listening rings */}
      {state === 'listening' && (
        <>
          <ellipse cx="200" cy="264" rx="105" ry="123" fill="none" stroke="#D0A8FF" strokeWidth="4"
            style={{ transformOrigin: '200px 264px', transformBox: 'fill-box', animation: 'listening-ring 1.5s ease-out infinite' }} />
          <ellipse cx="200" cy="264" rx="111" ry="129" fill="none" stroke="#D0A8FF" strokeWidth="2" opacity="0.4"
            style={{ transformOrigin: '200px 264px', transformBox: 'fill-box', animation: 'listening-ring 1.5s ease-out 0.5s infinite' }} />
        </>
      )}
    </svg>
  );
}

export default function CharacterAvatar({ character, state, className = '' }: Props) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height: '100%', width: '100%' }}>
      <div className="w-full h-full" style={{ animation: 'breathe-float 4.5s ease-in-out infinite' }}>
        {character === 'leo' ? <LeoSVG state={state} /> : <MiaSVG state={state} />}
      </div>
    </div>
  );
}
