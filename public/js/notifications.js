const bootstrap = window.bootstrap;
    let toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
        let newToast = new window.bootstrap.Toast(toast);
        newToast.show();
});