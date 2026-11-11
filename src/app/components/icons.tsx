const p = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': true } as const;
export const IconNotes = () => (<svg {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8.5 8h7M8.5 12h7M8.5 16h4" /></svg>);
export const IconCalc = () => (<svg {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01" stroke-width="2.4" /></svg>);
export const IconBookmark = ({ filled }: { filled?: boolean }) => (<svg {...p} fill={filled ? 'currentColor' : 'none'}><path d="M7 4h10v16l-5-4-5 4z" /></svg>);
export const IconBack = () => (<svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>);
export const IconNext = () => (<svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconClose = () => (<svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const IconUp = () => (<svg {...p} width="16" height="16"><path d="M6 15l6-6 6 6" /></svg>);
export const IconGear = () => (<svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></svg>);
