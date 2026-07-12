const fs = require('fs');
let code = fs.readFileSync('src/components/AdminJobDataManager.tsx', 'utf8');

const target = `<button onClick={() => handleEdit(null)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
          <Plus size={16} />
          Add Job
        </button>`;

const replacement = `<button onClick={async () => {
          // SEED DATA
          setLoading(true);
          const directRecruitmentJobs = [
            { title: 'India Post GDS (Gramin Dak Sevak)', level: 'All India & Bihar', eligibility: '10th Pass + Basic Computer', selection: 'Seedhi bharti. 10th class me aaye percentage ke aadhar par merit list banti hai.', category: 'direct' },
            { title: 'Railway Apprentice', level: 'All India & Bihar', eligibility: '10th Pass (min 50%) + ITI', selection: 'Bina exam ki bharti. 10th aur ITI ke marks ko milakar direct merit list banai jati hai.', category: 'direct' },
            { title: 'Bihar Vikas Mitra / Tola Sevak', level: 'Bihar State', eligibility: '10th / Matric Pass', selection: 'Panchayat ya ward level par merit ke aadhar par direct selection (Bina exam).', category: 'direct' },
            { title: 'Anganwadi Sevika / Sahayika', level: 'Bihar State', eligibility: '10th / 8th Pass', selection: 'Sthaniya (local) ward level par marks ke aadhar par merit list banti hai.', category: 'direct' }
          ];
          const interviewOnlyJobs = [
            { title: 'Bihar Vidhan Sabha / Parishad (Group D)', description: 'Vidhan Sabha me Karyalaya Parichari (Peon), Mali (Gardener), aur Darban jaise pado par bharti nikalti hai. Isme educational qualification 10th pass hoti hai aur selection sirf ek direct interview ke aadhar par hota hai.', category: 'interview' },
            { title: 'Various University Peon / Attendant (Bihar)', description: 'Bihar ke kai state universities me Group D ke pado par direct interview se bhartiyan ki jati hain, jisme 10th pass candidates apply kar sakte hain.', category: 'interview' }
          ];
          
          try {
            for (const job of [...directRecruitmentJobs, ...interviewOnlyJobs]) {
              await addDoc(collection(db, 'jobGuides'), { ...job, createdAt: new Date().toISOString() });
            }
            toast.success('Initial data seeded!');
            fetchJobs();
          } catch (e) {
            toast.error('Failed to seed data');
          }
        }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm mr-2">
          Seed Initial Data
        </button>
        <button onClick={() => handleEdit(null)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
          <Plus size={16} />
          Add Job
        </button>`;

if (!code.includes('Seed Initial Data')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/AdminJobDataManager.tsx', code);
}
