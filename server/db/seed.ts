import { db } from './database';
import { hashPassword, sha256 } from '../utils/crypto';

export async function seedDatabase(force = false) {
  // If already seeded and not force, return
  if (!force && db.users.countDocuments() > 0) {
    return;
  }

  db.clearAll();

  const defaultPasswordHash = await hashPassword('Student@123456');
  const adminPasswordHash = await hashPassword('Admin@123456');
  const auditorPasswordHash = await hashPassword('Auditor@123456');
  const candidatePasswordHash = await hashPassword('Candidate@123456');

  const now = new Date();
  const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 1. Users
  const adminUser = db.users.insertOne({
    id: 'user-admin-1',
    name: 'Dr. Arthur Sterling',
    email: 'admin@campus.edu',
    passwordHash: adminPasswordHash,
    studentId: 'FAC-8092',
    department: 'Dean of Student Affairs',
    semester: 0,
    role: 'ADMIN',
    accountStatus: 'ACTIVE',
    emailVerifiedAt: now.toISOString(),
    createdAt: pastDate.toISOString(),
    updatedAt: now.toISOString(),
  });

  const studentUser1 = db.users.insertOne({
    id: 'user-student-1',
    name: 'Alex Rivera',
    email: 'student@campus.edu',
    passwordHash: defaultPasswordHash,
    studentId: 'CS2023-0142',
    department: 'Computer Science & Engineering',
    semester: 6,
    role: 'VOTER',
    accountStatus: 'ACTIVE',
    emailVerifiedAt: pastDate.toISOString(),
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  const studentUser2 = db.users.insertOne({
    id: 'user-student-2',
    name: 'John Doe',
    email: 'john.doe@campus.edu',
    passwordHash: defaultPasswordHash,
    studentId: 'ECE2023-0881',
    department: 'Electronics & Communication',
    semester: 6,
    role: 'VOTER',
    accountStatus: 'ACTIVE',
    emailVerifiedAt: pastDate.toISOString(),
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  const freshmanUser = db.users.insertOne({
    id: 'user-student-3',
    name: 'Liam Neely',
    email: 'freshman@campus.edu',
    passwordHash: defaultPasswordHash,
    studentId: 'ME2026-0012',
    department: 'Mechanical Engineering',
    semester: 1,
    role: 'VOTER',
    accountStatus: 'PENDING_VERIFICATION',
    emailVerifiedAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  // Seed active verification token for freshman
  db.emailTokens.insertOne({
    id: 'token-freshman-1',
    userId: freshmanUser.id,
    tokenHash: sha256('verify-code-freshman'),
    code: '123456',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    usedAt: null,
    createdAt: now.toISOString(),
  });

  const auditorUser = db.users.insertOne({
    id: 'user-auditor-1',
    name: 'Professor Janet O’Connor',
    email: 'auditor@campus.edu',
    passwordHash: auditorPasswordHash,
    studentId: 'AUD-3004',
    department: 'Ethics & Governance Board',
    semester: 0,
    role: 'AUDITOR',
    accountStatus: 'ACTIVE',
    emailVerifiedAt: pastDate.toISOString(),
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  const candidateUser1 = db.users.insertOne({
    id: 'user-cand-1',
    name: 'Elena Vance',
    email: 'elena.vance@campus.edu',
    passwordHash: candidatePasswordHash,
    studentId: 'CS2023-0019',
    department: 'Computer Science & Engineering',
    semester: 6,
    role: 'CANDIDATE',
    accountStatus: 'ACTIVE',
    emailVerifiedAt: pastDate.toISOString(),
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  const candidateUser2 = db.users.insertOne({
    id: 'user-cand-2',
    name: 'Marcus Chen',
    email: 'marcus.chen@campus.edu',
    passwordHash: candidatePasswordHash,
    studentId: 'EC2022-0450',
    department: 'Electronics & Communication',
    semester: 8,
    role: 'CANDIDATE',
    accountStatus: 'ACTIVE',
    emailVerifiedAt: pastDate.toISOString(),
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  // 2. Main Active Election: "College Student Union Election 2026"
  const activeElection = db.elections.insertOne({
    id: 'elec-csu-2026',
    title: 'College Student Union Election 2026',
    description: 'Annual election for the executive officers of the Campus Student Union. Shape the academic policies, campus facilities, and student advocacy for 2026-2027.',
    academicYear: '2026-2027',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    createdBy: adminUser.id,
    positions: [
      {
        id: 'pos-pres',
        title: 'President',
        maxSelections: 1,
        description: 'Chief executive officer representing all undergraduate and graduate student interests to the University Board.',
      },
      {
        id: 'pos-vp',
        title: 'Vice President',
        maxSelections: 1,
        description: 'Oversees student clubs, societies, academic advisory council, and student grievance resolutions.',
      },
      {
        id: 'pos-gs',
        title: 'General Secretary',
        maxSelections: 1,
        description: 'Manages administrative communications, budget allocation oversight, and union general body sessions.',
      },
      {
        id: 'pos-cs',
        title: 'Cultural Secretary',
        maxSelections: 1,
        description: 'Coordinates annual cultural fest, music/drama societies, and collegiate arts festivals.',
      },
    ],
    eligibleDepartments: [],
    publishedAt: null,
    createdAt: pastDate.toISOString(),
    updatedAt: now.toISOString(),
  });

  // 3. Candidates for Active Election
  // Presidential Candidates
  const candElena = db.candidates.insertOne({
    id: 'cand-elena',
    electionId: activeElection.id,
    userId: candidateUser1.id,
    name: 'Elena Vance',
    photo: '/src/assets/images/candidate_elena_vance_1793428640086.jpg',
    department: 'Computer Science & Engineering',
    semester: 6,
    studentId: 'CS2023-0019',
    position: 'President',
    manifesto: 'Empowering students through transparent digital administration, 24/7 library access, subsidized textbook programs, and modernizing campus lab infrastructure. Every student deserves an amplified voice.',
    symbol: '⚡ Beacon of Progress',
    approvalStatus: 'APPROVED',
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  const candMarcus = db.candidates.insertOne({
    id: 'cand-marcus',
    electionId: activeElection.id,
    userId: candidateUser2.id,
    name: 'Marcus Chen',
    photo: '/src/assets/images/candidate_marcus_chen_1793428641233.jpg',
    department: 'Electronics & Communication',
    semester: 8,
    studentId: 'EC2022-0450',
    position: 'President',
    manifesto: 'Strengthening mental health counseling on campus, increasing career fair diversity, establishing an alumni mentorship fund, and ensuring dining hall dietary inclusivity.',
    symbol: '🏛️ Unity & Action',
    approvalStatus: 'APPROVED',
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  // Vice President Candidate
  const candSarah = db.candidates.insertOne({
    id: 'cand-sarah',
    electionId: activeElection.id,
    userId: 'user-cand-3',
    name: 'Sarah Jenkins',
    photo: '/src/assets/images/candidate_sarah_jenkins_1793428640873.jpg',
    department: 'Information Technology',
    semester: 6,
    studentId: 'IT2023-0105',
    position: 'Vice President',
    manifesto: 'Streamlined club budget approvals, zero-hassle auditorium bookings, and bi-weekly student town halls with academic deans.',
    symbol: '🌟 Forward Momentum',
    approvalStatus: 'APPROVED',
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  const candDavid = db.candidates.insertOne({
    id: 'cand-david',
    electionId: activeElection.id,
    userId: 'user-cand-4',
    name: 'David Okafor',
    photo: '',
    department: 'Civil Engineering',
    semester: 6,
    studentId: 'CE2023-0210',
    position: 'Vice President',
    manifesto: 'Renovating study rooms, eco-friendly campus transportation, and expanded inter-department collaborative competitions.',
    symbol: '🌿 Sustainable Campus',
    approvalStatus: 'APPROVED',
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  // General Secretary Candidate
  const candPriya = db.candidates.insertOne({
    id: 'cand-priya',
    electionId: activeElection.id,
    userId: 'user-cand-5',
    name: 'Priya Sharma',
    photo: '/src/assets/images/candidate_priya_sharma_1793428640467.jpg',
    department: 'Mechanical Engineering',
    semester: 6,
    studentId: 'ME2023-0774',
    position: 'General Secretary',
    manifesto: 'Publishing transparent union expenditure ledgers, digitizing grievance redressals within 48 hours, and modernizing student council records.',
    symbol: '📖 Transparency First',
    approvalStatus: 'APPROVED',
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  // Cultural Secretary Candidates
  const candLucas = db.candidates.insertOne({
    id: 'cand-lucas',
    electionId: activeElection.id,
    userId: 'user-cand-6',
    name: 'Lucas Miller',
    photo: '',
    department: 'Architecture & Design',
    semester: 4,
    studentId: 'AR2024-0091',
    position: 'Cultural Secretary',
    manifesto: 'Revitalizing the annual Spring Carnival, securing renowned indie performers, and funding student film and digital art showcases.',
    symbol: '🎨 Campus Harmony',
    approvalStatus: 'APPROVED',
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  });

  // 4. Voter Eligibility Records for Active Election
  // Alex Rivera (studentUser1) is eligible and has NOT voted yet:
  db.voterEligibility.insertOne({
    id: 'elig-1',
    electionId: activeElection.id,
    userId: studentUser1.id,
    hasVoted: false,
    votedAt: null,
    createdAt: pastDate.toISOString(),
  });

  // John Doe (studentUser2) is eligible and has ALREADY voted:
  const johnReceiptCode = 'EVC-2026-F41A-98BD';
  const johnReceiptHash = sha256(johnReceiptCode);

  db.voterEligibility.insertOne({
    id: 'elig-2',
    electionId: activeElection.id,
    userId: studentUser2.id,
    hasVoted: true,
    votedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    createdAt: pastDate.toISOString(),
  });

  // Simulated anonymous ballots cast by John Doe (Notice: NO voter ID stored in ballots!)
  db.ballots.insertOne({
    id: 'ballot-seed-1',
    electionId: activeElection.id,
    candidateId: candElena.id,
    position: 'President',
    receiptHash: johnReceiptHash,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  });
  db.ballots.insertOne({
    id: 'ballot-seed-2',
    electionId: activeElection.id,
    candidateId: candSarah.id,
    position: 'Vice President',
    receiptHash: johnReceiptHash,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  });
  db.ballots.insertOne({
    id: 'ballot-seed-3',
    electionId: activeElection.id,
    candidateId: candPriya.id,
    position: 'General Secretary',
    receiptHash: johnReceiptHash,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  });
  db.ballots.insertOne({
    id: 'ballot-seed-4',
    electionId: activeElection.id,
    candidateId: candLucas.id,
    position: 'Cultural Secretary',
    receiptHash: johnReceiptHash,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  });

  // Additional 8 simulated anonymous ballots to demonstrate live participation counts
  const dummyReceipts = [
    'EVC-2026-B102-45DC',
    'EVC-2026-C899-11AE',
    'EVC-2026-D441-90FF',
    'EVC-2026-E552-33BA',
  ];

  dummyReceipts.forEach((rc, i) => {
    const rHash = sha256(rc);
    db.ballots.insertOne({
      id: `ballot-dummy-pres-${i}`,
      electionId: activeElection.id,
      candidateId: i % 2 === 0 ? candElena.id : candMarcus.id,
      position: 'President',
      receiptHash: rHash,
      createdAt: new Date(Date.now() - (i + 1) * 3600 * 1000).toISOString(),
    });
    db.ballots.insertOne({
      id: `ballot-dummy-vp-${i}`,
      electionId: activeElection.id,
      candidateId: candSarah.id,
      position: 'Vice President',
      receiptHash: rHash,
      createdAt: new Date(Date.now() - (i + 1) * 3600 * 1000).toISOString(),
    });
  });

  // 5. Past Completed & Published Election: "Department Representatives Council 2025"
  const pastElection = db.elections.insertOne({
    id: 'elec-drc-2025',
    title: 'Department Representatives Council 2025',
    description: 'College-wide election for department delegates to the Academic Senate. Official results certified by the Election Commission.',
    academicYear: '2025-2026',
    startTime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PUBLISHED',
    createdBy: adminUser.id,
    positions: [
      {
        id: 'pos-sen-eng',
        title: 'Engineering Academic Delegate',
        maxSelections: 1,
        description: 'Represents all Engineering disciplines in Senate curriculum reviews.',
      },
      {
        id: 'pos-sen-sci',
        title: 'Sciences & Humanities Delegate',
        maxSelections: 1,
        description: 'Represents Sciences and Arts departments in academic councils.',
      },
    ],
    eligibleDepartments: [],
    publishedAt: new Date(Date.now() - 57 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 57 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const candPast1 = db.candidates.insertOne({
    id: 'cand-past-1',
    electionId: pastElection.id,
    userId: 'user-past-cand-1',
    name: 'Chloe DuPont',
    photo: '',
    department: 'Computer Science & Engineering',
    semester: 8,
    studentId: 'CS2022-0991',
    position: 'Engineering Academic Delegate',
    manifesto: 'Fair grading moderation and automated assignment evaluation timelines.',
    symbol: '⚖️ Equity in Grading',
    approvalStatus: 'APPROVED',
    createdAt: pastElection.createdAt,
    updatedAt: pastElection.createdAt,
  });

  const candPast2 = db.candidates.insertOne({
    id: 'cand-past-2',
    electionId: pastElection.id,
    userId: 'user-past-cand-2',
    name: 'Arjun Mehta',
    photo: '',
    department: 'Mechanical Engineering',
    semester: 8,
    studentId: 'ME2022-0120',
    position: 'Engineering Academic Delegate',
    manifesto: 'Modernizing workshop safety equipment and hands-on capstone subsidies.',
    symbol: '⚙️ Hands-On Engineering',
    approvalStatus: 'APPROVED',
    createdAt: pastElection.createdAt,
    updatedAt: pastElection.createdAt,
  });

  // Seed 42 votes for Past Election to provide rich historical analytics
  for (let k = 0; k < 42; k++) {
    const fakeRc = `EVC-2025-PST-${k.toString().padStart(4, '0')}`;
    const rHash = sha256(fakeRc);
    // Chloe won 28 to 14
    const chosenCand = k < 28 ? candPast1.id : candPast2.id;
    db.ballots.insertOne({
      id: `ballot-past-${k}`,
      electionId: pastElection.id,
      candidateId: chosenCand,
      position: 'Engineering Academic Delegate',
      receiptHash: rHash,
      createdAt: pastElection.endTime,
    });
  }

  // 6. Upcoming / Scheduled Election
  db.elections.insertOne({
    id: 'elec-sports-2026',
    title: 'Sports Advisory Board Election 2026',
    description: 'Election of student captains and athletics delegates to oversee college sports facilities, gym renovations, and inter-collegiate tournaments.',
    academicYear: '2026-2027',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED',
    createdBy: adminUser.id,
    positions: [
      { id: 'pos-sp-cap', title: 'Athletics Committee Chair', maxSelections: 1 },
      { id: 'pos-sp-fem', title: 'Women in Sports Ambassador', maxSelections: 1 },
    ],
    eligibleDepartments: [],
    publishedAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  // 7. Audit Logs
  db.auditLogs.insertOne({
    id: 'log-1',
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    actorRole: 'ADMIN',
    action: 'ELECTION_CREATED',
    entityType: 'ELECTION',
    entityId: activeElection.id,
    details: { title: activeElection.title, status: 'ACTIVE' },
    createdAt: pastDate.toISOString(),
  });

  db.auditLogs.insertOne({
    id: 'log-2',
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    actorRole: 'ADMIN',
    action: 'CANDIDATE_APPROVED',
    entityType: 'CANDIDATE',
    entityId: candElena.id,
    details: { candidateName: candElena.name, position: candElena.position },
    createdAt: pastDate.toISOString(),
  });

  db.auditLogs.insertOne({
    id: 'log-3',
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    actorRole: 'ADMIN',
    action: 'RESULTS_PUBLISHED',
    entityType: 'ELECTION',
    entityId: pastElection.id,
    details: { title: pastElection.title, totalBallots: 42 },
    createdAt: pastElection.publishedAt || now.toISOString(),
  });

  console.log('Database successfully seeded with demo data!');
}
