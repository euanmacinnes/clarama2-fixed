function chart_options_initialize() {
    const addSGBtn = document.getElementById("addSG");
    const seriesGrp = document.getElementById("seriesGrp");

    const addSFBtn = document.getElementById("addSF");
    const seriesFormat = document.getElementById("seriesFormat");

    // ==== DRAG N DROP ====
    $(document).ready(function () {
        dragAndDrop();
    });

    // jQuery to handle click event for all sg remove buttons
    $(document).on('click', '.cell-delete-series-group', function () {
        $(this).closest('li').remove();
    });

    addSGBtn.addEventListener("click", function () {
        // append new li to series grp
        seriesGrp.appendChild(addSeriesGrp());
    });

    // jQuery to handle click event for all sf remove buttons
    $(document).on('click', '.cell-delete-series-format', function () {
        $(this).closest('li').remove();
    });

    addSFBtn.addEventListener("click", function () {
        // append new li to series format
        seriesFormat.appendChild(addSeriesFormat());
    });

    // add event listener to dynamically added color select elements
    $(document).on("change", ".format-col", function () {
        if ($(this).val() === "custom") {
            // trigger the ellipsis, which triggers color picker
            $(this).siblings(".format-col-picker").trigger("click");
        } else {
            const color = $(this).val();
            $(this).css("background-color", color);
            $(this).css("color", isDarkColor(color) ? "white" : "black");
        }
    });

    // when ellipsis is clicked, open color picker dialog
    $(".ellipsis").on("click", function () {
        $(this).next(".format-col-picker").trigger("click");
    })

    // this is so that when user is choosing the color from the color picker, the select field changes the bg color immediately
    $(document).on("input", ".format-col-picker", function () {
        const color = $(this).val();
        const selectField = $(this).siblings(".format-col");
        selectField.css("background-color", color);
        selectField.css("color", isDarkColor(color) ? "white" : "black");
    });

    // the select option will be updated to the latest color the user picked once the color picker dialog is closed
    $(document).on("change", ".format-col-picker", function () {
        const color = $(this).val();
        const selectField = $(this).siblings(".format-col");
        selectField.css("background-color", color);
        selectField.css("color", isDarkColor(color) ? "white" : "black");

        // add new color as a selectable option
        const newOption = new Option(color, color, true, true);
        selectField.find("option[value='custom']").before(newOption);
    });
}

// using jquery ui's sortable method to make list items draggable
function dragAndDrop() {
    $("#seriesGrp").sortable({
        handle: '.draggable-heading' // specifies that entire list item (.draggable-heading) can be used to drag item
    });
}

// ==== SERIES GROUP ====
// fn to add a new series group row with a remove btn
function addSeriesGrp() {
    const newSG = document.createElement("li");
    newSG.className = "chart-series-groups";
    newSG.setAttribute("draggable", "true");

    const div = document.createElement("div");
    div.className = "list-group-item d-flex align-items-center";
    newSG.appendChild(div);

    const grip = document.createElement("i");
    grip.className = "bi bi-grip-vertical draggable-heading pe-3";
    div.appendChild(grip);

    const select = document.createElement("select");
    select.id = "sg1";
    select.className = "form-control series-type";
    ["Line", "Scatter", "Bubble", "Bar", "Doughnut"].forEach(type => {
        const option = document.createElement("option");
        option.textContent = type;
        select.appendChild(option);
    });
    div.appendChild(select);

    const labels = [
        { text: "X Axis", for: "x1", class: "series-x", name: "x", value: "Batch" },
        { text: "Y Axis", for: "y1", class: "series-y", name: "y", value: "" },
        { text: "Z Axis", for: "z1", class: "series-z", name: "z", value: "" },
        { text: "Y Min Axis", for: "ymin1", class: "series-ymin", name: "ymin", value: "" },
        { text: "Y Max Axis", for: "ymax1", class: "series-ymax", name: "ymax", value: "" },
        { text: "Series Axis", for: "s1", class: "series-s", name: "s", value: "" },
        { text: "Unit Axis", for: "u1", class: "series-u", name: "u", value: "" },
        { text: "Label Axis", for: "l1", class: "series-l", name: "l", value: "" }
    ];

    // eg,
    // <label for="x1" class="form-label">X Axis</label>
    // <input type="string" class="form-control series-x" id="x1" name="x" value="Batch">
    labels.forEach(labelInfo => {
        const label = document.createElement("label");
        label.setAttribute("for", labelInfo.for);
        label.className = "form-label";
        label.textContent = labelInfo.text;

        const input = document.createElement("input");
        input.type = "string";
        input.id = labelInfo.for;
        input.className = `form-control ${labelInfo.class}`;
        input.setAttribute("name", labelInfo.name);
        input.setAttribute("value", labelInfo.value);

        div.appendChild(label);
        label.appendChild(document.createTextNode(" "));
        div.appendChild(input);
        div.appendChild(document.createTextNode(" "));
    });

    // Create a remove button to delete the row
    const removeBtn = document.createElement("i");
    removeBtn.className = "bi bi-trash ps-3 cell-delete-series-group data-cell-icon-hover remove";
    div.appendChild(removeBtn);
    return newSG;
}

