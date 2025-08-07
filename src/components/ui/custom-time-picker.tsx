"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

export function CustomTimePicker({
  value,
  onChangeAction,
}: {
  value: Date | null;
  onChangeAction: (date: Date) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const now = value ?? new Date();

  const [hour, setHour] = React.useState<number>(now.getHours() % 12 || 12);
  const [minute, setMinute] = React.useState<number>(now.getMinutes());
  const [meridian, setMeridian] = React.useState<"AM" | "PM">(
    now.getHours() >= 12 ? "PM" : "AM"
  );

  // Wrap around logic
  const incrementHour = () => setHour((prev) => (prev % 12) + 1);
  const decrementHour = () => setHour((prev) => (prev === 1 ? 12 : prev - 1));

  const incrementMinute = () => setMinute((prev) => (prev + 1) % 60);
  const decrementMinute = () => setMinute((prev) => (prev === 0 ? 59 : prev - 1));

  const toggleMeridian = () => setMeridian((prev) => (prev === "AM" ? "PM" : "AM"));

  const applyTime = () => {
    let h = meridian === "PM" ? (hour % 12) + 12 : hour % 12;
    if (meridian === "AM" && hour === 12) h = 0;
    const updated = set(now, { hours: h, minutes: minute });
    onChangeAction(updated);
    setOpen(false);
  };

  const formatTime = value ? format(value, "h:mm a") : "Pick a time";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(" text-black w-full h-full justify-center text-lg font-medium", !value && "text-muted-foreground")}
        >
          {formatTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-4">
        <div className="flex justify-between items-center gap-4">
          {/* Hour */}
          <div className="flex flex-col items-center space-y-1">
            <Button variant="ghost" size="icon" onClick={incrementHour}>
              <ChevronUp className="w-4 h-4" />
            </Button>
            <div className="text-xl font-medium">{hour}</div>
            <Button variant="ghost" size="icon" onClick={decrementHour}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Minute */}
          <div className="flex flex-col items-center space-y-1">
            <Button variant="ghost" size="icon" onClick={incrementMinute}>
              <ChevronUp className="w-4 h-4" />
            </Button>
            <div className="text-xl font-medium">
              {minute.toString().padStart(2, "0")}
            </div>
            <Button variant="ghost" size="icon" onClick={decrementMinute}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* AM/PM */}
          <div className="flex flex-col items-center space-y-1">
            <Button variant="ghost" size="icon" onClick={toggleMeridian}>
              <ChevronUp className="w-4 h-4" />
            </Button>
            <div className="text-xl font-medium">{meridian}</div>
            <Button variant="ghost" size="icon" onClick={toggleMeridian}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <Button className="w-full" onClick={applyTime}>
            Set Time
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
