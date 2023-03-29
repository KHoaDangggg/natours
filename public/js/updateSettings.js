const updateSetting = async (data, type) => {
    const url =
        type === 'password'
            ? 'https://natours-beige.vercel.app/updateMyPassword'
            : 'https://natours-beige.vercel.app/updateMe';

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
