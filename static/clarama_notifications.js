/**
 * Clarama Notifications JS - Functions for handling notifications and flash messages
 * @fileoverview This file provides functions for displaying browser notifications
 * and temporary flash messages in the application.
 */

/** 
 * Current notification permission status
 * @type {string}
 */
let permission = Notification.permission;

/**
 * Shows a notification to the user
 * @param {string} title - The notification title
 * @param {string} body - The notification message body
 * @param {string} [icon] - URL to an icon to display with the notification
 * @description Displays a notification using the browser's Notification API if permission
 * is granted, requests permission if not yet set, or falls back to an alert
 */
function notification(title, body, icon) {
    if (permission === "granted") {
        showNotification(title, body);
    } else if (permission === "default") {
        requestAndShowPermission();
    } else {
        alert(title + ': ' + body);
    }
}

/**
 * Requests notification permission from the user
 * @description Requests permission to show notifications and shows a notification
 * if permission is granted
 */
function requestAndShowPermission() {
    Notification.requestPermission(function (permission) {
        if (permission === "granted") {
            showNotification();
        }
    });
}

/**
 * Creates and displays a browser notification
 * @param {string} title - The notification title
 * @param {string} body - The notification message body
 * @param {string} [icon] - URL to an icon to display with the notification
 * @description Creates a new Notification object and sets up a click handler
 * to close the notification and focus the window when clicked
 */
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

/**
 * Displays a temporary flash message in the UI
 * @param {string} message - The message to display
 * @param {string} [category="info"] - The message category/style (info, success, warning, danger)
 * @description Creates and appends a Bootstrap alert to the notification_popup element,
 * which automatically fades out after a few seconds
 */
function flash(message, category = "info") {
    html = '<div class="row alert flash-alert alert-' + category + '">' + message + '</div>'
    $("#notification_popup").append(html);

    $(".flash-alert").delay(3200).fadeOut(300);
    console.log(category + ":" + message);
}
