// var app = new Vue({
//     delimiters: ['{[', ']}'], // Change Vue.js delimiters to avoid conflicts with Django template tags
//     el: '#app',
const app = Vue.createApp({
    delimiters: ['{[', ']}'], // Change Vue.js delimiters to avoid conflicts with Django template tags
    data() {
        return {
            message: '',
            selectedFile: null, // Initialize selectedFile with null
            divisionListVue: [], // Initialize divisionList with an empty array
            calendarListVue: [], // Initialize calendarList with an empty array
            ooListVue: [], // Initialize orgOutcomeList with an empty array
            papsListVue: [], // Initialize papsList with an empty array
            filteredPAPs: [], // Initialize filteredPAPs with an empty array
            formData: {
                division_id: 0, // Initialize division_id with 0
                division_name: '', // Initialize with an empty string
                calendar_id: null, // Initialize calendar_id with 0
                calendar_name: '', // Initialize with an empty string
                whole_date_start: '', // Initialize with an empty string
                event_day_start: '',   // Initialize with empty strings
                event_month_start: '',
                event_year_start: '',
                event_time_start: '',
                whole_date_end: '', // Initialize with an empty string
                event_day_end: '',   // Initialize with empty strings
                event_month_end: '', 
                event_year_end: '',
                event_time_end: '',
                whole_date_start_searchable: '', // Initialize with an empty string
                whole_date_end_searchable: '', // Initialize with an empty string
                event_title: '', // Initialize with an empty string
                event_location: 0, // Initialize with an empty string
                event_location_district: '', // Initialize with an empty string
                event_location_lgu: '', // Initialize with an empty string
                event_location_barangay: '', // Initialize with an empty string
                event_desc: '', // Initialize with an empty string
                participants: '', // Initialize with an empty string
                file_attachment: null, // Initialize with null
                office: 0, // Initialize with an empty string
                unit: 0, // Initialize with an empty string
                org_outcome: 0, // Initialize with an empty string
                paps: 0, // Initialize with an empty string
                user_id: '', // Initialize with an empty string
                calendar_id: 0, // Initialize with an empty string
            }, // end of formData
            // initialize the Org Outcome form data
            orgFormData: {
                org_outcome: '', // Initialize with an empty string
                description: '', // Initialize with an empty string
            },
            // initialize papsFormData
            papsFormData: {
                pap: '', // Initialize with an empty string
                description: '', // Initialize with an empty string
                org_outcome_id: 0,
                oo_name: '',
            },
        };
    },
    created() {
        // Initialize the date property with the current date and time in Manila, Philippines (UTC+8)
        const now = new Date();
        const manilaOffset = 8 * 60; // UTC+8 offset for Manila
        now.setMinutes(now.getMinutes() + manilaOffset);
        const isoDate = now.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:mm"
        this.formData.whole_date_start = isoDate;
        this.formData.whole_date_end = isoDate;
        // Set the default selected to "Select Division"
        this.formData.division_id = 0;
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
                // 
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
        // Function to handle file upload
        handleFileChange(event) {
            // Access the selected file from the event
            const selectedFile = event.target.files[0];
        
            // Now you can do something with the selected file, like storing it in your component's data
            this.formData.file_attachment = selectedFile;
        
            // Optionally, you can show the selected file's name to the user
            //this.selectedFileName = selectedFile.name;
            //this.selectedFileName = selectedFile ? selectedFile.name : '';
          },
        // Function to save event data
        saveEventData() {

            // Get the selected Organizational Outcome text
            const orgOutcomeText = this.ooListVue.find(item => item.id === this.formData.org_outcome).org_outcome;
            // Get the selected PAPs text
            const papsText = this.papsListVue.find(item => item.id === this.formData.paps).pap;
            
            const formData = new FormData();
            formData.append('office', this.formData.office);
            formData.append('division_id', this.formData.division_id);
            formData.append('unit', this.formData.unit);
            formData.append('org_outcome', orgOutcomeText);
            formData.append('paps', papsText);
            formData.append('calendar_id', this.formData.calendar_id);
            formData.append('user_id', this.formData.user_id);
            formData.append('event_title', this.formData.event_title);
            formData.append('event_location', this.formData.event_location);
            formData.append('event_desc', this.formData.event_desc);
            formData.append('participants', this.formData.participants);
            //formData.append('file_attachment', this.formData.file_attachment); this code is not working because v-model doesn't work for input type files
            // Handle the file input separately
            //formData.append('file_attachment', this.$refs.file_attachment.files[0]);
            formData.append('file_attachment', this.formData.file_attachment);
            formData.append('event_day_start', this.formData.event_day_start);
            formData.append('event_month_start', this.formData.event_month_start);
            formData.append('event_year_start', this.formData.event_year_start);
            formData.append('event_time_start', this.formData.event_time_start);
            formData.append('event_day_end', this.formData.event_day_end);
            formData.append('event_month_end', this.formData.event_month_end);
            formData.append('event_year_end', this.formData.event_year_end);
            formData.append('event_time_end', this.formData.event_time_end);
            formData.append('whole_date_start', this.formData.whole_date_start);
            formData.append('whole_date_end', this.formData.whole_date_end);
            formData.append('whole_date_start_searchable', this.formData.whole_date_start_searchable);
            formData.append('whole_date_end_searchable', this.formData.whole_date_end_searchable);
            formData.append('calendar_name', this.formData.calendar_name);
            formData.append('division_name', this.formData.division_name);
            formData.append('event_location_district', this.formData.event_location_district);
            formData.append('event_location_lgu', this.formData.event_location_lgu);
            formData.append('event_location_barangay', this.formData.event_location_barangay);
            
            // ajax call to save the event data
            fetch("/events/save-event-ajax/", {
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
                // if message is true, then show the toast notification
                if (data.message) {
                // call the showToast() method and change the toast message to "Event saved successfully!"
                this.message = "Event saved successfully!";
                // call the showToast() method to show the toast notification
                this.showToast();
                // refresh the server-side datatables events table
                $('#eventsTable').DataTable().ajax.reload();
                // Handle a successful response
                console.log("Data saved successfully:", data);
                // reset the form data
                this.formData.office = 0;
                this.formData.division_id = 0;
                this.formData.unit = 0;
                this.formData.org_outcome = 0;
                this.formData.paps = 0;
                this.formData.calendar_id = 0;
                this.formData.user_id = '';
                this.formData.event_title = '';
                this.formData.event_location = '';
                this.formData.event_desc = '';
                this.formData.participants = '';
                this.formData.file_attachment = null;
                this.formData.event_day_start = '';
                this.formData.event_month_start = '';
                this.formData.event_year_start = '';
                this.formData.event_time_start = '';
                this.formData.event_day_end = '';
                this.formData.event_month_end = '';
                this.formData.event_year_end = '';
                this.formData.event_time_end = '';
                this.formData.whole_date_start = '';
                this.formData.whole_date_end = '';
                this.formData.whole_date_start_searchable = '';
                this.formData.whole_date_end_searchable = '';
                this.formData.calendar_name = '';
                this.formData.division_name = '';
                this.formData.event_location_district = '';
                this.formData.event_location_lgu = '';
                this.formData.event_location_barangay = '';

            } // end of if (data.message)
            else {
                // Handle a failed response
                console.log("Data save failed:", data);
            }
            
           }) // end of the first .then()

            .catch(error => {
                // Handle errors
                console.error("Error while saving data:", error);
            });
        }, // end of saveEventData() function

        // function to save org outcome data
        saveOoData() {
            const orgFormData = new FormData();
            orgFormData.append('org_outcome', this.orgFormData.org_outcome);
            orgFormData.append('description', this.orgFormData.description);
            // ajax call to save the org outcome data
            fetch("/orgoutcomes/save-org-outcome-ajax/", {
                method: "POST",
                body: orgFormData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json(); // Assuming the server returns JSON data
            })
            .then(data => {
                // if message is true, then show the toast notification
                if (data.message) {
                // call the showToast() method and change the toast message to "Org Outcome saved successfully!"
                this.message = "Org Outcome saved successfully!";
                // call the showToast() method to show the toast notification
                this.showToast();
                console.log("Data saved successfully:", data);
                // reset the form data
                this.orgFormData.org_outcome = '';
                this.orgFormData.description = '';
            } // end of if (data.message)
            else {
                // Handle a failed response
                console.log("Data save failed:", data);
            }
            }) // end of the first .then()
            .catch(error => {
                // Handle errors
                console.error("Error while saving data:", error);
            });
        }, // end of saveOrgOutcomeData() function

        // function to save paps data
        savePapsData() {
            const papsFormData = new FormData();
            papsFormData.append('pap', this.papsFormData.pap);
            papsFormData.append('description', this.papsFormData.description);
            papsFormData.append('org_outcome_id', this.papsFormData.org_outcome_id);
            papsFormData.append('oo_name', this.papsFormData.oo_name);
            //alert(this.papsFormData.oo_name);
            // ajax call to save the paps data
            fetch("/paps/save-paps-ajax/", {
                method: "POST",
                body: papsFormData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json(); // Assuming the server returns JSON data
            })
            .then(data => {
                // if message is true, then show the toast notification
                if (data.message) {
                // call the showToast() method and change the toast message to "PAPs saved successfully!"
                this.message = "PAP data saved successfully!";
                // call the showToast() method to show the toast notification
                this.showToast();
                console.log("Data saved successfully:", data.message);
                // reset the form data
                this.papsFormData.pap = '';
                this.papsFormData.description = '';
                this.papsFormData.org_outcome_id = 0;
                this.papsFormData.oo_name = '';
            } // end of if (data.message)
            else {
                // Handle a failed response
                console.log("Data save failed:", data.message);
            }
            }
            ) // end of the first .then()
            .catch(error => {
                // Handle errors
                console.error("Error while saving data:", error);
            });
        }, // end of savePapsData() function

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
        // Org Outcome modal
        showOrgModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#orgOutcomeModal').modal('show');
        },
        // PAPs modal
        showPapsModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#papsModal').modal('show');
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
        // Function to fetch org outcome data
        fetchOrgOutcomeData() {
            fetch('/orgoutcomes/api/get-ooList/') // Replace with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.ooListVue = data;
                console.log(this.ooListVue);
            })
            .catch(error => {
                console.error('Error fetching org outcome data:', error);
            });
        },
        // Function to fetch paps data
        fetchPapsData() {
            fetch('/paps/api/get-papsList/') // Replace with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.filteredPAPs = data;
                this.papsListVue = data;
                console.log(this.filteredPAPs);
            })
            .catch(error => {
                console.error('Error fetching paps data:', error);
            });
        },
        // Function to filter paps data
        updatePAPs() {
            // Filter the papsListVue array to only include items that match the selected org outcome
            //this.filteredPAPs = this.papsListVue.filter(item => item.org_outcome_id === this.papsFormData.org_outcome_id);
            this.filteredPAPs = this.papsListVue.filter(pap => pap.org_outcome_id === this.formData.org_outcome);
            console.log(this.filteredPAPs);
        },
        onDivisionChange() {
            //console.log('Selected Division ID:', this.formData.division_id);
            //console.log(this.divisionListVue);
            
            const selectedDivision = this.divisionListVue.find(item => item.id === this.formData.division_id);
            this.formData.division_name = selectedDivision ? selectedDivision.division_name : '';

           //var divText = $("#division-id option:selected").text();
           //this.formData.division_name = divText;
            
          },
        onCalendarChange() {
            //console.log('Selected Calendar ID:', this.formData.calendar_id);
            //console.log(this.calendarListVue);
            const selectedCalendar = this.calendarListVue.find(item => item.id === this.formData.calendar_id);
            this.formData.calendar_name = selectedCalendar ? selectedCalendar.calendar_name : '';
            
        },
        updateStartDateFields() {
            // Split the datetime value and update individual fields
            const datetimeValue = this.formData.whole_date_start;
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

            this.formData.event_day_start = day.toString(); // Convert back to string
            this.formData.event_month_start = month.toString(); // Convert back to string
            this.formData.event_year_start = year.toString(); // Convert back to string
            this.formData.event_time_start = `${formattedHours}:${formattedMinutes} ${amOrPm}`;
            this.formData.whole_date_start_searchable = formattedDate;
            //this.dateStartSearchable = `${year}-${month}-${day}`;
        },
        updateEndDateFields() {

            const enddatetimeValue = this.formData.whole_date_end;
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
          
            this.formData.event_day_end = endday.toString(); // Convert back to string
            this.formData.event_month_end = endmonth.toString(); // Convert back to string
            this.formData.event_year_end = endyear.toString(); // Convert back to string
            this.formData.event_time_end = `${endformattedHours}:${endformattedMinutes} ${period}`;
            this.formData.whole_date_end_searchable = endformattedDate;
            //this.dateEndSearchable = `${endyear}-${endmonth}-${endday}`;

          }, // end of updateEndDateFields() function
          // onOoChange function
          onOoChange() {
            // get the selected org outcome text value with id="orgOutcome-id-id" and assign the text value to input type='text' id='oo-name-id'
            var ooText = $("#orgOutcome-id option:selected").text();
            this.papsFormData.oo_name = ooText;
            },
    }, // end of methods
    mounted() {

        var table; //declare the table variable globally
        var tableEvents; //declare the table variable globally

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
                    {'data': 'office', 'searchable': true, 'sortable': true},
                    {'data': 'division_name', 'searchable': true, 'sortable': true},
                    {'data': 'unit', 'searchable': true, 'sortable': true},
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
                            //$("#editWholeDateStart-id").val(data.event_date_start);
                            //$("#editWholeDateEnd-id").val(data.event_date_end);
                            $("#editFileAttachment-id").text(data.file_attachment); 
                            $('#editEventModal').modal('show');
                        }
                    }); // end of the $.ajax()
                }
            }); // end of the $('#eventsTable tbody')

        }); // end of the function

        //Datatables serverside for displaying events in different field sequence
        tableEvents = $('#eventsDisplayTable').DataTable({
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
                {'data': 'whole_date_start_searchable', 'sortable': true, 'searchable': false},
                {'data': 'event_title', 'searchable': true, 'sortable': true},
                {'data': 'event_desc', 'searchable': true, 'sortable': true},
                {'data': 'event_title', 'searchable': true, 'sortable': true},
                {'data': 'event_title', 'searchable': true, 'sortable': true},
                {'data': 'event_title', 'searchable': true, 'sortable': true},
                {'data': 'event_title', 'searchable': true, 'sortable': true},
                {'data': 'event_title', 'searchable': true, 'sortable': true},
                // Add more columns as needed
            ],
            'order': [[0, 'desc']], // Order by ID column, descending
            
            }); // end of the $('#eventsTable').DataTable()
        

         // Fetch division and calendar data when the component is mounted
        this.fetchDivisionData();
        this.fetchCalendarData();
        // org outcome data
        this.fetchOrgOutcomeData();
        // paps data
        this.fetchPapsData();

    } // end of the mounted() function

});

app.mount('#app');
