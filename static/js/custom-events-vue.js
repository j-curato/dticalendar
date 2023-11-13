
const appEvents = Vue.createApp({
    delimiters: ['{[', ']}'], // Change Vue.js delimiters to avoid conflicts with Django template tags
    data() {
        return {
            message: '',
            
        };
    },
    created() {
       

    },
    methods: {
        filterEventsDatatbl() {
            // show the value of the selected option with and assign to a variable
            var filtertxt = $("#filterBy option:selected").val();

            if (filtertxt == 'division') {
                $('#showOfficeModal').modal('show');
            }else if (filtertxt == 'unit') {
                $('#showDtiDivModal').modal('show');
            }else{
                //do nothing
                console.log('do nothing');
            }
        },

    }, // end of methods
    mounted() {

        var table; //declare the table variable globally
        var tblEventsDiv; //declare the table variable globally
      
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
                    'copy', 'csv', 'excel', 'pdf', 'print' // Add the export buttons you need
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
                
                }); // end of the $('#eventsDivDisplayTable').DataTable()

                tblEventsDiv = $('#eventsDivDisplayTable').DataTable({
                    'processing': true,
                    'serverSide': true,
                    'ajax': { 
                        'url': '/events/fetch-events-by-div-ajax/',  // Replace with your API endpoint
                        'type': 'GET', 
                        'data': function (d) {
                            d.office = $("#office-txt").val();
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
                        {
                            'targets': [8],  // Apply text highlighting to columns RO, ADN, ADS, SDN, SDS, PDI
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

        }); // end of the function

    } // end of the mounted() function

});

appEvents.mount('#appEvents');
