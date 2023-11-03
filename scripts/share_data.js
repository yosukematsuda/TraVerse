function main(io, Master_CellData){
    io.on('connection', (socket) => {
        socket.on('updateCell', (Cliant_CellData) => {
            Master_CellData = Cliant_CellData;
            io.sockets.emit('cellInfo', {
                Master_CellData: Master_CellData
            });
        });
        socket.on('getCell', () => {
            socket.emit('cellInfo', {
                Master_CellData: Master_CellData
            });
        });       
    });
}

// マスのデータを作る
function initCellData(){
    var cellData = [];
    // 400個の要素作成
    for (let i = 0; i < 400; i++) {
        cellData[i] = {
            call: 0,
            texture: 0
        };
    }
    return cellData;
}

module.exports = {main:main, init:initCellData}