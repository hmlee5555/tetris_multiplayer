// const purple = "#7600FF";
// const lightgrey = "#C1C1C1";
// const white = "#fff";
const loginModal = document.querySelector('#login-modal');
const sessionModal = document.querySelector('#session-modal');
const aboutModal = document.querySelector('#about-modal');
const howtoModal = document.querySelector('#howto-modal');

document.querySelectorAll('.menu').forEach(item => {
    if (item.id === "quickmatch"){
        //QUICK MATCH button
        item.addEventListener('click', () => {
            window.location.href = '/game';
        });
    }else if (item.id === "login") {
        //login button : 로그인 모달 띄우기
        item.addEventListener('click', () => {
            // 로그인 모달 토글
            toggleModal(loginModal);
        });
    }else if (item.id === "mypage") {
        item.addEventListener('click', () => {
            window.location.href = '/update_info';
        });
    }else{
        //CREATE/JOIN SESSION button
        item.addEventListener('click', () => {
            toggleModal(sessionModal);
        });
    }
});

document.querySelectorAll('.footeritem').forEach(item => {
    if (item.id === "about"){
        // ABOUT button
        item.addEventListener('click', () => {
            toggleModal(aboutModal);
        });
    }else if (item.id === "howto") {
        // HOW TO button
        item.addEventListener('click', () => {
            toggleModal(howtoModal);
        });
    }
});

document.querySelectorAll('.overlay').forEach(item => {
    item.addEventListener('click', () => {
        // overlay에 클릭하므로 그의 parentNode가 modal-wrapper
        toggleModal(item.parentNode);
    });
});


function toggleModal(wrapper){
    if (wrapper.style.display === "none"){
        wrapper.style.display = "flex";
        wrapper.querySelector('label').focus(); // 입력창에 focus
    }else{
        wrapper.style.display = "none";
        // 모달 닫을 시 에러문구 삭제
        wrapper.querySelector('.modal-error').innerHTML = "";
    }
}
