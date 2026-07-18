const fs = require('fs');
let code = fs.readFileSync('src/pages/DetailPage.tsx', 'utf8');

// Update imports
code = code.replace(
  "import { motion, AnimatePresence } from 'framer-motion';",
  "import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';"
);

// Add hooks in DetailPage component
const hookCode = `
  const { id } = useParams<{ id: string }>();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });`;

code = code.replace("  const { id } = useParams<{ id: string }>();", hookCode);

// Add JSX for progress bar
const barJSX = `
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-academic-gold origin-left z-[100]"
        style={{ scaleX }}
      />
      <Header />`;

code = code.replace(
  `  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />`,
  barJSX
);

fs.writeFileSync('src/pages/DetailPage.tsx', code);
