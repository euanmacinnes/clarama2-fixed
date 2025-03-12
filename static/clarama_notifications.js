let permission = Notification.permission;

function notification(title, body, icon) {
    if (permission === "granted") {
        showNotification(title, body);
    } else if (permission === "default") {
        requestAndShowPermission();
    } else {
        alert(title + ': ' + body);
    }
}

function requestAndShowPermission() {
    Notification.requestPermission(function (permission) {
        if (permission === "granted") {
            showNotification();
        }
    });
}

function showNotification(title, body, icon) {
    //  if(document.visibilityState === "visible") {
    //      return;
    //  }
    let notification = new Notification(title, {body, icon});

    notification.onclick = () => {
        notification.close();
        window.parent.focus();
    }

}

function flash(message, category = "info") {
    html = '<div class="row alert flash-alert alert-' + category + '">' + message + '</div>'
    $("#notification_popup").append(html);

    $(".flash-alert").delay(3200).fadeOut(300);
}