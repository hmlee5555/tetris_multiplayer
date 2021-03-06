class ConnectionManager {
  constructor(tetrisManager) {
    this.conn = null; // connection
    this.peers = new Map(); // session에 있는 사람들 map

    this.tetrisManager = tetrisManager;
    this.localTetris = [...tetrisManager.instances][0];
  }
  connect(address) {
    this.conn = new WebSocket(address);

    // connection established
    this.conn.addEventListener("open", () => {
      console.log("Connection Established");

      this.initSession(); // session join/create
      this.watchEvents();
    });

    // 메세지 받을때마다 발동
    this.conn.addEventListener("message", event => {
      console.log("Received Message", event.data);
      this.receive(event.data);
    });
  }

  // session join/create
  initSession() {
    const sessionId = window.location.hash.split("#")[1]; // '#'이후로 오는거 다
    const state = this.localTetris.serialize(); // join할 당시 tetris 상태.

    if (sessionId) {
      // 주소 뒤에 세션ID 있으면 그 세션 join
      this.send({
        type: "join-session",
        id: sessionId,
        state,
      });
    } else {
      // 세션ID 없으면 세션 새로 생성
      this.send({
        type: "create-session",
        state,
      });
    }
  }

  ready(readyState) {
    const sessionId = window.location.hash.split("#")[1]; // '#'이후로 오는거 다
    this.send({
      type: "ready",
      readyState: readyState,
      id: sessionId,
    });
  }

  // event listener들 생성
  watchEvents() {
    const local = this.localTetris;

    const player = local.player;

    [
      "pos",
      "score",
      "matrix",
      "nextPiece",
      "savedPiece",
      "time",
      "speed",
      "gameOver",
    ].forEach(prop => {
      player.events.listen(prop, value => {
        this.send({
          type: "state-update",
          fragment: "player",
          state: [prop, value],
        });
      });
    });

    const arena = local.arena;
    ["matrix"].forEach(prop => {
      arena.events.listen(prop, value => {
        this.send({
          type: "state-update",
          fragment: "arena",
          state: [prop, value],
        });
      });
    });
  }

  updateManager(peers) {
    // 여기서 peers는 broadcastSession으로 전달받는 peers객체 (this.peers랑 다름)
    const me = peers.you; // 내 ID: broadcast할때 peers.you로 내 ID 뭔지 보냄
    const clients = peers.clients.filter(client => me !== client.id); // msg로 받은 peer list에서 나 빼고
    clients.forEach(client => {
      // 기존에 모르던 id 새로 들어오면 새로 tetris 생성
      if (!this.peers.has(client.id)) {
        const tetris = this.tetrisManager.createPlayer();
        tetris.unserialize(client.state); // 각 peer tetris에 state 적용
        this.peers.set(client.id, tetris); // 새로 생성한 tetris와 id mapping
      }
    });

    /** ConnectionManager객체의 this.peers가 clientID와 tetris의 Map이므로 entries()를 하면 [id,tetris] pair들이 나옴.
         * (...)로 array로 변환 후 foreach돌림.
         */
    // 있던 id 없어지면 해당 tetris객체 삭제
    [...this.peers.entries()].forEach(([id, tetris]) => {
      if (!clients.some(client => client.id === id)) {
        // clients에서 loop하며 id와 동일한거 찾기: 없으면 삭제
        this.tetrisManager.removePlayer(tetris);
        this.peers.delete(id);
      }
    });

    // sorting
    const sorted = peers.clients.map(client => {
      // peers에 나타는 순서대로 tetris 객체들의 array만듦
      return this.peers.get(client.id) || this.localTetris; // id가 peer에 없을때는 본인 tetris 넣음
    });
    this.tetrisManager.sortPlayers(sorted);
  }

  // peer들 상황 업뎃 및 표시
  updatePeer(id, fragment, [prop, value]) {
    if (!this.peers.has(id)) {
      // peer중에 해당 id 없는 경우
      console.error("Client does not exist", id);
      return;
    }
    const tetris = this.peers.get(id); // 해당 peer id의 tetris객체 가져옴
    /**
         * bracket notation: string으로 object의 property 접근할때 유용
         * tetris['arena']['matrix']는 tetris.arena.matrix와 같은 효과를 지님
         */
    tetris[fragment][prop] = value; // fragment는 'arena'나 'player' 둘 중 하나.
    if (prop === "score") {
      tetris.updateScore(value);
    } else if (prop === "gameOver" && value === 1){
      // gameOver된 player가 있으면 peer들은 data의 gameover prop을 통해 이를 알 수 있음
      this.localTetris.stopGame();
      document.querySelector("#game-over-modal p").innerText = "You Win!";
    } else {
      tetris.draw(); // score 이외의 경우는 move, rotate, arena 변화 등이므로 다시 tetris draw.
    }
  }

  receive(msg) {
    const data = JSON.parse(msg); // JSON으로 변환

    // 세션 생성된거 받음 -> URL 끝에 hash붙임
    if (data.type === "session-created") {
      window.location.hash = data.id;
      // broadcast받음 -> peer리스트 업뎃
    } else if (data.type === "session-broadcast") {
      window.location.hash = data.session_id; // 참가한 세션의 id -> URL 끝에 hash와 함께 붙임

      // 플레이어 수
      const newNum = data.peers.clients.length; // 바뀐 플레이어 수
      const currentNum = this.peers.size + 1;   // 현재 플레이어 수: connectionManager에서는 상대만 셈 => 나까지 +1해줘야 전체 플레이어 수

      // 현재 게임 진행중일때만 아래 메시지창 띄움(게임 도중 난입 시에만)
      // 게임 진행중일 때는 timerID 존재, 아니면 null
      if(this.localTetris.player.timerID){
        if(currentNum > newNum){  // 나갔을 때
          document.querySelector("#readyBtn").style.display = "none";
          document.querySelector(".messageContainer").style.display = "flex";
          document.querySelector("#message").innerHTML = "Player left the Session";
        }else if(currentNum < newNum){ //들어왔을 때
          document.querySelector("#readyBtn").style.display = "inline";
          document.querySelector(".messageContainer").style.display = "flex";
          document.querySelector("#message").innerHTML = "New player has entered the session. Start the game?";
        }
      } // 게임 첫 시작시
      if (newNum === 1){ // 세션에 나 혼자 남음
        this.ready(false); // 레디 상태 해제
        document.querySelector('#mainsoloBtn').style.display = "inline";  // PLAY SOLO 버튼 표시
        document.querySelector("#mainreadyBtn").style.display = "none";
        document.querySelector('#mainunreadyBtn').style.display = "none";
      }else{
        document.querySelector('#mainsoloBtn').style.display = "none";    // PLAY SOLO 버튼 숨김
        document.querySelector("#mainreadyBtn").style.display = "inline";
      }

      this.updateManager(data.peers); // msg로 받은 peer list 바탕으로 업데이트

    } else if (data.type === "state-update") {
      this.updatePeer(data.clientId, data.fragment, data.state);
    } else if (data.type === "game-start") {

      this.localTetris.stopGame();  // 하던 게임 중단 및 초기화
      this.localTetris.startGame(); // 게임 시작
    }
  }

  // 메세지 보낼때 JSON 형태의 str로 보냄
  send(data) {
    const msg = JSON.stringify(data);
    console.log(`Sending message: ${msg}`);
    this.conn.send(msg);
  }
}
