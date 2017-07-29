var delay = (10 * 1000); // How long between queries to the forums
var run_key = "wr8yoisfPG0ggb6MSsHYJH3hkMmInkxRTsHjmnNIuv0QjNmGBnnW9igZWuoeYet6"; // Random string that must match on
                                                                                  // https://socket.bugg.co:8880/runkey
var unreadAlerts, unreadConversations = 0;
function RunKeyCheckException(error) {
    this.error = error;
}

function run() {
    var runKeyValid = queryRunKey();
    if(runKeyValid) {
        queryForum();
    }
}

function runKeyCheck(data) {
    if(data.ok) {
        console.log("Successfully verified the run key.");
        return true;
    } else {
        throw new RunKeyCheckException(data.error);
    }
}

function queryForum() {
    $.ajax("https://hypixel.net/?_xfResponseType=json", {
        cache: false
    }).done(function(data) {
        if(data._visitor_alertsUnread > unreadAlerts || data._visitor_conversationsUnread > unreadConversations) {
            console.log("New Notification created");
            newAlert(data._visitor_alertsUnread, data._visitor_conversationsUnread);
        } else {
            console.log("No new data.");
        }
    }).fail(function() {
        ajaxFailure("hypixel.net")
    })
}

function queryRunKey() {
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
                return false;
            } else {
                console.error("Uncaught Exception: " + e.toString());
            }
        }
        return true;
    }).fail(function() {
        ajaxFailure("bugg.co")
        return false;
    });
}


function ajaxFailure(point) {
    console.error("Failed to connect to " + point);
    return chrome.notifications.create(null, {
        templateType: "basic",
        iconUrl: "./forums-alert-icon.png",
        title: "Connection Failure",
        message: "Failed connecting to " + point + "! Contact bugfroggy if this does not resolve itself."
    });
}

function newAlert(alertCount, convoCount) {
    chrome.notifications.create(null, {
        templateType: "basic",
        iconUrl: "./forums-alert-icon.png",
        title: "New Hypixel Forum Notifications",
        message: "You have " + alertCount + " unread alert(s) and " + convoCount + " unread conversation(s)."
    });
}
setInterval(run, delay);
