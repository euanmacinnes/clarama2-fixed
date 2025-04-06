/// Tried to do $(this) directly in here, $(this) didn't survive the function call, so it's passed as a parameter instead.
function chart_colour_select_custom(jqthis, variant) {
    if (jqthis.val() === "custom") {
        // trigger the ellipsis, which triggers color picker
        jqthis.siblings(".format-col-picker" + variant).trigger("click");
    } else {
        const color = jqthis.val();
        jqthis.css("background-color", color);
        jqthis.css("color", isDarkColor(color) ? "white" : "black");
    }
}

function pick_colour(jqthis, variant) {
    const color = jqthis.val();
    const selectField = jqthis.siblings(".format-col" + variant);
    selectField.css("background-color", color);
    selectField.css("color", isDarkColor(color) ? "white" : "black");
}

function update_colour(jqthis, variant) {
    const color = jqthis.val();
    const selectField = jqthis.siblings(".format-col" + variant);
    selectField.css("background-color", color);
    selectField.css("color", isDarkColor(color) ? "white" : "black");

    // add new color as a selectable option
    const newOption = new Option(color, color, true, true);
    selectField.find("option[value='custom']").before(newOption);
}

// MAIN INITIALIZE
function chart_options_initialize(loop_index) {
    const addSGBtn = document.getElementById("addSG" + loop_index);
    const seriesGrp = document.getElementById("seriesGrp" + loop_index);
    const seriesGrpJQ = $("#seriesGrp" + loop_index);

    const addSFBtn = document.getElementById("addSF" + loop_index);
    const seriesFormat = document.getElementById("seriesFormat" + loop_index);
    const seriesFormatJQ = $("#seriesFormat" + loop_index);

    // ==== DRAG N DROP ====
    $(document).ready(function () {
        dragAndDrop(loop_index);
    });

    // jQuery to handle click event for all sg remove buttons
    $(document).on('click', '.cell-delete-series-group', function () {
        $(this).closest('li').remove();
    });

    addSGBtn.addEventListener("click", function () {
        // append new li to series grp
        seriesGrp.appendChild(addSeriesGrp());
        enable_interactions(seriesGrpJQ); // This loads the URL defined in the DIV
    });

    // jQuery to handle click event for all sf remove buttons
    $(document).on('click', '.cell-delete-series-format', function () {
        $(this).closest('li').remove();
    });

    addSFBtn.addEventListener("click", function () {
        // append new li to series format
        seriesFormat.appendChild(addSeriesFormat());
        enable_interactions(seriesFormatJQ); // This loads the URL defined in the DIV
    });

    // add event listener to dynamically added color select elements
    $(document).on("change", ".format-col", function () {
        chart_colour_select_custom($(this), '');
    });

    // add event listener to dynamically added color select elements
    $(document).on("change", ".format-col-back", function () {
        chart_colour_select_custom($(this), '-back');
    });

    // when ellipsis is clicked, open color picker dialog
    $(".ellipsis").on("click", function () {
        $(this).next(".format-col-picker").trigger("click");
    })

    $(".ellipsis2").on("click", function () {
        $(this).next(".format-col-picker-back").trigger("click");
    })

    // this is so that when user is choosing the color from the color picker, the select field changes the bg color immediately
    $(document).on("input", ".format-col-picker", function () {
        pick_colour($(this), '');
    });

    // this is so that when user is choosing the color from the color picker, the select field changes the bg color immediately
    $(document).on("input", ".format-col-picker-back", function () {
        pick_colour($(this), '-back');
    });

    // the select option will be updated to the latest color the user picked once the color picker dialog is closed
    $(document).on("change", ".format-col-picker", function () {
        update_colour($(this), '');
    });

    // the select option will be updated to the latest color the user picked once the color picker dialog is closed
    $(document).on("change", ".format-col-picker-back", function () {
        update_colour($(this), '-back');
    });
}

// using jquery ui's sortable method to make list items draggable
function dragAndDrop(loop_index) {
    $(`#seriesGrp${loop_index}`).sortable({
        handle: '.draggable-heading' // specifies that entire list item (.draggable-heading) can be used to drag item
    });
}

// ==== SERIES GROUP ====
// fn to add a new series group row with a remove btn
function addSeriesGrp() {
    const newIndex = $(".chart-series-groups").length;
    const newSG = document.createElement("div");
    newSG.className = "clarama-post-embedded clarama-replaceable"; // clarama-replaceable means that the div itself gets replaced.
    newSG.setAttribute("url", `/template/render/explorer/steps/data_edit_chart_series_group?loop_index=${newIndex}`);
    return newSG;
}

// ==== SERIES FORMAT ====
// fn to add a new series format row with a remove btn
function addSeriesFormat() {
    const newIndex = $(".chart-series-formats").length;

    const newSF = document.createElement("div");
    newSF.className = "clarama-post-embedded clarama-replaceable"; // clarama-replaceable means that the div itself gets replaced.
    newSF.setAttribute("url", `/template/render/explorer/steps/data_edit_chart_series_format?loop_index=${newIndex}`);
    return newSF;
}

// ==== COLOR PICKER ====
function isDarkColor(color) {
    // convert hex color to RGB
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    // calculate luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    // return true if luminance is less than 128 (dark color)
    return luminance < 128;
}