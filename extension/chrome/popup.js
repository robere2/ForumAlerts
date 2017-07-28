$(document).ready(function() {

    $("#save").click(function() {
        if($("#oauth_token").val().length) {
            chrome.storage.sync.set({'token': oauth_input.val()}, function() {
                var res = "Updated OAuth Token";
                console.log(res);
                $("#res").text(res)
            })
        } else {
            var error = "The OAuth token field may not be empty.";
            console.warn(error);
            $("#res").text(error);
        }
    })
});