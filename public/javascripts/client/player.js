class Player {
  constructor(tetris) {
    this.tetris = tetris;
    this.arena = tetris.arena;

    this.events = new Events();

    this.DROP_SLOW = 1000;
    this.DROP_FAST = 100; // 50으로 하니까 너무 짧아서 한번만 눌러도 두칸씩 이동;; 좀 늘림
    this.dropCounter = 0;
    this.dropInterval = this.DROP_SLOW;

    this.pos = {x: 0, y: 0};
    this.matrix = null;
    this.currentPiece = null; // 현재 piece index
    this.nextPiece = -1; // 다음 piece index
    this.savedPiece = -1;
    this.savesLeft = 1; // save 기회 수 (1이면 save된거랑 교체할 기회 한번)
    this.score = 0;
    // time, speed
    this.timerID = null; // 게임 타이머 setInterval 아이디
    this.time = 0;
    this.speed = 0;

    this.gameOver = 0; // gameover

    this.reset();
  }

  // 게임 시간 타이머
  timer() {
    /***
     * 1. 아래 방향키 누를때마다 interval이 DROP_SLOW로 리셋돼서 사실상 스피드 올라가지 X
     * 2. 플레이하다가 다른 플레이어 들어올때마다 tetris.run()이 실행되는지 timer가 두배로 빨라짐
     *    -> 플레이 도중에 다른 플레이어 들어올때 고려해야함.
     */
    this.timerID = setInterval(() => {
      this.time += 1;
      // time 조정
      if (this.dropInterval > 50) {
        if (this.time % 10 === 0) {
          this.dropInterval -= 5;
          if (this.time % 20 === 0) {
            this.speed++;
            this.dropInterval -= 40;
          }
        }
      } else {
        this.speed = "MAX";
      }
      // time와 speed 업뎃 broadcast
      this.events.emit("time", this.time);
      this.events.emit("speed", this.speed);
    }, 1000);
  }

  // 왼쪽/오른쪽 이동
  move(dir) {
    this.pos.x += dir;
    if (this.arena.collide(this)) {
      this.pos.x -= dir;
      return; // collide한 경우 emit하지않기 위해
    }
    this.events.emit("pos", this.pos);
  }

  // 새로운 모양 generate, 만약 generate하자마자 collide하면 GAME OVER -> reset
  doReset() {
    this.matrix = this.createPiece(pieces[this.currentPiece]);
    this.pos.y = 0;
    this.pos.x =
      ((this.arena.matrix[0].length / 2) | 0) -
      ((this.matrix[0].length / 2) | 0);

    if (this.arena.collide(this)) {
      // GAME OVER
      this.tetris.stopGame();
    }

    this.events.emit("pos", this.pos);
    this.events.emit("matrix", this.matrix);
    // next와 saved, time ,speed도 전달 - 한번에 전달하는 방법 없을까?
    this.events.emit("nextPiece", this.nextPiece);
    this.events.emit("savedPiece", this.savedPiece);
    this.events.emit("time", this.time);
    this.events.emit("speed", this.speed);
    this.events.emit("gameOver", this.gameOver);
  }

  reset() {
    // 처음 실행시에는 nextPiece null이므로 새로 생성
    if (this.nextPiece === -1) {
      this.nextPiece = (pieces.length * Math.random()) | 0;
    }
    // next piece를 현재 piece로 바꾸고, next piece 새로 랜덤하게 생성해서 저장.
    this.currentPiece = this.nextPiece;
    this.nextPiece = (pieces.length * Math.random()) | 0;

    this.doReset();
  }

  //회전
  rotate(dir) {
    //회전했을때 collide대비
    this._rotateMatrix(this.matrix, dir); // 회전
    const pos = this.pos.x; // 원래 x위치(fail했을때 원래대로 돌려놓기 위해)
    const y_pos = this.pos.y;
    let offset = 1; // offset: 오른쪽으로 1칸, 왼쪽으로 2칸, 오른쪽으로 3칸 순으로 while loop으로 이동시키면서 collide안할때까지
    let y_offset = 1; // y offset: 하나씩 증가시키며 아래칸으로 내림

    while (this.arena.collide(this)) {
      this.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1)); //offset이 음수면 -1, 양수면 +1 하고 부호전환
      // failure catch: 내 모양보다 멀리이동하면 에러로 간주 - 원래대로 복원
      if (offset > this.matrix[0].length) {
        // 가로로 이동했을때는 효과없으면? -> 한칸 아래로 내려서 다시 시도
        this.pos.x = pos; // x offset, x위치 초기화
        offset = 1;
        this.pos.y++; // y offset 증가
        y_offset++;
        if (y_offset > this.matrix.length) {
          // 기준 어떻게 잡아야할까???
          this._rotateMatrix(this.matrix, -dir);
          this.pos.x = pos;
          this.pos.y = y_pos; // x,y 둘다 초기화
          return;
        }
      }
    }
    this.events.emit("matrix", this.matrix);
  }
  // rotate하려면 row를 column으로 바꾼 후 양쪽 col을 서로 바꾸면 됨
  // 1 2 3    1 4 7    7 4 1
  // 4 5 6 => 2 5 8 => 8 5 2
  // 7 8 9    3 6 9    9 6 3
  _rotateMatrix(matrix, dir) {
    // row를 column으로 바꾸기
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        //matrix[x][y]와 matrix[y][x]를 서로 바꿈
        //ex) [a,b] = [b,a]이렇게 하면 a와 b의 값이 서로 바뀜
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) {
      // 양쪽 col을 서로 바꾸기
      matrix.forEach(row => row.reverse());
    } else {
      // 반대방향으로 rotate할 경우 양쪽 row를 서로 바꾸면 됨
      matrix.reverse();
    }
  }

  // 모양들. 숫자를 달리해서 색깔로 매핑
  createPiece(type) {
    if (type === "T") {
      return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
    } else if (type === "O") {
      return [[2, 2], [2, 2]];
    } else if (type === "L") {
      return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
    } else if (type === "J") {
      return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
    } else if (type === "I") {
      return [[0, 0, 0, 0], [5, 5, 5, 5], [0, 0, 0, 0], [0, 0, 0, 0]];
    } else if (type === "S") {
      return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    } else if (type === "Z") {
      return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    }
  }

  // 아래로 한칸 이동: collide시 undo 하고 0으로 리셋
  drop() {
    this.pos.y++;
    this.dropCounter = 0;
    if (this.arena.collide(this)) {
      this.pos.y--;
      this.arena.merge(this);
      this.reset();
      this.score += this.arena.sweep();
      this.tetris.updateScore(this.score); // 영상에서 실수인듯? 본인 score도 업뎃해줘야함!!
      this.events.emit("score", this.score);
      return;
    }
    this.events.emit("pos", this.pos);
  }

  slam() {
    while (!this.arena.collide(this)) {
      this.pos.y++;
    }
    this.pos.y--;
    this.arena.merge(this);
    this.reset();
    this.score += this.arena.sweep();
    this.tetris.updateScore(this.score);
    this.events.emit("score", this.score);
    this.dropCounter = 0;
  }

  save() {
    // save 기회 소진 전: save된 도형이랑 바꿈
    if (this.savesLeft > 0) {
      if (this.savedPiece !== -1) {
        //현재 저장된 piece가 있으면 current와 교체
        [this.currentPiece, this.savedPiece] = [
          this.savedPiece,
          this.currentPiece,
        ];
      } else {
        //없다면 현재 piece저장하고 next piece를 current로 교체
        this.savedPiece = this.currentPiece;
        this.currentPiece = this.nextPiece;
        this.nextPiece = (pieces.length * Math.random()) | 0;
      }
      //this.savesLeft--; // save기회 1번 차감(일단은 해제해놓은 상태)
      this.doReset();
    } else {
      // save 기회 소진됐다면?: 아무것도 안함
      // 나중에 save 기회 소진했다는 문구나 에니메이션 표시 필요할듯
    }
  }

  update(deltaTime) {
    // update마다 dropCounter에 누적시간 추가. dropCounter가 1초 넘으면 player.drop 다시 draw
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.drop();
    }
  }
}
