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
            provincesListVue: [], // Initialize provincesList with an empty array
            lguListVue: [], // Initialize lguList with an empty array
            barangayListVue: [], // Initialize barangayList with an empty array
            filteredPAPs: [], // Initialize filteredPAPs with an empty array
            filteredLGUs: [], // Initialize filteredLGUs with an empty array
            filteredBarangays: [], // Initialize filteredBarangays with an empty array
            eventsListVue: [], // Initialize eventsList with an empty array
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
                event_location_lgu: 0, // Initialize with an empty string
                lgu_id: 0, // Initialize with zero
                event_location_barangay: 0, // Initialize with an empty string
                event_desc: '', // Initialize with an empty string
                participants: '', // Initialize with an empty string
                file_attachment: null, // Initialize with null
                office: 0, // Initialize with an empty string
                unit: 0, // Initialize with an empty string
                org_outcome: 0, // Initialize with an empty string
                paps: 0, // Initialize with an empty string
                user_id: '', // Initialize with an empty string
                calendar_id: 0, // Initialize with an empty string
                event_all_day: false, // Initialize with false
                event_code: '',
                event_pid: 0
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

          // function to handle event title change, keyup and click on autocomplete
          handleEventTitleText(event) {
            // Access the inputted text from the event
            const selectedEventTitle = event.target.value;
            this.formData.event_title = selectedEventTitle;
         },

        // Function to save event data
        saveEventData(event) {
            // Prevent the default submit action
            event.preventDefault();
            // Get the button elements by their IDs
            const saveButton = document.getElementById('saveButton');
            const updateButton = document.getElementById('updateButton');

            const orgOutcomeText = this.ooListVue.find(item => item.id === Number(this.formData.org_outcome))?.org_outcome;

            const papsText = this.papsListVue.find(item => item.id === this.formData.paps)?.pap;
            const eventLocationText = this.provincesListVue.find(item => item.id === this.formData.event_location)?.province;
            const lguText = this.lguListVue.find(item => item.id === this.formData.event_location_lgu)?.lgu;
            const barangayText = this.barangayListVue.find(item => item.id === this.formData.event_location_barangay)?.barangay;

            // Retrieve the text content of the clicked button
            let buttonText = '';

            if (event.target === saveButton) {

                buttonText = saveButton.textContent;
                    
                    const formData = new FormData();
                    formData.append('buttontxt', buttonText);
                    formData.append('office', this.formData.office);
                    formData.append('division_id', this.formData.division_id);
                    formData.append('unit', this.formData.unit);
                    formData.append('org_outcome', orgOutcomeText);
                    formData.append('orgoutcome_id', this.formData.org_outcome);
                    formData.append('paps', papsText);
                    formData.append('pap_id', this.formData.paps);
                    formData.append('calendar_id', 1);
                    //formData.append('calendar_id', this.formData.calendar_id);
                    formData.append('user_id', this.formData.user_id);
                    formData.append('event_title', this.formData.event_title);
                    formData.append('event_location', eventLocationText);
                    formData.append('province_id', this.formData.event_location);
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
                    formData.append('calendar_name', "DTI Calendar");
                    //formData.append('calendar_name', this.formData.calendar_name);
                    formData.append('division_name', this.formData.division_name);
                    formData.append('event_location_district', this.formData.event_location_district);
                    formData.append('event_location_lgu', lguText);
                    formData.append('lgu_id', this.formData.event_location_lgu);
                    formData.append('event_location_barangay', barangayText);
                    formData.append('barangay_id', this.formData.event_location_barangay);
                    // assign 10 randomly generated alphanumeric with special characters to the formData.event_code
                    if (buttonText == 'Save'){
                        formData.append('event_code', Math.random().toString(36).slice(2));
                    }else{
                        formData.append('event_code', formData.event_code);
                    }
                    formData.append('event_all_day', this.formData.event_all_day);
                    
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
                        this.message = "Event created successfully!";
                        // call the showToast() method to show the toast notification
                        this.showToast();
                        // refresh the server-side datatables events table
                        $('#eventsTable').DataTable().ajax.reload();
                        // Handle a successful response
                        console.log("Event added", data);
                        // reset the form data all at once using one line of code
                        Object.assign(this.formData, this.$options.data().formData);
                            
                        
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

            } else if (event.target === updateButton) {

                buttonText = updateButton.textContent;
                console.log("wowowee");
                console.log(orgOutcomeText);
                console.log("this.ooListVue:", this.ooListVue);
                console.log(this.formData.org_outcome);
                console.log(this.formData.event_pid);
                console.log(this.formData.event_title);
                console.log(this.formData.office);
                console.log(this.formData.division_id);
                console.log(this.formData.unit);
                console.log(this.formData.org_outcome);
                console.log(this.formData.paps);
                console.log(this.formData.event_location);
                console.log(this.formData.event_location_lgu); 
                console.log(this.formData.event_location_barangay);
                console.log(this.formData.event_location_district);
                console.log(this.formData.whole_date_start);
                console.log(this.formData.whole_date_end);
                console.log(this.formData.event_all_day);
                console.log(this.formData.event_desc);
                console.log(this.formData.participants);
                console.log(this.formData.file_attachment);

            }

            console.log("Button text:", buttonText.trim()); // Ensure to trim any whitespace
            
            

        }, // end of saveEventData() function

        // Function to load datatable with the selected id="dtioffice"
        loadFiltDatatable() {
            var tablevar; m
            // get the selected office id
            var officeId = $("#dtioffice option:selected").val();
            //Datatables serverside for displaying events
            tablevar = $('#eventsTable').DataTable({
                        'processing': true,
                        'serverSide': true,
                        'ajax': {
                            'url': '/get_events/',  // Replace with your API endpoint
                            'type': 'GET',
                            'data': {
                                'office_id': officeId,
                            },
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
        }, // end of loadFiltDatatable() function
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
            $("#modal1").modal('show'); // Show the modal on page load
            $("#updateButton").hide(); // Show the update button
            $("#saveButton").show(); // Hide the save button

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
        // Function to fetch provinces data
        fetchProvincesData() {
            fetch('/provinces/api/get-provincesList/') // Replace with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.provincesListVue = data;
                console.log(this.provincesListVue);
            })
            .catch(error => {
                console.error('Error fetching provinces data:', error);
            });
        },
        // function to fetch lgu data
        fetchLguData() {
            fetch('/lgus/api/get-lguList/') // Replace with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.filteredLGUs = data;
                this.lguListVue = data;
                console.log(this.filteredLGUs);
            })
            .catch(error => {
                console.error('Error fetching lgu data:', error);
            });
        },
        // Function to fetch barangay data
        fetchBarangayData() {
            fetch('/barangays/api/get-barangayList/') // Replace with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.filteredBarangays = data;
                this.barangayListVue = data;
                console.log(this.barangayListVue);
            })
            .catch(error => {
                console.error('Error fetching barangay data:', error);
            });
        },  
        // Function to filter paps data
        updatePAPs() {
            // Filter the papsListVue array to only include items that match the selected org outcome
            //this.filteredPAPs = this.papsListVue.filter(item => item.org_outcome_id === this.papsFormData.org_outcome_id);
            this.filteredPAPs = this.papsListVue.filter(pap => pap.org_outcome_id === this.formData.org_outcome);
            console.log(this.filteredPAPs);
            // reset the formData.paps to 0
            this.formData.paps = 0;
        },
        // Function to filter lgu  data
        updateLGUs() {
            // Filter the lguListVue array to only include items that match the selected province
            //this.filteredLGUs = this.lguListVue.filter(item => item.province_id === this.formData.event_location);
            this.filteredLGUs = this.lguListVue.filter(lgu => lgu.province_id === this.formData.event_location);
            console.log(this.filteredLGUs);
            console.log(this.formData.event_location);
            // reset the formData.event_location_lgu to 0
            this.formData.event_location_lgu = 0;
            // reset the formData.event_location_district to ''
            this.formData.event_location_district = '';
            this.formData.event_location_barangay = 0;
        },
        // function to fetch district data in the lgu database based on the selected lgu
        updateDistrict() {
            // get the selected lgu id
            var lguId = $("#event-location-lgu-id option:selected").val();
            // ajax call to fetch the districts data
            fetch('/lgus/api/get-districtsList/', {
                method: "POST",
                body: lguId,
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // assign the district name to the formData.event_location_district
                this.formData.event_location_district = data[0].district;
                console.log(this.formData.event_location_district);
                
            })
            .catch(error => {
                console.error('Error fetching districts data:', error);
            });

            // Filter the barangayListVue array to only include items that match the selected LGU
            this.filteredBarangays = this.barangayListVue.filter(barangay => barangay.lgu_id === this.formData.event_location_lgu);
            this.formData.event_location_barangay = 0;
        },
        // Function to filter datatable events data by office, division and unit
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

            // If event_all_day is true, set the time to 9am
            if (this.formData.event_all_day) {
                timeValue.setHours(9, 0, 0, 0); // Set time to 9 am
            }

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
            //this.formData.whole_date_start = `${formattedHours}:${formattedMinutes} ${amOrPm}`;
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

            // If event_all_day is true, set the time to 9am
            if (this.formData.event_all_day) {
                // Set time to 5pm
                endtimeValue.setHours(17, 0, 0, 0);
            }
          
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

        // Function to fetch events data based on formData.whole_date_start and formData.whole_date_end
        checkEventDate() {

                // show modal with id="events-modal" and show it on top of another modal with id="modal2"
                $('#events-modal').modal({backdrop: 'static', keyboard: false});
                $('#events-modal').modal('show');

                // get the formData.whole_date_start and formData.whole_date_end values
                var startDate = this.formData.whole_date_start;
                var endDate = this.formData.whole_date_end;
                //remove time from the date 2024-01-19T14:37
                var startDate = startDate.split('T')[0];
                var endDate = endDate.split('T')[0];

                // ajax call to fetch the events data with startDate and endDate as parameters
                fetch('/events/api/get-eventsList/', {
                    method: "POST",
                    body: JSON.stringify({
                        start_date: startDate,
                        end_date: endDate,
                    }),
                    })
                .then(response => response.json())
                .then(data => {
                    this.eventsListVue = data;      
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
                
        }, // end of checkEventDate() function

        handleDateTimeChange() {

            // Your logic for handling the event_all_day change
            if (this.formData.event_all_day) {
                const startDate = new Date(this.formData.whole_date_start); // Convert the user-input date string to a Date object
                startDate.setHours(17, 0, 0, 0); // Set time to 9am for start date
                this.formData.whole_date_start = startDate.toISOString().slice(0, 16); // Update start datetime
            
                const endDate = new Date(this.formData.whole_date_end); // Convert the user-input date string to a Date object
                endDate.setHours(25, 0, 0, 0); // Set time to 5pm for end date
                this.formData.whole_date_end = endDate.toISOString().slice(0, 16); // Update end datetime

                console.log(this.formData.whole_date_start);
                console.log(this.formData.whole_date_end);
                
            }else {

                const now = new Date();
                const startDate = new Date(this.formData.whole_date_start);
                const endDate = new Date(this.formData.whole_date_end);

                startDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
                endDate.setHours(now.getHours(), now.getMinutes(), 0, 0);

                const formattedStartDate = `${startDate.getFullYear()}-${(`0${startDate.getMonth() + 1}`).slice(-2)}-${(`0${startDate.getDate()}`).slice(-2)}T${(`0${startDate.getHours()}`).slice(-2)}:${(`0${startDate.getMinutes()}`).slice(-2)}`;
                const formattedEndDate = `${endDate.getFullYear()}-${(`0${endDate.getMonth() + 1}`).slice(-2)}-${(`0${endDate.getDate()}`).slice(-2)}T${(`0${endDate.getHours()}`).slice(-2)}:${(`0${endDate.getMinutes()}`).slice(-2)}`;

                this.formData.whole_date_start = formattedStartDate;
                this.formData.whole_date_end = formattedEndDate;

            }
            
            // Update the date fields
            this.updateStartDateFields();
            this.updateEndDateFields();
        }

    }, // end of methods
    mounted() {

        var table; //declare the table variable globally
        var tableEvents; //declare the table variable globally
        const self = this;

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
                    {
                        extend: 'copy',
                        exportOptions: {
                            columns: ':not(:first-child)' // Excludes the first column from copy
                        }
                    },
                    {
                        extend: 'csv',
                        exportOptions: {
                            columns: ':not(:first-child)' // Excludes the first column from CSV export
                        }
                    },
                    {
                        extend: 'excel',
                        exportOptions: {
                            columns: ':not(:first-child)' // Excludes the first column from Excel export
                        }
                    },
                    {
                        extend: 'pdf',
                        exportOptions: {
                            columns: ':not(:first-child)' // Excludes the first column from PDF export
                        }
                    },
                    {
                        extend: 'print',
                        exportOptions: {
                            columns: ':not(:first-child)' // Excludes the first column when printing
                        }
                    },
                ],
                'columns': [
                    {'data': 'id', 'sortable': true, 'searchable': false},
                    {'data': 'whole_date_start_searchable', 'searchable': true, 'sortable': true},
                    {'data': 'whole_date_end_searchable', 'searchable': true, 'sortable': true},
                    {'data': 'event_title', 'searchable': true, 'sortable': true},
                    {'data': 'event_desc', 'searchable': true, 'sortable': true},
                    {'data': 'office', 'searchable': true, 'sortable': true},
                    {'data': 'division_name', 'searchable': true, 'sortable': true},
                    {'data': 'unit', 'searchable': true, 'sortable': true},
                    // {
                    //     'data': 'file_attachment',
                    //     'searchable': true,
                    //     'sortable': true,
                    //     'render': function(data, type, row) {
                        
                    //             // Assuming the 'file_attachment' contains the full URL
                    //             if (type === 'display') {
                    //                 // check if the 'file_attachment' attribute has no file associated with it.
                    //                 const fileName = data.substring(data.lastIndexOf('/') + 1); // Extracts the file name from the URL
                    //                 const fileId = row.id; // Accessing the 'id' field from the row data
                    //                 // check file name if empty
                    //                 const displayFileName = (fileName==='NONE') ? 'No file attached' : '<a href="/events/download/' + fileId + '" download>' + fileName + '</a>';
                    //                 return displayFileName
                    //             }
                    //             return data; // For other types or non-display, return the data as is
                            
                    //     }
                    // },
                    // Add more columns as needed
                ],
                'order': [[0, 'desc']], // Order by ID column, descending
                
               
            }); // end of the $('#eventsTable').DataTable()

            $('#eventsTable tbody').on('click', 'tr', function () {
                
                var data = table.row(this).data();
                // show cursor as pointer when hovering over the table row
                $('#eventsTable tbody tr').css('cursor', 'pointer');
               
                if (data) {
                    console.log('Selected Data:', data.id);
                    //query the database for the event details using the event id and display it in the #editEventModal
                    $.ajax({
                        url: '/get_event_details_to_edit/',
                        type: 'GET',
                        data: {
                            'event_id': data.id,
                        },
                        dataType: 'json',
                        success: function (data) {
                            
                            // Assuming data.whole_dateStart_with_time is in the format "2024-01-08 09:00:00+08"
                            
                            // Assuming data.whole_dateStart_with_time is in the format "2024-01-08 09:00:00+08"
                            const startDateString = data.whole_dateStart_with_time.replace(' ', 'T'); // Convert to "YYYY-MM-DDTHH:MM:SS+HH:MM" format

                            // Adjusting for time zone offset
                            const startDate = new Date(startDateString);
                            const adjustedStartDate = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)); // Adjusting for local time

                            const endDateString = data.whole_dateEnd_with_time.replace(' ', 'T'); // Convert to "YYYY-MM-DDTHH:MM:SS+HH:MM" format

                            // Adjusting for time zone offset
                            const endDate = new Date(endDateString);
                            const adjustedEndDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)); // Adjusting for local time

                            // Formatting the adjusted dates back to "YYYY-MM-DDTHH:MM" format
                            const formattedStartDate = adjustedStartDate.toISOString().slice(0, 16);
                            const formattedEndDate = adjustedEndDate.toISOString().slice(0, 16);

                            // Assuming data.file_attachment contains the file path
                            const fullPath = data.file_attachment; // Replace this with your file path
                            const fileName = fullPath.split('/').pop(); // Extract the file name from the path

                            //console.log(data.event_code);
                            //populate the editEventModal with the event details
                            $("#event-id").val(data.id);
                            $("#editOffice").val(data.office);
                            $("#division-id").val(data.division_id);
                            $("#editUnit").val(data.unit);
                            $("#editOrgOutcome").val(data.orgoutcome_id);
                            $("#editPaps").val(data.pap_id);
                            $("#event-title-input").val(data.event_title);
                            $("#editLocProv").val(data.province_id);
                            $("#event-location-lgu-id").val(data.lgu_id);
                            $("#event-location-barangay-id").val(data.barangay_id);
                            $("#editDistrict").val(data.event_location_district);
                            $("#editDateStart").val(formattedStartDate);
                            $("#editDateEnd").val(formattedEndDate);
                            $("#customSwitch").prop('checked', data.event_all_day);
                            $("#editEventDesc").val(data.event_desc);
                            $("#editParticipants").val(data.participants);
                            //$("#editWholeDateStart-id").val(data.event_date_start);
                            //$("#editWholeDateEnd-id").val(data.event_date_end);
                            $("#editFileAttachment").text(data.file_attachment); 
                            // Assuming data.file_attachment contains the file name
                            $("#fileAttachmentName").text(fileName);

                            if (data) {
                                $("#updateButton").show(); // Show the update button
                                $("#saveButton").hide(); // Hide the save button
                            } else {
                                $("#updateButton").hide(); // Hide the update button
                                $("#saveButton").show(); // Show the save button
                            }

                            $('#modal1').modal('show');
                            const eventpID = $("#event-id").val();
                            const eventTitle = $("#event-title-input").val();
                            const eventOffice = $("#editOffice").val();
                            const eventDivision = $("#division-id").val();
                            const eventUnit = $("#editUnit").val();
                            const eventOo = $("#editOrgOutcome").val();
                            const eventpap = $("#editPaps").val();
                            const eventLocation = $("#editLocProv").val();
                            const eventLgu = $("#event-location-lgu-id").val();
                            const eventBrgy = $("#event-location-barangay-id").val();
                            const eventDistrict = $("#editDistrict").val();
                            const eventDateStart = $("#editDateStart").val();
                            const eventDateEnd = $("#editDateEnd").val();
                            const eventAllDay = $("#customSwitch").val();
                            const eventDesc = $("#editEventDesc").val();
                            const eventParticipants = $("#editParticipants").val();
                            const eventfile = $("#fileAttachmentName").text(fileName);


                            self.formData.event_pid = eventpID;
                            self.formData.event_title = eventTitle;
                            self.formData.office = eventOffice;
                            self.formData.division_id = eventDivision;
                            self.formData.unit = eventUnit;
                            self.formData.org_outcome = eventOo;
                            self.formData.paps = eventpap;
                            self.formData.event_location = eventLocation;
                            self.formData.event_location_lgu = eventLgu;
                            self.formData.event_location_barangay = eventBrgy;
                            self.formData.event_location_district = eventDistrict;
                            self.formData.whole_date_start = eventDateStart;
                            self.formData.whole_date_end = eventDateEnd;
                            self.formData.event_all_day = eventAllDay;
                            self.formData.event_desc = eventDesc;
                            self.formData.participants = eventParticipants;
                            self.formData.file_attachment = eventfile;

                           
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
            
            }); // end of the $('#eventsTable').DataTable()
        

         // Fetch division and calendar data when the component is mounted
        this.fetchDivisionData();
        this.fetchCalendarData(); 
        // org outcome data
        this.fetchOrgOutcomeData();
        // paps data
        this.fetchPapsData();
        // fetch provinces data
        this.fetchProvincesData();
        // fetch lgu data
        this.fetchLguData();
        // fetch barangay data
        this.fetchBarangayData();
    } // end of the mounted() function

});

app.mount('#app');
