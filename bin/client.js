class Client{
    constructor(conn,id) {
        this.conn = conn;
        this.id = id; // client 구별하기 위해
        this.session = null;

        this.state = null;
    }

    // 세션의 모든 client에게 send함
    broadcast(data){
        if (!this.session) { // 세션 없을 경우 방지
            throw new Error('Cannot broadcast without session')
        }
        data.clientId = this.id; // 누가보냈는지 알기위해

        this.session.clients.forEach(client => {
            if (this === client){ // 나 자신에게는 보내지않음
                return;
            }
            client.send(data);
        })
    }

    // client에서 브라우저로 메세지 보냄??
    send(data){
        const msg = JSON.stringify(data); // 메세지 보낼때 JSON 형태의 str로 보냄

        console.log(`Sending Message: ${msg}`);
        this.conn.send(msg, function ack(err){
            if(err){
                console.error('Message failed',msg,err);
            }
        });
    }

}

module.exports = Client;