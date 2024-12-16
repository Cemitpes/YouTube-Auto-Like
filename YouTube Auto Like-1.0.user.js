// ==UserScript==
// @name         YouTube Auto Like
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically like a YouTube video if subscribed and not already liked.
// @author       Your Name
// @match        https://www.youtube.com/watch?v=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Retry function to wait until an element is loaded
    function waitForElement(selector, callback, interval = 500) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            setTimeout(() => waitForElement(selector, callback, interval), interval);
        }
    }

    // Main function to handle liking the video
    function handleLike(subscriptionButton) {
        // Check if user is subscribed (button contains "취소합니다.")
        if (subscriptionButton.getAttribute('aria-label')?.includes("취소합니다.")) {
            console.log("User is subscribed. Checking like status...");

            // Check if the video is not liked and click the like button
            const likeButton = document.querySelector('ytd-menu-renderer #top-level-buttons-computed button[title="이 동영상이 마음에 듭니다."]');
            if (likeButton && likeButton.getAttribute('title') === "이 동영상이 마음에 듭니다.") {
                likeButton.click();
                console.log("Liked the video!");
            } else {
                console.log("Video is already liked or like button not found.");
            }
        } else {
            console.log("User is not subscribed. Skipping like.");
        }
    }

    // Initialize the script
    function init() {
        waitForElement('#subscribe-button-shape button', handleLike);
    }

    // Start the script
    init();
})();
