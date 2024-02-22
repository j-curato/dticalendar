
const appEvents = Vue.createApp({ 
    delimiters: ['{[', ']}'], // Change Vue.js delimiters to avoid conflicts with Django template tags
    data() {
        return {
            message: '',
            specificEventDetails: []
            
        };
    },
    mounted() {

        var table; //declare the table variable globally
        var tblEventsDiv; //declare the table variable globally
        var tblEventsUnit; //declare the table variable globally
        const self = this; // Preserve reference to Vue component

        $('#eventsDisplayTable, #eventsDivDisplayTable').on('click', '.regional-office', function() {
            const id = $(this).attr('data-id');
            self.fetchEventDetails(id);
        });

        // initialize the datatable
        $(function() {

            table = $('#eventsDisplayTable').DataTable({  
                'processing': true,
                'serverSide': true,
                'ajax': { 
                    'url': '/events/fetch-events-ajax/',  // Replace with your API endpoint
                    'type': 'GET', 
                },
                'dom': 'Bfrtip<"clear">l',        // Add this to enable export buttons
                'buttons': [
                    {
                        extend: 'copy',
                        exportOptions: {
                            columns: ':not(:first)' // Excludes the first visible column
                        }
                    },
                    {
                        extend: 'csv',
                        exportOptions: {
                            columns: ':not(:first)' // Excludes the first visible column
                        }
                    },
                    {
                        extend: 'excel',
                        exportOptions: {
                            columns: ':not(:first)' // Excludes the first visible column
                        },   
                        customize: function (xlsx) {
                            // Modify the content before exporting to PDF
                            const sheet = xlsx.xl.worksheets['sheet1.xml'];
                            // Ensure that the text containing bullet points is formatted properly and move to the next line after each bullet point
                            ['B', 'C', 'D', 'E', 'F', 'G'].forEach(function(columnLetter) {
                                $('row c[r^="' + columnLetter + '"]', sheet).each(function () {
                                    if ($(this).text().includes('•')) {
                                        // apply wrap text style
                                        $(this).attr('s', '55');
                                        // Insert line breaks after each bullet point
                                        $(this).html($(this).html().replace(/• /g, '\n• ')); // Insert line breaks after each bullet point
                                    }
                                });
                            });
                            
                        }
                    },
                    {
                        extend: 'pdf',
                        exportOptions: {
                            columns: ':not(:first)' // Excludes the first visible column
                        },
                        customize: function (doc) {

                            // Modify the content before exporting to PDF
                            doc.content[1].table.body.forEach(row => {
                                row.forEach(cell => {
                                    // Set border property for each cell
                                    cell['style'] = 'tableCell'; // Apply the table cell style
                                });
                            });
                            // Apply the table border style
                            doc.content[1].layout = {
                                hLineWidth: function () { return 1; },
                                vLineWidth: function () { return 1; },
                                hLineColor: function () { return '#b3b3b3'; },
                                vLineColor: function () { return '#b3b3b3'; },
                            };

                            // increase header width
                            doc.content[1].table.widths = ['*', '*', '*', '*', '*', '*', '*'];

                            // apply header background color
                            doc.content[1].table.body[0].forEach(cell => {
                                cell['fillColor'] = '#e6e6e6'; // Apply the header background color
                            });

                            // Increase the width of the exported PDF
                            doc.pageOrientation = 'landscape'; // Change orientation to landscape
                            doc.pageSize = 'A4'; // Set page size to A3
                    
                            // Modify the content before exporting to PDF
                            doc.content[1].table.body.forEach(row => {
                                row.forEach((cell, index) => {
                                    // Ensure that the text containing bullet points is formatted properly
                                    if (typeof cell.text === 'string' && cell.text.includes('•')) {
                                        cell.text = cell.text.replace(/• /g, '\n• '); // Insert line breaks after each bullet point
                                    }
                                });
                            });
                        }
                    },
                    {
                        extend: 'print',
                        exportOptions: {
                            columns: ':not(:first)' // Excludes the first visible column
                        },
                        customize: function (win) {
                            const table = $(win.document.body).find('table tbody');
                    
                            table.find('tr').each(function () {
                                const cells = $(this).find('td');
                    
                                cells.each(function () {
                                    const newText = $(this).text().replace(/•/g, '\n•');
                                    $(this).text(newText);
                                });
                            });
                        } 
                        
                    },
                ],
                'columns': [
                    {'data': 'whole_date_start', 'sortable': true, 'searchable': true, 'visible': false},
                    {'data': 'whole_date_start_searchable', 'sortable': true, 'searchable': true},
                    {'data': 'RO', 'sortable': true, 'searchable': true},
                    {'data': 'ADN', 'sortable': true, 'searchable': true},
                    {'data': 'ADS', 'sortable': true, 'searchable': true},
                    {'data': 'SDN', 'sortable': true, 'searchable': true},
                    {'data': 'SDS', 'sortable': true, 'searchable': true},
                    {'data': 'PDI', 'sortable': true, 'searchable': true},
                    // Add more columns as needed
                ],
                'order': [[0, 'asc']], // Order by ID column, descending
                //apply css style to the columns
                'columnDefs': [
                    {
                        'targets': [1],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        className: 'bold-column',
                    },
                    {
                        'targets': [2],
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                var formattedData = data.replace(/,/g, '<br>');
                                let html = '';

                                if (formattedData.includes('<br>')) {
                                    const splitData = formattedData.split('<br>');
                                    splitData.forEach(pair => {
                                        const [title, id, divname, unitname, timeStart, timeEnd] = pair.trim().split('*');
                                        html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Division: ${divname} &#13;Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span><br>`;
                                    });
                                } else {
                                    const [title, id, divname, unitname, timeStart, timeEnd] = formattedData.trim().split('*');
                                    html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Division: ${divname} &#13;Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span>`;
                                }
                                
                                return html;
                            }
                        }
                    },
                    
                    {
                        'targets': [3],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                var formattedData = data.replace(/,/g, ' <br>');
                                let html = '';
                    
                                if (formattedData.includes('<br>')) {
                                    const splitData = formattedData.split('<br>');
                                    splitData.forEach(pair => {
                                        const [title, id, divname, unitname] = pair.trim().split('*');
                                        html += `<span class="highlight-offices po-adn multiline" style="cursor: pointer;" data-id="${id}" title="Division: ${divname} &#13;Unit: ${unitname}">&#8226; ${title}</span><br>`;
                                    });
                                } else {
                                    const [title, id, divname, unitname] = formattedData.trim().split('*');
                                    html += `<span class="highlight-offices po-adn" data-id="${id}" style="cursor: pointer;" title="Division: ${divname} &#13;Unit: ${unitname}">&#8226; ${title}</span>`;
                                }
                                
                    
                                return html;
                            }
                        },
                    },
                    {
                        'targets': [4],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                var formattedData = data.replace(/,/g, ' <br>');
                                let html = '';
                    
                                if (formattedData.includes('<br>')) {
                                    const splitData = formattedData.split('<br>');
                                    splitData.forEach(pair => {
                                        const [title, id, divname, unitname] = pair.trim().split('*');
                                        html += `<span class="highlight-offices po-ads multiline" style="cursor: pointer;" data-id="${id}" title="Division: ${divname} &#13;Unit: ${unitname}">&#8226; ${title}</span><br>`;
                                    });
                                } else {
                                    const [title, id, divname, unitname] = formattedData.trim().split('*');
                                    html += `<span class="highlight-offices po-ads" data-id="${id}" style="cursor: pointer;" title="Division: ${divname} &#13;Unit: ${unitname}">&#8226; ${title}</span>`;
                                }
                                
                                return html;
                            }
                        },
                    },
                    {
                        'targets': [5],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                var formattedData = data.replace(/,/g, ' <br>');
                                let html = '';
                    
                                if (formattedData.includes('<br>')) {
                                    const splitData = formattedData.split('<br>');
                                    splitData.forEach(pair => {
                                        const [title, id, divname, unitname] = pair.trim().split('*');
                                        html += `<span class="highlight-offices po-sdn multiline" style="cursor: pointer;" data-id="${id}" title="Division: ${divname} &#13;Unit: ${unitname}">&#8226; ${title}</span><br>`;
                                    });
                                } else {
                                    const [title, id, divname, unitname] = formattedData.trim().split('*');
                                    html += `<span class="highlight-offices po-sdn" data-id="${id}" style="cursor: pointer;" title="Division: ${divname} &#13;Unit: ${unitname}">&#8226; ${title}</span>`;
                                }
                                
                    
                                return html;
                            }
                        },
                    },
                    {
                        'targets': [6],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                var formattedData = data.replace(/,/g, ' <br>');
                                let html = '';
                    
                                if (formattedData.includes('<br>')) {
                                    const splitData = formattedData.split('<br>');
                                    splitData.forEach(pair => {
                                        const [title, id, divname, unitname] = pair.trim().split('*');
                                        html += `<span class="highlight-offices po-sds multiline" style="cursor: pointer;" data-id="${id}" title="Division: ${divname} &#13;Unit: ${unitname}">&#8226; ${title}</span><br>`;
                                    });
                                } else {
                                    const [title, id, divname, unitname] = formattedData.trim().split('*');
                                    html += `<span class="highlight-offices po-sds" data-id="${id}" style="cursor: pointer;" title="Division: ${divname} &#13;Unit: ${unitname}">&#8226; ${title}</span>`;
                                }
                                
                    
                                return html;
                            }
                        },
                    },
                    {
                        'targets': [7],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                var formattedData = data.replace(/,/g, ' <br>');
                                let html = '';
                    
                                if (formattedData.includes('<br>')) {
                                    const splitData = formattedData.split('<br>');
                                    splitData.forEach(pair => {
                                        const [title, id, divname, unitname] = pair.trim().split('*');
                                        html += `<span class="highlight-offices po-pdi multiline" style="cursor: pointer;" data-id="${id}" title="Division: ${divname} &#13;Unit: ${unitname}">&#8226; ${title}</span><br>`;
                                    });
                                } else {
                                    const [title, id, divname, unitname] = formattedData.trim().split('*');
                                    html += `<span class="highlight-offices po-pdi" data-id="${id}" style="cursor: pointer;" title="Division: ${divname} &#13;Unit: ${unitname}">&#8226; ${title}</span>`;
                                }
                                
                                return html;
                            }
                        },
                    },
                    {'width': '5%', 'targets': 0},  // Adjust the percentage for each column
                    {'width': '15%', 'targets': 1},
                    {'width': '15%', 'targets': 2},
                    {'width': '15%', 'targets': 3},
                    {'width': '15%', 'targets': 4},
                    {'width': '15%', 'targets': 5},
                    {'width': '15%', 'targets': 6},
                    {'width': '10%', 'targets': 7},
                    // Add more 'columnDefs' as needed
                ],
                
                }); // end of the $('#').DataTable()

                // Define your dynamic column configuration
                let dynamicColumns = [
                    
                    {'data': 'whole_date_start', 'sortable': true, 'searchable': true, 'visible': false},
                    {'data': 'whole_date_start_searchable', 'sortable': true, 'searchable': true},
                    {'data': 'ORD', 'sortable': true, 'searchable': true},
                    {'data': 'OARD', 'sortable': true, 'searchable': true},
                    {'data': 'SDD', 'sortable': true, 'searchable': true},
                    {'data': 'IDD', 'sortable': true, 'searchable': true},
                    {'data': 'CPD', 'sortable': true, 'searchable': true},
                    {'data': 'FAD', 'sortable': true, 'searchable': true},
                    {'data': 'MSSD', 'sortable': true, 'searchable': true},
                    
                    // Add more columns as needed
                ];

                var tblEventsDiv;
                    // Create DataTable using dynamic configuration
                    tblEventsDiv = $('#eventsDivDisplayTable').DataTable({
                        'dom': 'Rlfrtip',
                        'colReorder': {
                            'allowReorder': true
                        },
                        'processing': true,
                        'serverSide': true,
                        'ajax': {
                            'url': '/events/fetch-events-by-div-ajax/',  // Replace with your API endpoint
                            'type': 'GET',
                            'data': function (d) {
                                d.office = $("#office-txt").val();
                                console.log(d);
                            }
                        },
                        'dom': 'Bfrtip<"clear">l',        // Add this to enable export buttons
                        'buttons': [
                            {
                                extend: 'copy',
                                exportOptions: {
                                    columns: ':not(:first)' // Excludes the first visible column
                                }
                            },
                            {
                                extend: 'csv',
                                exportOptions: {
                                    columns: ':not(:first)' // Excludes the first visible column
                                }
                            },
                            {
                                extend: 'excel',
                                exportOptions: {
                                    columns: ':not(:first)' // Excludes the first visible column
                                },   
                                customize: function (xlsx) {
                                    // Modify the content before exporting to PDF
                                    const sheet = xlsx.xl.worksheets['sheet1.xml'];
                                    // Ensure that the text containing bullet points is formatted properly and move to the next line after each bullet point
                                    ['B', 'C', 'D', 'E', 'F', 'G'].forEach(function(columnLetter) {
                                        $('row c[r^="' + columnLetter + '"]', sheet).each(function () {
                                            if ($(this).text().includes('•')) {
                                                // apply wrap text style
                                                $(this).attr('s', '55');
                                                // Insert line breaks after each bullet point
                                                $(this).html($(this).html().replace(/• /g, '\n• ')); // Insert line breaks after each bullet point
                                            }
                                        });
                                    });
                                    
                                }
                            },
                            {
                                extend: 'pdf',
                                exportOptions: {
                                    columns: ':not(:first)' // Excludes the first visible column
                                },
                                customize: function (doc) {

                                    // Modify the content before exporting to PDF
                                    doc.content[1].table.body.forEach(row => {
                                        row.forEach(cell => {
                                            // Set border property for each cell
                                            cell['style'] = 'tableCell'; // Apply the table cell style
                                        });
                                    });
                                    // Apply the table border style
                                    doc.content[1].layout = {
                                        hLineWidth: function () { return 1; },
                                        vLineWidth: function () { return 1; },
                                        hLineColor: function () { return '#b3b3b3'; },
                                        vLineColor: function () { return '#b3b3b3'; },
                                    };

                                    // increase header width
                                    doc.content[1].table.widths = ['*', '*', '*', '*', '*', '*', '*', '*'];

                                    // apply header background color
                                    doc.content[1].table.body[0].forEach(cell => {
                                        cell['fillColor'] = '#e6e6e6'; // Apply the header background color
                                    });

                                    // Increase the width of the exported PDF
                                    doc.pageOrientation = 'landscape'; // Change orientation to landscape
                                    doc.pageSize = 'A4'; // Set page size to A3
                            
                                    // Modify the content before exporting to PDF
                                    doc.content[1].table.body.forEach(row => {
                                        row.forEach((cell, index) => {
                                            // Ensure that the text containing bullet points is formatted properly
                                            if (typeof cell.text === 'string' && cell.text.includes('•')) {
                                                cell.text = cell.text.replace(/• /g, '\n• '); // Insert line breaks after each bullet point
                                            }
                                        });
                                    });
                                }
                            },
                            {
                                extend: 'print',
                                exportOptions: {
                                    columns: ':not(:first)' // Excludes the first visible column
                                },
                                customize: function (win) {
                                    const table = $(win.document.body).find('table tbody');
                            
                                    table.find('tr').each(function () {
                                        const cells = $(this).find('td');
                            
                                        cells.each(function () {
                                            const newText = $(this).text().replace(/•/g, '\n•');
                                            $(this).text(newText);
                                        });
                                    });
                                } 
                                
                            },
                        ],
                        'columns': dynamicColumns,
                        'order': [[0, 'asc']],
                        'columnDefs': dynamicColumns.map((column, index) => {
                            if (index === 1) {
                                // For whole_date_start_searchable column
                                return {
                                    'targets': [index],
                                    'searchable': true,
                                    'render': function (data) {
                                        return data;
                                    },
                                };
                            } else {
                                // For other columns
                                return {
                                    'targets': [index],
                                    'searchable': true,
                                    'render': function (data, type, row) {
                                        if (data === null || data === undefined) {
                                            return '<span class="highlight-vacant">empty</span>';
                                        } else {
                                            try {
                                                var formattedData = data.replace(/,/g, '<br>');
                                                let html = '';

                                                if (formattedData.includes('<br>')) {
                                                    const splitData = formattedData.split('<br>');
                                                    splitData.forEach(pair => {
                                                        const [title, id, divname, unitname, timeStart, timeEnd] = pair.trim().split('*');
                                                        html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span><br>`;
                                                    });
                                                } else {
                                                    const [title, id, divname, unitname, timeStart, timeEnd] = formattedData.trim().split('*');
                                                    html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span>`;
                                                }

                                                return html;
                                            } catch (error) {
                                                console.error("Error rendering column:", error);
                                                return '<span class="highlight-vacant">Error</span>';
                                            }
                                        }
                                    },
                                };
                            }
                        }),
                        'colResize': true // Enable column resizing
                    });

                // filter by division
                tblEventsDiv = $('#eventsDivDisfffplayTable').DataTable({
                    'processing': true,
                    'serverSide': true,
                    "sDom": 'Rlfrtip',
                    'ajax': { 
                        'url': '/events/fetch-events-by-div-ajax/',  // Replace with your API endpoint
                        'type': 'GET', 
                        'data': function (d) {
                            d.office = $("#office-txt").val();
                            console.log(d);
                        },
                        success: function (response) {
                            console.log(response);
                        }
                    },
                    'dom': 'Bfrtip<"clear">l',        // Add this to enable export buttons
                    'buttons': [
                        'copy', 'csv', 'excel', 'pdf', 'print' // Add the export buttons you need
                    ],
                    'columns': [
                        {'data': 'whole_date_start', 'sortable': true, 'searchable': true, 'visible': false},
                        {'data': 'whole_date_start_searchable', 'sortable': true, 'searchable': true},
                        {'data': 'ORD', 'sortable': true, 'searchable': true},
                        {'data': 'OARD', 'sortable': true, 'searchable': true},
                        {'data': 'SDD', 'sortable': true, 'searchable': true},
                        {'data': 'IDD', 'sortable': true, 'searchable': true},
                        {'data': 'CPD', 'sortable': true, 'searchable': true},
                        {'data': 'FAD', 'sortable': true, 'searchable': true},
                        {'data': 'MSSD', 'sortable': true, 'searchable': true},
                        
                        // Add more columns as needed
                    ],
                    'order': [[0, 'asc']], // Order by ID column, descending
                    //apply css style to the columns
                    'columnDefs': [
                        {
                            'targets': [2],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                            'render': function (data, type, row) {
                                if (data === null || data === undefined) {
                                    return '<span class="highlight-vacant">empty</span>';
                                } else {
                                    var formattedData = data.replace(/,/g, '<br>');
                                    let html = '';
    
                                    if (formattedData.includes('<br>')) {
                                        const splitData = formattedData.split('<br>');
                                        splitData.forEach(pair => {
                                            const [title, id, divname, unitname, timeStart, timeEnd] = pair.trim().split('*');
                                            html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span><br>`;
                                        });
                                    } else {
                                        const [title, id, divname, unitname, timeStart, timeEnd] = formattedData.trim().split('*');
                                        html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span>`;
                                    }
                                    
                                    return html;
                                }
                            },
                        },
                        {
                            'targets': [3],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                            'render': function (data, type, row) {
                                if (data === null || data === undefined) {
                                    return '<span class="highlight-vacant">empty</span>';available
                                } else {
                                    var formattedData = data.replace(/,/g, '<br>');
                                    let html = '';
    
                                    if (formattedData.includes('<br>')) {
                                        const splitData = formattedData.split('<br>');
                                        splitData.forEach(pair => {
                                            const [title, id, divname, unitname, timeStart, timeEnd] = pair.trim().split('*');
                                            html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span><br>`;
                                        });
                                    } else {
                                        const [title, id, divname, unitname, timeStart, timeEnd] = formattedData.trim().split('*');
                                        html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span>`;
                                    }
                                    
                                    return html;
                                }
                            },
                        },
                        {
                            'targets': [4],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                            'render': function (data, type, row) {
                                if (data === null || data === undefined) {
                                    return '<span class="highlight-vacant">empty</span>';
                                } else {
                                    var formattedData = data.replace(/,/g, '<br>');
                                    let html = '';
    
                                    if (formattedData.includes('<br>')) {
                                        const splitData = formattedData.split('<br>');
                                        splitData.forEach(pair => {
                                            const [title, id, divname, unitname, timeStart, timeEnd] = pair.trim().split('*');
                                            html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span><br>`;
                                        });
                                    } else {
                                        const [title, id, divname, unitname, timeStart, timeEnd] = formattedData.trim().split('*');
                                        html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span>`;
                                    }
                                    
                                    return html;
                                }
                            },
                        },
                        {
                            'targets': [5],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                            'render': function (data, type, row) {
                                if (data === null || data === undefined) {
                                    return '<span class="highlight-vacant">empty</span>';
                                } else {
                                    var formattedData = data.replace(/,/g, '<br>');
                                    let html = '';
    
                                    if (formattedData.includes('<br>')) {
                                        const splitData = formattedData.split('<br>');
                                        splitData.forEach(pair => {
                                            const [title, id, divname, unitname, timeStart, timeEnd] = pair.trim().split('*');
                                            html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span><br>`;
                                        });
                                    } else {
                                        const [title, id, divname, unitname, timeStart, timeEnd] = formattedData.trim().split('*');
                                        html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span>`;
                                    }
                                    
                                    return html;
                                }
                            },
                        },
                        {
                            'targets': [6],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                            'render': function (data, type, row) {
                                if (data === null || data === undefined) {
                                    return '<span class="highlight-vacant">empty</span>';
                                } else {
                                    var formattedData = data.replace(/,/g, '<br>');
                                    let html = '';
    
                                    if (formattedData.includes('<br>')) {
                                        const splitData = formattedData.split('<br>');
                                        splitData.forEach(pair => {
                                            const [title, id, divname, unitname, timeStart, timeEnd] = pair.trim().split('*');
                                            html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span><br>`;
                                        });
                                    } else {
                                        const [title, id, divname, unitname, timeStart, timeEnd] = formattedData.trim().split('*');
                                        html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span>`;
                                    }
                                    
                                    return html;
                                }
                            },
                        },
                        {
                            'targets': [7],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                            'render': function (data, type, row) {
                                if (data === null || data === undefined) {
                                    return '<span class="highlight-vacant">empty</span>';
                                } else {
                                    var formattedData = data.replace(/,/g, '<br>');
                                    let html = '';
    
                                    if (formattedData.includes('<br>')) {
                                        const splitData = formattedData.split('<br>');
                                        splitData.forEach(pair => {
                                            const [title, id, divname, unitname, timeStart, timeEnd] = pair.trim().split('*');
                                            html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span><br>`;
                                        });
                                    } else {
                                        const [title, id, divname, unitname, timeStart, timeEnd] = formattedData.trim().split('*');
                                        html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span>`;
                                    }
                                    
                                    return html;
                                }
                            },
                        },
                        {
                            'targets': [8],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                            'render': function (data, type, row) {
                                if (data === null || data === undefined) {
                                    return '<span class="highlight-vacant">empty</span>';
                                } else {
                                    var formattedData = data.replace(/,/g, '<br>');
                                    let html = '';
    
                                    if (formattedData.includes('<br>')) {
                                        const splitData = formattedData.split('<br>');
                                        splitData.forEach(pair => {
                                            const [title, id, divname, unitname, timeStart, timeEnd] = pair.trim().split('*');
                                            html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span><br>`;
                                        });
                                    } else {
                                        const [title, id, divname, unitname, timeStart, timeEnd] = formattedData.trim().split('*');
                                        html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span>`;
                                    }
                                    
                                    return html;
                                }
                            },
                        },
                        // Add more 'columnDefs' as needed
                    ],
                    'colReorder': true, // Enable ColReorder extension
                    'colResize': true   // Enable column resizing
                    
            }); // end of the $('#eventsDivDisplayTable').DataTable()

            // filter by unit
            tblEventsUnit = $('#eventsUnitDisplayTable').DataTable({
                'processing': true,
                'serverSide': true,
                'ajax': { 
                    'url': '/events/fetch-events-by-unit-ajax/',  // Replace with your API endpoint
                    'type': 'GET', 
                    'data': function (d) {
                        d.office = $("#office-txt").val();
                        d.division = $("#div-txt").val();
                    }
                },
                'dom': 'Bfrtip<"clear">l',        // Add this to enable export buttons
                'buttons': [
                    'copy', 'csv', 'excel', 'pdf', 'print' // Add the export buttons you need
                ],
                'columns': [
                    {'data': 'whole_date_start', 'sortable': true, 'searchable': true, 'visible': false},
                    {'data': 'whole_date_start_searchable', 'sortable': true, 'searchable': true},
                    {'data': 'NC', 'sortable': true, 'searchable': true},
                    {'data': 'EDU', 'sortable': true, 'searchable': true},
                    {'data': 'TPU', 'sortable': true, 'searchable': true},
                    {'data': 'CARP', 'sortable': true, 'searchable': true},
                    {'data': 'GAD', 'sortable': true, 'searchable': true},
                    {'data': 'PLANNING', 'sortable': true, 'searchable': true},
                    // Add more columns as needed
                ],
                'order': [[0, 'asc']], // Order by ID column, descending
                //apply css style to the columns
                'columnDefs': [
                    {
                        'targets': [2],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                // Replace commas with bullets and add line breaks
                                var formattedData = data.replace(/,/g, ' <br>&nbsp;&#8226;');
                                
                                if (formattedData.includes('<br>')) {
                                    // If the data contains a line break, apply multiline CSS
                                    return '<span class="highlight-offices regional-office multiline">&#8226; ' + formattedData + '</span>';
                                } else {
                                    return '<span class="highlight-offices regional-office">&#8226; ' + formattedData + '</span>';
                                }
                            }
                        },
                    },
                    {
                        'targets': [3],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';available
                            } else {
                                // Replace commas with bullets and add line breaks
                                var formattedData = data.replace(/,/g, ' <br>&nbsp;&#8226;');
                                
                                if (formattedData.includes('<br>')) {
                                    // If the data contains a line break, apply multiline CSS
                                    return '<span class="highlight-offices po-adn multiline">&#8226; ' + formattedData + '</span>';
                                } else {
                                    return '<span class="highlight-offices po-adn">&#8226; ' + formattedData + '</span>';
                                }
                            }
                        },
                    },
                    {
                        'targets': [4],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                // Replace commas with bullets and add line breaks
                                var formattedData = data.replace(/,/g, ' <br>&nbsp;&#8226;');
                                
                                if (formattedData.includes('<br>')) {
                                    // If the data contains a line break, apply multiline CSS
                                    return '<span class="highlight-offices po-ads multiline">&#8226; ' + formattedData + '</span>';
                                } else {
                                    return '<span class="highlight-offices po-ads">&#8226; ' + formattedData + '</span>';
                                }
                            }
                        },
                    },
                    {
                        'targets': [5],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                // Replace commas with bullets and add line breaks
                                var formattedData = data.replace(/,/g, ' <br>&nbsp;&#8226;');
                                
                                if (formattedData.includes('<br>')) {
                                    // If the data contains a line break, apply multiline CSS
                                    return '<span class="highlight-offices po-sdn multiline">&#8226; ' + formattedData + '</span>';
                                } else {
                                    return '<span class="highlight-offices po-sdn">&#8226; ' + formattedData + '</span>';
                                }
                            }
                        },
                    },
                    {
                        'targets': [6],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                // Replace commas with bullets and add line breaks
                                var formattedData = data.replace(/,/g, ' <br>&nbsp;&#8226;');
                                
                                if (formattedData.includes('<br>')) {
                                    // If the data contains a line break, apply multiline CSS
                                    return '<span class="highlight-offices po-sds multiline">&#8226; ' + formattedData + '</span>';
                                } else {
                                    return '<span class="highlight-offices po-sds">&#8226; ' + formattedData + '</span>';
                                }
                            }
                        },
                    },
                    {
                        'targets': [7],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
                        'render': function (data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">empty</span>';
                            } else {
                                // Replace commas with bullets and add line breaks
                                var formattedData = data.replace(/,/g, ' <br>&nbsp;&#8226;');
                                
                                if (formattedData.includes('<br>')) {
                                    // If the data contains a line break, apply multiline CSS
                                    return '<span class="highlight-offices po-pdi multiline">&#8226; ' + formattedData + '</span>';
                                } else {
                                    return '<span class="highlight-offices po-pdi">&#8226; ' + formattedData + '</span>';
                                }
                            }
                        },
                    },
                    // Add more 'columnDefs' as needed
                ],
                
            }); // end of the $('#eventsDivDisplayTable').DataTable()

            $('#eventsDisplayTable').DataTable().draw().on('draw', function() {
                $('[data-bs-toggle="tooltip"]').tooltip(); // Reinitialize tooltips for dynamically added elements
            });

        // Event listeners for PDF and Excel buttons
        $('.buttons-pdf').on('click', function() {
            handleExport('pdf');
        });

        $('.buttons-excel').on('click', function() {
            handleExport('excel');
        });


     }); // end of the function

    }, // end of the mounted() function
    methods: {
        filterEventsDatatbl() {
            // show the value of the selected option with and assign to a variable
            var filtertxt = $("#filterBy option:selected").val();

            if (filtertxt == 'division') {
                $('#showOfficeModal').modal('show');
            }else if (filtertxt == 'unit') {
                $('#showDtiDivModal').modal('show');
            }else{
                //redirect to the events page
                window.location.href = "/events/get_eventsList/";
            }
        },

        handleHover(id) {
            if (id) {
                alert(`ID: ${id}`);
            }
        },
        handleMouseOut(event) {
            // Perform actions on mouseout (if needed)
        },

        // Function to fetch event detail by getting the data-id value of the span tag with class name "regional-office"
        fetchEventDetails(id) {

            $('#specific-event-modal').modal('show');
            
            fetch('/events/api/get-event-details/', {

                method: "POST",
                body: JSON.stringify({
                    event_id: id
                }),
            })
            .then(response => response.json())
            .then(data => {
                this.specificEventDetails = data;
                console.log(data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        },

        extractFileName(url) {
            // Extracts the file name from the URL
            const fileName = url.split('/').pop();
            return fileName;
        }

    }, // end of methods

});

appEvents.mount('#appEvents');
