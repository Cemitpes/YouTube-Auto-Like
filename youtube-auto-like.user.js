// ==UserScript==
// @name         YouTube Auto Like
// @namespace    http://tampermonkey.net/
// @version      1.3.0
// @description  Automatically like a YouTube video or Shorts based on URL, if subscribed and not already liked.
// @author       Your Name
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const RETRY_INTERVAL = 500; // 모든 인터벌을 500ms로 통일
    let lastVideoId = null; // 마지막으로 확인된 비디오 ID

    /**
     * 특정 요소를 대기하여 처리
     * @param {string} selector - CSS 선택자
     * @param {function} callback - 요소가 로드된 후 실행될 함수
     * @param {number} interval - 검색 주기 (ms)
     * @param {number} timeout - 최대 대기 시간 (ms)
     */
    function waitForElement(selector, callback, interval = RETRY_INTERVAL, timeout = 10000) {
        const startTime = Date.now();
        const timer = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(timer);
                callback(element);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(timer);
                console.error(`시간 초과: 선택자 "${selector}"를 찾을 수 없습니다.`);
            }
        }, interval);
    }

    /**
     * 일반 비디오: 좋아요 로직 실행 및 변경 감지
     */
    function likeVideo() {
        const likeButton = document.querySelector('like-button-view-model button');
        if (!likeButton) {
            console.log(`[Info] 좋아요 버튼을 찾을 수 없습니다. ${RETRY_INTERVAL}ms 후 재시도합니다.`);
            setTimeout(likeVideo, RETRY_INTERVAL);
            return;
        }

        const observer = new MutationObserver(() => {
            if (likeButton.getAttribute('aria-pressed') === 'false') {
                console.log('[Info] 좋아요가 취소되었습니다. 다시 누릅니다.');
                likeButton.click();
                console.log('[Info] 좋아요 버튼을 다시 눌렀습니다.');
            }
        });

        observer.observe(likeButton, { attributes: true, attributeFilter: ['aria-pressed'] });

        if (likeButton.getAttribute('aria-pressed') === 'false') {
            console.log('[Info] 좋아요 버튼을 누릅니다.');
            likeButton.click();
        } else {
            console.log('[Info] 이미 좋아요를 누른 상태입니다.');
        }
    }

    /**
     * 쇼츠: 구독 상태 확인 및 좋아요 로직 실행
     * @param {HTMLElement} currentShort - 활성화된 쇼츠 요소
     */
    function checkSubscriptionStatus(currentShort) {
        const subscribeButton = currentShort.querySelector('.ytReelChannelBarViewModelReelSubscribeButton');
        if (!subscribeButton) {
            console.error('구독 버튼을 찾을 수 없습니다.');
            return;
        }

        const videoId = currentShort.querySelector("a[href*='/shorts']")?.getAttribute("href").split("/")[2];
        if (!videoId || videoId === lastVideoId) {
            console.log('이미 처리된 비디오이거나 ID를 찾을 수 없습니다.');
            return;
        }

        lastVideoId = videoId; // 현재 비디오 ID 업데이트

        const isSubscribed = !subscribeButton.querySelector('yt-subscribe-button-view-model');
        if (isSubscribed) {
            console.log('구독 상태를 확인했습니다. 좋아요를 누릅니다.');
            waitForElement('#like-button button', clickLikeButton);
        } else {
            console.log('구독하지 않은 채널입니다.');
        }
    }

    /**
     * 쇼츠: 좋아요 버튼 클릭
     * @param {HTMLElement} likeButton - 좋아요 버튼 요소
     */
    function clickLikeButton(likeButton) {
        if (likeButton && likeButton.getAttribute('aria-pressed') === 'false') {
            likeButton.click();
            console.log('좋아요 버튼을 눌렀습니다.');
        } else {
            console.log('좋아요 버튼을 이미 눌렀거나 찾을 수 없습니다.');
        }
    }

    /**
     * 쇼츠: 활성화된 쇼츠 반환
     * @returns {HTMLElement|null} - 활성화된 쇼츠 요소
     */
    function getActiveShort() {
        return document.querySelector('ytd-reel-video-renderer[is-active]');
    }

    /**
     * 쇼츠: 변경 감지 및 구독 상태 확인
     */
    function observeShortsChange() {
        const container = document.querySelector('#shorts-container');
        if (!container) {
            console.error('쇼츠 컨테이너를 찾을 수 없습니다.');
            return;
        }

        const observer = new MutationObserver(() => {
            setTimeout(() => { // 변경된 쇼츠의 DOM이 완전히 로드된 후 실행
                const currentShort = getActiveShort();
                if (currentShort) checkSubscriptionStatus(currentShort);
            }, RETRY_INTERVAL);
        });

        observer.observe(container, { childList: true, subtree: true });
    }

    /**
     * 페이지 초기화 및 URL 감지
     */
    function init() {
        if (location.href.includes('/shorts/')) {
            console.log('[Info] 쇼츠 페이지로 감지되었습니다.');
            waitForElement('#shorts-container', () => {
                observeShortsChange();
                const currentShort = getActiveShort();
                if (currentShort) checkSubscriptionStatus(currentShort);
            });
        } else if (location.href.includes('watch?v=')) {
            console.log('[Info] 일반 비디오 페이지로 감지되었습니다.');
            likeVideo();
        } else {
            console.log('[Info] 비디오 또는 쇼츠 페이지가 아닙니다.');
        }
    }

    /**
     * URL 변경 감지 및 초기화
     */
    function observeUrlChange() {
        let currentUrl = location.href;
        const observer = new MutationObserver(() => {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                console.log('[Info] URL이 변경되었습니다. 초기화 중...');
                init();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 스크립트 시작
    init();
    observeUrlChange();
})();
