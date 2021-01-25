// next/saved 때문에 pieces를 많은 곳에서 접근하므로 그냥 전역변수로 놔둠
const pieces = "ILJOTSZ";

const tetrisManager = new TetrisManager(document);
const localTetris = tetrisManager.createPlayer(); // tetris 객체를 반환함
localTetris.element.classList.add("local"); // css에서 내 tetris 테두리 하얗게 칠하게 위해 local class 추가
//localTetris.run(); // 내 tetris 실행

const connectionManager = new ConnectionManager(tetrisManager);
connectionManager.connect("ws://localhost:3000");

const keyListener = event => {
  [
    [37, 39, 40, 81, 87, 38, 32, 67], // player 1 조작키
    [100, 102, 101, 52, 104, 54, 96, 107], // player 2 조작키
  ].forEach((key, index) => {
    const player = localTetris.player;
    // player들끼리 키 꾹 누를때 간섭 없도록 keyup과 keydown을 나눔 - 나중에 online으로 가면 다시 원래대로 합치자
    // 근데 양옆으로 꾹 눌러서 이동할때는 안나눠서 여전히 간섭 남음. 어차피 online multiplayer로 가면 신경쓸 필요 없는 부분
    if (event.type === "keydown") {
      // 키 누르자마자 반응해야 하는 것들
      if (event.keyCode === key[0]) {
        player.move(-1);
      } else if (event.keyCode === key[1]) {
        player.move(1);
      } else if (event.keyCode === key[3]) {
        player.rotate(-1);
      } else if (event.keyCode === key[4] || event.keyCode === key[5]) {
        player.rotate(1);
      } else if (event.keyCode === key[6]) {
        player.slam();
      } else if (event.keyCode === key[7]) {
        player.save();
      }
    }
    if (event.keyCode === key[2]) {
      // DROP시 keydown에는 drop속도 빠르게 바꾸고, keyup시에는 drop속도 원래대로 복원
      if (event.type === "keydown") {
        if (player.dropInterval !== player.DROP_FAST) {
          //player.drop(); // 이거 없어도 잘 돌아가는데?
          player.dropInterval = player.DROP_FAST;
        }
      } else {
        // keyup일때
        player.dropInterval = player.DROP_SLOW;
      }
    }
  });
};

document.addEventListener("keydown", keyListener);
document.addEventListener("keyup", keyListener);
