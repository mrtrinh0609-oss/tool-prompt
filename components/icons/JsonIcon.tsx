
import React from 'react';

const JsonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M10 12.5a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0v-1Z" />
    <path d="M14 12.5a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0v-1Z" />
    <path d="M10 16.5a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0v-1Z" />
    <path d="M14 16.5a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0v-1Z" />
    <path d="M4 12V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" />
  </svg>
);

export default JsonIcon;
