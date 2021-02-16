document.querySelector('#auth-privacy').addEventListener('change', e => {
    document.querySelector('#publicInfo').classList.toggle('hidden');
    document.querySelector('#privateInfo').classList.toggle('hidden');
});