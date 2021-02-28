// next/saved 때문에 pieces를 많은 곳에서 접근하므로 그냥 전역변수로 놔둠
const pieces = "ILJOTSZ";

const tetrisManager = new TetrisManager(document);
const localTetris = tetrisManager.createPlayer(); // tetris 객체를 반환함
localTetris.element.classList.add("local"); // css에서 내 tetris 테두리 하얗게 칠하게 위해 local class 추가
//localTetris.run(); // 내 tetris 실행

const connectionManager = new ConnectionManager(tetrisManager);
connectionManager.connect("ws://localhost:3000");

// REPLAY 버튼
document.querySelector("#replayBtn").addEventListener('click', () => {
  document.querySelector("#game-over-modal").style.display = "none";  // 게임오버 창 지우기
  document.querySelector("#game-start-modal .modal-counter").innerText = "";  // 레디 창 띄우기
  document.querySelector("#game-start-modal").style.display = "flex";
  // 상대 플레이어 존재할 때만 레디상태 보냄
  if (connectionManager.peers.size !== 0) {
    toggleReady('main', true);
  }
});

// PLAY SOLO 버튼
// 혼자 있는데 레디 보내므로 전체 레디상태 됨 -> 게임 시작
document.querySelector('#mainsoloBtn').addEventListener('click', () => {
  toggleReady('main', true);
});

// READY 버튼들
const readyBtn = document.querySelector("#readyBtn");
const unreadyBtn = document.querySelector("#unreadyBtn");
const mainreadyBtn = document.querySelector("#mainreadyBtn");
const mainunreadyBtn = document.querySelector("#mainunreadyBtn");
mainreadyBtn.addEventListener('click', () => {
  toggleReady('main', true);
});
mainunreadyBtn.addEventListener('click', () => {
  toggleReady('main', false);
});
readyBtn.addEventListener('click', () => {
  toggleReady('message', true);
});
unreadyBtn.addEventListener('click', () => {
  toggleReady('message', false);
});
// 키보드로도 레디 토글할 수 있도록
document.addEventListener("keydown", event => {
  if (event.keyCode === 82){  // 'R'키 누르면 작동
    // ready버튼 보일때만 작동하도록
    if (document.querySelector("#game-start-modal").style.display !== "none" && document.querySelector("#game-start-modal .modal-footer").style.display !== "none"){
      if (mainreadyBtn.style.display !== 'none'){
        toggleReady('main', true);
      } else if (mainunreadyBtn.style.display !== 'none'){
        toggleReady('main', false);
      }
    }else if (document.querySelector(".messageContainer").style.display !== "none"){
      if (readyBtn.style.display !== 'none'){
        toggleReady('message', true);
      } else if (unreadyBtn.style.display !== 'none'){
        toggleReady('message', false);
      }
    }
  }
});

// 레디 설정/해제 :       btnLocation: 어디에 있는 버튼인지(메인모달 or 하단 메시지모달)
//                    readyState: 레디 설정/해제
function toggleReady(btnLocation, readyState){
  if (btnLocation === 'main'){  // 메인모달
    if (readyState){
      mainunreadyBtn.style.display = "inline";
      mainreadyBtn.style.display = "none";
    }else{
      mainreadyBtn.style.display = "inline";
      mainunreadyBtn.style.display = "none";
    }
  }else{
    if (readyState){  // 하단 메시지모달 (게임 진행 중 모달)
      document.querySelector("#message").innerHTML = "Waiting for other players to get ready...";
      unreadyBtn.style.display = "block";
      readyBtn.style.display = "none";
    }else{
      document.querySelector("#message").innerHTML = "New player has entered the session. Restart the game?";
      readyBtn.style.display = "block";
      unreadyBtn.style.display = "none";
    }
  }
  connectionManager.ready(readyState);  // 레디상태 서버로 전송
}


const keyListener = event => {
  [
    [37, 39, 40, 81, 87, 38, 32, 67], // player 1 조작키
    [100, 102, 101, 52, 104, 54, 96, 107], // player 2 조작키
  ].forEach((key, index) => {
    const player = localTetris.player;

    // 게임 진행중일때만 키입력 받음
    if (!player.timerID){ // 진행중일때만 timerID존재 (게임오버 후나 카운트다운 중에는 키입력 X)
      return;
    }
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
          player.speedSave = player.dropInterval;
          //player.drop(); // 이거 없어도 잘 돌아가는데?
          player.dropInterval = player.DROP_FAST;
        }
      } else {
        // keyup일때
        player.dropInterval = player.speedSave;
      }
    }
  });
};

document.addEventListener("keydown", keyListener);
document.addEventListener("keyup", keyListener);
