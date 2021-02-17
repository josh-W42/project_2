(() => {
    const newButton = document.querySelector('#newButton');

    // Check if this is a logged in user.
    if (newButton) {
        const newContentBtns = document.querySelectorAll('#contentCreation .option');

        // Applying animations to new content buttons.
        newButton.addEventListener('click', e => {
            newContentBtns.forEach(button => {
                button.classList.replace('invisible', 'visible');
            });
        });

        newButton.addEventListener('blur', e => {
            setTimeout(() => {
                newContentBtns.forEach(button => {
                    button.classList.replace('visible', 'invisible');
                });
            }, 1000);
        });
    }

    const myTab = document.querySelector('#myTab');
    // if (myTab) {
    //     let tabList = document.querySelectorAll('#myTab button');
    //     tabList.forEach(tabButton => {
    //         let tabTrigger = new bootstrap.Tab(tabButton);
    //         tabButton.addEventListener('click', e => {
    //             e.preventDefault();
    //             if (e.target.classList.contains('active')) {
    //                 tabTrigger.dispose();
    //             } else {
    //                 tabTrigger.show();
    //             }
    //         });
    //     });
    // }
})()