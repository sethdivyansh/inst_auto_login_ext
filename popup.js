// Popup script for managing credentials
document.addEventListener('DOMContentLoaded', function () {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const autoSubmitCheckbox = document.getElementById('autoSubmit');
    const autoCloseTabCheckbox = document.getElementById('autoCloseTab');
    const saveButton = document.getElementById('save');
    const clearButton = document.getElementById('clear');
    const statusDiv = document.getElementById('status');

    // Load existing credentials when popup opens
    loadCredentials();

    // Save credentials
    saveButton.addEventListener('click', function () {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const autoSubmit = autoSubmitCheckbox.checked;
        const autoCloseTab = autoCloseTabCheckbox.checked;

        if (!username || !password) {
            showStatus('Please enter both username and password', 'error');
            return;
        }

        chrome.storage.sync.set({
            username: username,
            password: password,
            autoSubmit: autoSubmit,
            autoCloseTab: autoCloseTab
        }, function () {
            if (chrome.runtime.lastError) {
                showStatus('Error saving credentials', 'error');
            } else {
                showStatus('Credentials saved successfully!', 'success');
            }
        });
    });

    // Clear credentials
    clearButton.addEventListener('click', function () {
        chrome.storage.sync.clear(function () {
            if (chrome.runtime.lastError) {
                showStatus('Error clearing credentials', 'error');
            } else {
                usernameInput.value = '';
                passwordInput.value = '';
                autoSubmitCheckbox.checked = true;
                autoCloseTabCheckbox.checked = true;
                showStatus('Credentials cleared successfully!', 'success');
            }
        });
    });

    // Load existing credentials
    function loadCredentials() {
        chrome.storage.sync.get(['username', 'password', 'autoSubmit', 'autoCloseTab'], function (result) {
            if (result.username) {
                usernameInput.value = result.username;
            }
            if (result.password) {
                passwordInput.value = result.password;
            }
            autoSubmitCheckbox.checked = result.autoSubmit !== false; // default to true
            autoCloseTabCheckbox.checked = result.autoCloseTab !== false; // default to true
        });
    }

    // Show status message
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';

        setTimeout(function () {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Auto-save on checkbox change
    autoSubmitCheckbox.addEventListener('change', function () {
        chrome.storage.sync.set({
            autoSubmit: autoSubmitCheckbox.checked
        });
    });

    autoCloseTabCheckbox.addEventListener('change', function () {
        chrome.storage.sync.set({
            autoCloseTab: autoCloseTabCheckbox.checked
        });
    });
});
