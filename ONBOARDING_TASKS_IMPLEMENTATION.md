# Automatic Onboarding Task Generation

## Overview
When users complete the 3-step signup flow and accept the user agreement (Step 3), a set of 10-12 study tasks are automatically generated and saved to their Firebase account. These tasks are:
- **Exam-specific**: Customized based on the exam they chose (JEE, NEET, CUET, UPSC-CSE, or Others)
- **Level-aware**: Adjusted for their academic level (Class 11, 12, Undergrad, Graduate)
- **Intelligently scheduled**: Due dates automatically spread across 3-4 weeks with 1-3 day gaps
- **User-independent**: Each user gets their own separate task set maintained in Firebase

## Files Modified/Created

### New Files
1. **`src/lib/generateOnboardingTasks.ts`** (378 lines)
   - Core utility function `generateOnboardingTasks(uid, classLevel, targetExam)`
   - Exam-specific task templates for: JEE, NEET, CUET, UPSC-CSE, Others
   - Intelligent due date algorithm with random first date and gap spacing
   - Returns array of 10-12 Task objects ready for Firebase

2. **`src/lib/generateOnboardingTasks.demo.ts`**
   - Example demonstrations showing task output for different combinations
   - Documentation of features and how it integrates

### Modified Files
1. **`src/app/signup/step3/page.tsx`**
   - Added imports: `generateOnboardingTasks`, `collection`, `addDoc`
   - Updated `handleSubmit()` to call task generation after user doc is saved
   - Tasks created and persisted to Firebase before navigation to /task

## Task Generation Details

### Task Structure
Each generated task follows the existing Task type:
```typescript
{
  uid: string;                    // User ID
  title: string;                  // Exam-specific topic
  subject: string;                // Physics, Chemistry, Biology, etc.
  subTasks: [                     // 3 standard subtasks
    { title: "Read & Understand concepts", done: false },
    { title: "Solve practice problems", done: false },
    { title: "Review & revise", done: false }
  ];
  priority: "Low" | "Medium" | "High";  // Randomized
  dueDate: string;                // ISO format, intelligently spaced
  createdAt: string;              // Task creation timestamp
  completed: false;               // Always false initially
  status: "pending";              // Always pending
  lapses: 0;
}
```

### Due Date Algorithm
1. **First task**: Random due date between 1-14 days from today
2. **Subsequent tasks**: Previous due date + (1-3 day random gap)
3. **Result**: Tasks spread naturally across 3-4 weeks
4. **Repeatable**: Each user gets unique random schedule

### Exam-Specific Content

#### JEE (Class 11/12)
- Physics, Chemistry, Mathematics topics
- Mechanics, Thermodynamics, Atomic Structure, Algebra, Calculus
- 10-12 tasks per class level
- Gradual progression from basics to advanced

#### NEET (Class 11/12)
- Biology, Chemistry, Physics focus
- Cell Structure, Photosynthesis, Organic Chemistry, Electromagnetism
- Human body systems, Genetics, Modern Physics
- Medical exam-aligned content

#### CUET (Class 11/12)
- General Knowledge, English, Languages, Reasoning
- Comprehension, Vocabulary, Current Affairs, Logic
- Essay writing, Literature analysis

#### UPSC-CSE (Class 12/Undergrad/Grad)
- Polity, History, Geography, Economics
- Current Affairs, Constitutional Studies
- Mains and interview preparation focus

#### Others
- Generic progression-based tasks
- Applicable to any exam/course
- Goal definition, study setup, milestone tracking

## Firebase Structure

### Collection: `tasks`
```
tasks/
├── {taskId1}
│   ├── uid: "user123"
│   ├── title: "Physics - Mechanics & Motion"
│   ├── subject: "Physics"
│   ├── dueDate: "2025-09-15T14:30:00Z"
│   ├── subTasks: [...]
│   ├── priority: "Medium"
│   ├── status: "pending"
│   └── ...
├── {taskId2}
│   └── (another auto-generated task)
└── {taskId3}
    └── (10-12 tasks total per new user)
```

### How It's Stored
- Tasks are stored in the main `tasks` collection (same as manually created tasks)
- Queried by `where("uid", "==", user.uid)`
- User can view, edit, delete, or mark complete like any manual task
- Compatible with SM-18 spaced repetition algorithm

## Integration Flow

```
User completes Step 3 (Agreement page)
    ↓
Clicks "Accept & Continue"
    ↓
handleSubmit() validates agreement checkbox
    ↓
Saves user document to users/{uid}
    ↓
Saves username mapping
    ↓
Saves agreement metadata
    ↓
generateOnboardingTasks() creates 10-12 tasks
    ↓
All tasks added to tasks collection via addDoc()
    ↓
Navigation to /task dashboard
    ↓
User sees populated task list with generated tasks
```

## Key Features

✅ **Automatic**: No user action needed, happens on signup completion
✅ **Intelligent Scheduling**: Due dates spread with realistic gaps
✅ **Customized**: Different tasks for different exams/levels
✅ **Independent**: Each user gets unique task set
✅ **Compatible**: Uses same Task type as existing system
✅ **Flexible**: Works with SM-18 algorithm if implemented
✅ **Maintainable**: Users can edit/delete generated tasks like any other

## Testing

To test the implementation:
1. Go through signup flow: `/signup` → Step 1 → Step 2 → Step 3
2. On Step 2, select a class (e.g., "12") and exam (e.g., "JEE")
3. Complete Step 3 by accepting the agreement
4. After redirect to `/task`, you should see 10-12 exam-specific tasks
5. Due dates should be spread across 3-4 weeks

Example combinations to test:
- JEE + Class 11
- NEET + Class 12
- CUET + Undergrad
- UPSC-CSE + Graduate

## Future Enhancements

Possible improvements:
- Add task templates in Firebase (centralized, easy to update)
- Allow customization of task generation from admin panel
- Add personalization based on weak areas
- Integrate with study time estimates
- Add automatic reminders based on due dates
