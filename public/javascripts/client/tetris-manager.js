class TetrisManager{
    constructor(document) {
        this.document = document;
        this.template = document.getElementById('player-template');

        this.instances = new Set;   // 현재 있는 tetris들 집합
                                    // array 대신 set로 정의하면 delete쉽게 사용가능
    }

    // 새로운 player 표시
    createPlayer(){
        // index.hbs의 template에서 내용물 가져옴
        const element = this.document.importNode(this.template.content, true).children[0];

        // 새 tetris 생성
        const tetris = new Tetris(element);
        this.instances.add(tetris); // array에서의 push와 동일.

        this.document.body.appendChild(tetris.element); // html에 tetris 표시

        return tetris; // 새로 생성된 tetris 반환
    }

    // player 제거
    removePlayer(tetris){
        this.instances.delete(tetris);                  // instances 집합에서 tetris 제거
        this.document.body.removeChild(tetris.element); // html에서 제거


    }

    // sort순서대로 tetris표시
    sortPlayers(tetri){
        tetri.forEach(tetris => {
            /**
             * appendChild()가 절대 같은 child 만들지 X (이미 있는 child로 인식되면 새로운 위치로 옮김)
             * => 항상 마지막에 들어온 element가 마지막에 표시
             */
            this.document.body.appendChild(tetris.element);
        });
    }
}