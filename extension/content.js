// Content script to facilitate communication between web app and extension

// Listen for messages from the web page
window.addEventListener('toggleFocusMode', (event) => {
  const { enabled } = event.detail;
  const dashboardUrl = `${window.location.origin}/dashboard`;

  // Send message to background script
  chrome.runtime.sendMessage({
    action: "toggleFocusMode",
    enabled: enabled,
    dashboardUrl: dashboardUrl
  }, (response) => {
    // Send confirmation back to web page
    const confirmEvent = new CustomEvent('extensionResponse', {
      detail: {
        action: 'focusModeToggled',
        enabled: response.enabled,
        success: response.success
      }
    });
    window.dispatchEvent(confirmEvent);
  });
});

window.addEventListener('getFocusMode', () => {
  // Get current focus mode status
  chrome.runtime.sendMessage({
    action: "getFocusMode"
  }, (response) => {
    // Send status back to web page
    const statusEvent = new CustomEvent('extensionResponse', {
      detail: {
        action: 'focusModeStatus',
        enabled: response.enabled
      }
    });
    window.dispatchEvent(statusEvent);
  });
});

// Notify the page that the extension is available
window.addEventListener('load', () => {
  const extensionAvailableEvent = new CustomEvent('extensionAvailable');
  window.dispatchEvent(extensionAvailableEvent);
});
