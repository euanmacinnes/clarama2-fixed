

// This function is called by the user when they click on a Run button
function task_run(parent){
   parent.find("#run").click(function(){
        console.log("RUNNING");
        // Get only the field values, not the full field definitions, text or code

        socket = $(this).attr("socket")

        $('#task_progress_main').attr('aria-valuenow',0);

        _task_run(socket);
    });
}

function task_edit_run(parent){
   parent.find("#editrun").click(function(){
        console.log("RUNNING");
        var field_registry=get_field_values(); // Get only the field values, not the full field definitions, text or code
        var task_registry=get_fields(false, true);
        task_registry['parameters']=field_registry

        socket = $(this).attr("socket")

        field_registry['clarama_task_kill'] = false;

        task_kernel_id = $("#" + socket).attr("task_kernel_id");
        url = $CLARAMA_ENVIRONMENTS_KERNEL_RUN + task_kernel_id;

        // Pass in the task's user-defined parameters from the field_registry, and paste into the header the internal configuration
        const task = get_url(url, field_registry);

        console.log("Running Task " + task);

        $.ajax({
          type: 'POST',
          url: url,
          datatype: "html",
          contentType: 'application/json',
          data: JSON.stringify(task_registry),
          success : function(data) {
            if (data['data']=='ok') {
                console.log('Submission was successful.');
                console.log(data);
                flash("Executing!");
            }
            else
            {
                console.log('Submission was successful.');
                console.log(data);
                flash("Couldn't run content: " + data['error']);
            }
          },
          error : function(data) {
            console.log('An error occurred.');
            console.log(data);
            flash("Couldn't run editable content, access denied", "danger");
          }
          })
    });
}

// This function is called by the user when they click on a Run button
function task_save(parent){
   parent.find("#save").click(function(){
        console.log("SAVING");
        var task_registry=get_fields(true, true); // Get the kitchen sink

        console.log(task_registry);

        url = "/content/save/" + $(this).attr("url")

        $.ajax({
          type: 'POST',
          url: url,
          datatype: "html",
          contentType: 'application/json',
          data: JSON.stringify(task_registry),
          success : function(data) {
            if (data['data']=='ok') {
                console.log('Submission was successful.');
                console.log(data);
                flash("Saved!");
            }
            else
            {
                console.log('Submission was successful.');
                console.log(data);
                flash("Couldn't save content: " + data['error']);
            }
          },
          error : function(data) {
            console.log('An error occurred.');
            console.log(data);
            flash("Couldn't save content, access denied", "danger");
          }
          })

    });
}