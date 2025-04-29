//  Copyright (c) 2024. Euan Duncan Macinnes, euan.d.macinnes@gmail.com, S7479622B - All Rights Reserved

function get_code_cell(cell) {
    var id = cell.attr('id')
    var editor = ace.edit(id);
    var code = editor.getValue();

    console.log("Getting code " + id);

    return {"type": "code", "content": code};
}

function get_data_cell(cell) {
    var dataid = cell.attr('dataid');

    var id = "content_query_" + dataid;
    var editor = ace.edit(id);
    var code = editor.getValue();

    console.log("Getting data " + id);

    var source_id = "task_step_" + dataid + "_source";
    var output_id = "task_step_" + dataid + "_output";
    var source = $("#" + source_id).val();
    var output = $("#" + output_id).val();

    var table_title = cell.find('.table-title').val();
    var table_search = cell.find('.table-search').prop('checked');
    var table_export = cell.find('.table-export').prop('checked');
    var table_filter = cell.find('.table-filter').prop('checked');
    var table_checkbox = cell.find('.table-checkbox').prop('checked');
    var table_multiselect_row = cell.find('.table-multiselect-row').prop('checked');
    var table_pagination = cell.find('.table-pagination').prop('checked');
    var table_sortable = cell.find('.table-sortable').prop('checked');
    var table_pagesize = cell.find('.table-pagesize').val();

    var chart_title = cell.find('.chart-title').val();
    var chart_subtitle = cell.find('.chart-subtitle').val();
    var chart_legend = cell.find('.chart-legend').val();
    var chart_xaxis_type = cell.find('.chart-xaxis-type').val();

    var chart_series_groups = [];
    var chart_series_formats = [];

    var series_groups = cell.find('.chart-series-groups');
    var series_formats = cell.find('.chart-series-formats');

    series_groups.each(function () {
        console.log(this);
        srs = {
            'series-type': $(this).find('.series-type').val(),          // Series type
            'series-x': $(this).find('.series-x').val(),                // X axis
            'series-y': $(this).find('.series-y').val(),                // Y axis
            'series-z': $(this).find('.series-z').val(),                // Z axis (e.g. for Bubble)
            'series-ymin': $(this).find('.series-ymin').val(),          // error bar Y MIN
            'series-ymax': $(this).find('.series-ymax').val(),          // error bar Y MAX
            'series-s': $(this).find('.series-s').val(),                // series axis
            'series-u': $(this).find('.series-u').val(),                // unit axis
            'series-l': $(this).find('.series-l').val()                 // label axis (e.g. for point name at X/Y)
        };
        console.log(srs);
        chart_series_groups.push(srs);
    })

    series_formats.each(function () {
        console.log(this);
        srs = {
            'format-nrx': $(this).find('.format-nrx').val(),            // name regex
            'format-f': $(this).find('.format-f').is(':checked'),       // filled
            'format-p': $(this).find('.format-p').is(':checked'),       // stepped
            'format-dt': $(this).find('.format-dt').is(':checked'),     // dotted
            'format-pr': $(this).find('.format-pr').val(),              // point size
            'format-lw': $(this).find('.format-lw').val(),              // line width
            'format-col': $(this).find('.format-col').val(),            // colour
            'format-col-back': $(this).find('.format-col-back').val(),  // background colour
            'format-title': $(this).find('.format-title').val()         // series title
        };
        console.log(srs);
        chart_series_formats.push(srs);
    })

    var chart = {
        'title': chart_title,
        'subtitle': chart_subtitle,
        'legend': chart_legend,
        'xaxis-type': chart_xaxis_type,
        'series-groups': chart_series_groups,
        'series-formats': chart_series_formats
    }

    var table = {
        'title': table_title,
        'search': table_search,
        'export': table_export,
        'filter': table_filter,
        'checkbox': table_checkbox,
        'multiselect-row': table_multiselect_row,
        'pagination': table_pagination,
        'sortable': table_sortable,
        'pagesize': table_pagesize
    }

    return {
        "type": "data",
        "source": source,
        "output": output,
        "table": table,
        "chart": chart,
        "content": code
    };
}

function get_text_cell(cell) {
    var myContent = cell.trumbowyg('html');
    console.log("Getting text " + myContent);
    return {"type": "markdown", "content": myContent};
}

function get_notification_cell(cell) {
    var dataid = cell.attr('dataid');

    var id = "content_query_" + dataid;

    console.log("Getting data " + id);

    var message_content = $("#" + id + "_message_content").trumbowyg('html');
    console.log("MESSAGE CONTENT:")
    console.log(message_content)

    //var targets = $("#" + id + "_targets").val();
    var id = id + "_targets"
    var editor = ace.edit(id);
    var targets = editor.getValue();

    console.log("MESSAGE TARGETS:")
    console.log(targets)


    return {
        "type": "notification",
        "message_content": message_content,
        "targets": targets
    };
}

function get_source_cell(cell) {
    var dataid = cell.attr('dataid');

    var id = "content_query_" + dataid;

    console.log("Getting data " + id);

    var source_id = "task_step_" + dataid + "_source";
    var source = $("#" + source_id).val();

    return {
        "type": "source",
        "source": source
    };
}

function get_url_cell(cell) {
    var dataid = cell.attr('dataid');

    var id = "content_query_" + dataid;
    var editor = ace.edit(id + "_params");
    var parameters = editor.getValue();

    var url = $("#" + id + "_url").val();
    var mode = $("#" + id + "_mode").val();

    return {
        "type": "url",
        "mode": mode,
        "url": url,
        "parameters": parameters
    };
}

function get_shell_cell(cell) {
    var id = cell.attr('id')
    var editor = ace.edit(id);
    var code = editor.getValue();

    console.log("Getting shell " + id);

    return {"type": "shell", "content": code};
}


/**
 * Call the specific get_<cell step>_cell function that will extract the entire cell information
 */
function get_cell_values(cell) {
    var cell_type = cell.attr("celltype");
    // Get the cell-type specific details
    cell_data = window["get_" + cell_type + "_cell"](cell);

    console.log(cell_data);
    return cell_data;
}

function get_cell(cell_owner, topic) {
    var owner_cells = [];

    cell_owner.find(".clarama-cell-content").each(
        function (index) {
            var input = $(this);

            //console.log("Getting cell values for " + input.attr('id') + ':' + input.attr('class') + ' = ' + input.attr("celltype"))
            cell = get_cell_values(input);

            // Then let's add in the generic cell information, like the loop
            // we are too low down here, the clarama-cell is near the editable fields far down from clarama-cell-item, so let's go back up to that one
            //console.log("PARENT");
            //console.log(input.closest(".clarama-cell-item"));
            //console.log("CHILD");
            //console.log(input.closest(".clarama-cell-item").find('.loop-iterable'));
            cell['loop-iterable'] = input.closest(".clarama-cell-item").find('.loop-iterable').val();

            if (topic != "") {
                console.log("Getting Cell with STEP: " + topic)


                cell['topic'] = topic;
                cell['step'] = topic;


            }

            owner_cells.push(cell);
        });

    return owner_cells;
}
