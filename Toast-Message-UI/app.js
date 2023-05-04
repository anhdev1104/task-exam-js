const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function toast({
    title = '',
    message = '',
    type = '',
    duration = 3000
}) {
    const main = $('#toast');

    if (main) {
        const toast = document.createElement('div');

        // Auto remove toast
        const autoRemoveToast = setTimeout(() => {
            main.removeChild(toast);
        },duration + 1000);

        // Remove toast when click
        toast.onclick = function(e) {
            if (e.target.closest('.toast__close')) {
                main.removeChild(toast);
                clearTimeout(autoRemoveToast);
            }
        }

        const icons = {
            success: 'fa-solid fa-circle-check',
            info: 'fa-solid fa-circle-info',
            warning: 'fa-solid fa-triangle-exclamation',
            error: 'fa-solid fa-bug'
        }
        const icon = icons[type];
        const delay = (duration / 1000).toFixed(2);

        toast.classList.add('toast', `toast--${type}`);
        toast.style.animation = `slideInLeft .3s ease, fadeOut linear 1s ${delay}s forwards`;
        toast.innerHTML = `
            <div class="toast__icon">
                <i class="${icon}"></i>
            </div>
                <div class="toast__body">
                    <h3 class="toast__title">${title}</h3>
                    <p class="toast__msg">${message}</p>
                </div>
                <div class="toast__close">
                    <i class="fa-solid fa-xmark"></i>
                </div>
        `;
        main.appendChild(toast);
    }

}

function showSuccessToast() {
    toast(
        {
            title: 'Thành công !',
            message: 'Đăng kí tài khoản thành công.',
            type: 'success',
            duration: 5000,
        }
    );

}

function showErrorToast() {
    toast(
        {
            title: 'Thất bại !',
            message: 'Có lỗi xảy ra vui lòng liên hệ quản trị viên',
            type: 'error',
            duration: 5000,
        }
    );
}

