// const purple = "#7600FF";
// const lightgrey = "#C1C1C1";
// const white = "#fff";

document.querySelectorAll('.menu').forEach(item => {
    if (item.id === "quickmatch"){
        //QUICK MATCH button
        item.addEventListener('click', () => {
            window.location.href = '/game';
        });
    }else if (item.id === "login") {
        //login button
        item.addEventListener('click', () => {
            // 로그인 모달 띄우기??
            toggleModal();
        });
    }else{
        //CREATE/JOIN SESSION button
        item.addEventListener('click', event => {

        });
    }
});

document.querySelectorAll('.overlay').forEach(item => {
    item.addEventListener('click', () => {
        toggleModal();
    });
});


function toggleModal(){
    let modal = document.querySelector(".modal-wrapper");
    if (modal.style.display === "none"){
        modal.style.display = "flex";
    }else{
        modal.style.display = "none";
    }
}
