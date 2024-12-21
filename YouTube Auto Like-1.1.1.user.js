// ==UserScript==
// @name         YouTube Auto Like
// @namespace    http://tampermonkey.net/
// @version      1.1.1
// @description  Automatically like a YouTube video if subscribed and not already liked, triggered by like button changes.
// @author       Your Name
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
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
    function handleLike() {
        const subscriptionButton = document.querySelector('#subscribe-button-shape button');

        if (subscriptionButton && subscriptionButton.getAttribute('aria-label')?.includes("취소합니다.")) {
            const likeButton = document.querySelector(
                'ytd-menu-renderer #top-level-buttons-computed button[title="이 동영상이 마음에 듭니다."]'
            );

            if (likeButton && likeButton.getAttribute('title') === "이 동영상이 마음에 듭니다.") {
                likeButton.click();
            }
        }
    }

    // Observe changes in the like button container
    function observeLikeButton() {
        const likeButtonContainer = document.querySelector('ytd-menu-renderer #top-level-buttons-computed');

        if (likeButtonContainer) {
            const observer = new MutationObserver(() => {
                const likeButton = document.querySelector(
                    'ytd-menu-renderer #top-level-buttons-computed button[title="이 동영상이 마음에 듭니다."]'
                );

                if (likeButton && likeButton.getAttribute('title') === "이 동영상이 마음에 듭니다.") {
                    handleLike();
                }
            });

            observer.observe(likeButtonContainer, {
                childList: true,
                subtree: true,
            });
        }
    }

    // Initialize the script
    function init() {
        waitForElement('ytd-menu-renderer #top-level-buttons-computed', observeLikeButton);
    }

    // Start the script
    init();
})();
