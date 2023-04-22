const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};
const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 1500);
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
        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 200);
        }
    } catch (err) {
        showAlert('error', 'Wrong username or password');
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
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/logout',
        });
        if (res.data.status === 'success') {
            location.assign('/');
        }
    } catch (error) {
        showAlert('error', 'Logged out');
    }
};

if (document.querySelector('.nav__el--logout')) {
    document.querySelector('.nav__el--logout').onclick = (e) => {
        e.preventDefault();
        logout();
    };
}
if (document.querySelector('header .logout')) {
    document.querySelector('header .logout').onclick = (e) => {
        e.preventDefault();
        logout();
    };
}

const signup = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm,
            },
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Create successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 200);
        }
    } catch (err) {
        showAlert('error', 'Invalid username or password or password confirm');
    }
};
if (document.querySelector('.form--signup')) {
    document.querySelector('.form--signup').onsubmit = (e) => {
        e.preventDefault();
        const name = document.querySelector('#name').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        const passwordConfirm =
            document.querySelector('#passwordConfirm').value;
        signup(name, email, password, passwordConfirm);
    };
}
