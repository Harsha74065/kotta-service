/**
 * Edit this file to personalize your resume portfolio.
 */
export const profile = {
  name: 'Your Name',
  title: 'Full Stack Developer',
  tagline: 'I build reliable web apps — from polished interfaces to production-ready APIs.',
  location: 'India',
  email: 'your.email@example.com',
  phone: '+91 XXXXX XXXXX',
  linkedin: 'https://linkedin.com/in/yourprofile',
  github: 'https://github.com/yourusername',
  summary:
    'Full stack developer with hands-on experience in React, Node.js, and SQL databases. I enjoy turning business problems into clean, maintainable software — whether that is a customer-facing portal, an admin dashboard, or payment integrations.',
};

export const skills = [
  {
    category: 'Frontend',
    items: ['React', 'JavaScript', 'HTML/CSS', 'Material UI', 'Responsive Design'],
  },
  {
    category: 'Backend',
    items: ['Node.js', 'Express', 'REST APIs', 'JWT Auth', 'SQLite'],
  },
  {
    category: 'Tools & Other',
    items: ['Git', 'Render', 'Razorpay', 'Agile', 'Debugging', 'DSA'],
  },
];

export const experience = [
  {
    role: 'Full Stack Developer',
    company: 'Freelance / Personal Projects',
    period: '2024 — Present',
    highlights: [
      'Designed and shipped full-stack web applications with React frontends and Express backends.',
      'Built role-based dashboards with secure authentication for admins and field staff.',
      'Integrated payment flows and QR-based UPI collection for real-world service businesses.',
    ],
  },
  {
    role: 'Software Developer Intern',
    company: 'Tech Company',
    period: '2023 — 2024',
    highlights: [
      'Contributed to feature development and bug fixes in a production web codebase.',
      'Collaborated with team members on API design and frontend component reuse.',
      'Wrote clear documentation and participated in code reviews.',
    ],
  },
];

export const projects = [
  {
    name: 'ServiceOps Platform',
    description:
      'End-to-end service operations platform for home appliance repair businesses — customer records, technician portal, due-service reminders, and Razorpay payments.',
    tech: ['React', 'Node.js', 'Express', 'SQLite', 'Material UI', 'Razorpay'],
    link: '/',
    linkLabel: 'View Live App',
  },
  {
    name: 'Admin Dashboard Suite',
    description:
      'Protected admin panel with analytics charts, customer/technician management, payment settings, and due-service tracking.',
    tech: ['React', 'Recharts', 'JWT', 'REST API'],
    link: '/admin/login',
    linkLabel: 'Admin Portal',
  },
  {
    name: 'DSA Learning Modules',
    description:
      'Server-side implementations of core data structures and algorithms — linked lists, stacks, queues, sorting, searching, and recursion.',
    tech: ['JavaScript', 'Node.js', 'Algorithms'],
    link: null,
    linkLabel: null,
  },
];

export const education = [
  {
    degree: 'Bachelor of Technology — Computer Science',
    school: 'Your University',
    period: '2020 — 2024',
    detail: 'Coursework: Data Structures, DBMS, Web Technologies, Software Engineering',
  },
];

export const navSections = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];
