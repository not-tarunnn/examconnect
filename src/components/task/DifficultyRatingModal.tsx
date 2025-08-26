"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

type DifficultyRatingModalProps = {
  open: boolean;
  onCloseAction: () => void;
  onSubmitAction: (rating: number) => void;
  taskTitle: string;
  existingRating?: number;
};

export default function DifficultyRatingModal({
  open,
  onCloseAction,
  onSubmitAction,
  taskTitle,
  existingRating,
}: DifficultyRatingModalProps) {
  const [rating, setRating] = useState<number>(existingRating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  // Update rating when existingRating changes (modal opens with different task)
  useEffect(() => {
    setRating(existingRating || 0);
  }, [existingRating]);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmitAction(rating);
      setRating(existingRating || 0);
      setHoveredRating(0);
      onCloseAction();
    }
  };

  const handleClose = () => {
    // Only allow closing if a rating has been submitted
    if (rating > 0) {
      setRating(existingRating || 0);
      setHoveredRating(0);
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
            "{taskTitle}"
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
