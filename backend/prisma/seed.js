require('dotenv').config();

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const alumniProfiles = [
  { fullName: 'Maya Shah', gradYear: 2016, domain: 'Computer Science', interests: ['AI', 'mentoring', 'product'], bio: 'Engineering lead focused on practical AI systems.', company: 'Nimbus Labs', jobTitle: 'Engineering Manager' },
  { fullName: 'Noah Kim', gradYear: 2014, domain: 'Data Science', interests: ['machine learning', 'analytics', 'python'], bio: 'Data scientist helping teams operationalize models.', company: 'Beacon Metrics', jobTitle: 'Senior Data Scientist' },
  { fullName: 'Ava Peterson', gradYear: 2018, domain: 'Product Management', interests: ['user research', 'startups', 'design'], bio: 'Product mentor for early-career PMs.', company: 'Northstar Apps', jobTitle: 'Product Manager' },
  { fullName: 'Ethan Rivera', gradYear: 2015, domain: 'Cybersecurity', interests: ['cloud security', 'devsecops', 'risk'], bio: 'Security specialist working on cloud hardening.', company: 'ShieldNet', jobTitle: 'Security Architect' },
  { fullName: 'Sophia Chen', gradYear: 2017, domain: 'Computer Science', interests: ['backend', 'distributed systems', 'golang'], bio: 'Builds scalable backend services and mentors junior devs.', company: 'Orbit Systems', jobTitle: 'Staff Software Engineer' },
  { fullName: 'Liam Brooks', gradYear: 2013, domain: 'Finance', interests: ['fintech', 'strategy', 'mentoring'], bio: 'Finance leader with a focus on fintech growth.', company: 'LedgerOne', jobTitle: 'Finance Director' },
  { fullName: 'Isabella Moore', gradYear: 2019, domain: 'UX Design', interests: ['design systems', 'accessibility', 'research'], bio: 'Design mentor helping students build stronger portfolios.', company: 'Pixel Foundry', jobTitle: 'Senior Product Designer' },
  { fullName: 'James Patel', gradYear: 2012, domain: 'Marketing', interests: ['growth', 'content', 'branding'], bio: 'Growth marketer who enjoys career coaching.', company: 'Trailblaze Media', jobTitle: 'Growth Lead' },
  { fullName: 'Olivia Reed', gradYear: 2016, domain: 'Data Science', interests: ['nlp', 'statistics', 'visualization'], bio: 'Works on NLP and decision intelligence products.', company: 'Synth Insights', jobTitle: 'Machine Learning Engineer' },
  { fullName: 'Benjamin Hall', gradYear: 2011, domain: 'Computer Science', interests: ['cloud', 'architecture', 'leadership'], bio: 'Cloud architect with a passion for mentoring builders.', company: 'Skyline Cloud', jobTitle: 'Principal Architect' },
  { fullName: 'Harper Lewis', gradYear: 2020, domain: 'Product Management', interests: ['roadmapping', 'experimentation', 'saas'], bio: 'PM focused on SaaS onboarding and activation.', company: 'PulseSuite', jobTitle: 'Product Manager' },
  { fullName: 'Lucas Diaz', gradYear: 2017, domain: 'Cybersecurity', interests: ['incident response', 'forensics', 'automation'], bio: 'Leads incident response and teaches security best practices.', company: 'SafeLayer', jobTitle: 'Blue Team Lead' },
  { fullName: 'Amelia Carter', gradYear: 2018, domain: 'Computer Science', interests: ['frontend', 'react', 'design'], bio: 'Frontend engineer bridging UX and engineering teams.', company: 'Canvas Web', jobTitle: 'Senior Frontend Engineer' },
  { fullName: 'Henry Nelson', gradYear: 2014, domain: 'Operations', interests: ['supply chain', 'analytics', 'leadership'], bio: 'Operations manager driving process optimization.', company: 'Flow Logistics', jobTitle: 'Operations Manager' },
  { fullName: 'Evelyn Wright', gradYear: 2015, domain: 'Data Science', interests: ['ai', 'ethics', 'mentoring'], bio: 'Mentors students transitioning into AI careers.', company: 'Mindfield AI', jobTitle: 'AI Program Lead' },
  { fullName: 'Michael Scott', gradYear: 2013, domain: 'Sales', interests: ['enterprise sales', 'negotiation', 'coaching'], bio: 'Enterprise sales leader supporting new grads.', company: 'BridgeWorks', jobTitle: 'Account Executive' },
  { fullName: 'Charlotte Evans', gradYear: 2019, domain: 'Computer Science', interests: ['mobile', 'ios', 'swift'], bio: 'iOS engineer passionate about mentorship.', company: 'Pocketly', jobTitle: 'Mobile Engineer' },
  { fullName: 'Daniel Young', gradYear: 2010, domain: 'Entrepreneurship', interests: ['startups', 'fundraising', 'strategy'], bio: 'Founder advising student entrepreneurs.', company: 'Launch Grove', jobTitle: 'Founder' },
  { fullName: 'Mia Turner', gradYear: 2016, domain: 'UX Design', interests: ['ux writing', 'research', 'accessibility'], bio: 'Design lead with a focus on inclusive product experiences.', company: 'Bright Path', jobTitle: 'UX Lead' },
  { fullName: 'Alexander Green', gradYear: 2017, domain: 'Computer Science', interests: ['devops', 'kubernetes', 'platform engineering'], bio: 'Platform engineer helping teams ship reliably.', company: 'InfraNex', jobTitle: 'DevOps Engineer' },
];

