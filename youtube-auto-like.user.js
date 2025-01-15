// ==UserScript==
// @name         YouTube Auto Like
// @namespace    http://tampermonkey.net/
// @version      1.4.0
// @description  Automatically like YouTube videos and Shorts if subscribed and not already liked.
// @author       Your Name
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Debugging options
    const DEBUG = true; // Enable or disable logging globally
    const DEBUG_LEVEL = 3; // 0 = None, 1 = Errors only, 2 = Warnings and Errors, 3 = All logs

    // Log utility function
    const log = (message, level = 3, type = 'log') => {
        if (DEBUG && level <= DEBUG_LEVEL && console[type]) {
            const styles = {
                log: 'color: blue;',
                info: 'color: green;',
                warn: 'color: orange;',
                error: 'color: red; font-weight: bold;',
            };
            console[type](`%c[YouTube Auto Like] ${message}`, styles[type] || '');
        }
    };

    // Constants
    const RETRY_INTERVAL = 500;
    const TIMEOUT = 10000;
    const SELECTORS = {
        LIKE_BUTTON: 'like-button-view-model button',
        SUBSCRIBE_BUTTON: '#subscribe-button-shape yt-touch-feedback-shape .yt-spec-touch-feedback-shape--touch-response',
        SHORTS: '.ytShortsVideoTitleViewModelShortsVideoTitle',
        SHORTS_LIKE_BUTTON: 'ytd-reel-video-renderer[is-active] #like-button button',
        SHORTS_SUBSCRIBE_BUTTON: 'ytd-reel-video-renderer[is-active] .ytReelChannelBarViewModelReelSubscribeButton'
    };

    // Utility: Wait for elements
    const waitForElements = (selectors, callback, interval = RETRY_INTERVAL, timeout = TIMEOUT) => {
        if (!Array.isArray(selectors)) {
            selectors = [selectors];
        }

        const startTime = Date.now();
        const timer = setInterval(() => {
            const elements = selectors.map(selector => document.querySelector(selector)).filter(Boolean);

            if (elements.length === selectors.length) {
                clearInterval(timer);
                callback(elements);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(timer);
                log(`Timeout: Cannot find all selectors "${selectors.join(', ')}".`, 1, 'error');
            }
        }, interval);
    };

    // Observe button state changes
    const observeButton = (likeSelector, subscribeSelector, isShorts, message) => {
        const likeButton = document.querySelector(likeSelector);
        if (!likeButton) {
            log('Like button not found for observation.', 1, 'error');
            return;
        }

        const observer = new MutationObserver(() => {
            const isSubscribed = document.querySelector(subscribeSelector);
            if (!isSubscribed) {
                log('Subscribe button not found during observation.', 1, 'error');
                return;
            }

            if (isShorts) {
                if (!isSubscribed.querySelector('yt-subscribe-button-view-model') && likeButton.getAttribute('aria-pressed') === 'false') {
                    likeButton.click();
                    log(message, 3, 'info');
                }
            } else {
                if (isSubscribed && likeButton.getAttribute('aria-pressed') === 'false') {
                    likeButton.click();
                    log(message, 3, 'info');
                }
            }
        });

        observer.observe(likeButton, { attributes: true, attributeFilter: ['aria-pressed'] });
    };

    // Like content
    const likeContent = (likeSelector, subscribeSelector, isShorts = false) => {
        waitForElements([likeSelector, subscribeSelector], () => {
            const likeButton = document.querySelector(likeSelector);
            const isSubscribed = document.querySelector(subscribeSelector);

            if (!likeButton || !isSubscribed) {
                log('Required buttons not found for liking content.', 1, 'error');
                return;
            }

            if (isShorts) {
                if (!isSubscribed.querySelector('yt-subscribe-button-view-model') && likeButton.getAttribute('aria-pressed') === 'false') {
                    likeButton.click();
                    log('Liked the Shorts content.', 3, 'info');
                }
            } else {
                if (isSubscribed && likeButton.getAttribute('aria-pressed') === 'false') {
                    likeButton.click();
                    log('Liked the video content.', 3, 'info');
                }
            }

            observeButton(likeSelector, subscribeSelector, isShorts, isShorts ? 'Re-liked the Shorts.' : 'Re-liked the video.');
        });
    };

    // Observe title changes
    const observeTitleChanges = (callback) => {
        waitForElements(['title'], () => {
            const titleElement = document.querySelector('title');
            if (!titleElement) {
                log('Title element not found.', 1, 'error');
                return;
            }

            let lastTitle = titleElement.innerText;
            const observer = new MutationObserver(() => {
                const currentTitle = titleElement.innerText;
                if (currentTitle !== lastTitle) {
                    lastTitle = currentTitle;
                    log(`Title changed to: ${currentTitle}`, 3, 'info');
                    callback();
                }
            });

            observer.observe(titleElement, { subtree: true, characterData: true, childList: true });
        });
    };

    // Initialization function
    const init = () => {
        try {
            if (location.href.includes('/shorts/')) {
                log('Shorts page detected.', 2, 'info');
                likeContent(SELECTORS.SHORTS_LIKE_BUTTON, SELECTORS.SHORTS_SUBSCRIBE_BUTTON, true);
            } else if (location.href.includes('watch?v=')) {
                log('Video page detected.', 2, 'info');
                likeContent(SELECTORS.LIKE_BUTTON, SELECTORS.SUBSCRIBE_BUTTON, false);
            } else {
                log('Not a video or shorts page.', 2, 'warn');
            }
        } catch (error) {
            log(`Initialization failed: ${error.message}`, 1, 'error');
        }
    };

    // Start script and observe title changes
    init();
    observeTitleChanges(init);
})();
