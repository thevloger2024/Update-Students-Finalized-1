const fs = require('fs');

let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Change sm:inline and lg:inline to xl:inline for header nav icons to prevent overlap on laptops
code = code.replace(/hidden sm:inline/g, 'hidden xl:inline');
code = code.replace(/hidden lg:inline/g, 'hidden xl:inline');
code = code.replace(/hidden lg:block/g, 'hidden xl:block'); // For user name

// Allow flex wrap on the main container
code = code.replace(
  'className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2"',
  'className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2 flex-wrap lg:flex-nowrap"'
);

// We might want to make the action buttons wrapper allow wrapping on smaller screens if they are in row
code = code.replace(
  'className="flex items-center gap-4 shrink-0"',
  'className="flex items-center gap-2 lg:gap-4 shrink-0 flex-wrap justify-center"'
);

fs.writeFileSync('src/components/Header.tsx', code);
