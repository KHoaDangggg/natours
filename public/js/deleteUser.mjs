const deleteUser = async (userId) => {
    await axios({
        method: 'DELETE',
        url: `/api/v1/users/${userId}`,
    });
    showAlert('success', 'This user has been deleted successfully!');
};

const deleteBtns = document.querySelectorAll('.del-btn');
deleteBtns.forEach((btn) => {
    btn.onclick = async (e) => {
        const id = e.target.dataset.userid;
        if (id) {
            await deleteUser(id);
        }
        window.location.replace('/all-users');
    };
});
