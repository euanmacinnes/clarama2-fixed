//  Copyright (c) 2024. Euan Duncan Macinnes, euan.d.macinnes@gmail.com, S7479622B - All Rights Reserved

// This file is for detecting and reacting to the field changes, to then decide the refresh (reload) action
// for the next field

// For keypress-based input fields, it will wait for 1000ms after typing stopped to then refresh the next field(s)
// For simple toggle fields (checkbox, button), the onchange event will directly apply

// Relevant classes:

// clarama-change-field - select boxes, checkbox
// clarama-button-field - button
// clarama-input-field - general input fields (text, number, date, etc..)
// clarama-editor-field - the ACE code editor
// clarama-rtf-field - the trumbowyg editor

// See: https://stackoverflow.com/questions/72699281/how-to-trigger-a-function-after-a-delay-only-once-with-the-latest-value-of-the-t
function debounce(func, timeout = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    }
}

function perform_interact(field, args = {}) {
    // console.log("Interacting from " + field.attr("id"));
    var element = field.parents(".clarama-element").attr('id');
    var grid = field.parents(".grid-stack");
    var grid_id = field.parents(".clarama-element").attr('grid-id');

    if (grid_id !== undefined) {
        var element_array = eval(grid_id + "elements");
        var eobj = element_array[element];

        field_values = merge_dicts(get_field_values(), args);
        //console.log(field_values);

        if ('links' in eobj) {
            links = eobj["links"]; // array of file names to refresh
            //console.log(links);
            //flash(element + ' links to ' + links);
            for (const link of links) {
                linked_element = grid.find('#' + link);
                linked_type = linked_element.attr("element-type");
                //console.log("Linking " + link + '->' + linked_type);
                switch (linked_type) {
                    case ".task":
                        field_values['clarama_var_run'] = 'True'
                        reload(linked_element, field_values);
                        break;

                    case ".field":
                        var form_field = linked_element.find(".clarama-field");

                        if (form_field.hasClass('clarama-delay-field')) {
                            //console.log("Reloading " + linked_element)
                            reload(linked_element, field_values)
                        } else {
                            //console.log("Refreshing " + linked_element)
                            form_field.empty().trigger('change')
                        }
                        break;
                    default:
                        flash("Don't know how to interact " + linked_type + " - " + link);
                }
            }
        }
    }
}

$.fn.interact_change = function () {
    return this.each(function () {
        const handleChange = debounce(() => perform_interact($(this)))
        $(this).off('change');
        $(this).on('change', handleChange);
    });
}

$.fn.interact_select = function () {
    return this.each(function () {

        const handleChange = debounce(() => perform_interact($(this)), 50)
        $(this).off('select2:select');
        $(this).on('select2:select', handleChange);
    });
}

$.fn.interact_delay = function () {
    return this.each(function () {
        const handleChange = debounce(() => perform_interact($(this)))
        $(this).on('input', handleChange);
    });
}

$.fn.interact_now = function () {
    return this.each(function () {
        //flash('interact! ' + $(this).attr('id'));
        $(this).on('input', perform_interact($(this)));
    });
}

$.fn.interact_button = function () {
    return this.each(function () {
        console.log("Setting interaction for " + $(this).attr('id'))
        $(this).off('click');
        $(this).on('click', function () {
                perform_interact($(this))
            }
        );
    });
}

$.fn.interact_editor = function () {
    return this.each(function () {

    });
}

$.fn.interact_rtf = function () {
    return this.each(function () {

    });
}


