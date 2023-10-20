//import axios from 'axios'; // Import axios library

const app = Vue.createApp({
    data() {
        return {
            startdate: '', // Initialize with an empty string
            dayStart: '',   // Initialize with empty strings
            monthStart: '',
            yearStart: '',
            timeStart: '',
            enddate: '', // Initialize with an empty string
            dayEnd: '',   // Initialize with empty strings
            monthEnd: '', 
            yearEnd: '',
            timeEnd: '',
            selectedDivisionId: null, // Initialize selectedDivisionId with null
        };
    },
    created() {
        // Initialize the date property with the current date and time in Manila, Philippines (UTC+8)
        const now = new Date();
        const manilaOffset = 8 * 60; // UTC+8 offset for Manila
        now.setMinutes(now.getMinutes() + manilaOffset);
        const isoDate = now.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:mm"
        this.startdate = isoDate;
        this.enddate = isoDate;
        // Set the default selected to "Select Division"
        this.selectedDivisionId = 0;
        // Call the updateDateFields method on page load
        this.updateStartDateFields();
        this.updateEndDateFields();

    },
    methods: {

        showModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#myModal').modal('show');
        },
        showDivModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#myDivModal').modal('show');
        },
        showCalModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#myCalModal').modal('show');
        },
        showEditEventModal(eventId) {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#editEventModal').modal('show');
            console.log(eventId);
        },
        onDivisionChange() {
            // Show an alert with the selected division ID
            // alert(`Selected Division ID: ${this.selectedDivisionId}`);
            console.log(this.selectedDivisionId);
        },
        updateStartDateFields() {
            // Split the datetime value and update individual fields
            const datetimeValue = this.startdate;
            const [date, time] = datetimeValue.split('T');
            const [year, month, day] = date.split('-');

            // Convert year and month to integers
            const yearInt = parseInt(year, 10);
            const monthInt = parseInt(month, 10);
            const dayInt = parseInt(day, 10);

            // Array of month names
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'
            ];

            // Convert the time to a Date object
            const timeValue = new Date(`2000-01-01T${time}`);

            // Extract hours and minutes from the Date object
            const hours = timeValue.getHours();
            const minutes = timeValue.getMinutes();

            // Determine if it's AM or PM
            const amOrPm = hours >= 12 ? 'PM' : 'AM';

            // Convert hours to 12-hour format
            const hours12 = hours > 12 ? hours - 12 : hours;

            // Format hours and minutes as strings with leading zeros
            const formattedHours = hours12 < 10 ? `0${hours12}` : `${hours12}`;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

            // Create a formatted date string
            const formattedDate = `${monthNames[monthInt - 1]} ${dayInt}, ${yearInt}`;

            this.dayStart = day.toString(); // Convert back to string
            this.monthStart = month.toString(); // Convert back to string
            this.yearStart = year.toString(); // Convert back to string
            this.timeStart = `${formattedHours}:${formattedMinutes} ${amOrPm}`;
            this.dateStartSearchable = formattedDate;
            //this.dateStartSearchable = `${year}-${month}-${day}`;
        },
        updateEndDateFields() {

            const enddatetimeValue = this.enddate;
            const [datePart, timePart] = enddatetimeValue.split('T');
            const [endyear, endmonth, endday] = datePart.split('-');

            // Convert year and month to integers
            const endyearInt = parseInt(endyear, 10);
            const endmonthInt = parseInt(endmonth, 10);
            const enddayInt = parseInt(endday, 10); 

            // Array of month names
            const endmonthNames = [
                'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'
            ];
          
            // Convert the time to a Date object
            const endtimeValue = new Date(`2000-01-01T${timePart}`);
          
            // Extract hours and minutes from the Date object
            const hours24 = endtimeValue.getHours();
            const endminutes = endtimeValue.getMinutes();
          
            // Determine if it's AM or PM
            const period = hours24 >= 12 ? 'PM' : 'AM';
          
            // Convert hours to 12-hour format
            const endhours12 = hours24 > 12 ? hours24 - 12 : hours24;
          
            // Format hours and minutes as strings with leading zeros
            const endformattedHours = endhours12 < 10 ? `0${endhours12}` : `${endhours12}`;
            const endformattedMinutes = endminutes < 10 ? `0${endminutes}` : `${endminutes}`;
          
            // Combine the formatted time with AM/PM
            this.formattedTimeEnd = `${endformattedHours}:${endformattedMinutes} ${period}`;

            // Create a formatted date string
            const endformattedDate = `${endmonthNames[endmonthInt - 1]} ${enddayInt}, ${endyearInt}`;
          
            this.dayEnd = endday.toString(); // Convert back to string
            this.monthEnd = endmonth.toString(); // Convert back to string
            this.yearEnd = endyear.toString(); // Convert back to string
            this.timeEnd = `${endformattedHours}:${endformattedMinutes} ${period}`;
            this.dateEndSearchable = endformattedDate;
            //this.dateEndSearchable = `${endyear}-${endmonth}-${endday}`;

          },
    },
    mounted() {

        $(function() {
            $("#event-title-input, #editEvent-title-input").autocomplete({
                source: 'suggest_event_titles',
                minLength: 1,  // Minimum number of characters before triggering autocomplete
                
            });

            $("#tag-id").autocomplete({
                source: 'suggest_event_titless',
                minLength: 1,  // Minimum number of characters before triggering autocomplete
            });

            //Datatables serverside for displaying events
            $('#eventsTable').DataTable({
                'processing': true,
                'serverSide': true,
                'ajax': {
                    'url': '/get_events/',  // Replace with your API endpoint
                    'type': 'GET',
                },
                'columns': [
                    {'data': 'id'},
                    {'data': 'event_title', 'searchable': true, 'orderable': true},
                    {'data': 'event_desc', 'searchable': true, 'orderable': true},
                    {'data': 'whole_date_start_searchable', 'searchable': true, 'orderable': true},
                    {'data': 'whole_date_end_searchable', 'searchable': true, 'orderable': true},
                    // Add more columns as needed
                ]
            });
        });

    }

});

app.mount('#app');
