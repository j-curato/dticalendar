
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

        $('#eventsDisplayTable, #eventsDivDisplayTable').on('click', '.regional-office', function(e) {
            if ($(e.target).hasClass('event-pill-toggle')) return; // ignore toggle clicks
            const id = $(this).attr('data-id');
            self.fetchEventDetails(id);
        });

        // Expand/collapse details toggle for event pills
        $('#eventsDisplayTable, #eventsDivDisplayTable').on('click', '.event-pill-toggle', function(e) {
            e.stopPropagation();
            const pill = $(this).closest('.event-pill');
            const meta = pill.find('.event-pill-meta');
            const label = pill.find('.pill-label');
            const fullTitle = pill.data('full-title');
            if (meta.is(':visible')) {
                meta.hide();
                const short = fullTitle.length > 35 ? fullTitle.substring(0, 35) + '…' : fullTitle;
                label.text('● ' + short);
                $(this).html('▾ details');
            } else {
                meta.show();
                label.text('● ' + fullTitle);
                $(this).html('▴ hide');
            }
        });

        // +N more / show less toggle for overflow pills
        $('#eventsDisplayTable, #eventsDivDisplayTable').on('click', '.pills-show-more', function(e) {
            e.stopPropagation();
            const overflow = $(this).prev('.pills-overflow');
            if (overflow.is(':visible')) {
                overflow.hide();
                const count = overflow.find('.event-pill').length;
                $(this).text('+' + count + ' more');
            } else {
                overflow.show();
                $(this).text('show less');
            }
        });

        // initialize the datatable
        $(function() {

            // Division color palette — pastel bg + dark text pairs (15 to avoid collisions)
            const PILL_COLORS = [
                { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' }, // Indigo
                { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4' }, // Teal
                { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' }, // Violet
                { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' }, // Rose
                { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }, // Amber
                { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' }, // Emerald
                { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' }, // Sky
                { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' }, // Orange
                { bg: '#f1f5f9', text: '#334155', border: '#94a3b8' }, // Slate
                { bg: '#fae8ff', text: '#86198f', border: '#e879f9' }, // Fuchsia
                { bg: '#cffafe', text: '#155e75', border: '#67e8f9' }, // Cyan
                { bg: '#f7fee7', text: '#3f6212', border: '#bef264' }, // Lime
                { bg: '#ffe4e6', text: '#9f1239', border: '#fda4af' }, // Crimson
                { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }, // Blue
                { bg: '#fef9c3', text: '#713f12', border: '#fde047' }, // Yellow
            ];
            function getDivisionColor(divname) {
                if (!divname) return PILL_COLORS[0];
                let hash = 0;
                for (let i = 0; i < divname.length; i++) {
                    hash = divname.charCodeAt(i) + ((hash << 5) - hash);
                }
                return PILL_COLORS[Math.abs(hash) % PILL_COLORS.length];
            }

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
                            return '<span style="color:#aaa">—</span>';
                        }
                        const MAX_CHARS = 35;
                        const MAX_VISIBLE = 2;
                        const parts = data.split('|||').filter(function(p) { return p.trim() !== ''; });
                        let visibleHtml = '';
                        let hiddenHtml = '';
                        parts.forEach(function(part, idx) {
                            const segs = part.trim().split('*');
                            const title = segs[0] || '';
                            const id = segs[1] || '';
                            const divname = segs[2] || '';
                            const unitname = segs[3] || '';
                            const timeStart = segs[4] || '';
                            const timeEnd = segs[5] || '';
                            const shortTitle = title.length > MAX_CHARS ? title.substring(0, MAX_CHARS) + '…' : title;
                            const safeTitle = title.replace(/"/g, '&quot;');
                            const pillColor = getDivisionColor(divname);
                            let pillHtml = `<span class="event-pill regional-office" data-id="${id}" data-full-title="${safeTitle}" style="background-color:${pillColor.bg};color:${pillColor.text};border-left-color:${pillColor.border}">`;
                            pillHtml += `<span class="pill-label">● ${shortTitle}</span><a href="javascript:void(0)" class="event-pill-toggle">▾ details</a>`;
                            pillHtml += `<div class="event-pill-meta">`;
                            if (divname) pillHtml += `<small>📁 ${divname}</small><br>`;
                            if (unitname) pillHtml += `<small>🔹 ${unitname}</small><br>`;
                            if (timeStart) pillHtml += `<small>🕐 ${timeStart}${timeEnd ? ' – ' + timeEnd : ''}</small>`;
                            pillHtml += `</div></span>`;
                            if (idx < MAX_VISIBLE) {
                                visibleHtml += pillHtml;
                            } else {
                                hiddenHtml += pillHtml;
                            }
                        });
                        let html = visibleHtml;
                        if (hiddenHtml) {
                            const remaining = parts.length - MAX_VISIBLE;
                            html += `<div class="pills-overflow" style="display:none">${hiddenHtml}</div>`;
                            html += `<a href="javascript:void(0)" class="pills-show-more">+${remaining} more</a>`;
                        }
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
                    'url': '/events/fetch-events-ajax/',
                    'type': 'GET',
                    'data': function(d) {
                        d.year = $('#filterYear').val() || new Date().getFullYear();
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
                'autoWidth': true,
                'columnDefs': [
                    {'targets': [1], 'className': 'bold-column'},
                    {'width': '0%', 'targets': 0},
                    {
                        'targets': officeTargets,
                        'render': renderOfficeCell,
                    },
                ],

                'colResize': true,

                }); // end of the $('#eventsDisplayTable').DataTable()

                // Reinitialize tooltips and adjust column widths whenever the table redraws
                table.on('draw', function() {
                    $('[data-bs-toggle="tooltip"]').tooltip();
                    table.columns.adjust();
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
                                return '<span style="color:#aaa">—</span>';
                            }
                            const MAX_CHARS = 35;
                            const MAX_VISIBLE = 2;
                            const parts = data.split('|||').filter(function(p) { return p.trim() !== ''; });
                            let visibleHtml = '';
                            let hiddenHtml = '';
                            parts.forEach(function(part, idx) {
                                const segs = part.trim().split('*');
                                const title = segs[0] || '';
                                const id = segs[1] || '';
                                const divname = segs[2] || '';
                                const unitname = segs[3] || '';
                                const timeStart = segs[4] || '';
                                const timeEnd = segs[5] || '';
                                const shortTitle = title.length > MAX_CHARS ? title.substring(0, MAX_CHARS) + '…' : title;
                                const safeTitle = title.replace(/"/g, '&quot;');
                                const pillColor = getDivisionColor(divname);
                                let pillHtml = `<span class="event-pill regional-office" data-id="${id}" data-full-title="${safeTitle}" style="background-color:${pillColor.bg};color:${pillColor.text};border-left-color:${pillColor.border}">`;
                                pillHtml += `<span class="pill-label">● ${shortTitle}</span><a href="javascript:void(0)" class="event-pill-toggle">▾ details</a>`;
                                pillHtml += `<div class="event-pill-meta">`;
                                if (unitname) pillHtml += `<small>🔹 ${unitname}</small><br>`;
                                if (timeStart) pillHtml += `<small>🕐 ${timeStart}${timeEnd ? ' – ' + timeEnd : ''}</small>`;
                                pillHtml += `</div></span>`;
                                if (idx < MAX_VISIBLE) {
                                    visibleHtml += pillHtml;
                                } else {
                                    hiddenHtml += pillHtml;
                                }
                            });
                            let html = visibleHtml;
                            if (hiddenHtml) {
                                const remaining = parts.length - MAX_VISIBLE;
                                html += `<div class="pills-overflow" style="display:none">${hiddenHtml}</div>`;
                                html += `<a href="javascript:void(0)" class="pills-show-more">+${remaining} more</a>`;
                            }
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
                                    d.year = $('#filterYear').val() || new Date().getFullYear();
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
                            'autoWidth': true,
                            'columnDefs': [
                                {'targets': [1], 'className': 'bold-column'},
                                {'width': '0%', 'targets': 0},
                                {
                                    'targets': divTargets,
                                    'render': renderDivCell,
                                },
                            ],
                            'colResize': true,
                        }); // end of $('#eventsDivDisplayTable').DataTable()

                        // Reinitialize tooltips and adjust column widths whenever the table redraws
                        tblEventsDiv.on('draw', function() {
                            $('[data-bs-toggle="tooltip"]').tooltip();
                            tblEventsDiv.columns.adjust();
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

        filterByYear() {
            // Reload whichever DataTable is currently visible
            if ($.fn.DataTable.isDataTable('#eventsDisplayTable')) {
                $('#eventsDisplayTable').DataTable().ajax.reload();
            }
            if ($.fn.DataTable.isDataTable('#eventsDivDisplayTable')) {
                $('#eventsDivDisplayTable').DataTable().ajax.reload();
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
