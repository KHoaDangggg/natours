const menuBar = document.querySelector('header .menu--bar');
const headerLogo = document.querySelector('.header__logo');
const settingMenu = document.querySelector('.side-nav :first-child');
const settingForm = document.querySelector('.user-view__content');
const setting = document.querySelector('.user-view__menu');
const menuArrow = document.querySelector('.menu-arrow');
const hideMenu = (hide, appear, translate) => () => {
    if (window.innerWidth <= 640) {
        setTimeout(() => {
            hide.style.display = 'none';
        }, 400);
        hide.style.transform = `translateX(${translate}%)`;
        hide.style.opacity = 0.3;
        appear.style.display = 'block';
        menuArrow.style.display = 'block';
        appear.style.transform = 'translateX(0%)';
        appear.style.opacity = 1;
    }
};
if (menuBar) {
    menuBar.onclick = (e) => {
        const menuPopdown = document.querySelector('header .menu-options');
        if (menuPopdown.style.display === 'block')
            menuPopdown.style.display = 'none';
        else menuPopdown.style.display = 'block';
    };
}
if (headerLogo) {
    headerLogo.onclick = () => {
        window.location.replace('/');
    };
}
if (settingMenu) {
    settingMenu.onclick = hideMenu(setting, settingForm, -100);
}
if (menuArrow) {
    menuArrow.onclick = hideMenu(settingForm, setting, 100);
}

window.onresize = () => {
    if (window.innerWidth > 640) {
        settingForm.style.transform = 'translateX(0)';
        setting.style.transform = 'translateX(0)';
        settingForm.style.display = 'block';
        setting.style.display = 'block';
        settingForm.style.opacity = 1;
        setting.style.opacity = 1;
        menuArrow.style.display = 'none';
    }
};
