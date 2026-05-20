import { Task } from "@/types/task";
import { serverTimestamp } from "firebase/firestore";

// Task templates by exam + class combination
const taskTemplates: Record<string, Record<string, string[]>> = {
  JEE: {
    "11": [
      "Physics - Mechanics & Motion",
      "Chemistry - Atomic Structure",
      "Mathematics - Algebra & Sequences",
      "Physics - Thermodynamics Review",
      "Chemistry - Periodic Table Concepts",
      "Mathematics - Coordinate Geometry",
      "Physics - Waves & Sound",
      "Chemistry - Chemical Bonding",
      "Mathematics - Calculus Fundamentals",
      "JEE Previous Year Papers - Set 1",
      "Problem Solving - Mixed Concepts",
      "Mock Test Practice",
    ],
    "12": [
      "Physics - Electromagnetism",
      "Chemistry - Organic Chemistry Reactions",
      "Mathematics - Calculus & Integration",
      "Physics - Modern Physics & Atoms",
      "Chemistry - Inorganic Chemistry",
      "Mathematics - Vector & 3D Geometry",
      "Physics - Semiconductor & Circuits",
      "Chemistry - Kinetics & Equilibrium",
      "Mathematics - Probability & Statistics",
      "JEE Advanced Practice Set 1",
      "Time Management in Exams",
      "Revision & Consolidation",
    ],
    Undergrad: [
      "Advanced Physics Problems",
      "Organic Synthesis Strategies",
      "Abstract Mathematics",
      "Quantum Mechanics Intro",
      "Computational Chemistry",
      "Linear Algebra Applications",
      "Fluid Mechanics",
      "Organic Reaction Mechanisms",
      "Differential Equations",
      "Research Paper Review",
      "Problem Set 1",
      "Exam Strategy Session",
    ],
    Graduate: [
      "Research Lab Setup",
      "Literature Review - JEE Preparation",
      "Advanced Topics Seminar",
      "Group Discussion Prep",
      "Interview Practice",
      "Subject Mastery Deep Dive",
      "Case Study Analysis",
      "Competitive Problem Solving",
      "Mentorship & Guidance",
      "Final Preparation Strategy",
      "Mock Interview",
      "Confidence Building Session",
    ],
  },
  NEET: {
    "11": [
      "Biology - Cell Structure & Function",
      "Chemistry - States of Matter",
      "Physics - Mechanics Fundamentals",
      "Biology - Tissues & Organization",
      "Chemistry - Atomic Structure",
      "Physics - Motion in One Dimension",
      "Biology - Plant Physiology Intro",
      "Chemistry - Chemical Bonding",
      "Physics - Forces & Energy",
      "NEET Foundation Test 1",
      "Anatomy Labeling Practice",
      "Concept Clarity Session",
    ],
    "12": [
      "Biology - Photosynthesis & Respiration",
      "Chemistry - Redox Reactions",
      "Physics - Electrostatics & Current",
      "Biology - Genetics & Heredity",
      "Chemistry - Organic Chemistry Basics",
      "Physics - Magnetism & Waves",
      "Biology - Human Physiology",
      "Chemistry - Qualitative Analysis",
      "Physics - Modern Physics",
      "NEET Practice Test - Full Length",
      "Time Management for Exams",
      "Final Revision Sprint",
    ],
    Undergrad: [
      "Advanced Biochemistry",
      "Clinical Case Studies",
      "Pathophysiology Deep Dive",
      "Medical Microbiology",
      "Pharmacology Applications",
      "Anatomical Variations",
      "Diagnostic Skills",
      "Medical Ethics Discussion",
      "Problem-Based Learning Session",
      "Board Exam Prep",
      "Clinical Scenario Analysis",
      "Confidence & Wellness Check",
    ],
    Graduate: [
      "Specialization Focus Study",
      "Research Methodology",
      "Literature Analysis",
      "Advanced Diagnostics",
      "Patient Case Management",
      "Teaching & Mentoring",
      "Board Preparation",
      "Thesis Work Progress",
      "Expert Consultation Prep",
      "Career Planning Session",
      "Skill Development",
      "Final Preparation Wrap-up",
    ],
  },
  CUET: {
    "11": [
      "English - Comprehension Skills",
      "General Knowledge - Current Affairs",
      "Quantitative Reasoning - Basics",
      "English - Vocabulary Building",
      "Geography - India Overview",
      "Quantitative Reasoning - Aptitude",
      "English - Essay Writing",
      "History - Ancient India",
      "Languages - Reading Practice",
      "CUET Mock Test 1",
      "Speed & Accuracy Practice",
      "Stress Management Techniques",
    ],
    "12": [
      "English - Literature Analysis",
      "General Knowledge - World Events",
      "Quantitative Reasoning - Advanced",
      "English - Writing Styles",
      "Political Science - Government",
      "Reasoning - Logic & Patterns",
      "Economics - Fundamentals",
      "English - Grammar Mastery",
      "Current Affairs - Weekly Review",
      "CUET Full Length Test",
      "Interview Skills Practice",
      "Final Strategic Review",
    ],
    Undergrad: [
      "Subject-Specific Deep Dive",
      "Research Skills",
      "Academic Writing",
      "Presentation Practice",
      "Discussion & Debate",
      "Leadership Development",
      "Career Preparation",
      "Final Year Projects",
      "Network Building",
      "Internship Readiness",
      "Aptitude Assessment",
      "Future Planning",
    ],
    Graduate: [
      "Advanced Research Methods",
      "Thesis Development",
      "Academic Publishing",
      "Conference Presentation",
      "Networking Strategy",
      "Professional Development",
      "Expert Mentoring",
      "Leadership Skills",
      "Industry Insights",
      "Career Transition Planning",
      "Final Project Completion",
      "Success Consolidation",
    ],
  },
  "UPSC-CSE": {
    "11": [
      "Current Affairs - Weekly Read",
      "History - Medieval India",
      "Geography - Physical Geography",
      "Polity - Constitutional Basics",
      "Economics - Basic Concepts",
      "General Knowledge - Science",
      "Prelims Strategy Session",
      "Current Events Analysis",
      "Map Practice - India",
      "UPSC Prelims Mock 1",
      "Discipline Building",
      "Goal Setting Session",
    ],
    "12": [
      "Current Affairs - Comprehensive",
      "History - Modern India",
      "Geography - Human Geography",
      "Polity - Governance System",
      "Economics - Microeconomics",
      "International Relations",
      "Prelims Test Series",
      "Essay Writing Practice",
      "Mains Strategy Development",
      "UPSC Advanced Mock Test",
      "Interview Prep Start",
      "Final Year Strategy",
    ],
    Undergrad: [
      "UPSC Prelims Intensive",
      "Static GK Consolidation",
      "Current Affairs Update",
      "Answer Writing Practice",
      "Case Study Analysis",
      "Mains Preparation",
      "Interview Skills Development",
      "Legal & Constitutional Study",
      "Optional Subject Focus",
      "Test Series & Evaluation",
      "Mentorship Session",
      "Confidence Building",
    ],
    Graduate: [
      "Advanced Mains Writing",
      "Optional Subject Mastery",
      "Interview Confidence Building",
      "Personality Development",
      "Ethics & Values Study",
      "Leadership & Management",
      "Civil Service Expectations",
      "Networking with Officers",
      "Final Mock Interviews",
      "Stress & Success Management",
      "Career Trajectory Planning",
      "Success Celebration",
    ],
  },
  Others: {
    "11": [
      "Goal Definition Workshop",
      "Learning Style Assessment",
      "Subject Foundation Review",
      "Time Management Basics",
      "Study Routine Establishment",
      "Resource Collection",
      "First Month Milestone",
      "Progress Tracking Setup",
      "Motivation Techniques",
      "Peer Learning Session",
      "Mentor Connection",
      "Success Planning",
    ],
    "12": [
      "Advanced Goal Setting",
      "Exam Pattern Analysis",
      "Syllabus Mapping",
      "Study Material Review",
      "Mock Test Practice Begins",
      "Weak Areas Identification",
      "Focused Study Plan",
      "Time Optimization",
      "Mock Interview Prep",
      "Final Stretch Planning",
      "Confidence Boost",
      "Victory Preparation",
    ],
    Undergrad: [
      "Specialization Selection",
      "Industry Research",
      "Internship Planning",
      "Project Initiation",
      "Network Building",
      "Skill Enhancement",
      "Leadership Opportunity",
      "Research Interest Exploration",
      "Career Pathway Planning",
      "Final Project Launch",
      "Interview Preparation",
      "Career Launch Readiness",
    ],
    Graduate: [
      "Advanced Learning Plan",
      "Research Direction",
      "Thesis Planning",
      "Industry Engagement",
      "Publishing Strategy",
      "Leadership Development",
      "Networking Expansion",
      "Professional Branding",
      "Career Options Analysis",
      "Expert Collaboration",
      "Final Goal Achievement",
      "Celebration & Reflection",
    ],
  },
};

