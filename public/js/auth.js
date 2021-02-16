document.querySelector('#auth-privacy').addEventListener('change', e => {
    document.querySelector('#publicInfo').classList.toggle('hidden');
    document.querySelector('#privateInfo').classList.toggle('hidden');
});

document.querySelector('#auth-image').addEventListener('change', e => {
    if (e.target.files.length > 0) {
        document.querySelector('#imagePreview').src = URL.createObjectURL(e.target.files[0]);
    }
});