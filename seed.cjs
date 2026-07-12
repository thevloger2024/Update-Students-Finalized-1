const fs = require('fs');

const directRecruitmentJobs = [
  {
    title: 'India Post GDS (Gramin Dak Sevak)',
    level: 'All India & Bihar',
    eligibility: '10th Pass + Basic Computer',
    selection: 'Seedhi bharti. 10th class me aaye percentage ke aadhar par merit list banti hai.',
    category: 'direct'
  },
  {
    title: 'Railway Apprentice',
    level: 'All India & Bihar',
    eligibility: '10th Pass (min 50%) + ITI',
    selection: 'Bina exam ki bharti. 10th aur ITI ke marks ko milakar direct merit list banai jati hai.',
    category: 'direct'
  },
  {
    title: 'Bihar Vikas Mitra / Tola Sevak',
    level: 'Bihar State',
    eligibility: '10th / Matric Pass',
    selection: 'Panchayat ya ward level par merit ke aadhar par direct selection (Bina exam).',
    category: 'direct'
  },
  {
    title: 'Anganwadi Sevika / Sahayika',
    level: 'Bihar State',
    eligibility: '10th / 8th Pass',
    selection: 'Sthaniya (local) ward level par marks ke aadhar par merit list banti hai.',
    category: 'direct'
  }
];

const interviewOnlyJobs = [
  {
    title: 'Bihar Vidhan Sabha / Parishad (Group D)',
    description: 'Vidhan Sabha me Karyalaya Parichari (Peon), Mali (Gardener), aur Darban jaise pado par bharti nikalti hai. Isme educational qualification 10th pass hoti hai aur selection sirf ek direct interview ke aadhar par hota hai.',
    category: 'interview'
  },
  {
    title: 'Various University Peon / Attendant (Bihar)',
    description: 'Bihar ke kai state universities me Group D ke pado par direct interview se bhartiyan ki jati hain, jisme 10th pass candidates apply kar sakte hain.',
    category: 'interview'
  }
];

// No easy way to seed firestore from node script since firebase-admin isn't configured,
// but we can put a "seed" button in the admin component temporarily if we want.
