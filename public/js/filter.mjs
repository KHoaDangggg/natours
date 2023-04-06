const selection = document.querySelector('#Sort');

const filter = async (fil) => {
    const url = `/?sort=${fil}`;
    window.location.replace(url);
};

if (selection) {
    selection.onchange = (e) => {
        const value = e.target.value;
        filter(value);
    };
}
