// const purple = "#7600FF";
// const lightgrey = "#C1C1C1";
// const white = "#fff";
const loginModal = document.querySelector('#login-modal');
const sessionModal = document.querySelector('#session-modal');

document.querySelectorAll('.menu').forEach(item => {
    if (item.id === "quickmatch"){
        //QUICK MATCH button
        item.addEventListener('click', () => {
            window.location.href = '/game';
        });
    }else if (item.id === "login") {
        //login button : 로그인 모달 띄우기
        item.addEventListener('click', () => {
            toggleModal(loginModal);
        });
    }else{
        //CREATE/JOIN SESSION button
        item.addEventListener('click', () => {
            toggleModal(sessionModal);
        });
    }
});

//모달 밖 영역 클릭하면 모달 닫기
document.querySelectorAll('.overlay').forEach(item => {
    item.addEventListener('click', () => {
        // overlay에 클릭하므로 그의 parentNode가 modal-wrapper
        toggleModal(item.parentNode);
    });
});

// 모달 toggle: wrapper HTML elemnet를 받음
function toggleModal(wrapper){
    if (wrapper.style.display === "none"){
        wrapper.style.display = "flex";
    }else{
        wrapper.style.display = "none";
        wrapper.querySelector('.modal-error').innerHTML = "";
    }
}
