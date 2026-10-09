/** Ice rink markings behind everything, rendered once and fixed. */
export function Background() {
  return (
    <div aria-hidden className="rink">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" fill="none">
        <g opacity="0.55" transform="rotate(-12 600 400)">
          {/* center red line */}
          <rect x="590" y="-200" width="20" height="1200" fill="#D7263D" />
          <rect x="598" y="-200" width="4" height="1200" fill="#fff" opacity="0.6" />
          {/* blue lines */}
          <rect x="300" y="-200" width="22" height="1200" fill="#0B1F3A" opacity="0.8" />
          <rect x="878" y="-200" width="22" height="1200" fill="#0B1F3A" opacity="0.8" />
          {/* center circle */}
          <circle cx="600" cy="400" r="150" stroke="#0B1F3A" strokeWidth="6" />
          <circle cx="600" cy="400" r="8" fill="#0B1F3A" />
          {/* faceoff circles */}
          <circle cx="150" cy="200" r="110" stroke="#D7263D" strokeWidth="6" />
          <circle cx="150" cy="200" r="7" fill="#D7263D" />
          <circle cx="1050" cy="600" r="110" stroke="#D7263D" strokeWidth="6" />
          <circle cx="1050" cy="600" r="7" fill="#D7263D" />
          {/* goal creases */}
          <path d="M -40 330 A 90 90 0 0 1 -40 470" stroke="#0B1F3A" strokeWidth="6" fill="#1FB5A8" fillOpacity="0.35" />
          <path d="M 1240 330 A 90 90 0 0 0 1240 470" stroke="#0B1F3A" strokeWidth="6" fill="#1FB5A8" fillOpacity="0.35" />
        </g>
      </svg>
      <div className="halftone absolute -left-10 -top-10 h-72 w-72 opacity-40 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="halftone absolute -bottom-10 -right-10 h-96 w-96 opacity-40 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
    </div>
  )
}
