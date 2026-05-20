/**
 * DEMO: Example task generation output for different exam/class combinations
 * 
 * This file shows what tasks are generated for each exam + class combination.
 * Run generateOnboardingTasks() with different exam and class params to see output.
 */

import { generateOnboardingTasks } from "./generateOnboardingTasks";

// Example 1: JEE Class 11 student
console.log("=== JEE Class 11 Student ===");
const jeeClass11Tasks = generateOnboardingTasks("user-id-1", "11", "JEE");
jeeClass11Tasks.forEach((task, idx) => {
  const dueDate = new Date(task.dueDate);
  console.log(`${idx + 1}. ${task.title}`);
  console.log(`   Subject: ${task.subject} | Priority: ${task.priority}`);
  console.log(`   Due: ${dueDate.toLocaleDateString()} | Status: ${task.status}`);
  console.log(`   Subtasks: ${task.subTasks.map((st) => st.title).join(", ")}`);
  console.log();
});

// Example 2: NEET Class 12 student
console.log("\n=== NEET Class 12 Student ===");
const neetClass12Tasks = generateOnboardingTasks("user-id-2", "12", "NEET");
neetClass12Tasks.forEach((task, idx) => {
  const dueDate = new Date(task.dueDate);
  console.log(`${idx + 1}. ${task.title}`);
  console.log(`   Subject: ${task.subject} | Priority: ${task.priority}`);
  console.log(`   Due: ${dueDate.toLocaleDateString()}`);
  console.log();
});

// Example 3: UPSC-CSE Graduate student
console.log("\n=== UPSC-CSE Graduate Student ===");
const upscGradTasks = generateOnboardingTasks("user-id-3", "Graduate", "UPSC-CSE");
upscGradTasks.forEach((task, idx) => {
  const dueDate = new Date(task.dueDate);
  console.log(`${idx + 1}. ${task.title}`);
  console.log(`   Subject: ${task.subject} | Priority: ${task.priority}`);
  console.log(`   Due: ${dueDate.toLocaleDateString()}`);
  console.log();
});

/**
 * KEY FEATURES:
 * 
 * 1. EXAM-SPECIFIC TASKS
 *    - Each exam (JEE, NEET, CUET, UPSC-CSE) has topic-relevant tasks
 *    - Tasks are tailored to the student's class level (11, 12, Undergrad, Graduate)
 * 
 * 2. AUTOMATIC DUE DATE ASSIGNMENT
 *    - First task gets random due date (1-14 days from now)
 *    - Each subsequent task has 1-3 day gap from previous
 *    - Spreads workload across 3-4 weeks automatically
 * 
 * 3. CONSISTENT STRUCTURE
 *    - Each task includes 3 standard subtasks:
 *      * Read & Understand concepts
 *      * Solve practice problems
 *      * Review & revise
 *    - Subjects rotate through exam-relevant fields
 *    - Priorities randomized (Low/Medium/High)
 * 
 * 4. FIREBASE INTEGRATION
 *    - Tasks saved to users/{uid}/tasks collection
 *    - Maintained independently per user
 *    - Same structure as manually created tasks
 *    - Compatible with SM-18 spaced repetition algorithm
 * 
 * 5. EXAMPLE OUTPUT STRUCTURE:
 *    {
 *      uid: "user-123",
 *      title: "Physics - Mechanics & Motion",
 *      subject: "Physics",
 *      priority: "Medium",
 *      dueDate: "2025-09-15T14:30:00.000Z",
 *      createdAt: "2025-09-01T10:00:00.000Z",
 *      completed: false,
 *      status: "pending",
 *      subTasks: [
 *        { title: "Read & Understand concepts", done: false },
 *        { title: "Solve practice problems", done: false },
 *        { title: "Review & revise", done: false }
 *      ],
 *      lapses: 0
 *    }
 * 
 * HOW IT WORKS IN ONBOARDING:
 * 
 * 1. User completes signup step2 (selects class + exam)
 * 2. User accepts agreement on step3
 * 3. step3 handleSubmit() calls generateOnboardingTasks(uid, classLevel, targetExam)
 * 4. Function returns 10-12 tasks with intelligent due date spacing
 * 5. All tasks are saved to Firebase tasks collection
 * 6. User sees populated task list when redirected to /task dashboard
 */
