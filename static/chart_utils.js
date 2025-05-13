'use strict';

/**
 * Chart Utils JS - Utility functions for chart generation and manipulation
 * @fileoverview This file provides utility functions for generating chart data,
 * handling colors, and creating sample datasets for charts.
 */

/**
 * Global chart color palette
 * @type {Object.<string, string>}
 */
window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

(function(global) {
    var MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    var COLORS = [
        '#4dc9f6',
        '#f67019',
        '#f53794',
        '#537bc4',
        '#acc236',
        '#166a8f',
        '#00a950',
        '#58595b',
        '#8549ba'
    ];
    /**
     * Samples namespace for chart utilities
     * @namespace
     */
    var Samples = global.Samples || (global.Samples = {});
    var Color = global.Color;

    /**
     * Utility functions for chart generation
     * @type {Object}
     */
    Samples.utils = {
        /**
         * Sets the random seed for deterministic random number generation
         * @param {number} seed - The seed value
         * @description Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
         */
        srand: function(seed) {
            this._seed = seed;
        },

        /**
         * Generates a random number within a specified range
         * @param {number} [min=0] - The minimum value (inclusive)
         * @param {number} [max=1] - The maximum value (exclusive)
         * @returns {number} A random number between min and max
         */
        rand: function(min, max) {
            var seed = this._seed;
            min = min === undefined ? 0 : min;
            max = max === undefined ? 1 : max;
            this._seed = (seed * 9301 + 49297) % 233280;
            return min + (this._seed / 233280) * (max - min);
        },
        /**
         * Generates an array of random numbers based on configuration
         * @param {Object} [config] - Configuration options
         * @param {number} [config.min=0] - Minimum value for random numbers
         * @param {number} [config.max=1] - Maximum value for random numbers
         * @param {Array} [config.from=[]] - Base values to add randomness to
         * @param {number} [config.count=8] - Number of values to generate
         * @param {number} [config.decimals=8] - Number of decimal places
         * @param {number} [config.continuity=1] - Probability of generating a value (vs null)
         * @returns {Array} Array of random numbers
         */
        numbers: function(config) {
            var cfg = config || {};
            var min = cfg.min || 0;
            var max = cfg.max || 1;
            var from = cfg.from || [];
            var count = cfg.count || 8;
            var decimals = cfg.decimals || 8;
            var continuity = cfg.continuity || 1;
            var dfactor = Math.pow(10, decimals) || 0;
            var data = [];
            var i, value;

            for (i = 0; i < count; ++i) {
                value = (from[i] || 0) + this.rand(min, max);
                if (this.rand() <= continuity) {
                    data.push(Math.round(dfactor * value) / dfactor);
                } else {
                    data.push(null);
                }
            }

            return data;
        },
        /**
         * Generates an array of evenly spaced labels
         * @param {Object} [config] - Configuration options
         * @param {number} [config.min=0] - Minimum value
         * @param {number} [config.max=100] - Maximum value
         * @param {number} [config.count=8] - Number of labels to generate
         * @param {number} [config.decimals=8] - Number of decimal places
         * @param {string} [config.prefix=''] - Prefix for each label
         * @returns {Array} Array of formatted label strings
         */
        labels: function(config) {
            var cfg = config || {};
            var min = cfg.min || 0;
            var max = cfg.max || 100;
            var count = cfg.count || 8;
            var step = (max - min) / count;
            var decimals = cfg.decimals || 8;
            var dfactor = Math.pow(10, decimals) || 0;
            var prefix = cfg.prefix || '';
            var values = [];
            var i;

            for (i = min; i < max; i += step) {
                values.push(prefix + Math.round(dfactor * i) / dfactor);
            }

            return values;
        },
        /**
         * Generates an array of month labels
         * @param {Object} [config] - Configuration options
         * @param {number} [config.count=12] - Number of months to generate
         * @param {number} [config.year=2020] - Starting year
         * @param {number} [config.section] - Number of characters to include from month name
         * @returns {Array} Array of month labels with year
         */
        months: function(config) {
            var cfg = config || {};
            var count = cfg.count || 12;
            var year = cfg.year || 2020;
            var section = cfg.section;
            var values = [];
            var i, value;

            for (i = 0; i < count; ++i) {
                value = MONTHS[Math.ceil(i) % 12];
                var yr = year + Math.trunc(i/12);
                values.push(value.substring(0, section) + ', ' + yr);
            }

            return values;
        },
        /**
         * Returns a color from the predefined color palette
         * @param {number} index - Index in the color palette
         * @returns {string} Hex color code
         */
        color: function(index) {
            return COLORS[index % COLORS.length];
        },

        //transparentize: function(color, opacity) {
        //  var alpha = opacity === undefined ? 0.5 : 1 - opacity;
        //  return ColorO(color).alpha(alpha).rgbString();
        //}
        /**
         * Creates a transparent color from RGB values
         * @param {number} r - Red component (0-255)
         * @param {number} g - Green component (0-255)
         * @param {number} b - Blue component (0-255)
         * @param {number} alpha - Alpha transparency (0-1)
         * @returns {string} RGBA color string
         */
        transparentize: function (r, g, b, alpha) {
              const a = (1 - alpha) * 255;
              const calc = x => Math.round((x - a)/alpha);

              return `rgba(${calc(r)}, ${calc(g)}, ${calc(b)}, ${alpha})`;
            }


    };
    /**
     * Generates a random scaling factor between -100 and 100
     * @returns {number} A random integer between -100 and 100
     * @deprecated Use Samples.utils.rand() instead
     */
    window.randomScalingFactor = function() {
        return Math.round(Samples.utils.rand(-100, 100));
    };
    // INITIALIZATION
    Samples.utils.srand(Date.now());

}(this));
