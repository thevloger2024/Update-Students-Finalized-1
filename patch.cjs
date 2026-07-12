const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryTray.tsx', 'utf8');

// Also need to import BookOpen from lucide-react if not present
if (!code.includes('BookOpen')) {
  code = code.replace("import { BrainCircuit } from 'lucide-react';", "import { BrainCircuit, BookOpen } from 'lucide-react';");
}

const target = `<span className="relative z-10">Quiz</span>
          </motion.button>
          <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>`;

const replacement = `<span className="relative z-10">Quiz</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/tips')}
            className="relative whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md hover:shadow-lg flex items-center gap-1.5 shrink-0"
          >
            <BookOpen size={16} />
            <span className="relative z-10">Job Guides</span>
          </motion.button>
          <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/CategoryTray.tsx', code);
