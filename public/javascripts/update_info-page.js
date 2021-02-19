const updateform = document.getElementById("updateForm");

// 마이페이지에서 정보 수정 버튼 누르면 수정 form 뜨도록
function toggleForm(wrapper = updateform){
    if (wrapper.style.display === "none"){
        wrapper.style.display = "flex";
    }else{
        wrapper.style.display = "none";
    }
}