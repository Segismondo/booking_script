# Bookero Auto-Fill Script for Przystanek Ku Sobie

Automatically fills in your booking details (name, surname, email) when reserving a gabinet on przystanekkusobie.pl.

## Features

- Automatically fills in Name, Surname, and Email when you click a time slot
- Optional auto-submit: automatically clicks the "Book" button
- Optional auto-close: automatically closes confirmation windows
- Works across all gabinet pages (Gabinet nr 1-4)
- Debug mode for troubleshooting

## Installation

### Method 1: Using Tampermonkey (Recommended)

1. **Install Tampermonkey browser extension:**
   - Chrome: [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: [Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - Edge: [Tampermonkey for Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. **Install the script:**
   - Click on the Tampermonkey icon in your browser
   - Click "Create a new script"
   - Delete everything in the editor
   - Copy and paste the entire contents of `bookero-autofill.user.js`
   - Press `Ctrl+S` (or `Cmd+S` on Mac) to save

3. **Configure your details:**
   - Edit the CONFIG section at the top of the script:
   ```javascript
   const CONFIG = {
       name: 'Your Name',           // Change this
       surname: 'Your Surname',     // Change this
       email: 'your@email.com',     // Change this
       autoSubmit: true,
       autoClose: true,
       debugMode: false
   };
   ```
   - Save the script again (`Ctrl+S`)

### Method 2: Using Greasemonkey (Firefox)

1. Install [Greasemonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
2. Follow the same steps as Tampermonkey above

## Usage

1. Go to https://przystanekkusobie.pl/kalendarz/
2. Select your gabinet (Gabinet nr 1-4)
3. Click on any available time slot
4. The script will automatically:
   - Fill in your Name, Surname, and Email
   - Click the "Book" button (if `autoSubmit: true`)
   - Close the confirmation window (if `autoClose: true`)

## Configuration Options

Edit these in the CONFIG section of the script:

| Option | Default | Description |
|--------|---------|-------------|
| `name` | 'Jan' | Your first name |
| `surname` | 'Kowalski' | Your last name |
| `email` | 'jan@example.com' | Your email address |
| `autoSubmit` | `true` | Automatically click the booking button |
| `autoClose` | `true` | Automatically close confirmation windows |
| `debugMode` | `false` | Show detailed console logs for troubleshooting |

### Example: Manual booking (no auto-submit)

If you want to review the booking before submitting:

```javascript
const CONFIG = {
    name: 'Your Name',
    surname: 'Your Surname',
    email: 'your@email.com',
    autoSubmit: false,  // Changed to false
    autoClose: false,   // Changed to false
    debugMode: false
};
```

## Troubleshooting

### Script not working?

1. **Check if Tampermonkey is enabled:**
   - Click the Tampermonkey icon
   - Make sure the script is enabled (toggle switch should be ON)

2. **Enable debug mode:**
   - Set `debugMode: true` in the CONFIG
   - Open browser console (`F12` or `Ctrl+Shift+I`)
   - Look for messages starting with `[Bookero AutoFill]`

3. **Manual trigger:**
   - Open browser console (`F12`)
   - Type: `fillBookingForm()` and press Enter
   - This manually triggers the auto-fill

4. **CORS/iframe issues:**
   - If you see "Cannot access iframe (CORS restriction)" in the console
   - This means the Bookero widget is in a protected iframe
   - Use the manual console method below

### Manual Console Method (Fallback)

If the userscript can't access the iframe due to CORS restrictions:

1. Open the booking page
2. Click on a time slot to open the booking form
3. Open browser console (`F12`)
4. Paste this code and press Enter:

```javascript
// Fill booking form manually
(function() {
    const name = 'Your Name';        // Change this
    const surname = 'Your Surname';  // Change this
    const email = 'your@email.com';  // Change this

    function fill(selector, value) {
        const el = document.querySelector(selector);
        if (el) {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    // Try multiple field patterns
    fill('input[name*="name"], input[name*="imie"]', name);
    fill('input[name*="surname"], input[name*="nazwisko"]', surname);
    fill('input[type="email"]', email);

    console.log('Form filled!');
})();
```

## How It Works

The script:

1. Monitors the page for the Bookero booking widget (iframe)
2. Watches for DOM changes (when booking forms appear)
3. Detects input fields for name, surname, and email using multiple patterns
4. Fills in your configured details
5. Optionally submits the form and closes confirmation dialogs

## Privacy & Security

- All data is stored locally in the script configuration
- No data is sent to any third party
- The script only runs on przystanekkusobie.pl pages
- You can review the entire source code in `bookero-autofill.user.js`

## License

Free to use and modify for personal use.

## Support

If you encounter issues:
1. Enable `debugMode: true`
2. Check browser console for errors
3. Try the manual console method
4. Make sure you're using the latest version of your browser and Tampermonkey