const studentProfiles = [
  { fullName: 'Riya Malhotra', gradYear: 2027, domain: 'Computer Science', interests: ['AI', 'backend', 'product'], bio: 'CS student exploring ML and product engineering.' },
  { fullName: 'Connor Blake', gradYear: 2026, domain: 'Data Science', interests: ['machine learning', 'nlp', 'python'], bio: 'Interested in applied data science roles.' },
  { fullName: 'Leah Simmons', gradYear: 2028, domain: 'UX Design', interests: ['accessibility', 'research', 'design systems'], bio: 'Design student building user-centered products.' },
  { fullName: 'Owen Park', gradYear: 2027, domain: 'Product Management', interests: ['experimentation', 'analytics', 'startups'], bio: 'Aspiring PM looking for alumni guidance.' },
];

async function seedUser(email, passwordHash, role, profile) {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      role,
      passwordHash,
    },
    create: {
      email: normalizedEmail,
      role,
      passwordHash,
    },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      fullName: profile.fullName,
      gradYear: profile.gradYear,
      domain: profile.domain,
      interests: profile.interests,
      bio: profile.bio,
      company: role === 'alumni' ? profile.company : null,
      jobTitle: role === 'alumni' ? profile.jobTitle : null,
    },
    create: {
      userId: user.id,
      fullName: profile.fullName,
      gradYear: profile.gradYear,
      domain: profile.domain,
      interests: profile.interests,
      bio: profile.bio,
      company: role === 'alumni' ? profile.company : null,
      jobTitle: role === 'alumni' ? profile.jobTitle : null,
    },
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run seed. Add it to backend/.env or export it in your shell.');
  }

  const passwordHash = await bcrypt.hash('Passw0rd!', 10);

  for (let index = 0; index < alumniProfiles.length; index += 1) {
    const email = `alumni${String(index + 1).padStart(2, '0')}@bonded.dev`;
    await seedUser(email, passwordHash, 'alumni', alumniProfiles[index]);
  }

  for (let index = 0; index < studentProfiles.length; index += 1) {
    const email = `student${String(index + 1).padStart(2, '0')}@bonded.dev`;
    await seedUser(email, passwordHash, 'student', studentProfiles[index]);
  }

  console.log(`Seed complete: ${alumniProfiles.length} alumni and ${studentProfiles.length} students upserted.`);
  console.log('Sample credentials: student01@bonded.dev / Passw0rd!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });