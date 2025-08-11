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
      <div className="fixed top-0 left-0 h-screen z-20">
        <Sidebar />
      </div>

      {/* Main */}
      <div
        className={`flex flex-col  bg-[#202020] flex-1 transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}
      >
        <div className="sticky top-0 z-10">
          <HeaderApp />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 translate-y-[-1rem] ">
          <Tabs defaultValue="basic" className="w-full flex flex-col items-center">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Sleep</TabsTrigger>
              <TabsTrigger value="advanced">Health</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Column 1: Sleep Score and Bedtime Reminders */}
                <div className="flex flex-col gap-4">
                  {/* Sleep Score */}
                  <Card className="bg-transparent h-full backdrop-blur-xl text-white border-none  flex items-center shadow-none justify-center">
                    <SleepScoreCard sleepDuration={sleepDuration} />
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
                      <CardHeader>
                        <CardTitle className="text-base">🔔 Reminder Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">Reminder is ON and will notify you nightly.</p>
                      </CardContent>
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
  <ScrollArea className="h-72 pr-2 pt-5 hover:scale-105 transition-transform duration-200">
    <div className="flex flex-col gap-3">
      {[
        {
          img: "/tips/img1.png",
          text: "Avoid screens 1 hour before sleep",
        },
        {
          img: "/tips/coolroom.jpg",
          text: "Keep room cool and dark",
        },
        {
          img: "/tips/schedule.jpg",
          text: "Follow a consistent schedule",
        },
        {
          img: "/tips/caffeine.jpg",
          text: "Avoid caffeine after 4 PM",
        },
        {
          img: "/tips/stretch.jpg",
          text: "Try gentle stretches before bed",
        },
        {
          img: "/tips/meditate.jpg",
          text: "Meditate for 5 minutes",
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
            className="w-full h-auto object-cover transform transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay text with shadow-from-below */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
            <p className="text-white text-sm">{tip.text}</p>
          </div>
        </div>
      ))}
    </div>
  </ScrollArea>
</CardContent>

                  </Card>
                </div>

                {/* Column 3: Sleep Streak (tall card) */}
                <Card className="backdrop-blur-xl bg-transparent border-none text-white h-full">
                  <SleepStreakCard />
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="w-full">
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-xl font-medium">
    🚧 Health feature is under development.
  </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Music Player */}
        <MusicPlayer />
      </div>
    </div>
  );
}
