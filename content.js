// Content script for auto-login functionality
(function () {
    'use strict';

    // Function to get stored credentials
    function getStoredCredentials() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['username', 'password', 'autoSubmit', 'autoCloseTab'], (result) => {
                resolve({
                    username: result.username || '',
                    password: result.password || '',
                    autoSubmit: result.autoSubmit !== false, // default to true
                    autoCloseTab: result.autoCloseTab !== false // default to true
                });
            });
        });
    }

    // Function to check for successful login and close tab if needed
    async function checkForSuccessfulLogin() {
        const currentUrl = window.location.href;

        // Check if we're on the keepalive page (indicates successful login)
        if (currentUrl.includes('192.168.249.1:1000/keepalive')) {
            console.log('Auto Login: Detected keepalive page - login successful');

            // Look for logout button or other success indicators
            const logoutButton = document.querySelector('a[href*="logout"]') ||
                document.querySelector('input[value*="logout"]') ||
                document.querySelector('input[value*="Logout"]') ||
                document.querySelector('button[type="submit"]') ||
                document.querySelector('input[type="submit"]') ||
                document.querySelector('form[action*="logout"]') ||
                document.querySelector('a[onclick*="logout"]');

            // Also check if we're definitely on the keepalive page (indicates success)
            const isKeepaliveSuccess = currentUrl.includes('keepalive') &&
                (logoutButton || document.body.innerText.includes('keep') || document.body.innerText.includes('alive'));

            if (logoutButton || isKeepaliveSuccess) {
                console.log('Auto Login: Confirmed successful login on keepalive page');

                const credentials = await getStoredCredentials();
                if (credentials.autoCloseTab) {
                    console.log('Auto Login: Auto-closing tab after successful login');

                    // Send message to background script to close the tab
                    // Show a popup indicating the tab will close soon
                    let popupDiv = document.createElement('div');
                    popupDiv.style.position = 'fixed';
                    popupDiv.style.top = '20px';
                    popupDiv.style.right = '20px';
                    popupDiv.style.zIndex = '99999';
                    popupDiv.style.background = '#222';
                    popupDiv.style.color = '#fff';
                    popupDiv.style.padding = '16px 24px';
                    popupDiv.style.borderRadius = '8px';
                    popupDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                    popupDiv.style.fontSize = '18px';
                    popupDiv.style.fontFamily = 'sans-serif';
                    popupDiv.textContent = 'Closing this tab';
                    document.body.appendChild(popupDiv);

                    setTimeout(() => {
                        popupDiv.remove();
                        chrome.runtime.sendMessage({ action: 'closeTab' }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error('Auto Login: Error sending close tab message:', chrome.runtime.lastError);
                                window.close();
                            } else if (response && response.success) {
                                console.log('Auto Login: Tab closed successfully');
                            } else {
                                console.error('Auto Login: Failed to close tab:', response?.error);
                                window.close();
                            }
                        });
                    }, 500);
                }
            } else {
                // If no success indicators found, wait a bit and try again (max 3 attempts)
                const attempts = checkForSuccessfulLogin.attempts || 0;
                if (attempts < 3) {
                    checkForSuccessfulLogin.attempts = attempts + 1;
                    console.log(`Auto Login: Success indicators not found, retrying (${attempts + 1}/3)...`);
                    setTimeout(checkForSuccessfulLogin, 2000);
                } else {
                    console.log('Auto Login: Max attempts reached, assuming login was successful');
                    // Auto-close anyway if we're on keepalive page after max attempts
                    const credentials = await getStoredCredentials();
                    if (credentials.autoCloseTab) {
                        setTimeout(() => {
                            chrome.runtime.sendMessage({ action: 'closeTab' }, (response) => {
                                if (chrome.runtime.lastError || !response?.success) {
                                    window.close();
                                }
                            });
                        }, 1000);
                    }
                }
            }
        }
    }

    // Function to fill login form
    async function fillLoginForm() {
        // Check if we're on the correct login page
        const currentUrl = window.location.href;
        if (!currentUrl.includes('192.168.249.1:1000/login') && !currentUrl.includes('192.168.249.1:1000/fgtauth')) {
            return;
        }

        // Get stored credentials
        const credentials = await getStoredCredentials();

        if (!credentials.username || !credentials.password) {
            console.log('Auto Login: No credentials stored');
            return;
        }

        // Find the form elements
        const usernameField = document.querySelector('input[name="username"]') || document.getElementById('ft_un');
        const passwordField = document.querySelector('input[name="password"]') || document.getElementById('ft_pd');
        const submitButton = document.querySelector('input[type="submit"]');

        if (usernameField && passwordField) {
            console.log('Auto Login: Filling credentials');

            // Fill the username field
            usernameField.value = credentials.username;
            usernameField.dispatchEvent(new Event('input', { bubbles: true }));
            usernameField.dispatchEvent(new Event('change', { bubbles: true }));

            // Fill the password field
            passwordField.value = credentials.password;
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordField.dispatchEvent(new Event('change', { bubbles: true }));

            // Auto-submit if enabled
            if (credentials.autoSubmit && submitButton) {
                console.log('Auto Login: Auto-submitting form');
                setTimeout(() => {
                    submitButton.click();
                }, 500); // Small delay to ensure form is properly filled
            }
        } else {
            console.log('Auto Login: Login form elements not found');
        }
    }

    // Function to observe DOM changes (in case the form loads dynamically)
    function observeFormChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const usernameField = document.querySelector('input[name="username"]') || document.getElementById('ft_un');
                    if (usernameField && !usernameField.value) {
                        fillLoginForm();
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Disconnect observer after 10 seconds to avoid memory leaks
        setTimeout(() => {
            observer.disconnect();
        }, 10000);
    }

    // Initialize based on current page
    function initializeExtension() {
        const currentUrl = window.location.href;

        if (currentUrl.includes('192.168.249.1:1000/login') || currentUrl.includes('192.168.249.1:1000/fgtauth')) {
            // On login page - fill form
            setTimeout(fillLoginForm, 100);
            observeFormChanges();
        } else if (currentUrl.includes('192.168.249.1:1000/keepalive')) {
            // On keepalive page - check for successful login
            setTimeout(checkForSuccessfulLogin, 500);
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
        initializeExtension();
    }

    // Also initialize when page becomes visible (in case of navigation)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(initializeExtension, 100);
        }
    });

})();
