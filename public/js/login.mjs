const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};
const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};
const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password,
            },
        });
        if (res.data.status === 'Success') {
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 200);
        }
    } catch (err) {
        showAlert('error', 'ERROR');
    }
};
if (document.querySelector('.form--login')) {
    document.querySelector('.form--login').onsubmit = (e) => {
        e.preventDefault();
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        login(email, password);
    };
}

const logout = async () => {
    try {
        console.log('Log out ...');
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        });
        if (res.data.status === 'success') {
            location.assign('/');
        }
    } catch (error) {
        console.log(error);
        showAlert('error', 'Logged out');
    }
};

if (document.querySelector('.nav__el--logout')) {
    document.querySelector('.nav__el--logout').onclick = (e) => {
        e.preventDefault();
        logout();
    };
}
