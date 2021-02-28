class Tetris {
  constructor(element) {
    this.element = element;
    this.canvas = element.querySelector(".tetris"); // 게임판
    this.nextcanvas = element.querySelector(".next"); // next 블록 표시되는 판
    this.savedcanvas = element.querySelector(".saved"); // saved 블록 표시되는 판

    this.context = this.canvas.getContext("2d");
    this.nextcontext = this.nextcanvas.getContext("2d");
    this.savedcontext = this.savedcanvas.getContext("2d");

    this.context.scale(20, 20);
    this.nextcontext.scale(20, 20);
    this.savedcontext.scale(20, 20);

    this.arena = new Arena(12, 20);
    this.player = new Player(this);

    this.colors = [
      null,
      "red",
      "blue",
      "violet",
      "green",
      "purple",
      "orange",
      "pink",
      "grey",
    ]; // 'grey'는 ghost전용 색

    let lastTime = 0;
    this._update = (time = 0) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      if(this.player.gameOver === 0){
        this.player.update(deltaTime);
        this.draw();
        this.reqId = requestAnimationFrame(this._update);
      }
    };
    this.updateScore(0);

    this.reqId = null; // requestAnimationFrame을 호출하여 반환된 ID
  }

  // 플레이어 reset
  playerReset(){
    this.player.gameOver = 0;
    this.player.dropInterval = this.player.DROP_SLOW;
    this.speedSave = this.DROP_SLOW;
    this.player.time = 0;
    this.player.speed = 0;
    this.player.score = 0;
    this.updateScore(this.player.score);
    this.arena.clear();
    this.player.reset();
  }

  // 현재 상태 출력: 현재 쌓인 상태(arena)출력하고 내 현재 모양(player)출력함
  draw() {
    this.context.fillStyle = "#000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMatrix(this.context, this.arena.matrix, {x: 0, y: 0});

    // draw ghost (ghost를 먼저그리고 player를 나중에 그려야 겹쳤을 떄 player가 위에 나타남)
    this.drawMatrix(this.context, this.ghostMatrix(this.player.matrix), {
      x: this.player.pos.x,
      y: this.player.pos.y + this.ghostOffset(),
    });

    // draw player
    this.drawMatrix(this.context, this.player.matrix, this.player.pos);

    // draw time
    this.updateTime();
    // draw speed
    this.updateSpeed();

    //draw next
    this.nextcontext.fillStyle = "#000";
    this.nextcontext.fillRect(
      0,
      0,
      this.nextcanvas.width,
      this.nextcanvas.height
    );
    // 다음 piece 그림. createPiece()로 그려서 rotate해도 변하지 않도록함.
    this.drawMatrix(
      this.nextcontext,
      this.player.createPiece(pieces[this.player.nextPiece]),
      {x: 0, y: 0}
    );

    //draw next
    this.savedcontext.fillStyle = "#000";
    this.savedcontext.fillRect(
      0,
      0,
      this.savedcanvas.width,
      this.savedcanvas.height
    );
    // 저장 piece 그림.
    if (this.player.savedPiece !== -1) {
      this.drawMatrix(
        this.savedcontext,
        this.player.createPiece(pieces[this.player.savedPiece]),
        {x: 0, y: 0}
      );
    }
  }

  // 1인 부분들은 색으로 출력 (offset으로 현재 player 위치 줌)
  // context로 어디에 그릴지 구별 (next 네모칸/ saved 네모칸 등...)
  drawMatrix(context, matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = this.colors[value];
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }
  // ghost 출력할 y offset 계산
  ghostOffset() {
    let offset = 0;
    // collide할때까지 offset 증가시키고 다시 1 뺌
    while (!this.arena.collide(this.player)) {
      this.player.pos.y++;
      offset++;
    }
    for (let i = 0; i < offset; ++i) {
      this.player.pos.y--;
    }
    return offset - 1;
  }
  // player와 동일 모양, 다른 색상(값)의 matrix 생성
  ghostMatrix(matrix) {
    let ghostmatrix = [];
    let newrow;
    // matrix에서 0 아닌 값들만 8로 바꿈 (colors 배열에서 grey색)
    matrix.forEach(row => {
      newrow = [];
      row.forEach(value => {
        if (value !== 0) {
          newrow.push(8); // grey색은 colors에서 index 8
        } else {
          newrow.push(0);
        }
      });
      ghostmatrix.push(newrow);
    });
    return ghostmatrix;
  }

  updateScore(score) {
    this.element.querySelector(".score").innerText = score;
  }
  updateTime() {
    this.element.querySelector(".time").innerText = this.player.time;
  }
  updateSpeed() {
    this.element.querySelector(".speed").innerText = this.player.speed;
  }

  // tetris 실행 (업뎃시작)
  run() {
    if (!this.player.timerID) {
      this.player.timer();
    }
    this._update();
  }

  // 3초 창 띄우고 게임 시작
  startGame() {
    this.playerReset(); // 게임 초기화
    this.draw();        // 3초 준비하면서 첫 블록 보이도록

    // 하단 메시지 창 지우기
    document.querySelector("#unreadyBtn").style.display = "none";
    document.querySelector(".messageContainer").style.display = "none";
    // 메인모달 버튼 상태 초기화
    document.querySelector("#mainunreadyBtn").style.display = "none";

    // 게임오버 창 지우기
    document.querySelector("#game-over-modal").style.display = "none";
    // 게임 시작까지 3초 걸린다는 창 띄우기
    document.querySelector("#game-start-modal .modal-footer").style.display = "none";
    document.querySelector("#game-start-modal .modal-title").innerText = "GET READY";
    document.querySelector("#game-start-modal .modal-counter").innerText = "3";
    document.querySelector("#game-start-modal").style.display = "flex";

    let waitingtime = 2;
    let timerId = setInterval(()=>{
      document.querySelector("#game-start-modal .modal-counter").innerText = waitingtime;
      waitingtime--;
      if(waitingtime === 0){
        clearInterval(timerId);
      }
    }, 1000);
    setTimeout(() => {
      document.querySelector("#game-start-modal").style.display = "none";
      document.querySelector("#game-start-modal .modal-footer").style.display = "block";
      document.querySelector("#game-start-modal .modal-title").innerText = "WAITING FOR PLAYERS...";
      this.run();
    }, 3000);
  }

  stopGame(){
    // GAME OVER
    this.player.gameOver = 1;
    cancelAnimationFrame(this.reqId);   // animation request 해제
    clearInterval(this.player.timerID); // 게임 타이머 해제
    this.player.timerID = null;
    this.player.tetris.draw();
    this.player.savedPiece = -1; // 저장된 piece와 next piece 초기화
    this.player.nextPiece = (pieces.length * Math.random()) | 0;
    document.querySelector("#game-over-modal").style.display = "flex";
    document.querySelector("#game-over-modal p").innerText = "You LOSE!";
    // time, speed 초기화는 replay 버튼 누를 시 함
  }

  // 현재 상태를 한번에 보여주는 object 반환
  serialize() {
    return {
      arena: {
        matrix: this.arena.matrix,
      },
      player: {
        matrix: this.player.matrix,
        pos: this.player.pos,
        score: this.player.score,
        // next, saved도 보냄
        nextPiece: this.player.nextPiece,
        savedPiece: this.player.savedPiece,
      },
    };
  }
  unserialize(state) {
    /**
         * 왜 = state.arena 안쓰고 = Object.assign(state.arena) 쓰는거지??
         * Object.assign(state.arena)만 하면 arena/player내 함수들(arena.collide, player.createPiece 등)이 undefined됐다는 에러 발생.
         * => Object.assign(this.arena, state.arena)로 바꿔서 병합하도록 했더니 문제 해결.
         */
    this.arena = Object.assign(this.arena, state.arena);
    this.player = Object.assign(this.player, state.player);
    this.updateScore(this.player.score);
    this.draw();
  }
}
