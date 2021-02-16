'use strict';

const main = () => {
    // Toggles privacy information.
    document.querySelector('#auth-privacy').addEventListener('change', e => {
        document.querySelector('#publicInfo').classList.toggle('hidden');
        document.querySelector('#privateInfo').classList.toggle('hidden');
    });
    
    document.querySelector('#auth-image').addEventListener('change', e => {
        if (e.target.files.length > 0) {
            document.querySelector('#imagePreview').src = URL.createObjectURL(e.target.files[0]);
        }
    });
    
    // Checks password information.
    const passInput = document.querySelector('#auth-password');
    const checkList = document.querySelector('#passwordVals');
    const checks = document.querySelectorAll('#passwordVals li');

    passInput.addEventListener('focus', e => {
        checkList.classList.remove('hidden');
    });

    passInput.addEventListener('blur', e => {
        checkList.classList.add('hidden');
    });
    passInput.addEventListener('input', e => {
        const userInput = e.target.value;

        if (userInput.length >= 8) {
            checks[0].classList.replace('valid-error', 'valid-success');
        } else {
            checks[0].classList.replace('valid-success', 'valid-error');
        }
        let numbers = /\d/;
        let letters = /[A-Za-z]/;
        if (numbers.test(userInput) && letters.test(userInput)) {
            checks[1].classList.replace('valid-error', 'valid-success');
        } else {
            checks[1].classList.replace('valid-success', 'valid-error');
        }

        let special = /[!"#$%&'()*+,-./:;<=>?@[\\\]\^_`{\|}~]/
        if (special.test(userInput)) {
            checks[2].classList.replace('valid-error', 'valid-success');
        } else {
            checks[2].classList.replace('valid-success', 'valid-error');
        }
    });

    const form = document.querySelector('.needs-validation');
    // In case user ignores password validation
    form.addEventListener('submit', e => {
        checks.forEach(check => {
            if (check.classList.contains('valid-error')) {
                e.preventDefault();
                e.stopPropagation();
                document.querySelector('label[for="auth-password"]').classList.add('valid-error');
            }
        });
    });
}
main();

