
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

            // Fetch offices from tbl_offices dynamically, then init DataTable
            if ($('#eventsDisplayTable').length)
            fetch('/offices/api/get-offices-list/')
                .then(function(r) { return r.json(); })
                .then(function(officeList) {

                    // Inject <th> into thead and tfoot from the same source (guarantees count match)
                    const theadRow = $('#eventsDisplayTable thead tr');
                    const tfootRow = $('#eventsDisplayTable tfoot tr');
                    officeList.forEach(function(office) {
                        theadRow.append('<th>' + office.office_initials + '</th>');
                        tfootRow.append('<th>' + office.office_initials + '</th>');
                    });

                    // Build columns array dynamically
                    const dtColumns = [
                        {'data': 'whole_date_start', 'sortable': true, 'searchable': true, 'visible': false},
                        {'data': 'whole_date_start_searchable', 'sortable': true, 'searchable': true},
                    ];
                    officeList.forEach(function(office) {
                        dtColumns.push({'data': office.office_initials, 'sortable': true, 'searchable': true});
                    });

                    // Indices for all office columns (2, 3, 4, ...)
                    const officeTargets = officeList.map(function(_, i) { return i + 2; });

                    // Unified render function for all office columns
                    function renderOfficeCell(data, type, row) {
                        if (data === null || data === undefined) {
                            return '<span class="highlight-vacant-">-</span>';
                        }
                        var formattedData = data.replace(/,/g, '<br>');
                        let html = '';
                        const parts = formattedData.includes('<br>') ? formattedData.split('<br>') : [formattedData];
                        parts.forEach(function(pair) {
                            const segs = pair.trim().split('*');
                            const title = segs[0] || '';
                            const id = segs[1] || '';
                            const divname = segs[2] || '';
                            const unitname = segs[3] || '';
                            const timeStart = segs[4] || '';
                            const timeEnd = segs[5] || '';
                            html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Division: ${divname}&#13;Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title}</span><br>`;
                        });
                        return html;
                    }

            table = $('#eventsDisplayTable').DataTable({
                'dom': 'Rlfrtip',
                        'colReorder': {
                            'allowReorder': true
                        },
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
                'columns': dtColumns,
                'order': [[1, 'asc']], // Sort by visible Event Date column (column 1)
                'columnDefs': [
                    {'targets': [1], 'className': 'bold-column'},
                    {'width': '0%', 'targets': 0},
                    {'width': '15%', 'targets': 1},
                    {
                        'targets': officeTargets,
                        'render': renderOfficeCell,
                    },
                ],

                'colResize': true,
                'fixedColumns': {
                    leftColumns: officeList.length + 1  // +1 for Event Date (hidden Date col excluded)
                }

                }); // end of the $('#eventsDisplayTable').DataTable()

                // Reinitialize tooltips whenever the table redraws
                table.on('draw', function() {
                    $('[data-bs-toggle="tooltip"]').tooltip();
                });

                }); // end of fetch .then(officeList)

                // Fetch divisions dynamically for the selected office, then init eventsDivDisplayTable
                if ($('#eventsDivDisplayTable').length) {
                const officeTxt = $("#office-txt").val() || '';
                fetch('/users/api/divisions/?office=' + encodeURIComponent(officeTxt))
                    .then(function(r) { return r.json(); })
                    .then(function(divisionList) {

                        // Inject <th> into thead and tfoot from the same source (guarantees count match)
                        const theadDivRow = $('#eventsDivDisplayTable thead tr');
                        const tfootDivRow = $('#eventsDivDisplayTable tfoot tr');
                        divisionList.forEach(function(div) {
                            theadDivRow.append('<th>' + div.division_name + '</th>');
                            tfootDivRow.append('<th>' + div.division_name + '</th>');
                        });

                        // Build columns array dynamically
                        const dtDivColumns = [
                            {'data': 'whole_date_start', 'sortable': true, 'searchable': true, 'visible': false},
                            {'data': 'whole_date_start_searchable', 'sortable': true, 'searchable': true},
                        ];
                        divisionList.forEach(function(div) {
                            dtDivColumns.push({'data': div.division_name, 'sortable': true, 'searchable': true});
                        });

                        // Indices for all division columns (2, 3, 4, ...)
                        const divTargets = divisionList.map(function(_, i) { return i + 2; });

                        // Unified render function for all division columns
                        function renderDivCell(data, type, row) {
                            if (data === null || data === undefined) {
                                return '<span class="highlight-vacant">-</span>';
                            }
                            var formattedData = data.replace(/,/g, '<br>');
                            let html = '';
                            const parts = formattedData.includes('<br>') ? formattedData.split('<br>') : [formattedData];
                            parts.forEach(function(pair) {
                                const segs = pair.trim().split('*');
                                const title = segs[0] || '';
                                const id = segs[1] || '';
                                const divname = segs[2] || '';
                                const unitname = segs[3] || '';
                                const timeStart = segs[4] || '';
                                const timeEnd = segs[5] || '';
                                html += `<span class="multiline highlight-offices regional-office" style="cursor: pointer;" data-id="${id}" title="Unit: ${unitname}&#13;Time: ${timeStart} - ${timeEnd}">• ${title} @ ${timeStart} - ${timeEnd}</span><br>`;
                            });
                            return html;
                        }

                        tblEventsDiv = $('#eventsDivDisplayTable').DataTable({
                            'dom': 'Rlfrtip',
                            'colReorder': {
                                'allowReorder': true
                            },
                            'processing': true,
                            'serverSide': true,
                            'ajax': {
                                'url': '/events/fetch-events-by-div-ajax/',
                                'type': 'GET',
                                'data': function (d) {
                                    d.office = $("#office-txt").val();
                                    console.log(d);
                                }
                            },
                            'dom': 'Bfrtip<"clear">l',
                            'buttons': [
                                {
                                    extend: 'copy',
                                    exportOptions: { columns: ':not(:first)' }
                                },
                                {
                                    extend: 'csv',
                                    exportOptions: { columns: ':not(:first)' }
                                },
                                {
                                    extend: 'excel',
                                    exportOptions: { columns: ':not(:first)' },
                                    customize: function (xlsx) {
                                        const sheet = xlsx.xl.worksheets['sheet1.xml'];
                                        const exportLetters = Array.from({length: divisionList.length + 1}, function(_, i) { return String.fromCharCode(66 + i); });
                                        exportLetters.forEach(function(columnLetter) {
                                            $('row c[r^="' + columnLetter + '"]', sheet).each(function () {
                                                if ($(this).text().includes('•')) {
                                                    $(this).attr('s', '55');
                                                    $(this).html($(this).html().replace(/• /g, '\n• '));
                                                }
                                            });
                                        });
                                    }
                                },
                                {
                                    extend: 'pdf',
                                    exportOptions: { columns: ':not(:first)' },
                                    customize: function (doc) {
                                        doc.content[1].table.body.forEach(row => {
                                            row.forEach(cell => { cell['style'] = 'tableCell'; });
                                        });
                                        doc.content[1].layout = {
                                            hLineWidth: function () { return 1; },
                                            vLineWidth: function () { return 1; },
                                            hLineColor: function () { return '#b3b3b3'; },
                                            vLineColor: function () { return '#b3b3b3'; },
                                        };
                                        const widths = Array.from({length: divisionList.length + 1}, function() { return '*'; });
                                        doc.content[1].table.widths = widths;
                                        doc.content[1].table.body[0].forEach(cell => { cell['fillColor'] = '#e6e6e6'; });
                                        doc.pageOrientation = 'landscape';
                                        doc.pageSize = 'A4';
                                        doc.content[1].table.body.forEach(row => {
                                            row.forEach((cell) => {
                                                if (typeof cell.text === 'string' && cell.text.includes('•')) {
                                                    cell.text = cell.text.replace(/• /g, '\n• ');
                                                }
                                            });
                                        });
                                    }
                                },
                                {
                                    extend: 'print',
                                    exportOptions: { columns: ':not(:first)' },
                                    customize: function (win) {
                                        const table = $(win.document.body).find('table tbody');
                                        table.find('tr').each(function () {
                                            $(this).find('td').each(function () {
                                                $(this).text($(this).text().replace(/•/g, '\n•'));
                                            });
                                        });
                                    }
                                },
                            ],
                            'columns': dtDivColumns,
                            'order': [[0, 'asc']],
                            'columnDefs': [
                                {'targets': [1], 'className': 'bold-column'},
                                {'width': '0%', 'targets': 0},
                                {'width': '15%', 'targets': 1},
                                {
                                    'targets': divTargets,
                                    'render': renderDivCell,
                                },
                            ],
                            'colResize': true,
                            'fixedColumns': {
                                leftColumns: divisionList.length + 1
                            }
                        }); // end of $('#eventsDivDisplayTable').DataTable()

                        // Reinitialize tooltips whenever the table redraws
                        tblEventsDiv.on('draw', function() {
                            $('[data-bs-toggle="tooltip"]').tooltip();
                        });

                    }); // end of fetch .then(divisionList)
                } // end if #eventsDivDisplayTable exists

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
