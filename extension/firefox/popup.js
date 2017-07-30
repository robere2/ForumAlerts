$(document).ready(function() {

    $("#version").text("v" + browser.runtime.getManifest().version);

    var forum_alerts_input = $("#forum_alerts_toggle");
    browser.storage.sync.get("forum_alerts_toggle", function(items) {

        var val = items.forum_alerts_toggle;
        if(items.forum_alerts_toggle !== "true" && items.forum_alerts_toggle !== "false") {
            browser.storage.sync.set({'forum_alerts_toggle': "true"}, function() {
                console.log("Invalid value for forum_alerts_toggle, fallback")
            });
            val = "true";
        }
        forum_alerts_input.val(val);
    });

    $("#save").click(function() {
        if(forum_alerts_input.val().length > 0) {
            browser.storage.sync.set({'forum_alerts_toggle': forum_alerts_input.val()}, function() {
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