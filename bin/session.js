class Session{
    constructor(id) {
        this.id = id;
        this.clients = new Set; // session에 있는 client들 집합
    }

    // 세션에 새 client 추가
    join(client){
        if (client.session) {
            throw new Error('Client already in session');
        }
        this.clients.add(client);
        client.session = this;
    }

    // client가 세션 떠남
    leave(client){
        if (client.session !== this){
            throw new Error('Client not in session');
        }
        this.clients.delete(client);
        client.session = null;
    }
}

/**
 * 이렇게 해야 www에서 require()로 이 모듈 쓸 수 있다??
 */
module.exports = Session;