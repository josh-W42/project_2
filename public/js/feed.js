(() => {
    const userNav = document.querySelector('#userNav');
    const bootstrap = window.bootstrap;
    
    // Check if this is a logged in user.
    if (userNav) {
        
        const newButton = document.querySelector('#newButton');
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

    }


    
})()