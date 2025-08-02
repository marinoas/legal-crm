#!/usr/bin/env node

const fs = require('fs');

// Manual fixes for remaining moment references
const fixes = [
  {
    file: 'backend/jobs/cronjobs.js',
    replacements: [
      {
        from: 'const now = moment();',
        to: 'const now = new Date();'
      },
      {
        from: 'const today = moment();',
        to: 'const today = new Date();'
      },
      {
        from: 'moment().hour() >= 18',
        to: 'new Date().getHours() >= 18'
      },
      {
        from: 'moment().hours(hours).minutes(minutes)',
        to: 'new Date().setHours(hours, minutes, 0, 0)'
      },
      {
        from: 'moment(p.dueDate).getTime() < today)',
        to: 'new Date(p.dueDate).getTime() < today.getTime())'
      },
      {
        from: 'moment(p.dueDate).getTime() === today, \'day\')',
        to: 'isSameDay(new Date(p.dueDate), today))'
      },
      {
        from: 'todaydifferenceInDays(moment(p.dueDate), \'days\')',
        to: 'differenceInDays(today, new Date(p.dueDate))'
      },
      {
        from: 'moment(deadline.dueDate)differenceInDays(today, \'days\')',
        to: 'differenceInDays(new Date(deadline.dueDate), today)'
      },
      {
        from: 'moment(court.date)differenceInDays(today, \'days\')',
        to: 'differenceInDays(new Date(court.date), today)'
      },
      {
        from: 'moment(appointment.date)differenceInDays(now, \'hours\')',
        to: 'differenceInHours(new Date(appointment.date), now)'
      }
    ]
  },
  {
    file: 'backend/scripts/seed.js',
    replacements: [
      {
        from: 'moment().add(6, \'months\').toDate()',
        to: 'addMonths(new Date(), 6)'
      },
      {
        from: 'moment(court.date).subtract(20, \'days\').toDate()',
        to: 'subDays(new Date(court.date), 20)'
      },
      {
        from: 'moment().add(3, \'months\').toDate()',
        to: 'addMonths(new Date(), 3)'
      },
      {
        from: 'moment().add(1, \'month\').toDate()',
        to: 'addMonths(new Date(), 1)'
      },
      {
        from: 'moment().add(2, \'weeks\').toDate()',
        to: 'addWeeks(new Date(), 2)'
      }
    ]
  },
  {
    file: 'backend/services/analytics.js',
    replacements: [
      {
        from: 'moment(endDate)differenceInDays(moment(startDate), \'days\')',
        to: 'differenceInDays(new Date(endDate), new Date(startDate))'
      },
      {
        from: 'moment().add(days, \'days\').toDate()',
        to: 'addDays(new Date(), days)'
      },
      {
        from: 'moment().subtract(5 - i, \'months\').startOf(\'month\').toDate()',
        to: 'startOfMonth(subMonths(new Date(), 5 - i))'
      },
      {
        from: 'moment().subtract(5 - i, \'months\').endOf(\'month\').toDate()',
        to: 'endOfMonth(subMonths(new Date(), 5 - i))'
      },
      {
        from: 'moment().year(year).month(month - 1).startOf(\'month\').toDate()',
        to: 'startOfMonth(new Date(year, month - 1, 1))'
      },
      {
        from: 'moment().year(year).month(month - 1).endOf(\'month\').toDate()',
        to: 'endOfMonth(new Date(year, month - 1, 1))'
      }
    ]
  }
];

// Add missing imports
const addImports = [
  {
    file: 'backend/jobs/cronjobs.js',
    import: 'const { format, addDays, addHours, addWeeks, addMonths, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays, differenceInHours, isSameDay } = require(\'date-fns\');'
  },
  {
    file: 'backend/scripts/seed.js',
    import: 'const { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay, startOfMonth, endOfMonth } = require(\'date-fns\');'
  },
  {
    file: 'backend/services/analytics.js',
    import: 'const { format, addDays, addMonths, subDays, subMonths, subYears, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays } = require(\'date-fns\');'
  }
];

function applyFixes() {
  fixes.forEach(({ file, replacements }) => {
    console.log(`Fixing ${file}...`);
    let content = fs.readFileSync(file, 'utf8');
    
    replacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replace(from, to);
        console.log(`  ✓ Replaced: ${from.substring(0, 50)}...`);
      }
    });
    
    fs.writeFileSync(file, content);
  });
  
  // Add missing imports
  addImports.forEach(({ file, import: importLine }) => {
    let content = fs.readFileSync(file, 'utf8');
    
    if (!content.includes('date-fns')) {
      // Find first require and add after it
      const lines = content.split('\n');
      let insertIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('require(') && !lines[i].includes('date-fns')) {
          insertIndex = i + 1;
          break;
        }
      }
      
      lines.splice(insertIndex, 0, importLine);
      content = lines.join('\n');
      
      fs.writeFileSync(file, content);
      console.log(`✓ Added date-fns import to ${file}`);
    }
  });
}

applyFixes();
console.log('\n✓ All moment.js references fixed!');

