import { Shadows } from '@mui/material/styles';

// Professional shadow system for Legal CRM
// Subtle, elegant shadows that convey depth without being distracting

const shadowColor = 'rgba(0, 0, 0, 0.1)';
const shadowColorDark = 'rgba(0, 0, 0, 0.15)';
const shadowColorLight = 'rgba(0, 0, 0, 0.05)';

export const shadows: Shadows = [
  'none', // 0
  `0 1px 2px ${shadowColorLight}`, // 1 - Very subtle
  `0 1px 3px ${shadowColor}, 0 1px 2px ${shadowColorLight}`, // 2 - Subtle
  `0 4px 6px -1px ${shadowColor}, 0 2px 4px -1px ${shadowColorLight}`, // 3 - Small
  `0 10px 15px -3px ${shadowColor}, 0 4px 6px -2px ${shadowColorLight}`, // 4 - Medium
  `0 20px 25px -5px ${shadowColor}, 0 10px 10px -5px ${shadowColorLight}`, // 5 - Large
  `0 25px 50px -12px ${shadowColorDark}`, // 6 - Extra large
  `0 35px 60px -12px ${shadowColorDark}`, // 7 - 2XL
  `0 40px 70px -12px ${shadowColorDark}`, // 8 - 3XL
  `0 45px 80px -12px ${shadowColorDark}`, // 9 - 4XL
  `0 50px 90px -12px ${shadowColorDark}`, // 10 - 5XL
  `0 55px 100px -12px ${shadowColorDark}`, // 11
  `0 60px 110px -12px ${shadowColorDark}`, // 12
  `0 65px 120px -12px ${shadowColorDark}`, // 13
  `0 70px 130px -12px ${shadowColorDark}`, // 14
  `0 75px 140px -12px ${shadowColorDark}`, // 15
  `0 80px 150px -12px ${shadowColorDark}`, // 16
  `0 85px 160px -12px ${shadowColorDark}`, // 17
  `0 90px 170px -12px ${shadowColorDark}`, // 18
  `0 95px 180px -12px ${shadowColorDark}`, // 19
  `0 100px 190px -12px ${shadowColorDark}`, // 20
  `0 105px 200px -12px ${shadowColorDark}`, // 21
  `0 110px 210px -12px ${shadowColorDark}`, // 22
  `0 115px 220px -12px ${shadowColorDark}`, // 23
  `0 120px 230px -12px ${shadowColorDark}`, // 24
];

// Custom shadow utilities
export const customShadows = {
  // Card shadows
  card: {
    rest: shadows[1],
    hover: shadows[3],
    active: shadows[2],
  },

  // Button shadows
  button: {
    rest: shadows[1],
    hover: shadows[2],
    active: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  // Modal/Dialog shadows
  modal: shadows[6],
  dialog: shadows[5],

  // Dropdown/Menu shadows
  dropdown: shadows[3],
  menu: shadows[4],

  // Navigation shadows
  header: shadows[1],
  sidebar: shadows[2],

  // Form shadows
  input: {
    rest: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
    focus: `inset 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 3px rgba(59, 130, 246, 0.1)`,
    error: `inset 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 3px rgba(220, 38, 38, 0.1)`,
  },

  // Table shadows
  table: {
    header: shadows[1],
    row: 'none',
    hover: shadows[1],
  },

  // Status-specific shadows
  status: {
    success: '0 4px 6px -1px rgba(5, 150, 105, 0.1), 0 2px 4px -1px rgba(5, 150, 105, 0.06)',
    warning: '0 4px 6px -1px rgba(245, 158, 11, 0.1), 0 2px 4px -1px rgba(245, 158, 11, 0.06)',
    error: '0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -1px rgba(220, 38, 38, 0.06)',
    info: '0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -1px rgba(14, 165, 233, 0.06)',
  },

  // Elevation levels for different components
  elevation: {
    tooltip: shadows[6],
    popover: shadows[4],
    drawer: shadows[5],
    appBar: shadows[2],
    fab: shadows[3],
    speedDial: shadows[4],
  },
} as const;

// Shadow utility functions
export const getShadow = (level: number): string => {
  return shadows[Math.min(Math.max(level, 0), 24)];
};

export const getCustomShadow = (
  category: keyof typeof customShadows,
  variant?: string
): string => {
  const shadowCategory = customShadows[category];
  
  if (typeof shadowCategory === 'string') {
    return shadowCategory;
  }
  
  if (typeof shadowCategory === 'object' && variant) {
    return shadowCategory[variant as keyof typeof shadowCategory] || shadows[1];
  }
  
  return shadows[1];
};

export default shadows;

