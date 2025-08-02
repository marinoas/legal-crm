#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapping of moment methods to date-fns equivalents
const momentToDateFns = {
  // Basic formatting
  "moment().format('YYYY-MM-DD HH:mm:ss')": "formatTz(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: ATHENS_TZ })",
  "moment().format('DD/MM/YYYY')": "format(new Date(), 'dd/MM/yyyy')",
  "moment().format('DD/MM HH:mm')": "format(new Date(), 'dd/MM HH:mm')",
  "moment().format('HH:mm')": "format(new Date(), 'HH:mm')",
  "moment().format('YYYY-MM')": "format(new Date(), 'yyyy-MM')",
  
  // Date operations
  "moment().startOf('day')": "startOfDay(new Date())",
  "moment().startOf('month')": "startOfMonth(new Date())",
  "moment().endOf('month')": "endOfMonth(new Date())",
  "moment().add(24, 'hours')": "addHours(new Date(), 24)",
  "moment().add(30, 'days')": "addDays(new Date(), 30)",
  "moment().subtract(1, 'year')": "subYears(new Date(), 1)",
  "moment().subtract(2, 'years')": "subYears(new Date(), 2)",
  "moment().subtract(6, 'months')": "subMonths(new Date(), 6)",
  "moment().subtract(1, 'month')": "subMonths(new Date(), 1)",
  "moment().subtract(1, 'week')": "subWeeks(new Date(), 1)",
  "moment().subtract(12, 'months')": "subMonths(new Date(), 12)",
  
  // Comparisons
  ".isBefore(": ".getTime() < ",
  ".isAfter(": ".getTime() > ",
  ".isSame(": ".getTime() === ",
  ".diff(": "differenceInDays(",
};

// Files to process
const filesToProcess = [
  'backend/jobs/cronjobs.js',
  'backend/scripts/seed.js',
  'backend/services/analytics.js'
];

function replaceInFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Add required imports if not present
  if (!content.includes('date-fns')) {
    const importLine = "const { format, addDays, addHours, addWeeks, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays, differenceInHours } = require('date-fns');\nconst { zonedTimeToUtc, utcToZonedTime, format: formatTz } = require('date-fns-tz');\n";
    
    // Find the first require statement and add after it
    const firstRequire = content.indexOf("require(");
    if (firstRequire !== -1) {
      const lineEnd = content.indexOf('\n', firstRequire);
      content = content.slice(0, lineEnd + 1) + importLine + content.slice(lineEnd + 1);
      hasChanges = true;
    }
  }
  
  // Remove moment require
  content = content.replace(/const moment = require\('moment.*?\);\n?/g, '');
  content = content.replace(/const moment = require\("moment.*?"\);\n?/g, '');
  
  // Apply replacements
  for (const [momentCode, dateFnsCode] of Object.entries(momentToDateFns)) {
    if (content.includes(momentCode)) {
      content = content.replace(new RegExp(momentCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), dateFnsCode);
      hasChanges = true;
    }
  }
  
  // Handle more complex patterns with regex
  const complexPatterns = [
    {
      pattern: /moment\(([^)]+)\)\.format\('([^']+)'\)/g,
      replacement: (match, date, formatStr) => {
        const dateFnsFormat = formatStr
          .replace(/YYYY/g, 'yyyy')
          .replace(/MM/g, 'MM')
          .replace(/DD/g, 'dd')
          .replace(/HH/g, 'HH')
          .replace(/mm/g, 'mm')
          .replace(/ss/g, 'ss');
        return `format(new Date(${date}), '${dateFnsFormat}')`;
      }
    },
    {
      pattern: /moment\(([^)]+)\)\.diff\(([^,]+),\s*'([^']+)'\)/g,
      replacement: (match, date1, date2, unit) => {
        const unitMap = {
          'days': 'differenceInDays',
          'hours': 'differenceInHours',
          'minutes': 'differenceInMinutes'
        };
        const fn = unitMap[unit] || 'differenceInDays';
        return `${fn}(new Date(${date1}), ${date2})`;
      }
    }
  ];
  
  complexPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated ${filePath}`);
  } else {
    console.log(`- No changes needed for ${filePath}`);
  }
}

// Process all files
filesToProcess.forEach(replaceInFile);

console.log('\n✓ Moment.js replacement completed!');

