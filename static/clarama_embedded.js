//  Copyright (c) 2024. Euan Duncan Macinnes, euan.d.macinnes@gmail.com, S7479622B - All Rights Reserved

// Running scripting in innerHTML from https://ghinda.net/article/script-tags/
// runs an array of async functions in sequential order
function seq(arr, callback, index) {
    // first call, without an index
    if (typeof index === 'undefined') {
        index = 0
    }

    try {

        arr[index](function () {
            index++;
            if (index === arr.length) {
                callback()
            } else {
                seq(arr, callback, index)
            }
        })
    } catch (error) {
    }
}

// trigger DOMContentLoaded
function scriptsDone() {
    var DOMContentLoadedEvent = document.createEvent('Event')
    DOMContentLoadedEvent.initEvent('DOMContentLoaded', true, true)
    document.dispatchEvent(DOMContentLoadedEvent)
}

function insertScript($script, callback) {
    let s = document.createElement('script');
    s.type = 'text/javascript'
    if ($script.src) {
        s.onload = callback
        s.onerror = callback
        s.src = $script.src
    } else {
        s.textContent = $script.innerText
    }

    // re-insert the script tag so it executes.
    document.head.appendChild(s)

    // clean-up
    $script.parentNode.removeChild($script)

    // run the callback immediately for inline scripts
    if (!$script.src) {
        callback()
    }
}

// https://html.spec.whatwg.org/multipage/scripting.html
var runScriptTypes = [
    'application/javascript',
    'application/ecmascript',
    'application/x-ecmascript',
    'application/x-javascript',
    'text/ecmascript',
    'text/javascript',
    'text/javascript1.0',
    'text/javascript1.1',
    'text/javascript1.2',
    'text/javascript1.3',
    'text/javascript1.4',
    'text/javascript1.5',
    'text/jscript',
    'text/livescript',
    'text/x-ecmascript',
    'text/x-javascript'
]

function runScripts($container) {
    // get scripts tags from a node
    var $scripts = $container.querySelectorAll('script')
    var runList = []
    var typeAttr

    [].forEach.call($scripts, function ($script) {
        typeAttr = $script.getAttribute('type')

        // only run script tags without the type attribute
        // or with a javascript mime attribute value
        if (!typeAttr || runScriptTypes.indexOf(typeAttr) !== -1) {
            runList.push(function (callback) {
                console.log('Running script ' + $script.innerHTML);
                insertScript($script, callback);
            })
        }
    })

    // insert the script tags sequentially
    // to preserve execution order
    seq(runList, scriptsDone)
}

function loadHTML(url, element) {
    element.html('<p>Loading...</p>');

    fetch($CLARAMA_ROOT + url)
        .then((response) => response.text())
        .then((html) => {
            //console.log('Loaded ' + $CLARAMA_ROOT + url)
            //console.log(html)
            var $element = document.getElementById(element)
            try {
                $element.innerHTML = html;
            } catch (err) {
                $element.innerHTML = err.message;
            }
            runScripts($element)
        })
        .catch((error) => {
            console.warn('Error loading ' + $CLARAMA_ROOT + url)
            console.warn(error);
        });
}

$.fn.load_post = function (onfinished, args, json) {
    if (args === undefined)
        args = {};

    if (json === undefined)
        json = {};

    return this.each(function () {
        var embedded = $(this);
        console.log("POST loading " + embedded.attr("class") + " = " + embedded.attr("url") + JSON.stringify(args));
        embedded.html('<p>Working...</p>');


        if (embedded.attr("clarama_loaded") != "true") {
            var url = embedded.attr("url");
            var json_div = embedded.attr("post_json");
            //console.log("Looking for " + json_div + " for " + url)
            var json_element = document.getElementById(json_div);

            var json_payload = json;

            if (json_element !== undefined) {
                try {
                    var je = $("<textarea/>").html(json_element.innerHTML).text(); // Hack to get json from a div element (which will be just text)
                    json_payload = JSON.parse(je);
                } catch {
                    // Ignore, leave it as blank JSON to default the content (e.g. for new steps)
                }
            }

            console.log("JSON Payload");
            console.log(json_payload);
            const final_url = merge_url_params(url, args);

            fetch($CLARAMA_ROOT + final_url,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "post",
                    body: JSON.stringify(json_payload)
                })
                .then((response) => {
                    // 1. check response.ok
                    if (response.ok) {
                        return response.text();
                    }

                    throw new Error('HTTP error ' + response.status);
                    //return Promise.reject(response); // 2. reject instead of throw
                })
                .then((html) => {
                    //console.log('POST Embedded JQuery Loaded ' + $CLARAMA_ROOT + url)
                    //console.log({ 'html': html })
                    try {
                        console.log(final_url)

                        if (embedded.hasClass("clarama-replaceable")) {
                            parent = embedded.parent();
                            embedded.replaceWith(html);
                            enable_interactions(parent);
                        } else {
                            embedded.html(html).promise()
                                .done(function () {
                                    enable_interactions(embedded);
                                });
                        }
                        //console.log('POST onfinished:' + typeof(onfinished) + '-' + onfinished);

                        if (typeof onfinished === 'function') {
                            //console.log("POST finished, calling onfinished")
                            onfinished();
                        }
                    } catch (err) {
                        embedded.html('<p>Clarama Embedded Error : ' + err.message + '</p>');
                        console.error(err, err.stack);
                    }
                    //console.log('JQuery HTML POST embedded ' + $CLARAMA_ROOT + url)
                    //runScripts(embedded.attr('id'))
                })
                .catch((error) => {
                    embedded.html('<p>' + error + '</p><p>' + $CLARAMA_ROOT + final_url + '</p>');
                    console.warn('JQuery Error loading ' + $CLARAMA_ROOT + final_url)
                    console.warn(error);
                });

            embedded.attr("clarama_loaded", true)
        }
    });
}

