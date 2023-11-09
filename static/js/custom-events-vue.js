
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
      
        $(function() {

            table = $('#eventsDivDisplayTable').DataTable({
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
                
                }); // end of the $('#eventsDivDisplayTable').DataTable()

        }); // end of the function

    } // end of the mounted() function

});

appEvents.mount('#appEvents');
