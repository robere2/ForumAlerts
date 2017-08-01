var delay = (60 * 1000); // How long between queries to the forums
var run_key = "wr8yoisfPG0ggb6MSsHYJH3hkMmInkxRTsHjmnNIuv0QjNmGBnnW9igZWuoeYet6"; // Random string that must match on
                                                                                  // http://socket.bugg.co:2083/runkey
var notifications = {error: [], alert: []}; // Object for different notification IDs.
var failures = {hypixelnet: false, buggco: false}; // Documents whether or not requests to websites have failed. Helps
                                                   // prevent notification spam.
var unreadAlerts = 0, unreadConversations = 0;
var maintenance; // Variable storing whether or not the service is currently undergoing maintenance

function init() {
    chrome.storage.sync.get("maintenance", function(items) {
        maintenance = items.maintenance || false; // Set to default (false) if items.maintenance is falsy (i.e. undefined).
    });

    setInterval(run, delay);
}

function RunKeyCheckException(error) {
    this.error = error;
}

function run() {
    chrome.storage.sync.get("forum_alerts_toggle", function(items) {
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
        maintenanceCheck(data.maintenance);
        return true;
    } else if(data.maintenance) {
        maintenanceCheck(data.maintenance);
        return false;
    } else {
        throw new RunKeyCheckException(data.error);
    }
}

function queryForum() {
    $.ajax("https://hypixel.net/?_xfResponseType=json", {
        cache: false
    }).done(function(data) {
        reestablish("hypixel.net");

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
    $.ajax("http://socket.bugg.co:2083/runkey", {
        cache: false,
        method: "POST",
        data: {key: run_key}
    }).done(function(data) {
        reestablish("bugg.co");

        try{
            return_val = runKeyCheck(data);
        } catch(e) {
            if(e instanceof RunKeyCheckException) {
                console.error("RunKeyCheckException: " + e.error);
                return_val = false;
            } else {
                console.error("Uncaught Exception: " + e.toString());
                return_val = false;
            }
        }
    }).fail(function() {
        if(!maintenance) {
            failure("bugg.co");
        }
        return_val = false;
    });
    return return_val;
}


function failure(point) {
    console.error("Failed to connect to " + point);

    var escapedPoint = point.replace(/\./g, ''); // Replaces the period in the URL to make it safe for object names
    if(!failures[escapedPoint]) {
        failures[escapedPoint] = true;

        return chrome.notifications.create(null, {
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

function maintenanceCheck(status) {

    if(status !== maintenance) {
        chrome.storage.sync.set({maintenance: status}, function() {
            console.log("Updated maintenance status");
        });
        maintenance = status;
        var title, message;
        if(maintenance) {
            title = "Undergoing Maintenance";
            message = "This service is currently unavailable due to maintenance. You will be notified when it is back online.";
        } else {
            title = "Maintenance Clear";
            message = "This service is no longer under maintenance. If you notice it is not working properly still, try updating the extension.";
        }

        return chrome.notifications.create(null, {
            type: "basic",
            iconUrl: "./pics/forum-alerts-64x.png",
            title: title,
            message: message
        }, function(id) {
            addNotification(id, "error");
            console.log("Error Notification ID: " + id);
        });
    }
}

function reestablish(point) {
    var escapedPoint = point.replace(/\./g, ''); // Replaces the period in the URL to make it safe for object names

    if(failures[escapedPoint]) {
        console.error("Reconnected to " + point);
        failures[escapedPoint] = false;

        return chrome.notifications.create(null, {
            type: "basic",
            iconUrl: "./pics/forum-alerts-64x.png",
            title: "Connection Reestablished",
            message: "Connection to " + point + " reestablished."
        }, function(id) {
            addNotification(id, "error");
            console.log("Error Notification ID: " + id);
        });
    }
}

function newAlert(alertCount, convoCount) {
    chrome.notifications.create(null, {
        type: "basic",
        iconUrl: "./pics/forum-alerts-64x.png",
        title: "New Hypixel Forum Notifications",
        message: "You have " + alertCount + " unread alert(s) and " + convoCount + " unread conversation(s)."
    },function(id) {
        addNotification(id, "alert");
        console.log("Alert Notification ID: " + id);
    });
}

chrome.notifications.onClicked.addListener(function(id) {
    console.log("Clicked");
    if($.inArray(id, notifications.alert > -1)) {
        chrome.tabs.create({url: "https://hypixel.net/"});
    } else {
        chrome.tabs.create({url: "https://bugg.co/"});
    }
    chrome.notifications.clear(id);
});

// Check installed status
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason === "install"){
        chrome.storage.sync.set({'forum_alerts_toggle': "true"}, function() {
            console.log("First install success, default settings applied.")
        });
    }
});

function addNotification(id, type) {
    notifications[type].push(id);
}

init();
