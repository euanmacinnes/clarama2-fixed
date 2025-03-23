var new_step_id = 100000000;

function cell_edit_run(parent) {
    //console.log("cell-edit-run for " +parent.attr('id') + ':' + parent.attr('class'));
    //console.log(parent.find(".celleditrun"));

    parent.find(".celleditrun").click(function () {
        var cell_button = $(this).closest('.clarama-cell-item');
        console.log(cell_button);
        cell_item_run(cell_button);
    });
}

function cell_insert_step(parent) {
    var cell_button = $(this).closest('.clarama-cell-item');

    parent.find(".insert_step").off('click');
    parent.find(".insert_step").on("click", function (event) {

        if ($(this).attr('stream') !== undefined) // Then hopefully it's the NEW CELL
        {
            var steptype = $(this).attr('steptype');
            var stream = $(this).attr('stream');

            var step_stream = $("#stream_" + stream);
            console.log(step_stream);
            var step_stream_file = step_stream.attr('stream-file');

            new_step_id = new_step_id + 1;

            get_html('/step/stream/' + steptype + '/' + new_step_id + '/' + step_stream_file + '/',
                function (new_step) {

                    var $new_element = $(new_step);

                    console.log(step_stream);
                    step_stream.append($new_element);

                    sortUpdate(step_stream);
                    enable_interactions($new_element);
                });
        } else {
            var step_cell = $(this).parents('.clarama-cell-item'); // This should be the clarama-cell-item class, the li
            var step = step_cell.attr('step');
            var steptype = $(this).attr('steptype');

            var step_stream = step_cell.parents(".stream");
            var step_stream_id = step_stream.attr('stream');
            var step_stream_file = step_stream.attr('stream-file');

            var insert_step = step_stream.find("li")[step - 1];


            console.log('cell_insert_step:' + step_cell.attr("id") + '=' + step_stream_id + '@' + step + ' from file ' + step_stream_file);


            var after = false;

            if (event.shiftKey) {
                after = true
            }

            new_step_id = new_step_id + 1;

            get_html('/step/' + step_stream.attr('stream') + '/' + steptype + '/' + new_step_id + '/' + step_stream_file + '/',
                function (new_step) {

                    var $new_element = $(new_step);

                    if (after) {
                        console.log("appending new step at end of " + step_stream.attr('stream'));
                        $(insert_step).after($new_element);
                    } else {
                        console.log("inserting new step before step " + step);
                        $(insert_step).before($new_element);
                    }

                    sortUpdate(step_stream);
                    enable_interactions($new_element);
                });
        }

        //alert("Insert " + step_type.attr("steptype") + ", stream " + step_parent.attr('stream') + " step " +  step_parent.attr('step'));

    });
}

function cell_delete_step(parent) {
    parent.find(".delete_step").off('click');
    parent.find(".delete_step").on("click", function () {
        var step_type = $(this);
        var step_parent = step_type.parents(".clarama-cell-item");

        var step_stream = step_parent.parents(".stream");

        step_parent.remove();

        sortUpdate(step_stream);
    });
}

function datacell_setOutput(id_template, value) {
    $('#' + id_template + '_output').attr('value', value);

    console.log(id_template);
    console.log(value);

    if ((value == undefined) || (value == ''))
        value = 'table';

    if (value == 'table') {
        $('#' + id_template + '_table').removeClass('btn-secondary');
        $('#' + id_template + '_table').addClass('btn-primary');

        $('#' + id_template + '_chart').removeClass('btn-primary');
        $('#' + id_template + '_chart').addClass('btn-secondary');
        $('#' + id_template + '_code').removeClass('btn-primary');
        $('#' + id_template + '_code').addClass('btn-secondary');
    } else if (value == 'chart') {
        $('#' + id_template + '_code').addClass('btn-secondary');
        $('#' + id_template + '_code').removeClass('btn-primary');
        $('#' + id_template + '_table').addClass('btn-secondary');
        $('#' + id_template + '_table').removeClass('btn-primary');


        $('#' + id_template + '_chart').addClass('btn-primary');
        $('#' + id_template + '_chart').removeClass('btn-secondary');
    } else {
        $('#' + id_template + '_code').addClass('btn-primary');
        $('#' + id_template + '_code').removeClass('btn-secondary');

        $('#' + id_template + '_table').addClass('btn-secondary');
        $('#' + id_template + '_table').removeClass('btn-primary');
        $('#' + id_template + '_chart').addClass('btn-secondary');
        $('#' + id_template + '_chart').removeClass('btn-primary');
    }

}