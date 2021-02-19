(() => {
    const userNav = document.querySelector('#userNav');
    const bootstrap = window.bootstrap;
    
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

        // Toggles privacy information.
        document.querySelector('#flock-privacy').addEventListener('change', e => {
            document.querySelector('#publicInfo').classList.toggle('hidden');
            document.querySelector('#privateInfo').classList.toggle('hidden');
        });
        
        document.querySelector('#flock-image').addEventListener('change', e => {
            if (e.target.files.length > 0) {
                document.querySelector('#imagePreview').src = URL.createObjectURL(e.target.files[0]);
            }
        });        
    }


    
})()