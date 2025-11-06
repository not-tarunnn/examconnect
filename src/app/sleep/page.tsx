"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import MusicPlayer from "@/components/sleep/MusicPlayer";
import { useSidebarStore } from "@/store/useSidebarStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import SleepScoreCard from "@/components/sleep/SleepScoreCard";
import SleepStreakCard from "@/components/sleep/SleepStreakCard";
import SleepDataCard from "@/components/sleep/SleepDataCard";
import { CustomTimePicker } from "@/components/ui/custom-time-picker";
import { FaBell } from "react-icons/fa6";
import { FaVolumeUp } from "react-icons/fa";
import SleepTracker from "@/components/sleep/SleepTracker";


export default function SleepPage() {
  const { collapsed } = useSidebarStore();
  const [sleepDuration] = useState(6.5); // in hours, mock
  const sleepScore = Math.min(100, Math.floor((sleepDuration / 8) * 100));
  const [time, setTime] = useState<Date | null>(new Date()); // ✅ default as Date
 const [isBellActive, setIsBellActive] = useState(false);
  const [isSpeakerActive, setIsSpeakerActive] = useState(false);
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed sm:relative top-0 left-0 h-screen z-50">
        <Sidebar />
      </div>

      {/* Main */}
      <div
        className={`flex flex-col  bg-[#202020] flex-1 transition-all duration-300 pl-0 sm:pl-0 `}
      >
        <div className="sticky top-0 z-10">
          <HeaderApp />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 translate-y-[-1rem] ">
          <Tabs defaultValue="basic" className="w-full flex flex-col items-center">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Sleep</TabsTrigger>
              {/* <TabsTrigger value="advanced">Health</TabsTrigger> */}
            </TabsList>

            <TabsContent value="basic" className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Column 1: Sleep Score and Bedtime Reminders */}
                <div className="flex flex-col gap-4">
                  {/* Sleep Score */}
                  <Card className="bg-transparent h-full backdrop-blur-xl text-white border-none  flex items-center shadow-none justify-center">
                    <SleepScoreCard/>
                  </Card>

                  {/* Bedtime Reminders Side-by-Side */}
                  <div className="flex gap-4">
                   
                    {/* Bedtime Reminder Part 1 */}

                <Card className="backdrop-blur-xl bg-black/30 border-none text-white w-full sm:w-1/2  h-full">
                  <CardContent className="flex flex-col gap-4 items-center pt-4">

                   {/* Top: Two Square Buttons */}
 <div className="flex w-full gap-4">
      

      {/* Speaker Button */}
      <div
        onClick={() => setIsSpeakerActive(!isSpeakerActive)}
        className={`aspect-square w-1/2 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 backdrop-blur-xl ${
          isSpeakerActive ? "bg-blue-500" : "bg-white/30 hover:bg-white/60"
        }`}
      >
        <FaVolumeUp className="text-white text-3xl" />  
      </div>

      {/* Bell Button */}
      <div
        onClick={() => setIsBellActive(!isBellActive)}
        className={`aspect-square w-1/2 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 backdrop-blur-xl ${
          isBellActive ? "bg-green-500" : "bg-white/30 hover:bg-white/60"
        }`}
      >
        <FaBell className="text-white text-3xl" />
      </div>
    </div>
                    {/* Bottom: 2:1 Time Setter */}
       
          <CustomTimePicker value={time} onChangeAction={setTime} />
        

                  </CardContent>
                </Card>


                    {/* Bedtime Reminder Part 2 */}
                    <Card className="backdrop-blur-xl bg-black/30 border-none text-white w-1/2 hover:scale-105 transition-transform h-full duration-200">
                      <SleepTracker/>
                    </Card>
                  </div>
                </div>

                {/* Column 2: Google Fit and Hygiene Tips */}
                <div className="flex flex-col gap-4">
                  {/* Google Fit Integration */}
                  <Card className="backdrop-blur-xl bg-transparent border-none h-full text-white h-30 hover:scale-105 transition-transform duration-200">
                    <SleepDataCard />
                  </Card>

                  {/* Bedtime Hygiene Tips */}
                  <Card className="backdrop-blur-xl bg-black/30 border-none text-white  h-full ">
                    <CardContent>
  <ScrollArea className="h-[17.9rem] pr-2 pt-5 ">
    <div className="flex flex-col gap-3 ">
      {[
        {
          img: "/tips/img1.webp",
          text: "Avoid screens 1 hour before sleep",
          desc: [
            "Blue light from screens delays melatonin release.",
            "Helps your brain wind down for rest.",
            "Reduces overstimulation from social media or games."
          ],
        },
        {
          img: "/tips/img2.webp",
          text: "Follow a consistent schedule",
          desc: [
            "Trains your body’s internal clock (circadian rhythm).",
            "Improves sleep quality over time.",
            "Easier to fall asleep and wake up naturally."
          ],
        },
        {
          img: "/tips/img3.webp",
          text: "Avoid caffeine after 4 PM",
          desc: [
            "Caffeine stays in your system for 6–8 hours.",
            "Prevents restlessness and difficulty falling asleep.",
            "Switch to herbal teas or water in the evening."
          ],
        },
        {
          img: "/tips/img5.webp",  
          text: "Keep room cool and dark",
          desc: [
            "Cool temperatures (18–20°C) help trigger sleep.",
            "Darkness signals your body to produce melatonin.",
            "Reduces night-time wake-ups."
          ],
        },
        {
          img: "/tips/img4.webp",
          text: "Try gentle stretches before bed",
          desc: [
            "Relieves muscle tension from the day.",
            "Promotes relaxation and blood flow.",
            "Can reduce nighttime cramps or stiffness."
          ],
        },
        {
          img: "/tips/img6.webp",
          text: "Meditate for 5 minutes",
          desc: [
            "Calms the mind and reduces stress.",
            "Helps slow down racing thoughts.",
            "Encourages a smoother transition to sleep."
          ],
        },
      ].map((tip, i) => (
        <div
          key={i}
          className="relative group w-full overflow-hidden rounded-lg shadow-lg"
        >
          {/* Image */}
          <img
            src={tip.img}
            alt={tip.text}
            className="w-full h-auto object-cover transform transition-transform duration-300 group-hover:scale-110"
          />

          {/* Overlay text */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
            <p className="text-white text-md font-bold">{tip.text}</p>
            <ul className="text-white text-sm mt-1 list-disc list-inside space-y-1">
              {tip.desc.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </ScrollArea>
</CardContent>


                  </Card>
                </div>

                {/* Column 3: Sleep Streak (tall card) */}
                <Card className="backdrop-blur-xl bg-transparent border-none text-white h-full pb-40 sm:pb-0">
                  <SleepStreakCard />
                </Card>
              </div>
            </TabsContent>

            {/* <TabsContent value="advanced" className="w-full">
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-xl font-medium">
    🚧 Health feature is under development.
  </div>
            </TabsContent> */}
          </Tabs>
        </div>

        {/* Music Player */}
        <MusicPlayer />
      </div>
    </div>
  );
}
