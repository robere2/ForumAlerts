var delay = (60 * 1000); // How long between queries to the forums
var run_key = "wr8yoisfPG0ggb6MSsHYJH3hkMmInkxRTsHjmnNIuv0QjNmGBnnW9igZWuoeYet6"; // Random string that must match on
                                                                                  // http://socket.bugg.co:8081/runkey
var notifications = {error: [], alert: []}; // Object for different notification IDs.
var failures = {hypixelnet: false, buggco: false}; // Documents whether or not requests to websites have failed. Helps
                                                   // prevent notification spam.
var unreadAlerts = 0, unreadConversations = 0;
function RunKeyCheckException(error) {
    this.error = error;
}

function run() {
    browser.storage.sync.get("forum_alerts_toggle", function(items) {
        var runKeyValid = queryRunKey();
        if (runKeyValid) {
            if(items.forum_alerts_toggle === "true") {
                queryForum();
            }
        }
    });
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
        if(failures.hypixelnet) {
            failures.hypixelnet = false;
        }

        if("_visitor_alertsUnread" in data && "_visitor_conversationsUnread" in data) {
            var remote_alerts = data._visitor_alertsUnread;
            var remote_convo = data._visitor_conversationsUnread;
            console.log("Unread alerts: " + remote_alerts);
            console.log("Unread convos: " + remote_convo);
            console.log("Local: " + unreadAlerts + " : " + unreadConversations);

            if (remote_alerts > unreadAlerts || remote_convo > unreadConversations) {
                console.log("New Notification created");
                newAlert(remote_alerts, remote_convo);
            } else {
                console.log("No new data.");
            }
            unreadAlerts = remote_alerts;
            unreadConversations = remote_convo;
        } else {
            failure("hypixel.net");
        }
    }).fail(function() {
        failure("hypixel.net");
    })
}

function queryRunKey() {
    var return_val = true;
    $.ajax("http://socket.bugg.co:8081/runkey", {
        cache: false,
        method: "POST",
        data: {key: run_key}
    }).done(function(data) {
        if(failures.buggco) {
           failures.buggco = false;
        }

        try{
            runKeyCheck(data);
        } catch(e) {
            if(e instanceof RunKeyCheckException) {
                console.error("RunKeyCheckException: " + e.error);
                return_val = false;
            } else {
                console.error("Uncaught Exception: " + e.toString());
                return_val = false;
            }
        }
        return_val = true;
    }).fail(function() {
        failure("bugg.co");
        return_val = false;
    });
    return return_val;
}


function failure(point) {
    console.error("Failed to connect to " + point);

    var escapedPoint = point.replace(/\./g, ''); // Replaces the period in the URL to make it safe for object names
    if(!failures[escapedPoint]) {
        failures[escapedPoint] = true;

        return browser.notifications.create(null, {
            type: "basic",
            iconUrl: "./pics/forum-alerts-64x.png",
            title: "Connection Failure",
            message: "Failed connecting to " + point + "! Contact bugfroggy if this does not resolve itself. (Are you logged in?)"
        }, function(id) {
            addNotification(id, "error");
            console.log("Error Notification ID: " + id);
        });
    }
}

function newAlert(alertCount, convoCount) {
    browser.notifications.create(null, {
        type: "basic",
        iconUrl: "./pics/forum-alerts-64x.png",
        title: "New Hypixel Forum Notifications",
        message: "You have " + alertCount + " unread alert(s) and " + convoCount + " unread conversation(s)."
    },function(id) {
        addNotification(id, "alert");
        console.log("Alert Notification ID: " + id);
    });
}

browser.notifications.onClicked.addListener(function(id) {
    console.log("Clicked");
    if($.inArray(id, notifications.alert > -1)) {
        browser.tabs.create({url: "https://hypixel.net/"});
    } else {
        browser.tabs.create({url: "https://bugg.co/"});
    }
});

// Check installed status
browser.runtime.onInstalled.addListener(function(details){
    if(details.reason === "install"){
        browser.storage.sync.set({'forum_alerts_toggle': "true"}, function() {
            console.log("First install success, default settings applied.")
        });
    }
});

function addNotification(id, type) {
    notifications[type].push(id);
}

setInterval(run, delay);
