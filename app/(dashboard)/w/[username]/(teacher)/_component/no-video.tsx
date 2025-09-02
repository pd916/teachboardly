const NoVideosIllustration = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 400 320"
    className={className}
    role="img"
    aria-label="Illustration of a student holding a book"
  >
    {/* background blob */}
    <defs>
      <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#E8F0FF" />
        <stop offset="100%" stopColor="#F5FAFF" />
      </linearGradient>
    </defs>
    <ellipse cx="200" cy="170" rx="180" ry="125" fill="url(#grad)" />
    {/* shadow */}
    <ellipse cx="200" cy="265" rx="110" ry="14" fill="#DDE7FF" opacity="0.7" />
    {/* body */}
    <path d="M150 210c0-30 25-55 55-55s55 25 55 55v18H150v-18z" fill="#FF8A4C" />
    {/* head */}
    <circle cx="205" cy="125" r="32" fill="#F9C9B6" />
    {/* hair */}
    <path d="M176 122c3-18 19-30 33-30 14 0 28 8 33 23-7 5-18 8-33 8-14 0-26-1-33-1z" fill="#2F2E41" />
    {/* eyes */}
    <circle cx="195" cy="130" r="3" fill="#2F2E41" />
    <circle cx="215" cy="130" r="3" fill="#2F2E41" />
    {/* smile */}
    <path d="M194 142c4 5 13 5 17 0" stroke="#C96A3D" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* arm left holding book */}
    <path d="M160 205c10-12 20-18 30-18" stroke="#E6763E" strokeWidth="10" strokeLinecap="round" />
    {/* arm right raised */}
    <path d="M245 200c10-10 20-16 34-20" stroke="#E6763E" strokeWidth="10" strokeLinecap="round" />
    {/* pointer/hand */}
    <circle cx="282" cy="176" r="6" fill="#F9C9B6" />
    {/* book */}
    <rect x="162" y="192" width="58" height="40" rx="6" fill="#3F51B5" />
    <rect x="168" y="196" width="46" height="32" rx="4" fill="#5C6BC0" />
    {/* pants */}
    <path d="M170 228h70v16c0 10-8 18-18 18h-34c-10 0-18-8-18-18v-16z" fill="#1E2A5A" />
    {/* shoes */}
    <rect x="168" y="262" width="36" height="10" rx="4" fill="#2F2E41" />
    {/* <rect x="210" y="262" width="36" height="10" rx="4" fill "#2F2E41" /> */}
    {/* play icon hint */}
    <circle cx="90" cy="110" r="26" fill="#FFFFFF" stroke="#D0DAFF" strokeWidth="3" />
    <polygon points="84,98 108,110 84,122" fill="#3F51B5" />
    {/* chalk line */}
    <line x1="300" y1="150" x2="350" y2="150" stroke="#3F51B5" strokeWidth="3" strokeLinecap="round" />
    {/* text */}
    <text x="200" y="300" textAnchor="middle" fontSize="20" fontFamily="Inter, system-ui, sans-serif" fill="#2F2E41">
      No videos yet
    </text>
  </svg>
);


export default NoVideosIllustration;