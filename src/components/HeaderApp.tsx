import React, { useState, useEffect } from 'react';
import { MoreHorizontal } from "lucide-react";
import { FaInbox } from 'react-icons/fa';

export default function Header() {
  const [focusMode, setFocusMode] = useState(false);
  const [extensionAvailable, setExtensionAvailable] = useState(false);

  // Extension ID - you'll need to replace this with your actual extension ID after installation
  const EXTENSION_ID = "ocpcngmbjpchcobdemmlkibmlnlhgpbi";

  useEffect(() => {
    // Check if extension is available and get current state
    checkExtensionStatus();
  }, []);

  const checkExtensionStatus = async () => {
    try {
      // Check if we're in a browser environment and chrome APIs are available
      if (typeof window === 'undefined') {
        setExtensionAvailable(false);
        return;
      }

      // First try content script communication (more reliable for web apps)
      const event = new CustomEvent('getFocusMode');
      window.dispatchEvent(event);

      // Listen for response
      const handleResponse = (event: any) => {
        if (event.detail && event.detail.action === 'focusModeStatus') {
          setExtensionAvailable(true);
          setFocusMode(event.detail.enabled);
          window.removeEventListener('extensionResponse', handleResponse);
        }
      };
      window.addEventListener('extensionResponse', handleResponse);

      // Remove listener after timeout
      setTimeout(() => {
        window.removeEventListener('extensionResponse', handleResponse);

        // If no response from content script, try direct Chrome API (if available)
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
      // Always try content script first (more reliable for web apps)
      sendMessageViaContentScript(newFocusMode);

      // Also try Chrome API if available as backup
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          chrome.runtime.sendMessage(EXTENSION_ID, {
            action: "toggleFocusMode",
            enabled: newFocusMode,
            dashboardUrl: dashboardUrl
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.log("Extension communication via Chrome API failed:", chrome.runtime.lastError.message);
            } else if (response && response.success) {
              setFocusMode(newFocusMode);
            }
          });
        } catch (chromeError) {
          console.log("Chrome API error:", chromeError);
        }
      }
    } catch (error) {
      console.error("Error toggling focus mode:", error);
      // Update local state anyway for UI feedback
      setFocusMode(newFocusMode);
    }
  };

  const sendMessageViaContentScript = (enabled: boolean) => {
    // Dispatch custom event for content script to catch
    const event = new CustomEvent('toggleFocusMode', {
      detail: { enabled }
    });
    window.dispatchEvent(event);

    // Listen for confirmation
    const handleConfirmation = (event: any) => {
      if (event.detail && event.detail.action === 'focusModeToggled') {
        setFocusMode(enabled);
        window.removeEventListener('extensionResponse', handleConfirmation);
      }
    };
    window.addEventListener('extensionResponse', handleConfirmation);

    // Remove listener after timeout and update local state
    setTimeout(() => {
      window.removeEventListener('extensionResponse', handleConfirmation);
      setFocusMode(enabled);
    }, 1000);
  };

  return (
    <header className="w-full px-6 py-4 bg-transparent  text-white flex items-center justify-between ">
      {/* Left: Logo */}
      <h1 className="text-xl font-bold tracking-tight">EXAM CONNECT</h1>

      {/* Right: Focus Mode Toggle */}
      <div className="flex items-center gap-3">
        {/* inbox icon */}
        <button className="p-2 rounded-full hover:bg-white/20 transition">
          <FaInbox size={20} />
        </button>
        <span className="text-sm">Focus Mode</span>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={focusMode}
              onChange={toggleFocusMode}
            />
            <div className={`w-11 h-6 rounded-full peer transition-all duration-300 ${
              focusMode ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition-transform duration-300"></div>
          </label>
          {!extensionAvailable && (
            <span className="text-xs text-yellow-400" title="Extension not detected">Install Extension ⚠️</span>
          )}
        </div>
        {/* Three Dots Icon */}
        <button className="p-2 rounded-full hover:bg-white/20 transition">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </header>
  );
}
