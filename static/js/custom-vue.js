
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
            divisionListVue: [], // Initialize divisionList with an empty array
            calendarListVue: [], // Initialize calendarList with an empty array
            formData: {
                division_id: 0, // Initialize division_id with 0
                division_name: '', // Initialize with an empty string
                calendar_id: null, // Initialize calendar_id with 0
                calendar_name: '', // Initialize with an empty string
            },
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

        nextModal() {
            $("#modal1").modal("hide");
            $("#modal2").modal("show");
        },

        previousModal() {
            $("#modal2").modal("hide");
            $("#modal1").modal("show");
        },

        saveData() {
            const formData = new FormData();
            formData.append('calendar_name', this.formData.calendar_name);
            formData.append('calendar_desc', this.formData.calendar_desc);
            // Append other form fields as needed
        
            fetch("/calendars/save-calendar-ajax/", {
                method: "POST",
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json(); // Assuming the server returns JSON data
            })
            .then(data => {
                // call the showToast() method to show the toast notification
                this.showToast();
                // Handle a successful response
                console.log("Data saved successfully:", data);
                // reset the form
                this.formData.calendar_name = '';
                this.formData.calendar_desc = '';
            })
            .catch(error => {
                // Handle errors
                console.error("Error while saving data:", error);
            });
        },

        showModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            // $('#myModal').modal('show');
            $("#modal1").modal('show'); // Show the modal on page load
        },
        showDivModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#myDivModal').modal('show');
        },
        showCalModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#myCalModal').modal('show');
        },
        showNextEventDetailsModal() {
            $("#exampleModalToggle2").modal('show'); // Show the modal on page load
        },
        showEditEventModal(eventId) {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#editEventModal').modal('show');
            console.log(eventId);
        },
        showToast() {
            const toastElement = document.getElementById('liveToast');
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        },
      
        hideToast() {
            const toastElement = document.getElementById('liveToast');
            const toast = new bootstrap.Toast(toastElement);
            toast.hide();
        },
        // Function to fetch division data
        fetchDivisionData() {
            fetch('/users/api/divisions/') // Replace with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.divisionListVue = data;
                console.log(this.divisionListVue);
            })
            .catch(error => {
                console.error('Error fetching division data:', error);
            });
        },
        // Function to fetch calendar data
        fetchCalendarData() {
            fetch('/users/api/calendars/') // Replace with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.calendarListVue = data;
                console.log(this.calendarListVue);
            })
            .catch(error => {
                console.error('Error fetching calendar data:', error);
            });
        },
        onDivisionChange() {
            //console.log('Selected Division ID:', this.formData.division_id);
            //console.log(this.divisionListVue);
            
            const selectedDivision = this.divisionListVue.find(item => item.id === this.formData.division_id);
            this.formData.division_name = selectedDivision ? selectedDivision.division_name : '';
            
          },
        onCalendarChange() {
            //console.log('Selected Calendar ID:', this.formData.calendar_id);
            //console.log(this.calendarListVue);
            const selectedCalendar = this.calendarListVue.find(item => item.id === this.formData.calendar_id);
            this.formData.calendar_name = selectedCalendar ? selectedCalendar.calendar_name : '';
            
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

        var table; //declare the table variable globally

        $(function() {

            $("#event-title-input, #editEventTitle-id").autocomplete({
                source: 'suggest_event_titles',
                minLength: 1,  // Minimum number of characters before triggering autocomplete
                
            });

            $("#tag-id").autocomplete({
                source: 'suggest_event_titless',
                minLength: 1,  // Minimum number of characters before triggering autocomplete
            });

            //Datatables serverside for displaying events
            table = $('#eventsTable').DataTable({
                'processing': true,
                'serverSide': true,
                'ajax': { 
                    'url': '/get_events/',  // Replace with your API endpoint
                    'type': 'GET',
                },
                'dom': 'Bfrtip<"clear">l',        // Add this to enable export buttons
                'buttons': [
                    'copy', 'csv', 'excel', 'pdf', 'print' // Add the export buttons you need
                ],
                'columns': [
                    {'data': 'id', 'sortable': true, 'searchable': false},
                    {'data': 'event_title', 'searchable': true, 'sortable': true},
                    {'data': 'event_desc', 'searchable': true, 'sortable': true},
                    {'data': 'whole_date_start_searchable', 'searchable': true, 'sortable': true},
                    {'data': 'whole_date_end_searchable', 'searchable': true, 'sortable': true},
                    // Add more columns as needed
                ],
                'order': [[0, 'desc']], // Order by ID column, descending
               
            }); // end of the $('#eventsTable').DataTable()

            $('#eventsTable tbody').on('click', 'tr', function () {
                var data = table.row(this).data();
                if (data) {
                    console.log('Selected Data:', data.id);
                    //query the database for the event details using the event id and display it in the #editEventModal
                    $.ajax({
                        url: '/get_event_details/',
                        type: 'GET',
                        data: {
                            'event_id': data.id,
                        },
                        dataType: 'json',
                        success: function (data) {
                            console.log(data);
                            //populate the editEventModal with the event details
                            $("#editOffice-id").val(data.office);
                            $("#editDivision-id").val(data.division_id);
                            $("#editUnit-id").val(data.unit);
                            $("#editOrgOutcome-id").val(data.org_outcome);
                            $("#editPAPs-id").val(data.paps);
                            $("#editCalendar-id").val(data.calendar_id);
                            $("#editUser-id").val(data.user_id);
                            $("#editEventTitle-id").val(data.event_title);
                            $("#editEventLocation-id").val(data.event_location);
                            $("#editEventDesc-id").val(data.event_desc);
                            $("#editParticipants-id").val(data.participants);
                            $("#editWholeDateStart-id").val(data.event_date_start);
                            $("#editWholeDateEnd-id").val(data.event_date_end);
                            $("#editFileAttachment-id").text(data.file_attachment); 
                            $('#editEventModal').modal('show');
                        }
                    }); // end of the $.ajax()
                }
            }); // end of the $('#eventsTable tbody')

        }); // end of the function

         // Fetch division and calendar data when the component is mounted
        this.fetchDivisionData();
        this.fetchCalendarData();

    } // end of the mounted() function

});

app.mount('#app');
