'use strict';
import socket from './app.js';
(() => {
    const userNav = document.querySelector('#userNav');
    const bootstrap = window.bootstrap;

    // Activate tooltips
    let tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // scroll to the comment form when clicked.
    document.querySelector('#replyBtn').addEventListener('click', e => {
        document.querySelector('#reply-collapse').scrollIntoView();
    });


    // Check if this is a logged in user.
    if (userNav) {

        // This should self close containers (i.e. followers, flocks, collections) when new ones are opened.
        const collaspeArray = document.querySelectorAll('#userNav .collapse-option');
        collaspeArray.forEach(collaspe => {
            let id = collaspe.dataset.bsTarget;
            let targetCollaspe = document.querySelector(`${id}`);
            
            targetCollaspe.addEventListener('show.bs.collapse', e => {
                collaspeArray.forEach(otherCollaspe => {
                    // We find an open collaspe group with a different id.
                    let otherId = otherCollaspe.dataset.bsTarget;
                    let target = document.querySelector(`${otherId}`);
                    // Then we close it.
                    if (otherId !== id && target.classList.contains('show')) {
                        // This toggles itself when created.
                        let bsCollaspe = new bootstrap.Collapse(target);
                    }
                });
            });
        });
    
        // No need to compute events for buttons if not logged in
        const addFeatherBtn = document.querySelector('.addFeatherBtn');
        const minusFeatherBtn = document.querySelector('.minusFeatherBtn');

        const postId = parseInt(addFeatherBtn.dataset.postid);

        // we need to update wings when the buttons are pressed.
        const updateWingsPost = (wings, postId, posterId, viewerId, didBtnFade, status) => {
            let query = `postId=${postId}&viewerId=${viewerId}&status=${status}`;

            const url = `/posts/wings`;
            fetch(url, {
                method: 'POST',
                mode: 'same-origin',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer', 
                body: query
            });
            
            // submit an event to the server saying a post has been updated.
            socket.emit('wing-post', {postId, wings, posterId, status, didBtnFade});
        }
        // Post Wing Button UI, very similar to post.js
        addFeatherBtn.addEventListener('click', e => {
            let currentAddBtn = e.target;
            let currentMinusBtn = minusFeatherBtn;
            if (!currentMinusBtn.classList.contains('btn-dark')) {
                // Change the wings locally when the user clicks.
                const countEl = document.querySelector(`#post${postId} .wingCount`);
                let count = parseInt(countEl.innerHTML);
                let faded = null;

                if (currentAddBtn.classList.contains('btn-dark')) {
                    currentAddBtn.classList.replace('btn-dark', 'btn-outline-dark');
                    countEl.innerHTML = count - 1;
                    count--;
                    faded = true;
                } else if (!currentAddBtn.classList.contains('btn-dark')) {
                    currentAddBtn.classList.replace('btn-outline-dark', 'btn-dark');
                    countEl.innerHTML = count + 1;
                    count++;
                    faded = false;
                }
                const post = document.querySelector(`#post${postId}`);
                const posterId = parseInt(post.dataset.poster);
                const viewerId = parseInt(post.dataset.viewer);
                updateWingsPost(count, postId, posterId, viewerId, faded, 'true');
            } 
        });
        minusFeatherBtn.addEventListener('click', e => {
            let currentMinusBtn = e.target;
            let currentAddBtn = addFeatherBtn;                    
            if (!currentAddBtn.classList.contains('btn-dark')) {
                // Change the wings locally when the user clicks.
                const countEl = document.querySelector(`#post${postId} .wingCount`);
                let count = parseInt(countEl.innerHTML);
                let faded = null;

                if (currentMinusBtn.classList.contains('btn-dark')) {
                    currentMinusBtn.classList.replace('btn-dark', 'btn-outline-dark');
                    countEl.innerHTML = count + 1;
                    count++;
                    faded = true;
                } else if (!currentMinusBtn.classList.contains('btn-dark')) {
                    currentMinusBtn.classList.replace('btn-outline-dark', 'btn-dark');
                    countEl.innerHTML = count - 1;
                    count--;
                    faded = false;
                }
                const post = document.querySelector(`#post${postId}`);
                const posterId = parseInt(post.dataset.poster);
                const viewerId = parseInt(post.dataset.viewer);
                updateWingsPost(count, postId, posterId, viewerId, faded, 'false');
            }
        });

        const addFeatherBtns = document.querySelectorAll('.addFeatherBtn');
        const minusFeatherBtns = document.querySelectorAll('.minusFeatherBtn');

        const updateWingsComment = (wings, commentId, posterId, viewerId, didBtnFade, status) => {
            let query = `postId=${postId}&commentId=${commentId}&viewerId=${viewerId}&status=${status}`;

            const url = `/comments/wings`;
            fetch(url, {
                method: 'POST',
                mode: 'same-origin',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer', 
                body: query
            });
            
            // submit an event to the server saying a post has been updated.
            socket.emit('wing-comment', {commentId, wings, postId, posterId, status, didBtnFade});
        }

        // Ignore the first btn, because it belongs to the post.
        // We do something very similar to above but for comments.
        if (addFeatherBtns.length > 1) {
            for (let i = 1; i < addFeatherBtns.length; i++) {
                addFeatherBtns[i].addEventListener('click', e => {
                    let currentAddBtn = e.target;
                    let currentMinusBtn = minusFeatherBtns[i];
                    if (!currentMinusBtn.classList.contains('btn-dark')) {
                        // Change the wings locally when the user clicks.
                        const commentId = currentAddBtn.dataset.commentid;
                        const countEl = document.querySelector(`#comment${commentId} .wingCount`);
                        let count = parseInt(countEl.innerHTML);
                        let faded = null;

                        if (currentAddBtn.classList.contains('btn-dark')) {
                            currentAddBtn.classList.replace('btn-dark', 'btn-outline-dark');
                            countEl.innerHTML = count - 1;
                            count--;
                            faded = true;
                        } else if (!currentAddBtn.classList.contains('btn-dark')) {
                            currentAddBtn.classList.replace('btn-outline-dark', 'btn-dark');
                            countEl.innerHTML = count + 1;
                            count++;
                            faded = false;
                        }
                        const comment = document.querySelector(`#comment${commentId}`);
                        const posterId = parseInt(comment.dataset.poster);
                        const viewerId = parseInt(comment.dataset.viewer);
                        updateWingsComment(count, commentId, posterId, viewerId, faded, 'true');
                    } 
                });
                minusFeatherBtns[i].addEventListener('click', e => {
                    let currentMinusBtn = e.target;
                    let currentAddBtn = addFeatherBtns[i];                    
                    if (!currentAddBtn.classList.contains('btn-dark')) {
                        // Change the wings locally when the user clicks.
                        const commentId = currentAddBtn.dataset.commentid;
                        const countEl = document.querySelector(`#comment${commentId} .wingCount`);
                        let count = parseInt(countEl.innerHTML);
                        let faded = null;

                        if (currentMinusBtn.classList.contains('btn-dark')) {
                            currentMinusBtn.classList.replace('btn-dark', 'btn-outline-dark');
                            countEl.innerHTML = count + 1;
                            count++;
                            faded = true;
                        } else if (!currentMinusBtn.classList.contains('btn-dark')) {
                            currentMinusBtn.classList.replace('btn-outline-dark', 'btn-dark');
                            countEl.innerHTML = count - 1;
                            count--;
                            faded = false;
                        }
                        const post = document.querySelector(`#comment${commentId}`);
                        const posterId = parseInt(post.dataset.poster);
                        const viewerId = parseInt(post.dataset.viewer);
                        updateWingsComment(count, commentId, posterId, viewerId, faded, 'false');
                    }
                });
            }
        }
    }

    // We need to update comments that have been liked in real time.
    socket.on('updateComments', data => {

        
        // only update the html if the post is on the page.
        let postEl = document.querySelector(`#post${data.postId}`);
        let postWingEl = document.querySelector(`#comment${data.commentId} .wingCount`);
        
        if (postEl && postWingEl) {
            postWingEl.innerHTML = data.wings;

            let viewerId = parseInt(document.querySelector(`#comment${data.commentId}`).dataset.viewer);
            let updatedOwnpost = data.posterId === viewerId ? true : false;
            // Change buttons if user is viewing themselves in another tab.
            if (updatedOwnpost) {
                let toggleBtns = document.querySelectorAll(`#comment${data.postId} .btn-toggle`);
                const addClass = toggleBtns[0].classList;
                const subClass = toggleBtns[1].classList;
                if (data.status) {
                    subClass.remove('btn-dark');
                    subClass.add('btn-outline-dark');
                    if (data.didBtnFade) {
                        addClass.remove('btn-dark');
                        addClass.add('btn-outline-dark');
                    } else {
                        addClass.add('btn-dark');
                        addClass.remove('btn-outline-dark');
                    }
                } else {
                    addClass.remove('btn-dark');
                    addClass.add('btn-outline-dark');
                    if (data.didBtnFade) {
                        subClass.remove('btn-dark');
                        subClass.add('btn-outline-dark');
                    } else {
                        subClass.add('btn-dark');
                        subClass.remove('btn-outline-dark');
                    }
                }
            }
        }
    });
})()