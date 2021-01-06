const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextcanvas = document.getElementById('next');
const nextcontext = nextcanvas.getContext('2d');
const savedcanvas = document.getElementById('saved');
const savedcontext = savedcanvas.getContext('2d');

context.scale(20,20);
nextcontext.scale(20,20);
savedcontext.scale(20,20);

// 줄 꽊찼을때 제거
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) { // 0이 있다는것은 꽉찬것이 아닌것이므로 다음줄로 넘어감
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0); // 줄 삭제하고 삭제된걸로 리턴된 줄을 0으로 채움
        arena.unshift(row); // 맨 앞에 그 줄 추가
        ++y; // 삭제했으므로 index조정
        //점수계산
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

// arena의 0이 아닌 부분과 겹치면 return true
function collide(arena, player) {
    const [m,o] = [player.matrix, player.pos];
    for (let y=0; y < m.length; ++y){
        for (let x=0; x < m[y].length; ++x){
            if (m[y][x] !== 0 &&    // 내 현재 모양(matrix)의 1과 arena의 1(혹은 존재하지 않는 row/col)들이 겹치는지 확인
                (arena[y + o.y] &&  // 아래 더이상 row가 없을때도 먹힘
                    arena[y+o.y][x + o.x]) !== 0){ // 오른쪽/왼쪽으로 더이상 col이 없을때도 먹힘
                return true;
            }
        }
    }
    return false;
}

// 현재 상태 저장하기 위한 matrix table생성 : w,h크기의 table만들고 0으로 채움
function createMatrix(w,h){
    const matrix = [];
    while (h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
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
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
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

// 현재 상태 출력: 현재 쌓인 상태(arena)출력하고 내 현재 모양(player)출력함
function draw(){
    context.fillStyle = '#000';
    context.fillRect(0,0, canvas.width, canvas.height);
    drawMatrix(context, arena, {x:0 , y:0});

    // draw ghost (ghost를 먼저그리고 player를 나중에 그려야 겹쳤을 떄 player가 위에 나타남)
    drawMatrix(context, ghostMatrix(player.matrix), {x:player.pos.x, y:player.pos.y+ghostOffset()});

    // draw player
    drawMatrix(context, player.matrix, player.pos);


    //draw next
    nextcontext.fillStyle = '#000';
    nextcontext.fillRect(0,0, nextcanvas.width, nextcanvas.height);
    // 다음 piece 그림. createPiece()로 그려서 rotate해도 변하지 않도록함.
    drawMatrix(nextcontext, createPiece(pieces[player.nextPiece]), {x:0 , y:0});

    //draw next
    savedcontext.fillStyle = '#000';
    savedcontext.fillRect(0,0, savedcanvas.width, savedcanvas.height);
    // 저장 piece 그림.
    if(player.savedPiece !== -1){
        drawMatrix(savedcontext, createPiece(pieces[player.savedPiece]), {x:0 , y:0});
    }
}

// 1인 부분들은 색으로 출력 (offset으로 현재 player 위치 줌)
function drawMatrix(context, matrix, offset) {
    matrix.forEach((row,y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                y + offset.y,
                                1,1);
            }
        });
    });
}
// ghost 출력할 y offset 계산
function ghostOffset(){
    let offset = 0;
    // collide할때까지 offset 증가시키고 다시 1 뺌
    while(!collide(arena, player)){
        player.pos.y++;
        offset++;
    }
    for (let i = 0; i < offset; ++i){
        player.pos.y--;
    }
    return offset-1;
}
// player와 동일 모양, 다른 색상(값)의 matrix 생성
function ghostMatrix(matrix){
    let ghostmatrix=[];
    let newrow;
    // matrix에서 0 아닌 값들만 8로 바꿈 (colors 배열에서 grey색)
    matrix.forEach(row => {
        newrow = [];
        row.forEach(value => {
            if (value !== 0) {
                newrow.push(8); // grey색은 colors에서 index 8
            }else{
                newrow.push(0);
            }
        });
        ghostmatrix.push(newrow);
    });
    return ghostmatrix;
}

