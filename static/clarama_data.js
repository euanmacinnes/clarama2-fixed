function bTable(table_id, table_data) {
    var table_columns = [];
    var table_rows = [];
    var headings = [];

    console.log(table_id + " TABLE_DATA");
    //console.log(table_data);


    for (col of table_data['cols']) {
        headings.push(col);
        var col_dict = {
            'field': col,
            'title': col,
            'sortable': true
        }
        table_columns.push(col_dict);
    }

    Object.entries(table_data['rows']).forEach((row) => {
        this_row = row[1];
        //console.log("row " + this_row);
        col_dict = {};
        for (let i = 0; i < this_row.length; i++) {
            var colname = headings[i];
            col_dict[colname] = this_row[i];
        }
        table_rows.push(col_dict);
    });


    $('#' + table_id).bootstrapTable('destroy').bootstrapTable({
        exportDataType: 'all',
        exportOptions: {},
        exportTypes: ['json', 'xml', 'csv', 'txt', 'excel', 'pdf'],
        columns: table_columns,
        data: table_rows,
        onClickRow: function (row, $element, field) {
            // alert(JSON.stringify(row));
            perform_interact($('#' + table_id), row);
        }
    });
};

function ChartSeriesFormat(dataset, formats) {
    if (formats === undefined) {
        dataset['fill'] = false;
        dataset['stepped'] = false;
        dataset['pointRadius'] = 4;
        dataset['borderWidth'] = 2;
        return dataset;
    }

    for (f = 0; f < formats.length; f++) {
        var format = formats[f];
        var match = true;

        if (format['format-nrx'] == dataset['label']) {
            match = true;
        } else {
            if (format['format-nrx'] != '') {
                var re = new RegExp(format['format-nrx']);
                match = re.test(dataset['label']);
                //console.log("RexEx test result: " + match)
            }
        }

        if (match) {
            if (format['format-lw'] === undefined || format['format-lw'] === '')
                format['format-lw'] = 2;

            if (format['format-pr'] === undefined || format['format-pr'] === '')
                format['format-pr'] = 4;


            dataset['fill'] = format['format-f'];
            dataset['stepped'] = format['format-p'];
            dataset['pointRadius'] = format['format-pr'];
            dataset['borderWidth'] = format['format-lw'];

            if (format['format-dt'])
                dataset['borderDash'] = [10, 5];

            // console.log("Matched series " + dataset['label'] + " to '" + format['format-nrx'] + '');
        } else {
            // console.log("NO Matched series " + dataset['label'] + " to '" + format['format-nrx'] + "'");
        }

        dataset['pointHoverRadius'] = 15;
    }

    return dataset;
}

/**
 * ChartSeriesAxis looks at the specified series and tries to assign an axis to it (this function will be called assuming a unit axis is specified).
 * @param {*|{}} dataset
 * @param {*|{}} scales
 * @param {string} axis
 */
function ChartSeriesAxis(dataset, scales, axis) {

    const keys = Object.keys(scales);
    console.log("UNIT AXIS: " + axis + ' ' + keys.length);
    var found = undefined;
    for (f = 0; f < keys.length; f++) {
        var scale = scales[keys[f]];

        if (scale['title']['text'] === axis) {
            found = keys[f];
            console.log("REUSING " + found);
        }

    }

    if (found === undefined) {
        yaxis = keys.length + 1
        scales['y' + yaxis] = {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
                text: axis,
                display: true,
            }
        }

        if (keys.length > 3)
            scales['y' + yaxis]['grid'] = {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
            };

        found = 'y' + yaxis;
    }

    if (found !== undefined) {
        dataset['yAxisID'] = found
    }
}


