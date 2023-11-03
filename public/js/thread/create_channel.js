$("#createChannelSubmit").click(()=>{
    let ChannelName = $("#createChannelName").val();
    ChannelName = encodeURI(ChannelName);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/create-channel?world=${World_ID}&channel_name=${ChannelName}`, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            let result = JSON.parse(xhr.responseText);
            console.log(result);
        } else {
            console.error('Request failed. Status:', xhr.status);
        }
    };
    xhr.send();
})