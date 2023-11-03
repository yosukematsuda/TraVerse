class ChatMessage{
    constructor(map_id, room_id, player_id, text, date = new Date().toLocaleString("ja-JP"), source = 0){
        this.mapID = map_id,
        this.roomID = room_id
        this.playerID = player_id,
        this.text = text,
        this.date = date,
        this.source = source
    }
}