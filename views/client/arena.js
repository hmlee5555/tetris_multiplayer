class Arena{
    constructor(w,h) {
        // 현재 상태 저장하기 위한 matrix table생성 : w,h크기의 table만들고 0으로 채움
        const matrix = [];
        while (h--){
            matrix.push(new Array(w).fill(0));
        }
        this.matrix = matrix;

        this.events = new Events();
    }

    // arena 초기화
    clear(){
        this.matrix.forEach(row => row.fill(0));
        this.events.emit('matrix', this.matrix);
    }

    // arena의 0이 아닌 부분과 겹치면 return true
    collide(player) {
        const [m,o] = [player.matrix, player.pos];
        for (let y=0; y < m.length; ++y){
            for (let x=0; x < m[y].length; ++x){
                if (m[y][x] !== 0 &&    // 내 현재 모양(matrix)의 1과 arena의 1(혹은 존재하지 않는 row/col)들이 겹치는지 확인
                    (this.matrix[y + o.y] &&  // 아래 더이상 row가 없을때도 먹힘
                        this.matrix[y+o.y][x + o.x]) !== 0){ // 오른쪽/왼쪽으로 더이상 col이 없을때도 먹힘
                    return true;
                }
            }
        }
        return false;
    }

    // matrix table에서 현재 player가 위치한 곳 모양 위치들 1로 바꿈
    merge(player) {
        player.matrix.forEach((row,y) => {
            row.forEach((value, x) => {
                if (value !== 0){
                    this.matrix[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
        this.events.emit('matrix', this.matrix);
    }

    // 줄 꽊찼을때 제거
    sweep() {
        let rowCount = 1;
        let score = 0;
        outer: for (let y = this.matrix.length - 1; y > 0; --y) {
            for (let x = 0; x < this.matrix[y].length; ++x) {
                if (this.matrix[y][x] === 0) { // 0이 있다는것은 꽉찬것이 아닌것이므로 다음줄로 넘어감
                    continue outer;
                }
            }
            const row = this.matrix.splice(y, 1)[0].fill(0); // 줄 삭제하고 삭제된걸로 리턴된 줄을 0으로 채움
            this.matrix.unshift(row); // 맨 앞에 그 줄 추가
            ++y; // 삭제했으므로 index조정
            // 점수계산함
            score += rowCount * 10;
            rowCount *= 2;
        }
        this.events.emit('matrix', this.matrix);
        return score;
    }
}
