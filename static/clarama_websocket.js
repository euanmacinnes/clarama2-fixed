function set_environment(environment) {
    flash("Changing environment to " + environment);
    $('#kernel_status').html('Loading');
    $('#environment').html('...');
    let socket = $("#edit_socket");
    socket.attr("environment", environment);
    run_socket(socket);
}

let sockets = {};

function run_socket(embedded) {
    let task = embedded.attr("task")
    let topic = embedded.attr("topic");
    let task_results = embedded.attr("results_id");
    let autorun = embedded.attr("autorun");
    let socket_id = embedded.attr("id");
    let refresh = embedded.attr("refresh");
    let element_prefix = embedded.attr("element_prefix");
    let env_url = '';
    let environment = embedded.attr("environment");

    if (environment !== undefined) {
        env_url = '&environment=' + environment;
        refresh = true;
        console.log("overriding environment with " + env_url);
    }


    let playbutton = $('.kernel-play-button');

    playbutton.addClass("btn-secondary")
    playbutton.removeClass("btn-primary")

    let task_url = $CLARAMA_ROOT + $CLARAMA_ENVIRONMENTS_TASK_OPEN + task + '?topic=' + topic + '&refresh=' + refresh + env_url;

    console.log(socket_id + " " + element_prefix + ":=>Task connecting to " + task_url)
    fetch(task_url)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            console.log(response);
            return Promise.reject(response);
        })
        .then((task_response) => {

            let socket_url = $CLARAMA_ROOT + $CLARAMA_WEBSOCKET_REGISTER + topic;

            if (socket_url in sockets) {
                console.log("CLOSING EXISTING SOCKET " + socket_url);
                sockets[socket_url].close();
            } else {
                console.log("NOT CLOSING SOCKET " + socket_url);
            }

            // console.log(JSON.stringify(task_response, null, 2));
            let kernel_id = task_response['results']['kernel_id']
            let task_environment = task_response['results']['environment_name']
            let environment_file = task_response['results']['environment']
            console.log(" SUBSCRIBING " + topic + " WebSocket " + socket_url + " for kernel " + kernel_id + " in environment " + task_environment + ' in ' + environment_file);

            embedded.attr('task_kernel_id', kernel_id);

            let active_selector = ('#environment_' + environment_file).replaceAll('.', "_");

            $("#kernel_status").html(kernel_id);
            $("#environment").html(task_environment);
            $(".environments").removeClass('active');
            $(active_selector).addClass('active');

            fetch(socket_url)
                .then((response) => response.json())
                .then((response) => {
                    //console.log(response);

                    let server = response['results']['socket']
                    let uuid = response['results']['uuid']
                    let topic = response['results']['topic']
                    //embedded.attr("task_kernel_id", kernel_id)

                    let websocket_address = server + 'ws/' + uuid + '/';
                    let socket_url = $CLARAMA_ROOT + $CLARAMA_WEBSOCKET_REGISTER + topic;
                    console.log("Creating " + socket_url + " Websocket on " + websocket_address);

                    let webSocket = new WebSocket(websocket_address);

                    sockets[socket_url] = webSocket;

                    webSocket.onerror = function (event) {
                        onError(event, task_url, websocket_address, webSocket, task_results)
                    };

                    webSocket.onopen = function (event) {
                        onOpen(event, websocket_address, webSocket, task_results, autorun, socket_id)
                    };

                    webSocket.onclose = function (event) {
                        onClose(event, websocket_address, webSocket, task_results)
                    };

                    webSocket.onmessage = function (event) {
                        onMessage(event, websocket_address, webSocket, element_prefix)
                    };
                });
        })
        .catch((error) => {
            flash(task_url + " error " + error, category = 'danger');
        });
}


// This function is called on document load to set up the websocket connection for a task
// It will expect the div to have the task, topic and results_id attributes set for:
// task: the task file to call the environments service with
// topic: the task topic to call the environments service with
// results_id the id of the div to paste the results back into
$.fn.enablesocket = function () {
    return this.each(function () {
        console.log("Enabling socket " + $(this).attr('id'))
        console.log($(this));
        let embedded = $(this);
        run_socket(embedded, true);
    });
}

function replace_keys(text, key_dict) {
    Object.entries(key_dict).forEach(([key, value]) => {
        if (key !== 'array') {
            //console.log('key ' + key);
            let replace_key = "{" + key + "_content}";
            const regEx = new RegExp(replace_key, "g");
            text = text.replace(regEx, value);
        }
    });

    return text;
}

// https://stackoverflow.com/questions/18673860/defining-a-html-template-to-append-using-jquery

