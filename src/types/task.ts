export type Task = {
  id: string;
  uid: string;
  title: string;
  subTasks: { title: string; done: boolean }[];
  subject: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  createdAt: string;
  completed: boolean;
  status: "pending" | "completed";
};
