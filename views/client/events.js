class Events{
    constructor() {
        this._listners = new Set;
    }

    /**
     * name에 해당하는 listner를 _listners에 추가
     * 해당 name으로 emit()하면 callback 실행됨.
     */
    listen(name, callback){
        this._listners.add({
            name,
            callback,
        });
    }

    emit(name, ...data){ // ...data라고 하면 나머지 argument들 전부
        this._listners.forEach(listener => {
            if (listener.name === name) {
                listener.callback(...data);
            }
        });
    }
}