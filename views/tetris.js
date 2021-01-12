class Tetris{
    constructor(element) {
        this.element = element;
        this.canvas = element.querySelector('.tetris');     // 게임판
        this.nextcanvas = element.querySelector('.next');   // next 블록 표시되는 판
        this.savedcanvas = element.querySelector('.saved'); // saved 블록 표시되는 판

        this.context = this.canvas.getContext('2d');
        this.nextcontext = this.nextcanvas.getContext('2d');
        this.savedcontext = this.savedcanvas.getContext('2d');

        this.context.scale(20,20);
        this.nextcontext.scale(20,20);
        this.savedcontext.scale(20,20);

        this.arena = new Arena(12,20);
        this.player = new Player(this);

        this.colors = [null,'red','blue','violet','green','purple','orange','pink','grey'];  // 'grey'는 ghost전용 색

        let lastTime = 0;
        const update = (time = 0) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            this.player.update(deltaTime);

            this.draw();
            requestAnimationFrame(update);
        }
        update();
        this.updateScore(0);
    }

    // 현재 상태 출력: 현재 쌓인 상태(arena)출력하고 내 현재 모양(player)출력함
    draw(){
        this.context.fillStyle = '#000';
        this.context.fillRect(0,0, this.canvas.width, this.canvas.height);
        this.drawMatrix(this.context, this.arena.matrix, {x:0 , y:0});

        // draw ghost (ghost를 먼저그리고 player를 나중에 그려야 겹쳤을 떄 player가 위에 나타남)
        this.drawMatrix(this.context, this.ghostMatrix(this.player.matrix), {x:this.player.pos.x, y:this.player.pos.y+this.ghostOffset()});

        // draw player
        this.drawMatrix(this.context, this.player.matrix, this.player.pos);


        //draw next
        this.nextcontext.fillStyle = '#000';
        this.nextcontext.fillRect(0,0, this.nextcanvas.width, this.nextcanvas.height);
        // 다음 piece 그림. createPiece()로 그려서 rotate해도 변하지 않도록함.
        this.drawMatrix(this.nextcontext, createPiece(pieces[this.player.nextPiece]), {x:0 , y:0});

        //draw next
        this.savedcontext.fillStyle = '#000';
        this.savedcontext.fillRect(0,0, this.savedcanvas.width, this.savedcanvas.height);
        // 저장 piece 그림.
        if(this.player.savedPiece !== -1){
            this.drawMatrix(this.savedcontext, createPiece(pieces[this.player.savedPiece]), {x:0 , y:0});
        }
    }

    // 1인 부분들은 색으로 출력 (offset으로 현재 player 위치 줌)
    // context로 어디에 그릴지 구별 (next 네모칸/ saved 네모칸 등...)
    drawMatrix(context, matrix, offset) {
        matrix.forEach((row,y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = this.colors[value];
                    context.fillRect(x + offset.x,
                        y + offset.y,
                        1,1);
                }
            });
        });
    }
    // ghost 출력할 y offset 계산
    ghostOffset(){
        let offset = 0;
        // collide할때까지 offset 증가시키고 다시 1 뺌
        while(!this.arena.collide(this.player)){
            this.player.pos.y++;
            offset++;
        }
        for (let i = 0; i < offset; ++i){
            this.player.pos.y--;
        }
        return offset-1;
    }
    // player와 동일 모양, 다른 색상(값)의 matrix 생성
    ghostMatrix(matrix){
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

    updateScore(score) {
        this.element.querySelector('.score').innerText = score;
    }

}