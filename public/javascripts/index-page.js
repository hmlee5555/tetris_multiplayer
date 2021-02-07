// const purple = "#7600FF";
// const lightgrey = "#C1C1C1";
// const white = "#fff";
// function setColor(menuitem, color){
//     // 아이콘과 텍스트 색깔 변경
//     menuitem.style.color = color;
//     menuitem.querySelector('path').setAttribute("fill", color);
// }

document.querySelectorAll('.menu').forEach(item => {
    if (item.id === "quickmatch"){
        //QUICK MATCH button
        item.addEventListener('click', event => {
            window.location.href = '/game';
        });
    }else if (item.id === "howto") {
        //HOW TO PLAY button
        item.addEventListener('click', event => {
            window.location.href = '/howto';
        });
    }else{
        //CREATE/JOIN SESSION button
        item.addEventListener('click', event => {
            // 로그인 모달 띄우기??
        });
    }
});

