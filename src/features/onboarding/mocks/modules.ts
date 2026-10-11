import { TrainingModule } from '../types';

export const mockTrainingModules: TrainingModule[] = [
  {
    id: 'mod-101',
    title: 'Welcome & Engineering Operating Principles',
    description: 'Learn about our journey, customer-first philosophy, architecture pillars, and quarterly OKR cadence.',
    duration: '12 mins',
    progress: 0,
    isCompleted: false,
    videoDurationSeconds: 120,
    keyTopics: ['Company History & Values', 'Leadership Team', 'Product Roadmap', 'Operating Principles'],
  },
  {
    id: 'mod-102',
    title: 'Security Awareness & Phishing Defense Essentials',
    description: 'Essential cyber safety protocols, identifying social engineering attempts, 1Password setup, and device encryption.',
    duration: '15 mins',
    progress: 0,
    isCompleted: false,
    videoDurationSeconds: 150,
    keyTopics: ['MFA Enforcement', 'Phishing Simulation Drills', 'Clean Desk Policy', 'Reporting Anomalies'],
  },
  {
    id: 'mod-103',
    title: 'Engineering Architecture & Tech Stack Tour',
    description: 'Deep-dive into microservices architecture, frontend design system, CI/CD pipeline, and observability.',
    duration: '18 mins',
    progress: 0,
    isCompleted: false,
    videoDurationSeconds: 180,
    keyTopics: ['Architecture Overview', 'Design System & Monorepo', 'Deployment Pipelines', 'Incident Management'],
  },
  {
    id: 'mod-104',
    title: 'Workplace Wellness, Benefits & People Operations',
    description: 'Overview of health insurance, leave management portal, mental health stipends, and continuous learning budgets.',
    duration: '10 mins',
    progress: 0,
    isCompleted: false,
    videoDurationSeconds: 100,
    keyTopics: ['Medical Insurance', 'Unlimited Paid Time Off Guidelines', 'Learning Allowances', 'HR Support Channels'],
  },
];
