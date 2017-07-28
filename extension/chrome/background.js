var delay = (60 * 1000); // How long between queries to the forums
var run_key = "wr8yoisfPG0ggb6MSsHYJH3hkMmInkxRTsHjmnNIuv0QjNmGBnnW9igZWuoeYet6"; // Random string that must match on
                                                                                  // https://socket.bugg.co:8880/runkey
function RunKeyCheckException(error) {
    this.error = error;
}

setInterval(function() {
    $.ajax("https://socket.bugg.co:8081/runkey", {
        cache: false,
        method: "POST",
        data: {key: run_key}
    }).done(function(data) {
        try{
            runKeyCheck(data);
        } catch(e) {
            if(e instanceof RunKeyCheckException) {
                console.error("RunKeyCheckException: " + e.error);
            }
        }
    });
}, delay);

function runKeyCheck(data) {
    if(data.ok) {

    } else {
        throw new RunKeyCheckException(data.error);
    }
}