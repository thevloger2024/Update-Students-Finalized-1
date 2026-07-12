const fs = require('fs');

let code = fs.readFileSync('src/components/JobGuideSection.tsx', 'utf8');

const oldTabs = `      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('direct')}
          className={\`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all \${activeTab === 'direct' ? 'bg-green-100 text-green-700 shadow-sm border border-green-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}\`}
        >
          <CheckCircle2 size={16} className={activeTab === 'direct' ? 'text-green-600' : 'text-slate-400'} />
          Direct Recruitment
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={\`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all \${activeTab === 'interview' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}\`}
        >
          <Briefcase size={16} className={activeTab === 'interview' ? 'text-blue-600' : 'text-slate-400'} />
          Interview-Only
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={\`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all \${activeTab === 'exams' ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}\`}
        >
          <GraduationCap size={16} className={activeTab === 'exams' ? 'text-purple-600' : 'text-slate-400'} />
          Basic Exams
        </button>
      </div>`;

const newTabs = `      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {[
          { id: 'direct', label: 'Direct Recruitment', icon: CheckCircle2, activeColor: 'text-green-700', activeBg: 'bg-green-100 border-green-200' },
          { id: 'interview', label: 'Interview-Only', icon: Briefcase, activeColor: 'text-blue-700', activeBg: 'bg-blue-100 border-blue-200' },
          { id: 'exams', label: 'Basic Exams', icon: GraduationCap, activeColor: 'text-purple-700', activeBg: 'bg-purple-100 border-purple-200' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={\`relative whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors duration-300 \${
                isActive ? tab.activeColor : 'text-slate-600 hover:text-slate-800'
              }\`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className={\`absolute inset-0 rounded-xl border shadow-sm \${tab.activeBg}\`}
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors" />
              )}
              <div className="relative z-10 flex items-center gap-2">
                <Icon size={16} className={isActive ? 'opacity-100' : 'text-slate-400'} />
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>`;

code = code.replace(oldTabs, newTabs);
fs.writeFileSync('src/components/JobGuideSection.tsx', code);