function process_template(template_id, substitutions, target_div, element_prefix) {
    if (target_div === undefined)
        return;

    let full_template_id = element_prefix + template_id;

    if (element_prefix === undefined)
        full_template_id = template_id;

    let template_object = $("template#" + full_template_id);

    if (template_object == null) {
        console.log("Template " + full_template_id + " not found");
    } else {
        //console.log("template#" + full_template_id);
        let template = template_object.html();
        let target_class = replace_keys(template_object.attr("target_class"), substitutions);

        //console.log("target_class: " + target_class || "")

        if (template == null)
            console.log("Template " + full_template_id + " not found");
        else {
            //console.log("Template " + template_id + " FOUND with " + substitutions);
            Object.entries(substitutions).forEach(([key, value]) => {
                if (key === 'array') {
                    const array_start = template.indexOf("<!--{array:start}-->");
                    const array_end = template.indexOf("<!--{array:end}-->");

                    const array_template = template.slice(array_start + 20, array_end - 1);
                    let array_result = "";
                    console.log("VALUE" + value);
                    try {
                        value.forEach((element) => array_result = array_result + array_template.replace("{array:value}", element));
                    } catch {
                    }

                    template = template.slice(0, array_start - 1) + array_result + template.slice(array_end + 18);
                } else {
                    //console.log('key ' + key);
                    let replace_key = "{" + key + "_content}";
                    const regEx = new RegExp(replace_key, "g");
                    template = template.replace(regEx, value);
                }
            });

            let target_id = target_div.attr("id") + '.' + target_class
            //console.log('FINAL TARGET for Template: ' + target_div.attr("id") + '.' + target_class);
            let target = target_div.find('.' + target_class).first();

            if (target === null)
                console.log("Error, could not find object #" + target_id + " for template " + full_template_id);
            else {
                let final_template = template.replace("<!--", "").replace("-->", "");
                //console.log("FINAL TEMPLATE " + final_template + " sending to " + target.attributes);
                let $elements = $(final_template);
                target.append($elements);
                enable_interactions($elements);
            }
        }
    }
}

// On receipt of a websocket message from the server. The kernels will send messages of dicts
// in which one of the keys, "type" indicates the type of message, which then correlates with the HTML template to use
// to render that message
function onMessage(event, socket_url, webSocket, element_prefix) {
    let dict = JSON.parse(event.data);

    if ('class' in dict) {
        //console.log("Processing Socket Message " + dict['class']);
        try {

            if (dict['class'] === "template") {
                let resulter = "#" + dict['step_id'];
                //console.log("WEBSOCKET MESSAGE:" + dict['step_id']);
                //console.log("TEMPLATE RESULTER --[" + resulter + ']--');
                process_template(dict['type'], dict['values'], $(resulter), element_prefix);
            }

            if (dict['class'] === "template_array") {
                Object.entries(dict['results']).forEach(([key, value]) => {
                    console.log("template_array for key " + key);
                    let new_dict = dict['values'] || {};
                    new_dict['array'] = value;
                    let resulter = "#" + dict['step_id'];
                    console.log("WEBSOCKET MESSAGE:" + dict['step_id']);
                    console.log("TEMPLATE ARRAY RESULTER --[" + resulter + ']--');
                    process_template(dict['type'], new_dict, $(resulter), element_prefix);
                })
            }

            if (dict['class'] === "template_table") {
                let resulter = "#" + dict['step_id'];
                //console.log("WEBSOCKET MESSAGE:" + dict['step_id']);
                process_template(dict['type'], dict['values'], $(resulter), element_prefix);
                // Draw the table ID first, then let's put in the data
                bTable(dict['values']['table_id'], dict['results']);
            }

            if (dict['class'] === "template_chart") {
                let resulter = "#" + dict['step_id'];
                console.log("WEBSOCKET CHART MESSAGE:" + webSocket.url);
                process_template(dict['type'], dict['values'], $(resulter), element_prefix);
                // Draw the table ID first, then let's put in the data
                bChart(dict['values']['chart_id'], dict['results']);
            }


            if (dict['type'] === 'task_step_started') {
                let spinner = "#" + dict['step_id'];
                //console.log("SPINNING --[" + spinner + ']--');
                $(spinner).find('.cell-spin').animate({"opacity": 1});
                $(spinner).find('.cell-results').empty();
                $(spinner).find('.cell-timing').empty();

                //console.log("TASK STEP STARTED " + target)
            }

            let task_progress = $('#task_progress_main');

            if (dict['type'] === 'task_step_completed' || dict['type'] === 'task_step_exception') {
                //console.log("Step done " + dict['type'] + " " + dict['step_id'])
                if ('step_number' in dict)
                    if (dict['step_number'] > -1) {
                        //console.log("Setting progress " + dict['step_number'])

                        let max = task_progress.attr("max");

                        task_progress.width((100 * dict['step_number'] / max).toString() + '%');
                    }

                let spinner = "#" + dict['step_id'];
                $(spinner).find('.cell-spin').animate({"opacity": 0});

                if (dict['type'] === 'task_step_exception')
                    task_progress.addClass("bg-danger")
            }

        } catch (err) {
            console.log(err);
            console.log('exception raised processing:');
            console.log(dict);
        }
    } else if ('progress' in dict) {
        $('#task_progress_' + dict['stream']).attr('aria-valuenow', dict['step_number']);
    } else {
        console.log("WTF was this: " + dict)
    }
}

function onOpen(event, socket_url, webSocket, task_results, autorun, socket_id) {
    console.log('WebSocket Connection established ' + socket_url);
    let kernel_status = $('#kernel_status');
    kernel_status.add("bi-check-circle")
    kernel_status.add("text-success")
    kernel_status.remove("bi-hourglass-split")
    webSocket.send("{client: { replay: True } } ");

    let playbutton = $('.kernel-play-button');

    playbutton.removeClass("btn-secondary")
    playbutton.addClass("btn-primary")

    if (autorun === 'True') {
        _task_run(socket_id)
    }

}

function onClose(event, socket_url, webSocket, task_results) {
    console.log('WebSocket Connection CLOSED ' + socket_url + " on socket " + webSocket + " with result " + task_results);
}

function onError(event, task_url, socket_url, webSocket, task_results) {
    flash("Task " + task_url + " WebSocket Error [" + event.data + "] from " + socket_url + " on socket " + webSocket + " with result " + task_results);
}
