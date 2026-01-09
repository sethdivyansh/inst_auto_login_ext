# Auto Login Chrome Extension

A Chrome extension that automatically enters and submits username and password on the login page at `192.168.249.1:1000/login`.

## Features

- Automatically fills username and password fields on the target login page
- Optional auto-submit functionality
- Secure credential storage using Chrome's sync storage
- Simple popup interface for managing credentials
- Works with both HTTP and HTTPS versions of the target site

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension directory
4. The extension icon should appear in your toolbar

## Usage

1. Click the extension icon in your toolbar
2. Enter your username and password in the popup
3. Choose whether to enable auto-submit (enabled by default)
4. Click "Save Credentials"
5. Navigate to the login page - the extension will automatically fill and optionally submit the form

## Target Form

This extension is specifically designed for login forms with the following structure:

- Username field: `input[name="username"]` or `#ft_un`
- Password field: `input[name="password"]` or `#ft_pd`
- Submit button: `input[type="submit"]`

## Security Note

Credentials are stored using Chrome's sync storage, which is encrypted and synced across your Chrome browsers when signed in to your Google account.

## Permissions

- `activeTab`: To interact with the login page
- `scripting`: To inject the content script
- `storage`: To save and retrieve credentials
- `host_permissions`: To access the specific login site

## Files

- `manifest.json`: Extension configuration
- `content.js`: Script that runs on the login page to fill forms
- `popup.html`: Extension popup interface
- `popup.js`: Popup functionality for managing credentials
# inst_auto_login_ext
