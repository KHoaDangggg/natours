const deleteUser = async (userId) => {
    await axios({
        method: 'DELETE',
        url: `/api/v1/users/${userId}`,
    });
};

const deleteBtns = document.querySelectorAll('.card-body a');
deleteBtns.forEach((btn) => {
    btn.onclick = (e) => {
        const id = e.target.closest('.card-body').dataset.userid;
        if (id) {
            deleteUser(id);
        }
        e.target.closest('.card').style.display = 'none';
    };
});
