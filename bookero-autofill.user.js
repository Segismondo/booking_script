// ==UserScript==
// @name         Bookero Auto-Fill for Przystanek Ku Sobie
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically fills booking form fields when clicking time slots
// @author       You
// @match        https://przystanekkusobie.pl/gabinet-*
// @match        https://przystanekkusobie.pl/kalendarz/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION - Change these values
    // ============================================
    const CONFIG = {
        name: 'Agata',              // Your first name
        surname: 'Plura',      // Your last name
        email: 'gabinetkamino@gmail.com', // Your email
        autoSubmit: true,         // Automatically click "Book" button
        autoClose: true,          // Automatically close confirmation window
        debugMode: false          // Set to true for console logging
    };
    // ============================================

    function log(...args) {
        if (CONFIG.debugMode) {
            console.log('[Bookero AutoFill]', ...args);
        }
    }

    // Function to fill form fields
    function fillField(input, value) {
        if (!input || input.value) return false; // Skip if already filled

        input.value = value;

        // Trigger various events to ensure the form recognizes the input
        ['input', 'change', 'blur'].forEach(eventType => {
            input.dispatchEvent(new Event(eventType, { bubbles: true }));
        });

        // For React/Vue apps
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));

        return true;
    }

    // Function to find and fill booking form
    function findAndFillForm(doc = document) {
        log('Searching for booking form...');

        // Look for common input field patterns in Polish booking forms
        const namePatterns = [
            'input[name*="name"]',
            'input[name*="imie"]',
            'input[name*="imię"]',
            'input[placeholder*="Imię"]',
            'input[placeholder*="imie"]',
            'input[id*="name"]',
            'input[id*="imie"]'
        ];

        const surnamePatterns = [
            'input[name*="surname"]',
            'input[name*="nazwisko"]',
            'input[placeholder*="Nazwisko"]',
            'input[id*="surname"]',
            'input[id*="nazwisko"]'
        ];

        const emailPatterns = [
            'input[type="email"]',
            'input[name*="email"]',
            'input[placeholder*="Email"]',
            'input[placeholder*="e-mail"]',
            'input[id*="email"]'
        ];

        let filled = false;

        // Try to find and fill name
        for (const pattern of namePatterns) {
            const input = doc.querySelector(pattern);
            if (input && fillField(input, CONFIG.name)) {
                log('Filled name field:', pattern);
                filled = true;
                break;
            }
        }

        // Try to find and fill surname
        for (const pattern of surnamePatterns) {
            const input = doc.querySelector(pattern);
            if (input && fillField(input, CONFIG.surname)) {
                log('Filled surname field:', pattern);
                filled = true;
                break;
            }
        }

        // Try to find and fill email
        for (const pattern of emailPatterns) {
            const input = doc.querySelector(pattern);
            if (input && fillField(input, CONFIG.email)) {
                log('Filled email field:', pattern);
                filled = true;
                break;
            }
        }

        // If we filled something and autoSubmit is enabled, look for submit button
        if (filled && CONFIG.autoSubmit) {
            setTimeout(() => {
                const submitPatterns = [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button:contains("Zarezerwuj")',
                    'button:contains("Rezerwuj")',
                    'button:contains("Book")',
                    '[class*="submit"]',
                    '[class*="book"]'
                ];

                for (const pattern of submitPatterns) {
                    const button = doc.querySelector(pattern);
                    if (button && button.textContent.match(/zarezerwuj|rezerwuj|book|zapisz/i)) {
                        log('Found and clicking submit button:', button);
                        button.click();
                        break;
                    }
                }
            }, 500); // Wait a bit to ensure all fields are filled
        }

        return filled;
    }

    // Function to handle iframes
    function processIframe(iframe) {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            log('Processing iframe:', iframe.src);

            // Watch for changes in the iframe
            const observer = new MutationObserver(() => {
                findAndFillForm(iframeDoc);
            });

            observer.observe(iframeDoc.body, {
                childList: true,
                subtree: true
            });

            // Also try immediately
            findAndFillForm(iframeDoc);
        } catch (e) {
            log('Cannot access iframe (CORS restriction):', e.message);
            // If we can't access the iframe due to CORS, we'll need a different approach
            console.warn('[Bookero AutoFill] Cannot access Bookero iframe due to cross-origin restrictions.');
            console.info('[Bookero AutoFill] You may need to use the browser console method instead.');
        }
    }

    // Watch for modal/popup windows
    function watchForModals() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if it's a modal or contains form fields
                            if (node.querySelector('input[type="email"]') ||
                                node.querySelector('input[name*="name"]') ||
                                node.querySelector('input[name*="imie"]')) {
                                log('Found new form in added node');
                                setTimeout(() => findAndFillForm(document), 100);
                            }
                        }
                    });
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Auto-close confirmation windows
    function setupAutoClose() {
        if (!CONFIG.autoClose) return;

        const observer = new MutationObserver(() => {
            // Look for success messages or confirmation dialogs
            const closeButtons = document.querySelectorAll('button, a, [class*="close"], [class*="zamknij"]');
            closeButtons.forEach(btn => {
                if (btn.textContent.match(/zamknij|close|ok|×/i)) {
                    const parent = btn.closest('[class*="modal"], [class*="dialog"], [class*="popup"]');
                    if (parent && parent.textContent.match(/zarezerwowano|success|potwierd/i)) {
                        log('Auto-closing confirmation window');
                        setTimeout(() => btn.click(), 1000);
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize
    function init() {
        log('Bookero AutoFill script initialized');
        console.log('[Bookero AutoFill] Script loaded. Name:', CONFIG.name, 'Surname:', CONFIG.surname, 'Email:', CONFIG.email);

        // Watch main document
        watchForModals();
        setupAutoClose();

        // Try to find Bookero iframe
        const checkForIframe = setInterval(() => {
            const bookeroIframe = document.querySelector('iframe[src*="bookero"], #bookero iframe, iframe');
            if (bookeroIframe) {
                log('Found Bookero iframe');
                processIframe(bookeroIframe);
                clearInterval(checkForIframe);
            }
        }, 1000);

        // Stop checking after 30 seconds
        setTimeout(() => clearInterval(checkForIframe), 30000);

        // Also watch for forms in main document (in case Bookero renders outside iframe)
        setTimeout(() => findAndFillForm(), 2000);
    }

    // Wait for page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose a manual trigger function
    window.fillBookingForm = function() {
        console.log('[Bookero AutoFill] Manually triggering form fill...');
        findAndFillForm();

        // Also try in iframes
        document.querySelectorAll('iframe').forEach(processIframe);
    };

    console.log('[Bookero AutoFill] Tip: If auto-fill doesn\'t work, open browser console and type: fillBookingForm()');
})();
