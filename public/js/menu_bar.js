function player_list(){
	let participant_box = $('#participant');
    socket.on('list', (players) => {
        participant_box.empty();
        // participant_box.append('<p>参加者</p>');
		Object.values(players).forEach((player) => {
            console.log(player.playerName);
            let child = $(`<p>${player.playerName}</p>`);
            participant_box.append(child);
        });
    });
}

player_list();