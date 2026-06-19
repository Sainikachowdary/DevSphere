export const DevSphereLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="13" fill="url(#gradient)" />
    <circle cx="16" cy="16" r="10" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
    <circle cx="16" cy="16" r="6" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
    <circle cx="16" cy="10" r="1.5" fill="white" />
    <circle cx="22" cy="16" r="1.5" fill="white" />
    <circle cx="16" cy="22" r="1.5" fill="white" />
    <circle cx="10" cy="16" r="1.5" fill="white" />
    <circle cx="19.2" cy="12.8" r="1" fill="white" opacity="0.7" />
    <circle cx="19.2" cy="19.2" r="1" fill="white" opacity="0.7" />
    <circle cx="12.8" cy="19.2" r="1" fill="white" opacity="0.7" />
    <circle cx="12.8" cy="12.8" r="1" fill="white" opacity="0.7" />
    <circle cx="16" cy="16" r="2" fill="white" />
  </svg>
);

export const CodeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06L11.28 3.22z"/>
  </svg>
);

export const ProjectIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M1.75 2.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V5.5H8.5a1 1 0 01-1-1V1.75c0-.138-.112-.25-.25-.25H1.75zM9 1.75V4.5h5.25L9 1.75z"/>
  </svg>
);

export const TeamIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 5.5a3.5 3.5 0 115.898 2.549 5.508 5.508 0 013.034 4.084.75.75 0 01-1.482.235 4 4 0 00-7.9 0 .75.75 0 01-1.482-.236A5.507 5.507 0 013.102 8.05 3.49 3.49 0 012 5.5zM11 4a3.001 3.001 0 012.22 5.018 5.01 5.01 0 012.56 3.012.749.749 0 011.456.365A6.51 6.51 0 008.74 11.1a5.01 5.01 0 012.56-3.012A3.001 3.001 0 0111 4z"/>
  </svg>
);