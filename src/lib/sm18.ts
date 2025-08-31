import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Task } from "@/types/task"; // Assuming Task type is defined with stability and retrievability

interface SM18Params {
  alpha: number;
  beta: number;
  gamma: number;
  stability: number;  // Stability (S) from Task type
  D: number;          // Damping factor
  retrievability: number;  // Retrievability (R) from Task type
  Rtarget: number;    // Target retrievability
  t: number;          // Time variable
  taskId: string;     // Task ID for Firestore update
}

// 🔹 Priority → Retrievability & Rtarget mapping
const priorityMap: Record<string, number> = {
  Low: 0.8,
  Medium: 0.85,
  High: 0.9,
};

class SM18 {
  private alpha: number;
  private beta: number;
  private gamma: number;
  private stability: number;
  private D: number;
  private retrievability: number;
  private Rtarget: number;
  private t: number;
  private taskId: string;

  constructor(params: SM18Params) {
    this.alpha = params.alpha;
    this.beta = params.beta;
    this.gamma = 1;  // Fixed at 1
    this.stability = params.stability;  // Stability (S) from Task
    this.D = params.D;
    this.retrievability = params.retrievability;  // Retrievability (R) from Task
    this.Rtarget = params.Rtarget;
    this.t = params.t;
    this.taskId = params.taskId;
  }

  rDecay(): number {
    return Math.exp(-this.t / this.stability);  // Using stability field
  }

  updateSOnSuccess(): number {
    // Update stability (S) based on the success of the task
    this.stability =
      this.stability *
      (1 + (1 - this.D) * this.alpha * Math.pow(this.retrievability, this.gamma));
    return this.stability;
  }

  updateSOnFailure(): number {
    // Update stability (S) when the task fails
    this.stability =
      this.stability *
      (1 - this.beta * (1 - this.retrievability)); // Using retrievability (R) from Task
    return this.stability;
  }

    // Calculate the interval as -S * ln(Rtarget)
  calculateInterval(): number {
    const interval = -this.stability * Math.log(this.Rtarget);  // Using stability (S) from Task
    return interval;
  }

  // Calculate new due date based on the interval
  calculateDueDate(interval: number): string {
    const intervalInMillis = interval * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    const newDueDate = new Date().getTime() + intervalInMillis; // Add interval to current time

    // Format as YYYY-MM-DD
    return new Date(newDueDate).toISOString().split("T")[0];
  }

  // Update Firestore task with new values
  async updateFirestoreTask(task: Task, interval: number): Promise<void> {
    try {
      // Calculate new values
      const newStability = this.updateSOnSuccess(); // Or updateSOnFailure() based on result
      const newDueDate = this.calculateDueDate(interval); // Calculate the new due date

      // Update Firestore document with the new values
      const taskRef = doc(db, "tasks", this.taskId);
      await updateDoc(taskRef, {
        stability: newStability, // Updated stability (S)
        dueDate: newDueDate, // Updated due date
        interval: interval, // Store the interval as well
        retrievability: this.retrievability, // Keep retrievability updated
      });
      console.log("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  // Static method to apply SM18 algorithm to a task
// inside applySM18Algorithm
static async applySM18Algorithm(taskId: string, rating: number): Promise<void> {
  try {
    const taskRef = doc(db, "tasks", taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      console.error("Task not found!");
      return;
    }

    const task = taskDoc.data() as Task;

    // 🔹 Ensure stability exists
    if (task.stability === undefined) {
      task.stability = 7;
      await updateDoc(taskRef, { stability: task.stability });
    }

    // 🔹 Initialize retrievability if missing
    if (task.retrievability === undefined) {
      const initialRetrievability = priorityMap[task.priority] ?? 0.85;
      await updateDoc(taskRef, { retrievability: initialRetrievability });
      task.retrievability = initialRetrievability;
    }

    // 🔹 Map Firestore priority to Rtarget
    const Rtarget = priorityMap[task.priority] ?? 0.85;

    // 🔹 Calculate `t` (days since last dueDate)
    let t = 0;
    if (task.dueDate) {
      const lastDueDate = new Date(task.dueDate);
      const now = new Date();
      const diffMs = now.getTime() - lastDueDate.getTime();
      t = diffMs / (1000 * 60 * 60 * 24); // convert ms → days
      if (t < 0) t = 0; // safeguard (future due dates)
    }

    const params = {
      alpha: 0.5,
      beta: 0.3,
      gamma: 1,
      stability: task.stability,
      D: 0.1,
      t,
      taskId,
      retrievability: task.retrievability,
      Rtarget,
    };

    const sm18 = new SM18(params);

    // 1️⃣ Recalculate retrievability from t and stability
    const newRetrievability = sm18.rDecay();

    // 2️⃣ Update stability based on success/failure
    let newStability: number;
    if (rating >= 3) {
      newStability = sm18.updateSOnSuccess();
    } else {
      newStability = sm18.updateSOnFailure();
    }

    // 3️⃣ Recalculate interval & dueDate using *new* stability
    const interval = -newStability * Math.log(Rtarget);
    const newDueDate = sm18.calculateDueDate(interval);

    // 4️⃣ Update Firestore
    await updateDoc(taskRef, {
      retrievability: newRetrievability,
      stability: newStability,
      interval,
      dueDate: newDueDate,
    });

    console.log("Task updated successfully with t =", t);
  } catch (error) {
    console.error("Error applying SM18 algorithm:", error);
  }
}
}

export default SM18;
