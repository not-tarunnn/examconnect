import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { db } from "@/lib/firebase"; // Assuming you're using Firebase for Firestore
import { doc, updateDoc, getDoc } from "firebase/firestore"; // Firebase Firestore methods
import SM18 from "@/lib/sm18";  // Import your SM18 algorithm

type DifficultyRatingModalProps = {
  open: boolean;
  onCloseAction: () => void;
  onSubmitAction: (rating: number, priority: string) => void;
  taskTitle: string;
  existingRating?: number;
  taskId: string; // Pass the taskId to update the priority in Firestore
};

export default function DifficultyRatingModal({
  open,
  onCloseAction,
  onSubmitAction,
  taskTitle,
  existingRating,
  taskId,
}: DifficultyRatingModalProps) {
  // Initialize states
  const [rating, setRating] = useState<number>(existingRating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [priority, setPriority] = useState<string>("Medium"); // Default priority

  // Ensure that existingRating is properly updated when modal is opened
  useEffect(() => {
    setRating(existingRating || 0);
  }, [existingRating]);

  // Handle submit for difficulty rating and call SM18 algorithm
  const handleSubmit = async () => {
    if (rating > 0) {
      // Check that taskId is provided before proceeding
      if (!taskId) {
        console.error("No taskId provided!");
        return;
      }

      // Call the SM18 algorithm to apply it to the task
      try {
        await SM18.applySM18Algorithm(taskId, rating);

        // Fetch the current task to get its subtasks
        const taskRef = doc(db, "tasks", taskId);
        const taskSnapshot = await getDoc(taskRef);
        const currentTask = taskSnapshot.data();

        // Reset all subtasks to done: false
        const resetSubTasks = currentTask?.subTasks?.map((subTask: any) => ({
          ...subTask,
          done: false,
        })) || [];

        // Update Firestore task with the new rating, priority, and reset subtasks
        await updateDoc(taskRef, {
          rating: rating,
          priority: priority,
          subTasks: resetSubTasks,
          completed: false,
          status: "pending",
        });

        // Call the parent onSubmitAction function
        onSubmitAction(rating, priority);

        // Reset state
        setRating(existingRating || 0);
        setHoveredRating(0);
        setPriority("Medium"); // Reset priority to default
        onCloseAction(); // Close the modal
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const handleClose = () => {
    if (rating > 0) {
      setRating(existingRating || 0);
      setHoveredRating(0);
      setPriority("Medium"); // Reset priority
      onCloseAction();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#202020] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-white">
            {existingRating ? "Update Performance Rating" : "Task Completed! 🎉"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-center text-sm text-gray-300">
            How well did you perform on this task?
          </p>
          
          <p className="text-center font-medium text-sm truncate text-white">
            "{taskTitle || "No task title provided"}"
          </p>
          
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                type="button"
                className="p-1 transition-transform hover:scale-110"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoveredRating(starValue)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Star
                  size={32}
                  className={`transition-colors ${
                    starValue <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          
          <div className="text-center text-xs text-gray-400">
            {rating === 0 && (existingRating ? "Update your performance" : "Please rate your performance")}
            {rating === 1 && "Failed - Need to try again"}
            {rating === 2 && "Struggled - Partial understanding"}
            {rating === 3 && "Challenging - Got it with effort"}
            {rating === 4 && "Good - Performed well"}
            {rating === 5 && "Easy - Mastered it"}
          </div>

          {/* Priority selection dropdown */}
          <div className="text-center">
            <label className="block text-sm text-gray-400">Set Task Priority</label>
            <select
              className="mt-2 bg-[#202020] text-white border border-gray-600 rounded-md p-2"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