// ==== SERIES FORMAT ====
// fn to add a new series format row with a remove btn
function addSeriesFormat() {
    const newIndex = $(".chart-series-formats").length;

    const newSF = document.createElement("li");
    newSF.className = "chart-series-formats";

    const div = document.createElement("div");
    div.className = "list-group-item d-flex align-items-center";
    newSF.appendChild(div);

    const labels = [
        { text: "Series Name / Regex", for: `nrx${newIndex}`, class: "format-nrx", name: "x", type: "string", value: "" },
        { text: "Filled", for: `f${newIndex}`, class: "format-f", name: "f", type: "checkbox" },
        { text: "Stepped", for: `p${newIndex}`, class: "format-p", name: "p", type: "checkbox" },
        { text: "Dotted", for: `dt${newIndex}`, class: "format-dt", name: "dt", type: "checkbox" },
        { text: "Point Size", for: `pr${newIndex}`, class: "format-pr", name: "pr", type: "number", value: "", step: "1", min: "0", max: "100" },
        { text: "Line Width", for: `lw${newIndex}`, class: "format-lw", name: "lw", type: "number", value: "", step: "1", min: "0", max: "100" }
    ];
    labels.forEach(labelInfo => {
        const label = document.createElement("label");
        label.setAttribute("for", labelInfo.for);
        label.className = "form-label";
        label.textContent = labelInfo.text;

        const input = document.createElement("input");
        input.type = labelInfo.type;
        if (labelInfo.type === "checkbox") {
            input.className = `form-check-input ${labelInfo.class}`;
        } else {
            input.className = `form-control ${labelInfo.class}`;
            input.value = labelInfo.value;
        }
        input.id = labelInfo.for;
        input.name = labelInfo.name;
        if (labelInfo.type === "number") {
            input.step = labelInfo.step;
            input.min = labelInfo.min;
            input.max = labelInfo.max;
        }

        div.appendChild(label);
        div.appendChild(input);
    })

    const clabel = document.createElement("label");
    clabel.setAttribute("for", `col${newIndex}`);
    clabel.className = "form-label";
    clabel.textContent = "Colour (named or hex)";

    const divColorPicker = document.createElement("div");
    divColorPicker.className = "color-picker-container d-flex align-items-center";

    const select = document.createElement("select");
    select.className = "form-control format-col";
    select.id = `col${newIndex}`;
    select.name = "color";

    const options = [{ text: "Red", value: "rgb(255, 99, 132)" },
    { text: "Orange", value: "rgb(255, 159, 64)" },
    { text: "Yellow", value: "rgb(255, 205, 86)" },
    { text: "Green", value: "rgb(75, 192, 192)" },
    { text: "Blue", value: "rgb(54, 162, 235)" },
    { text: "Purple", value: "rgb(153, 102, 255)" },
    { text: "Grey", value: "rgb(201, 203, 207)" },
    { text: "Custom Colour", value: "custom" }
    ];
    options.forEach(optionInfo => {
        const option = document.createElement("option");
        option.textContent = optionInfo.text;
        option.value = optionInfo.value;
        select.appendChild(option);
    });

    const ellipsis = document.createElement("i");
    ellipsis.className = "bi bi-three-dots-vertical ellipsis";

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.className = "form-control format-col-picker";
    colorPicker.id = `col${newIndex}`;
    colorPicker.name = "cc";

    div.appendChild(clabel);
    div.appendChild(divColorPicker);
    divColorPicker.appendChild(select);
    divColorPicker.appendChild(ellipsis);
    divColorPicker.appendChild(colorPicker);

    // Create a remove button to delete the row
    const removeBtn = document.createElement("i");
    removeBtn.className = "bi bi-trash ps-3 cell-delete-series-format data-cell-icon-hover remove";
    div.appendChild(removeBtn);
    
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