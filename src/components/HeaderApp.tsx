"use client";

import React, { useState, useEffect } from 'react';
import { MoreHorizontal } from "lucide-react";
import { FaInbox } from 'react-icons/fa';
import dynamic from "next/dynamic";
import { useStreakStore } from "@/store/useStreakStore";
import { fetchStreakFromFirestore } from "@/lib/fetchStreak";
import { FaFire } from "react-icons/fa";
import { FaRegBell } from 'react-icons/fa6';
import BirthdayWish from './BirthdayCountdown';
import BirthdayCountdown from './BirthdayCountdown';

const PomodoroModal = dynamic(() => import("@/components/PomodoroModal"), {
  ssr: false,
});

export default function Header() {
  const [focusMode, setFocusMode] = useState(false);
  const [extensionAvailable, setExtensionAvailable] = useState(false);

  const EXTENSION_ID = "ocpcngmbjpchcobdemmlkibmlnlhgpbi";
const { streak, longestStreak } = useStreakStore();

  useEffect(() => {
    fetchStreakFromFirestore();
  }, []);
  useEffect(() => {
    checkExtensionStatus();
  }, []);

  useEffect(() => {
    const enterFullscreen = async () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
    };

    const exitFullscreen = async () => {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    };

    if (focusMode) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [focusMode]);

  const checkExtensionStatus = async () => {
    try {
      if (typeof window === 'undefined') {
        setExtensionAvailable(false);
        return;
      }

      const event = new CustomEvent('getFocusMode');
      window.dispatchEvent(event);

      const handleResponse = (event: any) => {
        if (event.detail && event.detail.action === 'focusModeStatus') {
          setExtensionAvailable(true);
          setFocusMode(event.detail.enabled);
          window.removeEventListener('extensionResponse', handleResponse);
        }
      };
      window.addEventListener('extensionResponse', handleResponse);

      setTimeout(() => {
        window.removeEventListener('extensionResponse', handleResponse);

        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          try {
            chrome.runtime.sendMessage(EXTENSION_ID, { action: "getFocusMode" }, (response) => {
              if (chrome.runtime.lastError) {
                console.log("Extension not available via Chrome API:", chrome.runtime.lastError.message);
                setExtensionAvailable(false);
              } else if (response) {
                setExtensionAvailable(true);
                setFocusMode(response.enabled);
              }
            });
          } catch (chromeError) {
            console.log("Chrome API not available:", chromeError);
            setExtensionAvailable(false);
          }
        } else {
          setExtensionAvailable(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error checking extension status:", error);
      setExtensionAvailable(false);
    }
  };

  const toggleFocusMode = async () => {
    const newFocusMode = !focusMode;
    const dashboardUrl = `${window.location.origin}/dashboard`;

    try {
      sendMessageViaContentScript(newFocusMode);

      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          chrome.runtime.sendMessage(
            EXTENSION_ID,
            {
              action: "toggleFocusMode",
              enabled: newFocusMode,
              dashboardUrl: dashboardUrl,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.log("Extension communication via Chrome API failed:", chrome.runtime.lastError.message);
              } else if (response && response.success) {
                setFocusMode(newFocusMode);
              }
            }
          );
        } catch (chromeError) {
          console.log("Chrome API error:", chromeError);
        }
      }
    } catch (error) {
      console.error("Error toggling focus mode:", error);
      setFocusMode(newFocusMode);
    }
  };

  const sendMessageViaContentScript = (enabled: boolean) => {
    const event = new CustomEvent('toggleFocusMode', {
      detail: { enabled },
    });
    window.dispatchEvent(event);

    const handleConfirmation = (event: any) => {
      if (event.detail && event.detail.action === 'focusModeToggled') {
        setFocusMode(enabled);
        window.removeEventListener('extensionResponse', handleConfirmation);
      }
    };
    window.addEventListener('extensionResponse', handleConfirmation);

    setTimeout(() => {
      window.removeEventListener('extensionResponse', handleConfirmation);
      setFocusMode(enabled);
    }, 1000);
  };

return (
  <div id="focus-root">
    <header className="w-full px-6 py-4 bg-transparent text-white flex items-center justify-between">
      {/* Left: Logo */}
      <h1
  className="
    text-xl               /* smaller text for mobile */
    md:text-xl            /* normal size for desktop */
    font-bold tracking-tight
    ml-12 md:ml-0  
    py-2 md:py-0        /* move right on mobile, normal on desktop */
  "
>
  EXAM CONNECT
</h1>

 {/* Center: Birthday Message */}
  <BirthdayCountdown targetDate="2026-02-06T00:00:00" />
  
      {/* Right: Focus Mode Toggle */}
      <div className="flex items-center gap-3 ">

        <div className="flex items-center gap-1 md:gap-2">
          <FaFire className="text-xl text-orange-400" />
          <span>{streak}</span>
        </div>
        {/* inbox icon */}
        <button className="hidden sm:block p-2 rounded-full hover:bg-white/20 transition">
          <FaRegBell size={20} />
        </button>

        <span className=" hidden sm:block text-sm">Focus Mode</span>

        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={focusMode}
              onChange={toggleFocusMode}
            />
            <div
              className={`w-11 h-6 rounded-full peer transition-all duration-300 ${
                focusMode ? "bg-green-500" : "bg-gray-500"
              }`}
            ></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition-transform duration-300"></div>
          </label>
          {!extensionAvailable && (
           <span
  className="hidden sm:inline text-xs text-yellow-400"
  title="Extension not detected"
>
  Install Extension ⚠️
</span>

          )}
        </div>

        {/* Three Dots Icon */}
        <button className="hidden sm:block p-2 rounded-full hover:bg-white/20 transition">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </header>

    {/* Pomodoro Modal Fullscreen Overlay */}
    {focusMode && <PomodoroModal onClose={toggleFocusMode} />}
  </div>
);
}