// arena table에서 현재 player가 위치한 곳 모양 위치들 1로 바꿈
function merge(arena, player) {
    player.matrix.forEach((row,y) => {
        row.forEach((value, x) => {
            if (value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// 아래로 한칸 이동: collide시 undo 하고 0으로 리셋
function playerDrop(){
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}
function playerSlam(){
    while(!collide(arena, player)){
        player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    dropCounter = 0;
}

// 왼쪽/오른쪽 이동
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)){
        player.pos.x -= dir;
    }
}
//회전
function playerRotate(dir) {
    rotate(player.matrix, dir); // 회전
    //회전했을때 collide대비
    const pos = player.pos.x;  // 원래 x위치(fail했을때 원래대로 돌려놓기 위해)
    let offset = 1;            // offset: 오른쪽으로 1칸, 왼쪽으로 2칸, 오른쪽으로 3칸 순으로 while loop으로 이동시키면서 collide안할때까지
    while (collide(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1)); //offset이 음수면 -1, 양수면 +1 하고 부호전환
        // failure catch: 내 모양보다 멀리이동하면 에러로 간주 - 원래대로 복원
        if (offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
// 새로운 모양 generate, 만약 generate하자마자 collide하면 GAME OVER -> reset
function doReset(){
    player.matrix = createPiece(pieces[player.currentPiece]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        // GAME OVER
        player.savedPiece = -1; // 저장된 piece와 next piece 초기화
        player.nextPiece = pieces.length * Math.random() | 0;
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}
function playerReset(){
    // next piece를 현재 piece로 바꾸고, next piece 새로 랜덤하게 생성해서 저장.
    player.currentPiece = player.nextPiece;
    player.nextPiece = pieces.length * Math.random() | 0;

    doReset();
}
function playerSave() {
    if (player.savesLeft > 0){
        if (player.savedPiece !== -1){
            //현재 저장된 piece가 있으면 current와 교체
            [player.currentPiece, player.savedPiece] = [player.savedPiece, player.currentPiece];
        }else{
            //없다면 현재 piece저장하고 next piece를 current로 교체
            player.savedPiece = player.currentPiece;
            player.currentPiece = player.nextPiece;
            player.nextPiece = pieces.length * Math.random() | 0;
        }
        doReset();
    }else{

    }
}

// rotate하려면 row를 column으로 바꾼 후 양쪽 col을 서로 바꾸면 됨
// 1 2 3    1 4 7    7 4 1
// 4 5 6 => 2 5 8 => 8 5 2
// 7 8 9    3 6 9    9 6 3
function rotate(matrix, dir){
    // row를 column으로 바꾸기
    for (let y=0; y < matrix.length; ++y){
        for (let x=0; x<y; ++x){
            //matrix[x][y]와 matrix[y][x]를 서로 바꿈
            //ex) [a,b] = [b,a]이렇게 하면 a와 b의 값이 서로 바뀜
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];

        }
    }
    if (dir > 0) { // 양쪽 col을 서로 바꾸기
        matrix.forEach(row => row.reverse());
    }else{ // 반대방향으로 rotate할 경우 양쪽 row를 서로 바꾸면 됨
        matrix.reverse();
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    // update마다 dropCounter에 누적시간 추가. dropCounter가 1초 넘으면 playerDrop하고 다시 draw
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}
function updateScore() {
    document.getElementById('score').innerText = player.score;
}

const pieces = 'ILJOTSZ'; // 다음 piece 접근할 수 있도록 전역변수로.
const colors = [null,'red','blue','violet','green','purple','orange','pink','grey'];  // 'grey'는 ghost전용 색
const arena = createMatrix(12,20);
const player = {
    pos: {x:0, y:0},
    matrix: null,
    currentPiece: null, // 현재 piece index
    nextPiece: pieces.length * Math.random() | 0, // 다음 piece index 초기값.
    savedPiece: -1,
    savesLeft: 1,
    score: 0,
}

document.addEventListener('keydown', event => {
   if (event.keyCode === 37){
       playerMove(-1);
   }else if (event.keyCode === 39) {
       playerMove(1);
   }else if (event.keyCode === 40) {
       playerDrop();
   }else if (event.keyCode === 81) {
       playerRotate(-1);
   }else if (event.keyCode === 87 || event.keyCode === 38) {
       playerRotate(1);
   }else if (event.keyCode === 32) {
       playerSlam();
   }else if (event.keyCode === 67) {
       playerSave();
   }
});

playerReset();
updateScore();
update();