function bChart(chart_id, chart_data) {
    var data = chart_data['data'];
    var config = chart_data['chart'];
    var formats = config['series-formats'];

    var aspect_ratio = config['aspect_ratio'];
    var maintain = false;

    if (isNaN(aspect_ratio) || !aspect_ratio) {
        aspect_ratio = 2.5;
        maintain = true;
    }

    var legend_display = config['legend'] != 'Off';


    console.log('CHART aspect ' + aspect_ratio + ' with maintain ' + maintain);
    console.log(config);


    scales = {};
    xaxis_scale = {
        display: true,
        type: config['xaxis-type'] || 'category',
        title: {
            display: true,
            text: config['xaxis-title'] || 'X Axis'
        }
    };

    yaxis_scale = {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
            display: true,
            text: 'Y Axis'
        }
    };

    var labels = undefined;

    var datasets = [];

    for (i = 0; i < config['series-groups'].length; i++) {
        console.log("SERIES GROUP " + i + " of " + config['series-groups'].length);
        console.log(config['series-groups'][i]);
        var sg = config['series-groups'][i];
        var label = sg['series-y'];

        xaxis_id = data['cols'].indexOf(sg['series-x']);
        yaxis_id = data['cols'].indexOf(sg['series-y']);
        zaxis_id = data['cols'].indexOf(sg['series-z']);
        series_id = data['cols'].indexOf(sg['series-s']);
        label_id = data['cols'].indexOf(sg['series-l']);
        unit_id = data['cols'].indexOf(sg['series-u']);

        if (xaxis_id >= 0 & yaxis_id >= 0) {
            xaxis = data['rows'][xaxis_id];
            yaxis = data['rows'][yaxis_id];
            labels = xaxis

            if (zaxis_id >= 0)
                zaxis = data['rows'][zaxis_id];

            if (label_id >= 0)
                labelaxis = data['rows'][label_id];

            if (unit_id >= 0)
                unitaxis = data['rows'][unit_id];

            xaxis_scale['title']['text'] = sg['series-x'];
            yaxis_scale['title']['text'] = sg['series-y'];
            scales['x'] = xaxis_scale;
            scales['y'] = yaxis_scale;


            console.log("X-AXIS");
            //console.log(xaxis);


            var points = [];

            if (series_id >= 0) {
                series = data['rows'][series_id];

                if (unit_id > 0)
                    unit = data['rows'][unit_id];
                else
                    unit = undefined;

                if (series !== undefined) {
                    var curr = series[0];

                    label = curr;

                    for (p = 0; p < xaxis.length; p++) {
                        if (series[p] !== curr)   // then pop the current dataset onto the datasets queue, and reset
                        {
                            dataset = {
                                label: label,
                                data: points,
                                type: sg['series-type'].toLowerCase()
                            }

                            if (unit !== undefined)
                                ChartSeriesAxis(dataset, scales, unit[p - 1]);

                            datasets.push(ChartSeriesFormat(dataset, formats));

                            label = series[p];
                            points = [];
                            curr = series[p];
                        }

                        point = {
                            x: xaxis[p],
                            y: yaxis[p]
                        }

                        if (zaxis_id >= 0)
                            point['z'] = zaxis[p];

                        if (label_id >= 0)
                            point['text'] = labelaxis[p];

                        points.push(point);
                    }
                }

            } else {

                for (p = 0; p < xaxis.length; p++) {

                    point = {
                        x: xaxis[p],
                        y: yaxis[p]
                    };

                    if (label_id >= 0)
                        point['text'] = labelaxis[p];

                    points.push(point);

                }

            }
            dataset = {
                label: label,
                data: points,
                type: sg['series-type'].toLowerCase(),
            }

            if (unit !== undefined)
                if (xaxis.length >= 1)
                    ChartSeriesAxis(dataset, scales, unit[xaxis.length - 1]);

            datasets.push(ChartSeriesFormat(dataset, formats));

            console.log("DATASETS");
            console.log(datasets.length);
        } else
            alert("Didn't find X and Y axis for chart in " + data['cols'] + '. X: ' + sg['series-x'] + '. Y: ' + sg['series-y']);

        console.log('i' + i);
    }

    console.log("FINAL DATASETS");
    console.log(datasets.length);
    console.log("FINAL SCALES");
    console.log(scales);
    console.log(datasets);

    var chartColors = {
        red: 'rgb(255, 50, 50)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 255, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)',
        black: 'rgb(20, 20, 20)'
    };

    var annotation_example = {
        annotations: {
            alarm1: {
                borderDash: [4, 4],
                // Indicates the type of annotation
                type: 'line',
                borderColor: 'rgb(255, 99, 132)',
                yMin: 85,
                yMax: 95,
                borderWidth: 1,
                label: {
                    content: 'RPM max alarm',
                    enabled: true,
                    display: true,
                    position: 'end',
                    backgroundColor: 'red',
                }
            }
        }
    }

    const unique_labels = [...new Set(labels)] // Get unique list of labels for the x axis

    var config = {
        data: {
            labels: unique_labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: maintain,
            aspectRatio: aspect_ratio,
            layout: {
                autoPadding: false,
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            animation: false,
            transitions: {active: {animation: {duration: 0}}},
            scales: scales,
            onClick: (event, elements, chart) => {
                chart_id = chart.canvas.id

                if (elements[0]) {
                    const i = elements[0].index;
                    const ds = elements[0].datasetIndex;
                    series = chart.data.datasets[ds].label;
                    x = chart.data.datasets[ds].data[i].x;
                    y = chart.data.datasets[ds].data[i].y;

                    datapoint = {
                        series: series,
                        x: x,
                        y: y
                    }
                    perform_interact($('#' + chart_id), datapoint);
                }
            },
            plugins: {
                legend: {
                    display: legend_display,
                    position: config['legend'].toLowerCase(),
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';

                            if (context.raw.text)
                                return context.raw.text;

                            if (label) {
                                label += ': ';
                            }
                            if (context.raw.y !== null) {
                                label += context.raw.y;
                            }


                            return label;
                        }
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        modifierKey: 'ctrl'
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            modifierKey: 'ctrl',
                        },
                        drag: {
                            enabled: true,
                            borderColor: 'rgb(54, 162, 235)',
                            borderWidth: 1,
                            backgroundColor: 'rgba(54, 162, 235, 0.3)'
                        },
                        mode: 'x',
                    }
                },
                datalabels: {
                    color: 'rgba(54, 162, 235, 0.3)',
                    labels: {
                        title: null
                    }
                },
                title: {
                    display: config['title'] != '',
                    text: config['title'],
                    font: {
                        size: 22
                    }
                },
                subtitle: {
                    display: config['subtitle'] != '',
                    text: config['subtitle'],
                    font: {
                        size: 18
                    }
                }
            }
        }
    };

    var chart_id = "chart_" + chart_id;
    let chartStatus = Chart.getChart(chart_id); // <canvas> id
    if (chartStatus !== undefined) {
        console.log("Destroying existing chart " + chart_id);
        chartStatus.destroy();
    }
    var chart_element = $('#' + chart_id);
    console.log("Chart: " + chart_id + ' - ');
    console.log(chart_data);
    chart_element.attr("chart", new Chart(chart_element, config));
};
