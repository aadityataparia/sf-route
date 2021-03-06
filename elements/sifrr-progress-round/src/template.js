import { html } from '@sifrr/template';

import style from './style.css';

export default html`
  <style>
    ${style}
  </style>
  <svg
    xmlns:xlink="http://www.w3.org/1999/xlink"
    preserveAspectRatio="xMinYMin meet"
    width="100%"
    height="100%"
    viewBox="0 0 60 60"
  >
    <circle
      cx="30"
      cy="30"
      r="28"
      fill="none"
      stroke="rgba(255, 255, 255, 0.6)"
      stroke-width="${el => el.strokeWidth || 2}"
    />
    <circle
      id="top"
      cx="30"
      cy="30"
      r="28"
      fill="none"
      stroke="${el => el.stroke || '#fff'}"
      stroke-width="${el => el.strokeWidth || 2}"
      stroke-dasharray="188.5"
      stroke-dashoffset="${el => ((100 - (el.progress || 0)) / 100) * 188.5}"
    />
  </svg>
`;
