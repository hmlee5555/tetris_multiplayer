// 모양들. 숫자를 달리해서 색깔로 매핑
function createPiece(type){
    if (type === 'T') {
        return [
            [0,0,0],
            [1,1,1],
            [0,1,0],
        ];
    }else if (type === 'O'){
        return [
            [2,2],
            [2,2],
        ];
    }else if (type === 'L'){
        return [
            [0,3,0],
            [0,3,0],
            [0,3,3],
        ];
    }else if (type === 'J'){
        return [
            [0,4,0],
            [0,4,0],
            [4,4,0],
        ];
    }else if (type === 'I'){
        return [
            [0,0,0,0],
            [5,5,5,5],
            [0,0,0,0],
            [0,0,0,0],
        ];
    }else if (type === 'S'){
        return [
            [0,6,6],
            [6,6,0],
            [0,0,0],
        ];
    }else if (type === 'Z'){
        return [
            [7,7,0],
            [0,7,7],
            [0,0,0],
        ];
    }
}

// next/saved 때문에 pieces를 많은 곳에서 접근하므로 그냥 전역변수로 놔둠
const pieces = 'ILJOTSZ';

const tetri = []; // tetris들
/*
    querySelector(): selector와 일치하는 첫번쩨 element 반환
    querySelectorAll(): 일치하는 element들의 NodeList 반환
 */
const playerElements = document.querySelectorAll('.player'); // player클래스 element들의 배열


/*
    spread syntax (...)는 iterable한 변수를 전개함.
    ex) numbers = [1,2,3]이면
        sum(...numbers)는 sum(1,2,3)과 같은 효과를 가짐.
    따라서 [...playerElements]로 playerElement를 array로 변환하는듯?
 */
[...playerElements].forEach(element => {
    const tetris = new Tetris(element);
    tetri.push(tetris);
})


const keyListener = (event) => {
    [
        [37,39,40,81,87,38,32,67], // player 1 조작키
        [49,50,51,52,53,54,55,56], // player 2 조작키
    ].forEach((key,index) =>{
        const player = tetri[index].player;
        // player들끼리 키 꾹 누를때 간섭 없도록 keyup과 keydown을 나눔 - 나중에 online으로 가면 다시 원래대로 합치자
        // 근데 양옆으로 꾹 눌러서 이동할때는 안나눠서 여전히 간섭 남음. 어차피 online multiplayer로 가면 신경쓸 필요 없는 부분
        if (event.type === 'keydown'){ // 키 누르자마자 반응해야 하는 것들
            if (event.keyCode === key[0]){
                player.move(-1);
            }else if (event.keyCode === key[1]) {
                player.move(1);
            }else if (event.keyCode === key[3]) {
                player.rotate(-1);
            }else if (event.keyCode === key[4] || event.keyCode === key[5]) {
                player.rotate(1);
            }else if (event.keyCode === key[6]) {
                player.slam();
            }else if (event.keyCode === key[7]) {
                player.save();
            }
        }
        if (event.keyCode === key[2]) {
            // DROP시 keydown에는 drop속도 빠르게 바꾸고, keyup시에는 drop속도 원래대로 복원
            if (event.type === 'keydown'){
                if (player.dropInterval !== player.DROP_FAST){
                    //player.drop(); // 이거 없어도 잘 돌아가는데?
                    player.dropInterval = player.DROP_FAST;
                }
            }else{ // keyup일때
                player.dropInterval = player.DROP_SLOW;
            }
        }
    });
};

document.addEventListener('keydown', keyListener);
document.addEventListener('keyup', keyListener);