function merge_url_params(url, args) {
    const url_split = url.split('?');
    const params = new URLSearchParams(url_split[1]);

    for (let arg in args)
        params.set(arg, args[arg]);

    if (params.size == 0)
        return url;

    return `${url_split[0]}?${params}`;
}

function merge_dicts(a, b) {
    for (let arg in a)
        b[arg] = a[arg];

    return b;
}

function reload(embedded, args) {
    console.log("Reloading " + embedded.attr('url') + " with args " + JSON.stringify(args))
    embedded.attr("clarama_loaded", 'false');
    embedded.attr("autorun", 'true');

    if (embedded.hasClass('clarama-embedded'))
        embedded.load(undefined, args);

    if (embedded.hasClass('clarama-post-embedded')) {
        console.log("RELOAD POST " + embedded, args);
        embedded.load_post(undefined, undefined, args);
    }
}

$.fn.load = function (onfinished, args) {
    if (args === undefined)
        args = {};

    return this.each(function () {
        var embedded = $(this);
        embedded.html('<p>Working...</p>');
        // console.log("GET loading " + embedded.attr("class") + " = " + embedded.attr("url") + ' with args ' + JSON.stringify(args));


        if ((embedded.attr("clarama_loaded") !== "true") && (embedded.attr("autorun") !== "False")) {
            var url = embedded.attr("url");
            var url_data_id = embedded.attr("url_data_id");

            if (url_data_id !== undefined) {
                //console.log("Retrieving JSON for " + url_data_id);

                var url_data = $("#" + embedded.attr("url_data_id"));

                if (url_data !== undefined)
                    url = url + 'json_data=' + encodeURI(url_data.html());
            }

            const final_url = merge_url_params(url, args);

            //console.log($CLARAMA_ROOT + final_url);

            //console.log('GET JQuery Loading ' + url + ' into div ' + embedded);

            fetch($CLARAMA_ROOT + final_url)
                .then((response) => response.text())
                .then((html) => {
                    //console.log('GET Embedded JQuery Loaded ' + $CLARAMA_ROOT + url)
                    // console.log({ 'html': html })
                    try {
                        //console.log(final_url)
                        embedded.html(html).promise()
                            .done(function () {
                                enable_interactions(embedded);
                            });
                    } catch (err) {
                        embedded.html('<p>Clarama Embedded Error : ' + err.message + '</p>');
                        console.error(err, err.stack);
                    }

                    if (typeof onfinished === 'function') {
                        onfinished();
                    }
                })
                .catch((error) => {
                    console.warn('JQuery Error loading ' + $CLARAMA_ROOT + url)
                    console.warn(error);
                });

            embedded.attr("clarama_loaded", true)
        }
        // else
        // {
        //    console.log(embedded.attr("url") + " control already loaded");
        // }
    });
}

function get_html(clarama_url, loaded_event) {
    var fetch_url = $CLARAMA_ROOT + clarama_url;

    fetch(fetch_url)
        .then((response) => response.text())
        .then((html) => {
            //console.log('GET JQuery HTML Loaded ' + fetch_url)
            // console.log({ 'html': html })
            try {
                console.log({'html': html});
                loaded_event(html);
            } catch (err) {
                console.log('<p>' + err.message + '</p>');
                console.warn('JQuery Error loading ' + fetch_url)
                console.warn(err);
                return '<p>' + err.message + '</p>'
            }
            //console.log('JQuery HTML embedded ' + $CLARAMA_ROOT + url)
            //runScripts(embedded.attr('id'))
        })
        .catch((error) => {
            console.warn('JQuery Error loading ' + fetch_url)
            console.warn(error);
        });

}

function get_json(clarama_url, result) {
    var fetch_url = $CLARAMA_ROOT + clarama_url;

    fetch(fetch_url)
        .then((response) => response.json())
        .then((json) => {
            //console.log('GET JQuery JSON Loaded ' + fetch_url)
            // console.log({ 'html': html })
            try {
                result(json);
            } catch (err) {
                //console.log('<p>' + err.message + '</p>');
                console.warn('JQuery Error loading ' + fetch_url)
                console.warn(err);
                return {};
            }
            //console.log('JQuery HTML embedded ' + $CLARAMA_ROOT + url)
            //runScripts(embedded.attr('id'))
        })
        .catch((error) => {
            console.warn('JQuery Error loading ' + fetch_url)
            console.warn(error);
        });
}

function execute_json_url(clarama_url, reload = false) {
    get_json(clarama_url, function (json) {
        console.log("Executed " + clarama_url)

        if (reload)
            window.location.reload()

        if (json['data'] == 'ok') {
            flash(json['results']);
        } else {
            flash(json['results'], 'danger');
        }
    })
}

function execute_this() {
    execute_function($(this).attr("url"));
}

$.fn.execute = function () {
    return this.each(function () {
            $(this).click(execute_this())
        }
    )
};