const blockedSites = [
  "*://*.facebook.com/*",
  "*://*.twitter.com/*",
  "*://*.instagram.com/*"
];

let isBlocking = false;
let dashboardUrl = "http://localhost:48752/dashboard"; // Default fallback

// Listen for messages from the web app
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleFocusMode") {
    isBlocking = message.enabled;
    // Update dashboard URL if provided
    if (message.dashboardUrl) {
      dashboardUrl = message.dashboardUrl;
    }
    updateBlockingRules(isBlocking);
    sendResponse({ success: true, enabled: isBlocking });
  } else if (message.action === "getFocusMode") {
    sendResponse({ enabled: isBlocking });
  } else if (message.action === "setDashboardUrl") {
    dashboardUrl = message.url;
    sendResponse({ success: true, url: dashboardUrl });
  }
});

// Listen for messages from content scripts or external sources
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleFocusMode") {
    isBlocking = message.enabled;
    updateBlockingRules(isBlocking);
    sendResponse({ success: true, enabled: isBlocking });
  } else if (message.action === "getFocusMode") {
    sendResponse({ enabled: isBlocking });
  }
});

function updateBlockingRules(shouldBlock) {
  if (shouldBlock) {
    // Add redirect rules instead of blocking
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: "redirect",
            redirect: { url: dashboardUrl }
          },
          condition: {
            urlFilter: "*",
            domains: ["facebook.com", "twitter.com", "instagram.com", "x.com"]
          }
        }
      ]
    });
  } else {
    // Remove redirect rules
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1]
    });
  }
}
