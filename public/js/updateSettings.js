const updateSetting = async (data, type) => {
    const url =
        type === 'password'
            ? '/api/v1/users/updateMyPassword'
            : '/api/v1/users/updateMe';

    await axios({
        method: 'PATCH',
        url,
        data,
    });
};

if (document.querySelector('.form-user-data')) {
    document.querySelector('.form-user-data').onsubmit = (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.querySelector('#name').value);
        form.append('email', document.querySelector('#email').value);
        form.append('photo', document.querySelector('#photo').files[0]);
        updateSetting(form, 'data');
    };
}
if (document.querySelector('.form-user-settings')) {
    document.querySelector('.form-user-settings').onsubmit = (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append(
            'password-current',
            document.querySelector('#password-current').value
        );
        form.append('password', document.querySelector('#password').value);
        form.append(
            'password-confirm',
            document.querySelector('#password-confirm').value
        );
        updateSetting(form, 'password');
    };
}