// Subject mapping for different exams
const subjectMap: Record<string, string[]> = {
  JEE: ["Physics", "Chemistry", "Mathematics"],
  NEET: ["Biology", "Chemistry", "Physics"],
  CUET: ["English", "General Knowledge", "Languages"],
  "UPSC-CSE": ["Polity", "History", "Geography"],
  Others: ["General", "Academics", "Skills"],
};

// Priority distribution
const priorities: ("Low" | "Medium" | "High")[] = ["Low", "Medium", "High"];

function getRandomPriority(): "Low" | "Medium" | "High" {
  return priorities[Math.floor(Math.random() * priorities.length)];
}

function getSubject(exam: string, index: number): string {
  const subjects = subjectMap[exam] || subjectMap.Others;
  return subjects[index % subjects.length];
}

function generateRandomDueDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(Math.floor(Math.random() * 24), 0, 0, 0);
  return date.toISOString();
}

export function generateOnboardingTasks(
  uid: string,
  classLevel: string,
  targetExam: string
): Omit<Task, "id">[] {
  // Get templates for the exam + class combination
  const templates = taskTemplates[targetExam]?.[classLevel] || taskTemplates.Others.Undergrad;

  // Generate first task with random due date (0-14 days from now)
  const firstTaskDays = Math.floor(Math.random() * 14) + 1; // 1-14 days from now
  let currentDueDate = generateRandomDueDate(firstTaskDays);
  let nextDayGap = 1;

  const tasks: Omit<Task, "id">[] = templates.map((title, index) => {
    const dueDate = currentDueDate;

    // For next task: add 1-day gap + random gap (1-3 days)
    if (index < templates.length - 1) {
      nextDayGap = 1 + Math.floor(Math.random() * 3); // 1-3 additional days
      const nextDate = new Date(currentDueDate);
      nextDate.setDate(nextDate.getDate() + nextDayGap);
      currentDueDate = nextDate.toISOString();
    }

    const subject = getSubject(targetExam, index);

    return {
      uid,
      title,
      subject,
      subTasks: [
        { title: "Read & Understand concepts", done: false },
        { title: "Solve practice problems", done: false },
        { title: "Review & revise", done: false },
      ],
      priority: getRandomPriority(),
      dueDate,
      createdAt: new Date().toISOString(),
      completed: false,
      status: "pending",
      stability: undefined,
      difficulty: undefined,
      retrievability: undefined,
      priorityWeight: undefined,
      lastReviewedAt: null,
      dueAt: null,
      lapses: 0,
    };
  });

  return tasks;
}
