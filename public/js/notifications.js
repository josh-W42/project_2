'use strict';
import socket from './app.js';

(() => {
    /* 
        The idea here is to use socket.io to simulate real time notifications.
        
        When an event is captured we change the hidden template, make a clone,
        and then use bootstrap to show it.
    */
    let templateToast = document.querySelector('#toastTemplate');
    let templateImg = document.querySelector('#toastImg');
    let templateTime = document.querySelector('#toastTime');
    let templateInfo = document.querySelector('#toastInfo');
    const toastContainer = document.querySelector('.toast-container');
    socket.onAny((event, ...args) => {
        let time = new Date();
        templateImg.src = "https://res.cloudinary.com/dom5vocai/image/upload/v1613426540/crane_logo_xzo7cm.png";
        templateTime.innerHTML = `${time.toLocaleTimeString()}`
        templateInfo.innerHTML = `${event}`;
        const clone = templateToast.cloneNode(true);
        clone.classList.remove('hidden');
        toastContainer.appendChild(clone);
        let newToast = new window.bootstrap.Toast(clone);
        newToast.show();
    });
    let toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
        let newToast = new window.bootstrap.Toast(toast);
        newToast.show();
    });
})()