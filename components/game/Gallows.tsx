'use client'

interface GallowsProps {
  wrongGuesses: number
}

export default function Gallows({ wrongGuesses }: GallowsProps) {
  return (
    <div className="gallows">
      <svg viewBox="0 0 120 140">
        {/* Base structure - always visible */}
        <line className="gallows-part gallows-base" x1="10" y1="135" x2="70" y2="135" />
        <line className="gallows-part gallows-base" x1="30" y1="135" x2="30" y2="10" />
        <line className="gallows-part gallows-base" x1="30" y1="10" x2="80" y2="10" />
        <line className="gallows-part gallows-base" x1="80" y1="10" x2="80" y2="25" />

        {/* Head */}
        <circle
          className={`gallows-part ${wrongGuesses >= 1 ? 'visible' : ''}`}
          cx="80"
          cy="38"
          r="13"
        />
        {/* Body */}
        <line
          className={`gallows-part ${wrongGuesses >= 2 ? 'visible' : ''}`}
          x1="80"
          y1="51"
          x2="80"
          y2="85"
        />
        {/* Left arm */}
        <line
          className={`gallows-part ${wrongGuesses >= 3 ? 'visible' : ''}`}
          x1="80"
          y1="58"
          x2="60"
          y2="72"
        />
        {/* Right arm */}
        <line
          className={`gallows-part ${wrongGuesses >= 4 ? 'visible' : ''}`}
          x1="80"
          y1="58"
          x2="100"
          y2="72"
        />
        {/* Left leg */}
        <line
          className={`gallows-part ${wrongGuesses >= 5 ? 'visible' : ''}`}
          x1="80"
          y1="85"
          x2="60"
          y2="110"
        />
        {/* Right leg */}
        <line
          className={`gallows-part ${wrongGuesses >= 6 ? 'visible' : ''}`}
          x1="80"
          y1="85"
          x2="100"
          y2="110"
        />
      </svg>
    </div>
  )
}
