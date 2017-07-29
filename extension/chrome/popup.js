$(document).ready(function() {

    var forum_alerts_input = $("#forum_alerts_toggle");
    chrome.storage.sync.get("forum_alerts_toggle", function(items) {
        forum_alerts_input.val(items.forum_alerts_toggle);
    });

    $("#save").click(function() {
        if(forum_alerts_input.val().length > 0) {
            chrome.storage.sync.set({'forum_alerts_toggle': forum_alerts_input.val()}, function() {
                var res = "Settings saved.";
                console.log(res);
                $("#res").text(res)
            })
        } else {
            var error = "The Forum Alerts toggle cannot be empty.";
            console.warn(error);
            $("#res").text(error);
        }
    })
    /*
    OAUTH IS DISABLED FOR NOW. That's probably something I'll do in the future.
    */
});