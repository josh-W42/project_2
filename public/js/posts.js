import socket from './app.js'

(() => {
    // Activate tooltips
    let tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    const userNav = document.querySelector('#userNav');
    if (userNav) {
        // No need to compute events for buttons if not logged in
        const addFeatherBtns = document.querySelectorAll('.addFeatherBtn');
        const minusFeatherBtns = document.querySelectorAll('.minusFeatherBtn');
        const collectionsBtns = document.querySelectorAll('.collectionBtn');

        // we need to update wings when the buttons are pressed.
        const updateWings = (wings, postId, posterId, viewerId, didBtnFade, status) => {
            let query = `postId=${postId}&viewerId=${viewerId}&status=${status}`;

            const url = `/posts/wings`;
            fetch(url, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'same-origin', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: query // body data type must match "Content-Type" header
            });
            
            // submit an event to the server saying a post has been updated.
            socket.emit('wing', {postId, wings, posterId, status, didBtnFade});
        }

        if (addFeatherBtns.length > 0) {
            // Post Wing Button UI
            // We want the wing button to look pressed when clicked then switch
            // between up votes and down votes.
            for (let i = 0; i < addFeatherBtns.length; i++) {
                // Because there should be the same amount of add / minus / bookmark buttons
                // we can add all event listeners in one place.

                addFeatherBtns[i].addEventListener('click', e => {
                    let currentAddBtn = e.target;
                    let currentMinusBtn = minusFeatherBtns[i];
                    if (!currentMinusBtn.classList.contains('btn-dark')) {
                        // Change the wings locally when the user clicks.
                        const postId = currentAddBtn.dataset.postid;
                        const countEl = document.querySelector(`#post${postId} .wingCount`);
                        let count = parseInt(countEl.innerHTML);
                        let faded = null;

                        if (currentAddBtn.classList.contains('btn-dark')) {
                            currentAddBtn.classList.replace('btn-dark', 'btn-outline-dark');
                            countEl.innerHTML = count - 1;
                            count--;
                            faded = true;
                        } else {
                            currentAddBtn.classList.replace('btn-outline-dark', 'btn-dark');
                            countEl.innerHTML = count + 1;
                            count++;
                            faded = false;
                        }
                        const post = document.querySelector(`#post${postId}`);
                        const posterId = parseInt(post.dataset.poster);
                        const viewerId = parseInt(post.dataset.viewer);
                        updateWings(count, postId, posterId, viewerId, faded, true);
                    } 
                });
                minusFeatherBtns[i].addEventListener('click', e => {
                    let currentMinusBtn = e.target;
                    let currentAddBtn = addFeatherBtns[i];                    
                    if (!currentAddBtn.classList.contains('btn-dark')) {
                        // Change the wings locally when the user clicks.
                        const postId = currentAddBtn.dataset.postid;
                        const countEl = document.querySelector(`#post${postId} .wingCount`);
                        let count = parseInt(countEl.innerHTML);
                        let faded = null;

                        if (currentMinusBtn.classList.contains('btn-dark')) {
                            currentMinusBtn.classList.replace('btn-dark', 'btn-outline-dark');
                            countEl.innerHTML = count + 1;
                            count++;
                            faded = true;
                        } else {
                            currentMinusBtn.classList.replace('btn-outline-dark', 'btn-dark');
                            countEl.innerHTML = count - 1;
                            count--;
                            faded = false;
                        }
                        const post = document.querySelector(`#post${postId}`);
                        const posterId = parseInt(post.dataset.poster);
                        const viewerId = parseInt(post.dataset.viewer);
                        updateWings(count, postId, posterId, viewerId, faded, false);
                    }
                });
                collectionsBtns[i].addEventListener('click', e => {
                    if (e.target.classList.contains('btn-dark')) {
                        e.target.classList.replace('btn-dark', 'btn-outline-dark');
                    } else {
                        e.target.classList.replace('btn-outline-dark', 'btn-dark');
                    }
                });
            }
        }
    }

    // We need to update posts that have been liked in real time.
    socket.on('updatePosts', data => {

        let postWingEl = document.querySelector(`#post${data.postId} .wingCount`);
        // only update the html if the post is on the page.
        if (postWingEl) {
            postWingEl.innerHTML = data.wings;

            let viewerId = parseInt(document.querySelector(`#post${data.postId}`).dataset.viewer);
            let updatedOwnpost = data.posterId === viewerId ? true : false;
            // Change buttons if user is viewing themselves in another tab.
            if (updatedOwnpost) {
                let toggleBtns = document.querySelectorAll(`#post${data.postId} .btn-toggle`);
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