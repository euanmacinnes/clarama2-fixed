/**
 * Clarama Hover JS - Functions for handling hover effects and tooltips
 * @fileoverview This file provides functions for managing hover effects on elements
 * and initializing Bootstrap tooltips.
 */

/**
 * Applies hover animation effects to an element
 * @param {jQuery} elem - jQuery object representing the element(s) to apply hover effects to
 * @description Sets up hover event handlers that animate opacity changes when
 * hovering over the element or a target specified by the hovertarget attribute
 */
function hoverover_this(elem)
{
     elem.off('hover');
     elem.hover(function(){
        $($(this).attr("hovertarget") || this).animate({"opacity": 1});
    },function(){
        $($(this).attr("hovertarget") || this).animate({"opacity": $(this).attr('opacity') || 0});
    });
 }

/**
 * Removes hover effects from an element
 * @param {jQuery} elem - jQuery object representing the element(s) to remove hover effects from
 * @description Removes hover event handlers and sets the element's opacity to 1
 */
function hoverover_off(elem)
{
     elem.off('hover');
     elem.css({ 'opacity' : 1 });
}

/**
 * Initializes Bootstrap tooltips when the document is ready
 * @description Finds all elements with the data-bs-toggle="tooltip" attribute
 * and initializes Bootstrap tooltips on them
 */
$(document).ready(function() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})
  });
