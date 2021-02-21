import socket from './app.js'

(() => {
    const userNav = document.querySelector('#userNav');
    if (userNav) {
        // No need to compute events for buttons if not logged in
        const addFeatherBtns = document.querySelectorAll('.addFeatherBtn');
        const minusFeatherBtns = document.querySelectorAll('.minusFeatherBtn');
        const collectionsBtns = document.querySelectorAll('.collectionBtn');

        const updateWings = (wings, postId, userId, modifier) => {
            let query = `wings=${wings}&postId=${postId}&userId=${userId}&status=${modifier}`;

            const url = `/posts/wings`;
            fetch(url, {
                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
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
                        const id = currentAddBtn.dataset.postid;
                        const countEl = document.querySelector(`#post${id} .wingCount`);
                        let count = parseInt(countEl.innerHTML);

                        if (currentAddBtn.classList.contains('btn-dark')) {
                            currentAddBtn.classList.replace('btn-dark', 'btn-outline-dark');
                            countEl.innerHTML = count - 1;
                            count--;
                        } else {
                            currentAddBtn.classList.replace('btn-outline-dark', 'btn-dark');
                            currentMinusBtn.classList.replace('btn-dark', 'btn-outline-dark');
                            countEl.innerHTML = count + 1;
                            count++;
                        }
                        const userId = document.querySelector(`#post${id}`).dataset.user;
                        updateWings(count, id, parseInt(userId), true);
                    } 
                });
                minusFeatherBtns[i].addEventListener('click', e => {
                    let currentMinusBtn = e.target;
                    let currentAddBtn = addFeatherBtns[i];
                    
                    if (!currentAddBtn.classList.contains('btn-dark')) {
                        // Change the wings locally when the user clicks.
                        const id = currentAddBtn.dataset.postid;
                        const countEl = document.querySelector(`#post${id} .wingCount`);
                        let count = parseInt(countEl.innerHTML);

                        if (currentMinusBtn.classList.contains('btn-dark')) {
                            currentMinusBtn.classList.replace('btn-dark', 'btn-outline-dark');
                            countEl.innerHTML = count + 1;
                            count++;
                        } else {
                            currentAddBtn.classList.replace('btn-dark', 'btn-outline-dark');
                            currentMinusBtn.classList.replace('btn-outline-dark', 'btn-dark');
                            countEl.innerHTML = count - 1;
                            count--;
                        }
                        const userId = document.querySelector(`#post${id}`).dataset.user;
                        updateWings(count, id, parseInt(userId), false);
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

})()