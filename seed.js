require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEFAULT_PASSWORD = 'password123';

// Helper to create or fetch auth user
async function ensureAuthUser(email, password, displayName, role) {
  try {
    // List existing users to find if user already exists
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.warn('Warning listing users:', listError.message);
    }
    
    const existing = (listData?.users || []).find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      // Update password and metadata
      const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: password,
        user_metadata: { name: displayName, role: role }
      });
      if (updateErr) {
        console.warn(`Could not update password for ${email}:`, updateErr.message);
      }
      return existing.id;
    }

    // Create user
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: displayName, role: role }
    });

    if (createErr) {
      console.error(`Error creating user ${email}:`, createErr.message);
      throw createErr;
    }
    return created.user.id;
  } catch (err) {
    console.error(`ensureAuthUser failed for ${email}:`, err);
    throw err;
  }
}

async function runSeed() {
  console.log('\n--- 1. SEEDING PRINCIPAL / DEAN USERS ---');
  const principalId1 = await ensureAuthUser('principal@college.edu', DEFAULT_PASSWORD, 'Dr. K. S. Ramanujan (Dean & Director)', 'principal');
  const principalId2 = await ensureAuthUser('principal@school.com', DEFAULT_PASSWORD, 'Dr. K. S. Ramanujan (Dean & Director)', 'principal');
  
  await supabaseAdmin.from('users').upsert([
    {
      id: principalId1,
      name: 'Dr. K. S. Ramanujan (Dean & Director)',
      email: 'principal@college.edu',
      role: 'principal',
      created_at: Date.now()
    },
    {
      id: principalId2,
      name: 'Dr. K. S. Ramanujan (Dean & Director)',
      email: 'principal@school.com',
      role: 'principal',
      created_at: Date.now()
    }
  ]);
  console.log('✓ Principal / Dean accounts ready.');

  console.log('\n--- 2. SEEDING B.TECH CLASSES ---');
  const classes = [
    { id: 'btech_cse_4a', grade: 'B.Tech CSE - 4th Year', section: 'Section A' },
    { id: 'btech_cse_4b', grade: 'B.Tech CSE - 4th Year', section: 'Section B' },
    { id: 'btech_cse_3a', grade: 'B.Tech CSE - 3rd Year', section: 'Section A' },
    { id: 'btech_ece_3a', grade: 'B.Tech ECE - 3rd Year', section: 'Section A' },
    { id: 'btech_aids_2a', grade: 'B.Tech AI & Data Science - 2nd Year', section: 'Section A' }
  ];

  for (const c of classes) {
    await supabaseAdmin.from('classes').upsert({
      id: c.id,
      grade: c.grade,
      section: c.section,
      created_at: Date.now()
    });
  }
  console.log(`✓ Seeded ${classes.length} B.Tech degree classes.`);

  console.log('\n--- 3. SEEDING 10 PROFESSORS & FACULTY ---');
  const facultyData = [
    {
      email: 'prof.sharma@college.edu',
      name: 'Dr. Rajesh Sharma (HOD - CSE)',
      classId: 'btech_cse_4a',
      subjects: ['Cloud Computing & DevOps', 'Distributed Systems']
    },
    {
      email: 'prof.priya@college.edu',
      name: 'Dr. Priya Nair (Professor - AI & ML)',
      classId: 'btech_cse_4b',
      subjects: ['Deep Learning & Neural Networks', 'Artificial Intelligence Fundamentals']
    },
    {
      email: 'prof.vikram@college.edu',
      name: 'Prof. Vikram Malhotra (Associate Professor - Systems)',
      classId: 'btech_cse_3a',
      subjects: ['Operating Systems', 'Computer Networks']
    },
    {
      email: 'prof.ananya@college.edu',
      name: 'Dr. Ananya Roy (Associate Professor - Data Science)',
      classId: 'btech_aids_2a',
      subjects: ['Data Structures & Algorithms', 'Database Management Systems']
    },
    {
      email: 'prof.suresh@college.edu',
      name: 'Dr. Suresh Reddy (HOD - ECE)',
      classId: 'btech_ece_3a',
      subjects: ['Digital Signal Processing', 'VLSI Design & Technology']
    },
    {
      email: 'prof.kavita@college.edu',
      name: 'Prof. Kavita Rao (Assistant Professor - Cyber Security)',
      classId: null,
      subjects: ['Cyber Security & Cryptography', 'Software Engineering']
    },
    {
      email: 'prof.amit@college.edu',
      name: 'Prof. Amit Verma (Assistant Professor - Full Stack)',
      classId: null,
      subjects: ['Full Stack Web Development', 'Object Oriented Programming with Java']
    },
    {
      email: 'prof.arun@college.edu',
      name: 'Dr. Arun Kumar (Associate Professor - Embedded Systems)',
      classId: null,
      subjects: ['Microprocessors & Microcontrollers', 'Embedded Systems Lab']
    },
    {
      email: 'prof.meenakshi@college.edu',
      name: 'Dr. Meenakshi Sundaram (Professor - Mathematics)',
      classId: null,
      subjects: ['Discrete Mathematics', 'Probability & Statistics for Engineers']
    },
    {
      email: 'prof.rohit@college.edu',
      name: 'Prof. Rohit Sen (Assistant Professor - Architecture)',
      classId: null,
      subjects: ['Computer Organization & Architecture', 'Control Systems Engineering']
    }
  ];

  const facultyMap = {}; // email -> uid
  for (const f of facultyData) {
    const uid = await ensureAuthUser(f.email, DEFAULT_PASSWORD, f.name, f.classId ? 'class_teacher' : 'teacher');
    facultyMap[f.email] = { uid, ...f };

    await supabaseAdmin.from('users').upsert({
      id: uid,
      name: f.name,
      email: f.email,
      role: f.classId ? 'class_teacher' : 'teacher',
      class_id: f.classId || null,
      assigned_subjects: f.subjects,
      created_at: Date.now()
    });

    if (f.classId) {
      await supabaseAdmin.from('teacher_class_assignments').upsert({
        id: `${uid}_${f.classId}`,
        teacher_id: uid,
        class_id: f.classId,
        is_class_teacher: true,
        assigned_at: Date.now(),
        assigned_by: principalId1
      });
    }
  }
  console.log(`✓ Seeded ${facultyData.length} faculty members.`);

  console.log('\n--- 4. SEEDING B.TECH SUBJECTS ---');
  const subjectsByClass = {
    btech_cse_4a: [
      'Cloud Computing & DevOps',
      'Deep Learning & Neural Networks',
      'Distributed Systems',
      'Cyber Security & Cryptography',
      'Major Project & Seminar',
      'Full Stack Web Development'
    ],
    btech_cse_4b: [
      'Cloud Computing & DevOps',
      'Deep Learning & Neural Networks',
      'Distributed Systems',
      'Cyber Security & Cryptography',
      'Major Project & Seminar',
      'Full Stack Web Development'
    ],
    btech_cse_3a: [
      'Data Structures & Algorithms',
      'Database Management Systems',
      'Operating Systems',
      'Computer Networks',
      'Software Engineering',
      'Design & Analysis of Algorithms'
    ],
    btech_ece_3a: [
      'Digital Signal Processing',
      'VLSI Design & Technology',
      'Microprocessors & Microcontrollers',
      'Control Systems Engineering',
      'Electromagnetic Waves',
      'Embedded Systems Lab'
    ],
    btech_aids_2a: [
      'Artificial Intelligence Fundamentals',
      'Data Science with Python',
      'Object Oriented Programming with Java',
      'Discrete Mathematics',
      'Probability & Statistics for Engineers',
      'Computer Organization & Architecture'
    ]
  };

  for (const [classId, subjectsList] of Object.entries(subjectsByClass)) {
    for (const subName of subjectsList) {
      const subId = `${classId}_${subName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      await supabaseAdmin.from('subjects').upsert({
        id: subId,
        name: subName,
        class_id: classId,
        created_at: Date.now()
      });
    }
  }
  console.log('✓ Seeded comprehensive B.Tech department subject catalogs.');

  console.log('\n--- 5. SEEDING 12 B.TECH STUDENTS ---');
  const studentsData = [
    {
      email: 'aarav.sharma@college.edu',
      name: 'Aarav Sharma',
      classId: 'btech_cse_4a',
      rollNumber: '21CS001',
      admissionNumber: 'ADM2021001',
      gender: 'Male',
      parentName: 'Ramesh Sharma',
      parentPhone: '9876543210',
      dob: '2003-05-14'
    },
    {
      email: 'sneha.patel@college.edu',
      name: 'Sneha Patel',
      classId: 'btech_cse_4a',
      rollNumber: '21CS002',
      admissionNumber: 'ADM2021002',
      gender: 'Female',
      parentName: 'Kiran Patel',
      parentPhone: '9876543211',
      dob: '2003-08-22'
    },
    {
      email: 'rohan.gupta@college.edu',
      name: 'Rohan Gupta',
      classId: 'btech_cse_4a',
      rollNumber: '21CS003',
      admissionNumber: 'ADM2021003',
      gender: 'Male',
      parentName: 'Manoj Gupta',
      parentPhone: '9876543212',
      dob: '2003-11-03'
    },
    {
      email: 'ananya.deshmukh@college.edu',
      name: 'Ananya Deshmukh',
      classId: 'btech_cse_4a',
      rollNumber: '21CS004',
      admissionNumber: 'ADM2021004',
      gender: 'Female',
      parentName: 'Sanjay Deshmukh',
      parentPhone: '9876543213',
      dob: '2003-03-19'
    },
    {
      email: 'vikram.aditya@college.edu',
      name: 'Vikram Aditya',
      classId: 'btech_cse_4a',
      rollNumber: '21CS005',
      admissionNumber: 'ADM2021005',
      gender: 'Male',
      parentName: 'Venkat Aditya',
      parentPhone: '9876543214',
      dob: '2003-07-29'
    },
    {
      email: 'pooja.iyer@college.edu',
      name: 'Pooja Iyer',
      classId: 'btech_cse_4a',
      rollNumber: '21CS006',
      admissionNumber: 'ADM2021006',
      gender: 'Female',
      parentName: 'Subramanian Iyer',
      parentPhone: '9876543215',
      dob: '2003-12-10'
    },
    {
      email: 'karthik.rajan@college.edu',
      name: 'Karthik Rajan',
      classId: 'btech_cse_4b',
      rollNumber: '21CS007',
      admissionNumber: 'ADM2021007',
      gender: 'Male',
      parentName: 'Rajan Pillai',
      parentPhone: '9876543216',
      dob: '2003-04-12'
    },
    {
      email: 'divya.menon@college.edu',
      name: 'Divya Menon',
      classId: 'btech_cse_4b',
      rollNumber: '21CS008',
      admissionNumber: 'ADM2021008',
      gender: 'Female',
      parentName: 'Pradeep Menon',
      parentPhone: '9876543217',
      dob: '2003-09-05'
    },
    {
      email: 'arjun.mehta@college.edu',
      name: 'Arjun Mehta',
      classId: 'btech_cse_3a',
      rollNumber: '22CS010',
      admissionNumber: 'ADM2022010',
      gender: 'Male',
      parentName: 'Hasmukh Mehta',
      parentPhone: '9876543218',
      dob: '2004-01-18'
    },
    {
      email: 'tanvi.singh@college.edu',
      name: 'Tanvi Singh',
      classId: 'btech_cse_3a',
      rollNumber: '22CS011',
      admissionNumber: 'ADM2022011',
      gender: 'Female',
      parentName: 'Ravinder Singh',
      parentPhone: '9876543219',
      dob: '2004-06-30'
    },
    {
      email: 'rahul.nair@college.edu',
      name: 'Rahul Nair',
      classId: 'btech_ece_3a',
      rollNumber: '22EC001',
      admissionNumber: 'ADM2022101',
      gender: 'Male',
      parentName: 'Gopal Nair',
      parentPhone: '9876543220',
      dob: '2004-02-14'
    },
    {
      email: 'ishaan.verma@college.edu',
      name: 'Ishaan Verma',
      classId: 'btech_aids_2a',
      rollNumber: '23AI001',
      admissionNumber: 'ADM2023001',
      gender: 'Male',
      parentName: 'Alok Verma',
      parentPhone: '9876543221',
      dob: '2005-10-08'
    }
  ];

  const studentMap = {}; // email -> uid
  for (const s of studentsData) {
    const uid = await ensureAuthUser(s.email, DEFAULT_PASSWORD, s.name, 'student');
    studentMap[s.email] = { uid, ...s };

    await supabaseAdmin.from('users').upsert({
      id: uid,
      name: s.name,
      email: s.email,
      role: 'student',
      class_id: s.classId,
      created_at: Date.now()
    });

    await supabaseAdmin.from('students').upsert({
      id: uid,
      uid: uid,
      name: s.name,
      email: s.email,
      class_id: s.classId,
      admission_number: s.admissionNumber,
      roll_number: s.rollNumber,
      date_of_birth: s.dob,
      gender: s.gender,
      parent_name: s.parentName,
      parent_phone: s.parentPhone,
      added_by: principalId1,
      added_at: Date.now()
    });
  }
  console.log(`✓ Seeded ${studentsData.length} students.`);

  console.log('\n--- 6. SEEDING FULL 6-DAY WEEKLY TIMETABLES ---');
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Timetable template for btech_cse_4a
  const timeSlots = [
    { periodNumber: 1, startTime: '09:00', endTime: '10:00' },
    { periodNumber: 2, startTime: '10:00', endTime: '11:00' },
    { periodNumber: 3, startTime: '11:15', endTime: '12:15' },
    { periodNumber: 4, startTime: '12:15', endTime: '13:15' },
    { periodNumber: 5, startTime: '14:00', endTime: '15:00' },
    { periodNumber: 6, startTime: '15:00', endTime: '16:00' }
  ];

  const classSchedules = {
    btech_cse_4a: {
      Monday: [
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.sharma@college.edu' }
      ],
      Tuesday: [
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.priya@college.edu' }
      ],
      Wednesday: [
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.sharma@college.edu' }
      ],
      Thursday: [
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.priya@college.edu' }
      ],
      Friday: [
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.sharma@college.edu' }
      ],
      Saturday: [
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.sharma@college.edu' },
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' }
      ]
    },
    btech_cse_3a: {
      Monday: [
        { sub: 'Data Structures & Algorithms', teacher: 'prof.ananya@college.edu' },
        { sub: 'Database Management Systems', teacher: 'prof.ananya@college.edu' },
        { sub: 'Operating Systems', teacher: 'prof.vikram@college.edu' },
        { sub: 'Computer Networks', teacher: 'prof.vikram@college.edu' },
        { sub: 'Software Engineering', teacher: 'prof.kavita@college.edu' },
        { sub: 'Design & Analysis of Algorithms', teacher: 'prof.ananya@college.edu' }
      ],
      Tuesday: [
        { sub: 'Operating Systems', teacher: 'prof.vikram@college.edu' },
        { sub: 'Computer Networks', teacher: 'prof.vikram@college.edu' },
        { sub: 'Data Structures & Algorithms', teacher: 'prof.ananya@college.edu' },
        { sub: 'Database Management Systems', teacher: 'prof.ananya@college.edu' },
        { sub: 'Software Engineering', teacher: 'prof.kavita@college.edu' },
        { sub: 'Design & Analysis of Algorithms', teacher: 'prof.ananya@college.edu' }
      ],
      Wednesday: [
        { sub: 'Database Management Systems', teacher: 'prof.ananya@college.edu' },
        { sub: 'Data Structures & Algorithms', teacher: 'prof.ananya@college.edu' },
        { sub: 'Software Engineering', teacher: 'prof.kavita@college.edu' },
        { sub: 'Operating Systems', teacher: 'prof.vikram@college.edu' },
        { sub: 'Computer Networks', teacher: 'prof.vikram@college.edu' },
        { sub: 'Design & Analysis of Algorithms', teacher: 'prof.ananya@college.edu' }
      ],
      Thursday: [
        { sub: 'Computer Networks', teacher: 'prof.vikram@college.edu' },
        { sub: 'Operating Systems', teacher: 'prof.vikram@college.edu' },
        { sub: 'Database Management Systems', teacher: 'prof.ananya@college.edu' },
        { sub: 'Data Structures & Algorithms', teacher: 'prof.ananya@college.edu' },
        { sub: 'Design & Analysis of Algorithms', teacher: 'prof.ananya@college.edu' },
        { sub: 'Software Engineering', teacher: 'prof.kavita@college.edu' }
      ],
      Friday: [
        { sub: 'Software Engineering', teacher: 'prof.kavita@college.edu' },
        { sub: 'Design & Analysis of Algorithms', teacher: 'prof.ananya@college.edu' },
        { sub: 'Computer Networks', teacher: 'prof.vikram@college.edu' },
        { sub: 'Operating Systems', teacher: 'prof.vikram@college.edu' },
        { sub: 'Data Structures & Algorithms', teacher: 'prof.ananya@college.edu' },
        { sub: 'Database Management Systems', teacher: 'prof.ananya@college.edu' }
      ],
      Saturday: [
        { sub: 'Data Structures & Algorithms', teacher: 'prof.ananya@college.edu' },
        { sub: 'Database Management Systems', teacher: 'prof.ananya@college.edu' },
        { sub: 'Operating Systems', teacher: 'prof.vikram@college.edu' },
        { sub: 'Computer Networks', teacher: 'prof.vikram@college.edu' },
        { sub: 'Software Engineering', teacher: 'prof.kavita@college.edu' },
        { sub: 'Design & Analysis of Algorithms', teacher: 'prof.ananya@college.edu' }
      ]
    },
    btech_ece_3a: {
      Monday: [
        { sub: 'Digital Signal Processing', teacher: 'prof.suresh@college.edu' },
        { sub: 'VLSI Design & Technology', teacher: 'prof.suresh@college.edu' },
        { sub: 'Microprocessors & Microcontrollers', teacher: 'prof.arun@college.edu' },
        { sub: 'Control Systems Engineering', teacher: 'prof.rohit@college.edu' },
        { sub: 'Electromagnetic Waves', teacher: 'prof.suresh@college.edu' },
        { sub: 'Embedded Systems Lab', teacher: 'prof.arun@college.edu' }
      ],
      Tuesday: [
        { sub: 'VLSI Design & Technology', teacher: 'prof.suresh@college.edu' },
        { sub: 'Digital Signal Processing', teacher: 'prof.suresh@college.edu' },
        { sub: 'Control Systems Engineering', teacher: 'prof.rohit@college.edu' },
        { sub: 'Microprocessors & Microcontrollers', teacher: 'prof.arun@college.edu' },
        { sub: 'Embedded Systems Lab', teacher: 'prof.arun@college.edu' },
        { sub: 'Electromagnetic Waves', teacher: 'prof.suresh@college.edu' }
      ],
      Wednesday: [
        { sub: 'Microprocessors & Microcontrollers', teacher: 'prof.arun@college.edu' },
        { sub: 'Embedded Systems Lab', teacher: 'prof.arun@college.edu' },
        { sub: 'Digital Signal Processing', teacher: 'prof.suresh@college.edu' },
        { sub: 'VLSI Design & Technology', teacher: 'prof.suresh@college.edu' },
        { sub: 'Control Systems Engineering', teacher: 'prof.rohit@college.edu' },
        { sub: 'Electromagnetic Waves', teacher: 'prof.suresh@college.edu' }
      ],
      Thursday: [
        { sub: 'Control Systems Engineering', teacher: 'prof.rohit@college.edu' },
        { sub: 'Electromagnetic Waves', teacher: 'prof.suresh@college.edu' },
        { sub: 'VLSI Design & Technology', teacher: 'prof.suresh@college.edu' },
        { sub: 'Digital Signal Processing', teacher: 'prof.suresh@college.edu' },
        { sub: 'Microprocessors & Microcontrollers', teacher: 'prof.arun@college.edu' },
        { sub: 'Embedded Systems Lab', teacher: 'prof.arun@college.edu' }
      ],
      Friday: [
        { sub: 'Electromagnetic Waves', teacher: 'prof.suresh@college.edu' },
        { sub: 'Digital Signal Processing', teacher: 'prof.suresh@college.edu' },
        { sub: 'Microprocessors & Microcontrollers', teacher: 'prof.arun@college.edu' },
        { sub: 'VLSI Design & Technology', teacher: 'prof.suresh@college.edu' },
        { sub: 'Control Systems Engineering', teacher: 'prof.rohit@college.edu' },
        { sub: 'Embedded Systems Lab', teacher: 'prof.arun@college.edu' }
      ],
      Saturday: [
        { sub: 'Digital Signal Processing', teacher: 'prof.suresh@college.edu' },
        { sub: 'VLSI Design & Technology', teacher: 'prof.suresh@college.edu' },
        { sub: 'Microprocessors & Microcontrollers', teacher: 'prof.arun@college.edu' },
        { sub: 'Embedded Systems Lab', teacher: 'prof.arun@college.edu' },
        { sub: 'Control Systems Engineering', teacher: 'prof.rohit@college.edu' },
        { sub: 'Electromagnetic Waves', teacher: 'prof.suresh@college.edu' }
      ]
    },
    btech_aids_2a: {
      Monday: [
        { sub: 'Artificial Intelligence Fundamentals', teacher: 'prof.priya@college.edu' },
        { sub: 'Data Science with Python', teacher: 'prof.ananya@college.edu' },
        { sub: 'Object Oriented Programming with Java', teacher: 'prof.amit@college.edu' },
        { sub: 'Discrete Mathematics', teacher: 'prof.meenakshi@college.edu' },
        { sub: 'Probability & Statistics for Engineers', teacher: 'prof.meenakshi@college.edu' },
        { sub: 'Computer Organization & Architecture', teacher: 'prof.rohit@college.edu' }
      ],
      Tuesday: [
        { sub: 'Data Science with Python', teacher: 'prof.ananya@college.edu' },
        { sub: 'Artificial Intelligence Fundamentals', teacher: 'prof.priya@college.edu' },
        { sub: 'Discrete Mathematics', teacher: 'prof.meenakshi@college.edu' },
        { sub: 'Object Oriented Programming with Java', teacher: 'prof.amit@college.edu' },
        { sub: 'Computer Organization & Architecture', teacher: 'prof.rohit@college.edu' },
        { sub: 'Probability & Statistics for Engineers', teacher: 'prof.meenakshi@college.edu' }
      ],
      Wednesday: [
        { sub: 'Object Oriented Programming with Java', teacher: 'prof.amit@college.edu' },
        { sub: 'Discrete Mathematics', teacher: 'prof.meenakshi@college.edu' },
        { sub: 'Data Science with Python', teacher: 'prof.ananya@college.edu' },
        { sub: 'Artificial Intelligence Fundamentals', teacher: 'prof.priya@college.edu' },
        { sub: 'Probability & Statistics for Engineers', teacher: 'prof.meenakshi@college.edu' },
        { sub: 'Computer Organization & Architecture', teacher: 'prof.rohit@college.edu' }
      ],
      Thursday: [
        { sub: 'Probability & Statistics for Engineers', teacher: 'prof.meenakshi@college.edu' },
        { sub: 'Computer Organization & Architecture', teacher: 'prof.rohit@college.edu' },
        { sub: 'Object Oriented Programming with Java', teacher: 'prof.amit@college.edu' },
        { sub: 'Discrete Mathematics', teacher: 'prof.meenakshi@college.edu' },
        { sub: 'Data Science with Python', teacher: 'prof.ananya@college.edu' },
        { sub: 'Artificial Intelligence Fundamentals', teacher: 'prof.priya@college.edu' }
      ],
      Friday: [
        { sub: 'Computer Organization & Architecture', teacher: 'prof.rohit@college.edu' },
        { sub: 'Probability & Statistics for Engineers', teacher: 'prof.meenakshi@college.edu' },
        { sub: 'Artificial Intelligence Fundamentals', teacher: 'prof.priya@college.edu' },
        { sub: 'Data Science with Python', teacher: 'prof.ananya@college.edu' },
        { sub: 'Object Oriented Programming with Java', teacher: 'prof.amit@college.edu' },
        { sub: 'Discrete Mathematics', teacher: 'prof.meenakshi@college.edu' }
      ],
      Saturday: [
        { sub: 'Artificial Intelligence Fundamentals', teacher: 'prof.priya@college.edu' },
        { sub: 'Data Science with Python', teacher: 'prof.ananya@college.edu' },
        { sub: 'Object Oriented Programming with Java', teacher: 'prof.amit@college.edu' },
        { sub: 'Discrete Mathematics', teacher: 'prof.meenakshi@college.edu' },
        { sub: 'Probability & Statistics for Engineers', teacher: 'prof.meenakshi@college.edu' },
        { sub: 'Computer Organization & Architecture', teacher: 'prof.rohit@college.edu' }
      ]
    },
    btech_cse_4b: {
      Monday: [
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.priya@college.edu' }
      ],
      Tuesday: [
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.priya@college.edu' }
      ],
      Wednesday: [
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.sharma@college.edu' }
      ],
      Thursday: [
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.priya@college.edu' }
      ],
      Friday: [
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.sharma@college.edu' }
      ],
      Saturday: [
        { sub: 'Cloud Computing & DevOps', teacher: 'prof.sharma@college.edu' },
        { sub: 'Deep Learning & Neural Networks', teacher: 'prof.priya@college.edu' },
        { sub: 'Distributed Systems', teacher: 'prof.sharma@college.edu' },
        { sub: 'Full Stack Web Development', teacher: 'prof.amit@college.edu' },
        { sub: 'Cyber Security & Cryptography', teacher: 'prof.kavita@college.edu' },
        { sub: 'Major Project & Seminar', teacher: 'prof.priya@college.edu' }
      ]
    }
  };

  for (const [classId, daysMap] of Object.entries(classSchedules)) {
    for (const [day, periodsDef] of Object.entries(daysMap)) {
      const periods = periodsDef.map((p, idx) => {
        const slot = timeSlots[idx];
        const teacherObj = facultyMap[p.teacher];
        return {
          id: `p_${idx + 1}`,
          periodNumber: slot.periodNumber,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subjectName: p.sub,
          teacherId: teacherObj ? teacherObj.uid : '',
          teacherName: teacherObj ? teacherObj.name : 'Faculty'
        };
      });

      await supabaseAdmin.from('timetables').upsert({
        id: `${classId}_${day}`,
        class_id: classId,
        day_of_week: day,
        periods: periods,
        updated_at: Date.now(),
        updated_by: principalId1
      });
    }
  }
  console.log('✓ Seeded full 6-day (Mon-Sat, 6 periods/day) timetables for all 5 classes.');

  console.log('\n--- 7. SEEDING REALISTIC ATTENDANCE RECORDS ---');
  const pastDates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-09-29', '2026-09-30'];
  const attendanceRows = [];

  for (const [email, s] of Object.entries(studentMap)) {
    const classSchedule = classSchedules[s.classId];
    if (!classSchedule) continue;

    for (let dIdx = 0; dIdx < pastDates.length; dIdx++) {
      const dateStr = pastDates[dIdx];
      const dayName = DAYS[dIdx % DAYS.length];
      const dayPeriods = classSchedule[dayName] || classSchedule['Monday'];

      for (let pIdx = 0; pIdx < dayPeriods.length; pIdx++) {
        const p = dayPeriods[pIdx];
        const teacherObj = facultyMap[p.teacher];
        // 92% attendance rate
        const isPresent = ((s.rollNumber.charCodeAt(s.rollNumber.length - 1) + dIdx + pIdx) % 11) !== 0;
        const status = isPresent ? 'Present' : 'Absent';

        attendanceRows.push({
          id: `${s.classId}_${dateStr}_p${pIdx + 1}_${s.uid}`,
          class_id: s.classId,
          date: dateStr,
          period_number: pIdx + 1,
          subject_name: p.sub,
          student_id: s.uid,
          status: status,
          marked_by: teacherObj ? teacherObj.uid : principalId1,
          timestamp: Date.now() - (pastDates.length - dIdx) * 86400000 + pIdx * 3600000
        });
      }
    }
  }

  // Batch insert attendance
  const chunkSize = 100;
  for (let i = 0; i < attendanceRows.length; i += chunkSize) {
    const chunk = attendanceRows.slice(i, i + chunkSize);
    const { error } = await supabaseAdmin.from('attendance_records').upsert(chunk);
    if (error) console.error('Error inserting attendance chunk:', error.message);
  }
  console.log(`✓ Seeded ${attendanceRows.length} attendance period records.`);

  console.log('\n--- 8. SEEDING EXAM MARKS & GRADES ---');
  const examNames = [
    { name: 'Mid-Term Exam 1', total: 50, scale: 0.85 },
    { name: 'Mid-Term Exam 2', total: 50, scale: 0.88 },
    { name: 'End-Semester Exam', total: 100, scale: 0.86 }
  ];

  const marksRows = [];
  for (const [email, s] of Object.entries(studentMap)) {
    const subjects = subjectsByClass[s.classId] || [];
    const baseStudentSeed = s.rollNumber.charCodeAt(s.rollNumber.length - 1) * 3;

    for (const sub of subjects) {
      for (const exam of examNames) {
        const marksObtained = Math.min(
          exam.total,
          Math.max(
            Math.round(exam.total * 0.6),
            Math.round(exam.total * exam.scale + ((baseStudentSeed + sub.length) % 12) - 4)
          )
        );

        marksRows.push({
          id: `${s.classId}_${sub.replace(/\s+/g, '')}_${exam.name.replace(/\s+/g, '')}_${s.uid}`,
          class_id: s.classId,
          subject_name: sub,
          exam_name: exam.name,
          student_id: s.uid,
          marks_obtained: marksObtained,
          total_marks: exam.total,
          graded_by: principalId1,
          timestamp: Date.now() - 30 * 86400000
        });
      }
    }
  }

  for (let i = 0; i < marksRows.length; i += chunkSize) {
    const chunk = marksRows.slice(i, i + chunkSize);
    const { error } = await supabaseAdmin.from('marks_records').upsert(chunk);
    if (error) console.error('Error inserting marks chunk:', error.message);
  }
  console.log(`✓ Seeded ${marksRows.length} exam marks records.`);

  console.log('\n--- 9. SEEDING COLLEGE ANNOUNCEMENTS ---');
  const announcements = [
    {
      id: 'ann_hackathon_2026',
      title: 'National Level Hackathon 2026 - Registrations Open',
      content: 'All B.Tech students are invited to register for Hack-Campus 2026. Grand cash prizes worth ₹2,00,000, internship opportunities at top tech startups, and mentorship from industry leaders. Submit team abstracts on the college portal by October 25.',
      author_id: principalId1,
      author_name: 'Dr. K. S. Ramanujan (Dean & Director)',
      author_role: 'principal',
      target_audience: 'all',
      timestamp: Date.now() - 2 * 86400000
    },
    {
      id: 'ann_even_sem_datesheet',
      title: 'Even Semester Final Examination Schedule Published',
      content: 'The Office of Controller of Examinations has published the final datesheet for B.Tech End-Semester Theory & Practical Laboratory Examinations. Hall tickets will be available for download 7 days prior to commencement.',
      author_id: principalId1,
      author_name: 'Dr. K. S. Ramanujan (Dean & Director)',
      author_role: 'principal',
      target_audience: 'all',
      timestamp: Date.now() - 5 * 86400000
    },
    {
      id: 'ann_placement_drive',
      title: 'Tier-1 Campus Placement Drive 2026-27',
      content: 'Placement cell is organizing on-campus recruitment for 4th Year B.Tech CSE & ECE students with leading technology organizations (Google, Microsoft, AWS, Oracle). Eligible students must update their GitHub and resumes by Friday.',
      author_id: facultyMap['prof.sharma@college.edu']?.uid || principalId1,
      author_name: 'Dr. Rajesh Sharma (HOD - CSE)',
      author_role: 'teacher',
      target_audience: 'students',
      timestamp: Date.now() - 3 * 86400000
    },
    {
      id: 'ann_faculty_fdp',
      title: 'AICTE Faculty Development Program on Generative AI & LLMs',
      content: 'A 3-day sponsored workshop on Transformer Architectures, RLHF, and Distributed Training Pipelines will be conducted in Seminar Hall A for all engineering faculty members.',
      author_id: principalId1,
      author_name: 'Dr. K. S. Ramanujan (Dean & Director)',
      author_role: 'principal',
      target_audience: 'teachers',
      timestamp: Date.now() - 7 * 86400000
    },
    {
      id: 'ann_wifi_upgrade',
      title: 'Campus High-Speed Wi-Fi 6 & Cloud Lab Expansion',
      content: 'High-speed optical fiber infrastructure (1 Gbps symmetric) and upgraded GPU clusters (NVIDIA A100 nodes) are now operational in Central Computer Center and all residential hostel blocks.',
      author_id: principalId1,
      author_name: 'Dr. K. S. Ramanujan (Dean & Director)',
      author_role: 'principal',
      target_audience: 'all',
      timestamp: Date.now() - 10 * 86400000
    }
  ];

  for (const ann of announcements) {
    await supabaseAdmin.from('announcements').upsert(ann);
  }
  console.log(`✓ Seeded ${announcements.length} official college announcements.`);

  console.log('\n--- 10. SEEDING CLASS GROUP POSTS & LAB MATERIALS ---');
  const classPosts = [
    {
      id: 'post_cse4a_lab1',
      class_id: 'btech_cse_4a',
      author_id: facultyMap['prof.sharma@college.edu']?.uid || principalId1,
      author_name: 'Dr. Rajesh Sharma',
      title: 'Lab Exercise 4: Kubernetes Cluster Setup & Helm Charts',
      content: 'Please find attached the guidelines for deploying a microservices application using Minikube and Helm charts. Submit your GitHub repository links and report PDF before next Tuesday 11:59 PM.',
      timestamp: Date.now() - 1 * 86400000
    },
    {
      id: 'post_cse4a_project',
      class_id: 'btech_cse_4a',
      author_id: facultyMap['prof.priya@college.edu']?.uid || principalId1,
      author_name: 'Dr. Priya Nair',
      title: 'Major Project Phase-1 Evaluation Rubrics & Demo Schedule',
      content: 'Phase-1 Project demos will begin on Thursday. Each team has 15 minutes for system architecture presentation, live pipeline demonstration, and Q&A session.',
      timestamp: Date.now() - 3 * 86400000
    },
    {
      id: 'post_cse3a_dsa',
      class_id: 'btech_cse_3a',
      author_id: facultyMap['prof.ananya@college.edu']?.uid || principalId1,
      author_name: 'Dr. Ananya Roy',
      title: 'Lecture 14 Slides: Graph Algorithms (Dijkstra, Bellman-Ford & Floyd-Warshall)',
      content: 'Slide deck and practice problem set from today’s session are now uploaded. Please implement the shortest path algorithm in C++ or Java for tomorrow’s lab.',
      timestamp: Date.now() - 2 * 86400000
    },
    {
      id: 'post_ece3a_vlsi',
      class_id: 'btech_ece_3a',
      author_id: facultyMap['prof.suresh@college.edu']?.uid || principalId1,
      author_name: 'Dr. Suresh Reddy',
      title: 'VLSI Cadence Tool Simulation Guidelines & CMOS Inverter Delay Analysis',
      content: 'Access the EDA lab workstations remotely via VPN. Follow the step-by-step tutorial for DC characteristics and propagation delay calculation.',
      timestamp: Date.now() - 4 * 86400000
    },
    {
      id: 'post_aids2a_python',
      class_id: 'btech_aids_2a',
      author_id: facultyMap['prof.ananya@college.edu']?.uid || principalId1,
      author_name: 'Dr. Ananya Roy',
      title: 'Data Science Assignment 3: Pandas, NumPy & Exploratory Data Analysis',
      content: 'Kaggle dataset on healthcare analytics is posted. Perform data cleaning, feature engineering, and plot correlation heatmaps.',
      timestamp: Date.now() - 2 * 86400000
    }
  ];

  for (const post of classPosts) {
    await supabaseAdmin.from('class_posts').upsert(post);
  }
  console.log(`✓ Seeded ${classPosts.length} class group posts and study materials.`);

  console.log('\n--- 11. SEEDING COLLEGE FEES & DUES RECORDS ---');
  const feeRecords = [];
  const feeTypes = [
    { type: 'Semester Tuition Fee (Even Sem 2026-27)', amount: 75000, due: '2026-11-15' },
    { type: 'Hostel & Mess Boarding Charges', amount: 45000, due: '2026-11-01' },
    { type: 'End-Semester University Exam Fee', amount: 3500, due: '2026-10-25' },
    { type: 'AI & GPU Lab Development Fee', amount: 5000, due: '2026-10-30' }
  ];

  for (const [email, s] of Object.entries(studentMap)) {
    const isOdd = s.rollNumber.charCodeAt(s.rollNumber.length - 1) % 2 === 0;

    feeTypes.forEach((ft, idx) => {
      const isPaid = idx > 0 || isOdd;
      const status = isPaid ? 'Paid' : 'Pending';
      const feeId = `fee_${s.uid.substring(0, 8)}_${idx + 1}`;

      feeRecords.push({
        id: feeId,
        student_id: s.uid,
        amount: ft.amount,
        status: status,
        created_at: Date.now() - (idx * 15 + 10) * 86400000
      });
    });
  }

  for (let i = 0; i < feeRecords.length; i += chunkSize) {
    const chunk = feeRecords.slice(i, i + chunkSize);
    const { error } = await supabaseAdmin.from('fees').upsert(chunk);
    if (error) console.error('Error inserting fees chunk:', error.message);
  }
  console.log(`✓ Seeded ${feeRecords.length} college fee transaction records.`);

  console.log('\n======================================================');
  console.log('🎉 COMPLETE COLLEGE ERP DATABASE SEEDED SUCCESSFULLY!');
  console.log('======================================================\n');
  console.log('Default Password for ALL seeded accounts: ' + DEFAULT_PASSWORD);
  console.log('\n--- SAMPLE TEST CREDENTIALS ---');
  console.log('1. Principal / Dean: principal@college.edu  (or principal@school.com)');
  console.log('2. HOD CSE:          prof.sharma@college.edu');
  console.log('3. Prof AI/ML:       prof.priya@college.edu');
  console.log('4. Prof Systems:     prof.vikram@college.edu');
  console.log('5. Student (4th Yr): aarav.sharma@college.edu');
  console.log('6. Student (4th Yr): sneha.patel@college.edu');
  console.log('7. Student (3rd Yr): arjun.mehta@college.edu');
  console.log('8. Student (ECE):    rahul.nair@college.edu');
  console.log('9. Student (AI&DS):  ishaan.verma@college.edu');
  console.log('======================================================\n');
}

runSeed().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
