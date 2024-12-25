// ==UserScript==
// @name         YouTube Auto Like
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Automatically like a YouTube video or Shorts based on URL, if subscribed and not already liked.
// @author       Your Name
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Constants for selectors and intervals
    const RETRY_INTERVAL = 500; // Retry interval in milliseconds
    const VIDEO_URL_PREFIX = 'https://www.youtube.com/watch?v=';
    const LIKE_BUTTON_SELECTOR = 'like-button-view-model button';
    const SUBSCRIBE_BUTTON_SELECTOR = '#subscribe-button-shape yt-touch-feedback-shape .yt-spec-touch-feedback-shape--touch-response';
    const TITLE_SELECTOR = '#title yt-formatted-string';

    // Variables to track the current URL and video title
    let currentUrl = location.href;
    let currentVideoTitle;

    /**
     * Logs messages with a specific type.
     * @param {string} type - The type of the log (e.g., Info, Warning).
     * @param {string} message - The message to log.
     */
    function logMessage(type, message) {
        console.log(`[YouTube Auto Like][${type}] ${message}`);
    }

    /**
     * Handles the logic for liking a video.
     */
    function likeVideo() {
        const likeButton = document.querySelector(LIKE_BUTTON_SELECTOR);

        if (!likeButton) {
            logMessage('Info', `Like button not found. Retrying in ${RETRY_INTERVAL} milliseconds.`);
            setTimeout(likeVideo, RETRY_INTERVAL);
            return;
        }

        logMessage('Info', 'Like button found.');

        if (likeButton.getAttribute('aria-pressed') === 'true') {
            logMessage('Info', 'Video is already liked.');
            currentVideoTitle = getVideoTitle();
            return;
        }

        const subscriptionButton = document.querySelector(SUBSCRIBE_BUTTON_SELECTOR);

        if (!subscriptionButton) {
            logMessage('Warning', 'User is not subscribed to the channel.');
            currentVideoTitle = getVideoTitle();
            return;
        }

        logMessage('Info', 'User is subscribed to the channel. Clicking the like button.');
        likeButton.click();
        logMessage('Info', 'Like button clicked.');
        currentVideoTitle = getVideoTitle();
    }

    /**
     * Initializes the script logic for the current page.
     */
    function init() {
        if (!currentUrl.startsWith(VIDEO_URL_PREFIX)) {
            logMessage('Info', 'Not a video page. Skipping operation.');
            return;
        }

        logMessage('Info', 'Video page detected. Starting like operation.');
        likeVideo();
    }

    /**
     * Observes changes to the page URL and triggers initialization if the URL changes.
     */
    function observeUrlChange() {
        const observer = new MutationObserver(() => {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                logMessage('Info', 'URL changed. Waiting for title update...');
                waitForTitleChange(currentVideoTitle, RETRY_INTERVAL);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    /**
     * Waits for the video title to change and reinitializes the script.
     * @param {string} previousTitle - The title of the previous video.
     * @param {number} interval - Retry interval in milliseconds.
     */
    function waitForTitleChange(previousTitle, interval) {
        const videoTitle = getVideoTitle();

        if (videoTitle === previousTitle) {
            logMessage('Info', `Title has not updated. Retrying in ${interval} milliseconds.`);
            setTimeout(() => waitForTitleChange(previousTitle, interval), interval);
        } else {
            logMessage('Info', 'Title updated. Reinitializing...');
            init();
        }
    }

    /**
     * Retrieves the current video title from the page.
     * @returns {string} The video title, or an empty string if not found.
     */
    function getVideoTitle() {
        const titleElement = document.querySelector(TITLE_SELECTOR);
        return titleElement ? titleElement.textContent.trim() : '';
    }

    // Start the script
    init();
    observeUrlChange();

})();
