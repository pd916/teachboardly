"use client";
import React from "react";

const NoSavedBoardSVG: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 400 300"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="No saved board yet"
  >
    {/* Background blob */}
    <ellipse cx="200" cy="150" rx="180" ry="120" fill="#F5F7FF" />

    {/* Board shape */}
    <rect x="100" y="70" width="200" height="140" rx="12" fill="#FFFFFF" stroke="#CBD5E0" strokeWidth="3" />
    <line x1="100" y1="110" x2="300" y2="110" stroke="#E2E8F0" strokeWidth="2" />
    <line x1="100" y1="150" x2="300" y2="150" stroke="#E2E8F0" strokeWidth="2" />
    <line x1="100" y1="190" x2="300" y2="190" stroke="#E2E8F0" strokeWidth="2" />

    {/* Pin */}
    <circle cx="200" cy="60" r="10" fill="#3B82F6" />
    <rect x="198" y="60" width="4" height="12" fill="#3B82F6" />

    {/* Text */}
    <text
      x="200"
      y="260"
      textAnchor="middle"
      fontSize="20"
      fontFamily="Inter, system-ui, sans-serif"
      fill="#4A5568"
    >
      No saved board yet
    </text>
  </svg>
);

export default NoSavedBoardSVG;
