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
            filteredUnitList: [], // initialized with an empty array
            unitListVue: [], // initialized with an empty array
            filteredBarangays: [], // Initialize filteredBarangays with an empty array
            eventsListVue: [], // Initialize eventsList with an empty array
            formData: {
                division_id: 0, // Initialize division_id with 0
                division_name: '', // Initialize with an empty string
                unit_name: '',
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

                oo_pid: 0,
                org_outcome: '', // Initialize with an empty string
                description: '', // Initialize with an empty string

            },
            // initialize papsFormData
            papsFormData: {

                pap_pid: 0,
                pap: '', // Initialize with an empty string
                description: '', // Initialize with an empty string
                org_outcome_id: 0,
                oo_name: '',

            },
            unitFormData: {

                unit_pid: 0,
                unit_name: '',
                description: '',
                division_id: 0,
                division_name: ''

            },
            divFormData:{

                division_name: '',
                division_desc: '',
                div_pid: 0

            }
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

        callDivFunctions(){
            this.showDivModal();
            this.resetDivFormData();
        },

        callUnitFunctions(){
            this.showUnitModal();
            this.resetUnitFormData();
        },

        callOoFunctions(){
            this.showOrgModal();
            this.resetOoFormData();
        },
        callPapFunctions(){
            this.showPapsModal();
        },
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

            // Retrieve the text content of the clicked button
            let buttonText = '';

            console.log('c');

            if (event.target === saveButton) {

                // Get the selected Organizational Outcome text
                const orgOutcomeText = this.ooListVue.find(item => item.id === this.formData.org_outcome).org_outcome;
                // Get the selected PAPs text
                const papsText = this.papsListVue.find(item => item.id === this.formData.paps).pap;
                // get the selected event location text
                const eventLocationText = this.provincesListVue.find(item => item.id === this.formData.event_location).province;
                // get the selected lgu text
                const lguText = this.lguListVue.find(item => item.id === this.formData.event_location_lgu).lgu;
                // get the selected barangay text
                const barangayText = this.barangayListVue.find(item => item.id === this.formData.event_location_barangay).barangay;

                buttonText = saveButton.textContent;
                    
                    const formData = new FormData();
                    formData.append('buttontxt', buttonText);
                    formData.append('office', this.formData.office);
                    formData.append('division_id', this.formData.division_id);
                    formData.append('unit', this.formData.unit);
                    formData.append('unit_name', $("#editUnit option:selected").text());
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
                        this.message = "Event Added!";
                        // call the showToast() method to show the toast notification
                        this.showToast();
                        // refresh the server-side datatables events table
                        $('#eventsTable').DataTable().ajax.reload();
                        // Handle a successful response
                        console.log("Event added", data);
                        // reset the form data all at once using one line of code
                        //Object.assign(this.formData, this.$options.data().formData);

                        $("#editOffice").val(0);
                        $("#division-id").val(0);
                        $("#division-name-id").val(" ");
                        $("#editUnit").val(0);
                        $("#editOrgOutcome").val(0);
                        $("#editPaps").val(0);
                        $("#event-title-input").val(" ");
                        $("#editLocProv").val(0);
                        $("#event-location-lgu-id").val(0);
                        $("#event-location-barangay-id").val(0);
                        $("#editDistrict").val(" ");
                        $("#customSwitch").prop('checked',false);
                        $("#editEventDesc").val(" ");
                        $("#editParticipants").val(" ");    
                        
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

                const orgOutcomeTextEdit = this.ooListVue.find(item => item.id === Number(this.formData.org_outcome))?.org_outcome;
                const papsTextEdit = this.papsListVue.find(item => item.id === Number(this.formData.paps))?.pap;
                const eventLocationTextEdit = this.provincesListVue.find(item => item.id === Number(this.formData.event_location))?.province;
                const lguTextEdit = this.lguListVue.find(item => item.id === Number(this.formData.event_location_lgu))?.lgu;
                const barangayTextEdit = this.barangayListVue.find(item => item.id === Number(this.formData.event_location_barangay))?.barangay;

                buttonText = updateButton.textContent;
                    
                    const formData = new FormData();
                    formData.append('buttontxt', buttonText);
                    formData.append('pID', this.formData.event_pid);
                    formData.append('office', this.formData.office);
                    formData.append('division_id', this.formData.division_id);
                    formData.append('unit', this.formData.unit);
                    formData.append('unit_name', $("#editUnit option:selected").text());
                    formData.append('org_outcome', orgOutcomeTextEdit);
                    formData.append('orgoutcome_id', this.formData.org_outcome);
                    formData.append('paps', papsTextEdit);
                    formData.append('pap_id', this.formData.paps);
                    formData.append('calendar_id', 1);
                    //formData.append('calendar_id', this.formData.calendar_id);
                    formData.append('user_id', this.formData.user_id);
                    formData.append('event_title', this.formData.event_title);
                    formData.append('event_location', eventLocationTextEdit);
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
                    formData.append('division_name', this.formData.division_name);
                    formData.append('event_location_district', this.formData.event_location_district);
                    formData.append('event_location_lgu', lguTextEdit);
                    formData.append('lgu_id', this.formData.event_location_lgu);
                    formData.append('event_location_barangay', barangayTextEdit);
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
                        this.message = "Event Updated!";
                        // call the showToast() method to show the toast notification
                        this.showToast();
                        // refresh the server-side datatables events table
                        $('#eventsTable').DataTable().ajax.reload();
                        // Handle a successful response
                        console.log("Event added", data);
                        // reset the form data all at once using one line of code
                        //Object.assign(this.formData, this.$options.data().formData);
                        
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

            }else{

                console.log('Nothing in here');    

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
                            {'data': 'unit_name', 'searchable': true, 'sortable': true},
                            {'data': 'whole_date_start_searchable', 'searchable': true, 'sortable': true},
                            {'data': 'whole_date_end_searchable', 'searchable': true, 'sortable': true},
                            // Add more columns as needed
                        ],
                        'order': [[0, 'desc']], // Order by ID column, descending
                    }); // end of the $('#eventsTable').DataTable()
        }, // end of loadFiltDatatable() function
        // function to save org outcome data
        saveOoData(event) {

            event.preventDefault();

            const saveOoButton = document.getElementById('oo-save');
            const updateOoButton = document.getElementById('oo-update');
            const orgFormData = new FormData();
            

            if(event.target.textContent === saveOoButton.textContent){

                orgFormData.append('oobtntxt', saveOoButton.textContent)
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
                    $('#oodataTable').DataTable().ajax.reload();
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

            }else if(event.target.textContent === updateOoButton.textContent){

                orgFormData.append('oobtntxt', updateOoButton.textContent);
                orgFormData.append('id', this.orgFormData.oo_pid);
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
                    this.message = "Org Outcome detail/s updated!";
                    // call the showToast() method to show the toast notification
                    this.showToast();
                    console.log("Data saved successfully:", data);
                    // refresh the display table data
                    $('#oodataTable').DataTable().ajax.reload();

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

            }else{
                console.log("Failed tx");
            }


        }, // end of saveOrgOutcomeData() function

        // function to save paps data
        savePapsData(event) {

            event.preventDefault();
            
            const papsFormData = new FormData();
            const savePapButton = document.getElementById('pap-save');
            const updatePapButton = document.getElementById('pap-update');

            if(event.target.textContent === savePapButton.textContent){

                papsFormData.append('papBtnTxt', savePapButton.textContent);
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
                    this.message = "PAP details added";
                    // call the showToast() method to show the toast notification
                    this.showToast();
                    console.log("Data saved successfully:", data.message);
                    // reset the form data
                    this.papsFormData.pap = '';
                    this.papsFormData.description = '';
                    this.papsFormData.org_outcome_id = 0;
                    this.papsFormData.oo_name = '';
                    $('#papdataTable').DataTable().ajax.reload();
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

            }else if(event.target.textContent === updatePapButton.textContent){

                papsFormData.append('papBtnTxt', updatePapButton.textContent);
                papsFormData.append('id', this.papsFormData.pap_pid);
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
                    this.message = "PAP detail/s updated";
                    // call the showToast() method to show the toast notification
                    this.showToast();
                    console.log("Data saved successfully:", data.message);
                    $('#papdataTable').DataTable().ajax.reload();
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

            }else{
                console.log("Failed tx");
            }

        }, // end of savePapsData() function

        saveUnitData(event) {

            event.preventDefault();

            const saveUnitButton = document.getElementById('unit-save');
            const updateUnitButton = document.getElementById('unit-update');
            console.log(updateUnitButton.textContent)
            console.log(event.target.textContent)
            const unitFormData = new FormData();

            if(event.target.textContent === saveUnitButton.textContent){

                unitFormData.append('bntUnitText', saveUnitButton.textContent);
                unitFormData.append('unit_name', this.unitFormData.unit_name);
                unitFormData.append('description', this.unitFormData.description);
                unitFormData.append('division_id', this.unitFormData.division_id);
                unitFormData.append('division_name', this.unitFormData.division_name);
                //alert(this.papsFormData.oo_name);
                // ajax call to save the paps data
                fetch("/units/save-unit-ajax/", {
                    method: "POST",
                    body: unitFormData,
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
                    this.message = "Unit details added";
                    // call the showToast() method to show the toast notification
                    this.showToast();
                    console.log("Data saved successfully:", data.message);
                    // reset the form data
                    this.unitFormData.unit_name = '';
                    this.unitFormData.description = '';
                    this.unitFormData.division_id = 0;
                    this.unitFormData.division_name = '';
                    $('#unitdataTable').DataTable().ajax.reload();
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

            }else if(event.target.textContent === updateUnitButton.textContent){

                unitFormData.append('bntUnitText', updateUnitButton.textContent);
                unitFormData.append('id', this.unitFormData.unit_pid);
                unitFormData.append('unit_name', this.unitFormData.unit_name);
                unitFormData.append('description', this.unitFormData.description);
                unitFormData.append('division_id', this.unitFormData.division_id);
                unitFormData.append('division_name', this.unitFormData.division_name);
                //alert(this.papsFormData.oo_name);
                // ajax call to save the paps data
                fetch("/units/save-unit-ajax/", {
                    method: "POST",
                    body: unitFormData,
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
                    this.message = "Unit detail/s updated";
                    // call the showToast() method to show the toast notification
                    this.showToast();
                    console.log("Data updated successfully:", data.message);
                    // refresh datatable
                    $('#unitdataTable').DataTable().ajax.reload();
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

            }else{
                console.log("Failed transaction");
            }


        }, // end of savePapsData() function

        saveDivData(event) {

            event.preventDefault();

            const saveDivButton = document.getElementById('div-save');
            const updateDivButton = document.getElementById('div-update');
            console.log(updateDivButton.textContent)
            console.log(event.target.textContent)
            const divFormData = new FormData();

            if(event.target.textContent === saveDivButton.textContent){

                divFormData.append('buttonDivTxt', saveDivButton.textContent)
                divFormData.append('division_name', this.divFormData.division_name);
                divFormData.append('division_desc', this.divFormData.division_desc);
               
                //alert(this.papsFormData.oo_name);
                // ajax call to save the paps data
                fetch("/divisions/save-div-ajax/", {
                    method: "POST",
                    body: divFormData,
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
                    this.message = "Division details saved";
                    // call the showToast() method to show the toast notification
                    this.showToast();
                    console.log("Data saved successfully:", data.message);
                    // reset the form data
                    this.divFormData.division_name = '';
                    this.divFormData.division_desc = '';
                } // end of if (data.message)
                else {
                    // Handle a failed response
                    console.log("Data save failed:", data.message);
                }
                $('#divdataTable').DataTable().ajax.reload();
                }
                ) // end of the first .then()
                .catch(error => {
                    // Handle errors
                    console.error("Error while saving data:", error);
                });

            }else if(event.target.textContent === updateDivButton.textContent){

                divFormData.append('buttonDivTxt', updateDivButton.textContent)
                divFormData.append('id', this.divFormData.div_pid);
                divFormData.append('division_name', this.divFormData.division_name);
                divFormData.append('division_desc', this.divFormData.division_desc);
               
                //alert(this.papsFormData.oo_name);
                // ajax call to save the paps data
                fetch("/divisions/save-div-ajax/", {
                    method: "POST",
                    body: divFormData,
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
                    this.message = "Division detail/s updated";
                    // call the showToast() method to show the toast notification
                    this.showToast();
                    console.log("Data saved successfully:", data.message);
                    //$("#div-ID").val("");
                } // end of if (data.message)
                else {
                    // Handle a failed response
                    console.log("Data save failed:", data.message);
                }
                $('#divdataTable').DataTable().ajax.reload();
                }
                ) // end of the first .then()
                .catch(error => {
                    // Handle errors
                    console.error("Error while saving data:", error);
                });

            }else{

                console.log("Failed transaction");

            }
            

        }, // end of savePapsData() function

        showModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $("#modal1").modal('show'); // Show the modal on page load
            $("#updateButton").hide(); // Show the update button
            $("#saveButton").show(); // Hide the save button
            // Initialize the date property with the current date and time in Manila, Philippines (UTC+8)
            const now = new Date();
            const manilaOffset = 8 * 60; // UTC+8 offset for Manila
            now.setMinutes(now.getMinutes() + manilaOffset);
            const isoDate = now.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:mm"
            $("#editDateStart").val(isoDate);
            $("#editDateEnd").val(isoDate);

            this.formData.event_title = '';
            this.formData.event_desc = '';
            this.formData.participants = '';

            console.log(this.formData.event_title);
            console.log(this.formData.event_desc);
            console.log(this.formData.participants);

            // Get the text content of the h5 tag
            var h5Text = $('#h5-Event1').text();
            var h5Text2 = $('#h5-Event2').text();

            if (h5Text.includes('Update Event') || h5Text2.includes('Update Event')) {
                // If it contains "Update Event", replace it with "Add Event"
                $('#h5-Event1').text(h5Text.replace('Update Event', 'Add Event'));
                $('#h5-Event2').text(h5Text2.replace('Update Event', 'Add Event'));
            }

        },
        showDivModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#myDivModal').modal('show');
            $("#div-update").hide();
            $("#div-save").show();

            var h5Text = $('#h5-Div').text();

            if (h5Text.includes('Update Division')) {
                // If it contains "Update Event", replace it with "Add Event"
                $('#h5-Div').text(h5Text.replace('Update Division', 'Add Division'));
            }
        },
        showDivModalPanel(){
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#myDivModalPanel').modal('show');
        },
        showUnitModal(){

            $("#myUnitModal").modal('show');
            $("#unit-update").hide();
            $("#unit-save").show();

            var h5Text = $('#h5-Unit').text();

            if (h5Text.includes('Update Unit')) {
                // If it contains "Update Event", replace it with "Add Event"
                $('#h5-Unit').text(h5Text.replace('Update Unit', 'Add Unit'));
            }
        },
        showUnitModalPanel(){
            $("#myUnitModalPanel").modal('show');
        },
        showOrgModalPanel(){
            $("#myOoModalPanel").modal('show');
        },
        showPapsModalPanel(){
            $("#myPapsModalPanel").modal('show');
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
            $("#oo-update").hide(); // Show the update button
            $("#oo-save").show(); // Hide the save button

            var h5Text = $('#h5-Oo').text();

            if (h5Text.includes('Update Organizational Outcome')) {
                // If it contains "Update Event", replace it with "Add Event"
                $('#h5-Oo').text(h5Text.replace('Update Organizational Outcome', 'Add Organizational Outcome'));
            }
        },
        // PAPs modal
        showPapsModal() {
            // Show the Bootstrap modal by selecting it with its ID and calling the 'modal' method
            $('#papsModal').modal('show');
            $("#pap-update").hide(); // Show the update button
            $("#pap-save").show(); // Hide the save button

            var h5Text = $('#h5-Paps').text();

            if (h5Text.includes('Update Program and Project')) {
                // If it contains "Update Event", replace it with "Add Event"
                $('#h5-Paps').text(h5Text.replace('Update Program and Project', 'Add Program and Project'));
            }
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

        // function to fetch unit data
        fetchUnitData(){

            fetch('/units/api/get-unitList/') // Replace with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.filteredUnitList = data;
                this.unitListVue = data;
                console.log(this.filteredUnitList);
            })
            .catch(error => {
                console.error('Error fetching lgu data:', error);
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

             // Append the default value if it's not already in the filteredBarangays array
             const defaultLgu = { id: 74, lgu: 'To be determined' };
             if (!this.filteredLGUs.some(lgu => lgu.id === defaultLgu.id)) {
             this.filteredLGUs.unshift(defaultLgu);
             }
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

            // Append the default value if it's not already in the filteredBarangays array
            const defaultBarangay = { id: 1312, barangay: 'To be determined' };
            if (!this.filteredBarangays.some(barangay => barangay.id === defaultBarangay.id)) {
            this.filteredBarangays.unshift(defaultBarangay);
            }

            this.formData.event_location_barangay = 0; 
        },
        // Function to filter datatable events data by office, division and unit
        onDivisionChange() {
            //console.log('Selected Division ID:', this.formData.division_id);
            //console.log(this.divisionListVue);
            
            const selectedDivision = this.divisionListVue.find(item => item.id === this.formData.division_id);
            this.formData.division_name = selectedDivision ? selectedDivision.division_name : '';
            
            //change unit list based on the selected division
            this.filteredUnitList = this.unitListVue.filter(unit => unit.division_id === this.formData.division_id);
            console.log(this.filteredUnitList);
            this.formData.unit = 0;
           //var divText = $("#division-id option:selected").text();
           //this.formData.division_name = divText;
            
          },

        //   onDivisionChange(param) {
        //     //console.log('Selected Division ID:', this.formData.division_id);
        //     //console.log(this.divisionListVue);
        //     if(param){

        //         const selectedDivision = this.divisionListVue.find(item => item.id === this.formData.division_id);
        //         this.formData.division_name = selectedDivision ? selectedDivision.division_name : '';
                
        //         //change unit list based on the selected division
        //         this.filteredUnitList = this.unitListVue.filter(unit => unit.division_id === this.formData.division_id);
        //         console.log(this.filteredUnitList);
        //         this.formData.unit = 0;

        //     }else{

        //         const selectedDivision = this.divisionListVue.find(item => item.id === this.formData.division_id);
        //         this.formData.division_name = selectedDivision ? selectedDivision.division_name : '';
                
        //         //change unit list based on the selected division
        //         this.filteredUnitList = this.unitListVue.filter(unit => unit.division_id === this.formData.division_id);
        //         console.log(this.filteredUnitList);
        //         this.formData.unit = 0;
        //     //var divText = $("#division-id option:selected").text();
        //     //this.formData.division_name = divText;

        //     }
            
            
        //   },

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
            
            // fetch division name list
            onDivChange(){

                var divText = $("#divList-id option:selected").text();
                this.unitFormData.division_name = divText;

            },

        // Function to fetch events data based on formData.whole_date_start and formData.whole_date_end
        checkEventDate(event) {

                event.stopPropagation();
                // show modal with id="events-modal" and show it on top of another modal with id="modal2"
                $('#events-modal').modal({backdrop: 'static', keyboard: false});
                $('#events-modal').modal('show');

                 // show modal with id="events-modal" and show it on top of another modal with id="modal2"
                 $('#events-modal').modal({backdrop: 'static', keyboard: false});
                 $('#events-modal').modal('show');
 
                 // get the formData.whole_date_start and formData.whole_date_end values
                 var startDate = this.formData.whole_date_start;
                 var endDate = this.formData.whole_date_end;
                 //remove time from the date 2024-01-19T14:37
                 var startDate = startDate.split('T')[0];
                 var endDate = endDate.split('T')[0];

                    console.log(startDate);
                    console.log(endDate);

                // var saveButton = document.getElementById('saveButton');
                // var displayPropertyValue = saveButton.style.display;
                // if(displayPropertyValue === 'none'){

                //console.log('Update function');
                     // get the formData.whole_date_start and formData.whole_date_end values
                    // var startDateUpdate = this.formData.whole_date_start;
                    // var endDateUpdate = this.formData.whole_date_end;
                    //remove time from the date 2024-01-19T14:37
                    // var startDate = startDateUpdate.split('T')[0];
                    // var endDate = endDateUpdate.split('T')[0];
                    // console.log(startDate);
                    // console.log(endDate);
                // }else{

                //     console.log('Save function');
                //     // Initialize the date property with the current date and time in Manila, Philippines (UTC+8)
                //     const now = new Date();
                //     const manilaOffset = 8 * 60; // UTC+8 offset for Manila
                //     now.setMinutes(now.getMinutes() + manilaOffset);
                //     const isoDate = now.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:mm"
                //     this.formData.whole_date_start = isoDate;
                //     this.formData.whole_date_end = isoDate;

                //     // get the formData.whole_date_start and formData.whole_date_end values
                //     var startDateSave = this.formData.whole_date_start;
                //     var endDateSave = this.formData.whole_date_end;
                //     //remove time from the date 2024-01-19T14:37
                //     var startDate = startDateSave.split('T')[0];
                //     var endDate = endDateSave.split('T')[0];
                //     console.log(startDate);
                //     console.log(endDate);
                // }

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
        },

        resetFormData() {
            // Reset the form data to initial values
            Object.assign(this.formData, this.$options.data().formData);
            // Alternatively, you can reset the form using the form reference
            this.$refs.eventForm.reset();
         },

         resetDivFormData() {
            // Reset the division form data to initial values
            Object.assign(this.divFormData, this.$options.data().divFormData);
            $("#div-ID").val("");
         },

         resetUnitFormData(){
            // Reset the unit form data to initial values
            Object.assign(this.unitFormData, this.$options.data().unitFormData);
            $("#unit-ID").val('');
         },

         resetOoFormData(){
            // Reset the unit form data to initial values
            Object.assign(this.orgFormData, this.$options.data().orgFormData);
            $("#oo-ID").val('');
         }

    }, // end of methods
    mounted() {

        var table; //declare the table variable globally
        var tableEvents; //declare the table variable globally
        var divTable;
        var unitTable;
        var ooTable;
        var papTable;
        const self = this;

        $(function() {

            document.getElementById('closeButton').addEventListener('click', function () {

                console.log('a');

                $("#event-id").val("");
                $("#editOffice").val(0);
                $("#division-id").val(0);
                $("#division-name-id").val("");
                $("#editUnit").val(0);
                $("#editOrgOutcome").val(0);
                $("#editPaps").val(0);
                $("#event-title-input").val("");
                $("#editLocProv").val(0);
                $("#event-location-lgu-id").val(0);
                $("#event-location-barangay-id").val(0);
                $("#editDistrict").val("");
                $("#customSwitch").prop('checked',false);
                $("#editEventDesc").val("");
                $("#editParticipants").val("");     
                document.getElementById('fileAttachmentName').textContent = '';

            });

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
                    {'data': 'unit_name', 'searchable': true, 'sortable': true},
                    
                ],
                'order': [[0, 'desc']], // Order by ID column, descending
                
               
            }); // end of the $('#eventsTable').DataTable()

            $('#eventsTable tbody').on('click', 'tr', function () {

                var data = table.row(this).data();
                // Get the text content of the h5 tag
                var h5Text = $('#h5-Event1').text();
                var h5Text2 = $('#h5-Event2').text();

                // Check if the text contains "Add Event"
                if (h5Text.includes('Add Event') || h5Text2.includes('Add Event')) {
                    // If it does, replace it with "Update Event"
                    $('#h5-Event1').text(h5Text.replace('Add Event', 'Update Event'));
                    $('#h5-Event2').text(h5Text.replace('Add Event', 'Update Event'));
                } else if (h5Text.includes('Update Event')) {
                    // If it contains "Update Event", replace it with "Add Event"
                    $('#h5-Event1').text(h5Text.replace('Update Event', 'Add Event'));
                }

                // show cursor as pointer when hovering over the table row
                $('#eventsTable tbody tr').css('cursor', 'pointer');
               
                if (data) {
                    console.log('Selected Data:', data.id);
                    console.log(data.division_name);
                    //query the database for the event details using the event id and display it in the #editEventModal
                    $.ajax({
                        url: '/get_event_details_to_edit/',
                        type: 'GET',
                        data: {
                            'event_id': data.id,
                            'division_name': data.division_name
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
                            const editFileName = fullPath.split('/').pop(); // Extract the file name from the path

                            //console.log(data.event_code);
                            //populate the editEventModal with the event details
                            $("#event-id").val(data.id);
                            $("#editOffice").val(data.office);
                            $("#division-id").val(data.division_id);
                            $("#editUnit").val(data.unit_id);
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
                            $("#editDayStart").val(data.event_day_start);
                            $("#editMonthStart").val(data.event_month_start);
                            $("#editYearStart").val(data.event_year_start);
                            $("#editTimeStart").val(data.event_time_start);
                            $("#editDStartSearchable").val(data.whole_date_start_searchable);
                            $("#editDayEnd").val(data.event_day_end);
                            $("#editMonthEnd").val(data.event_month_end);
                            $("#editYearEnd").val(data.event_year_end);
                            $("#editTimeEnd").val(data.event_time_end);
                            $("#editDEndSearchable").val(data.whole_date_end_searchable);
                            $("#division-name-id").val(data.division_name);
                            // Assuming data.file_attachment contains the file name
                            $("#fileAttachmentName").text(editFileName);

                            if (data) {
                                $("#updateButton").show(); // Show the update button
                                $("#saveButton").hide(); // Hide the save button
                            } else {
                                $("#updateButton").hide(); // Hide the update button
                                $("#saveButton").show(); // Show the save button
                            }

                            $('#modal1').modal('show');
                            //self.onDivisionChange(data.division_id);
                            const eventpID = $("#event-id").val();
                            const eventTitle = $("#event-title-input").val();
                            const eventOffice = $("#editOffice").val();
                            const eventDivision = $("#division-id").val();
                            const eventDivName = $("#division-name-id").val();
                            const eventUnit = $("#editUnit").val();
                            const eventOo = $("#editOrgOutcome").val();
                            const eventpap = $("#editPaps").val();
                            const eventLocation = $("#editLocProv").val();
                            const eventLgu = $("#event-location-lgu-id").val();
                            const eventBrgy = $("#event-location-barangay-id").val();
                            const eventDistrict = $("#editDistrict").val();
                            const eventDateStart = $("#editDateStart").val();
                            const eventDateEnd = $("#editDateEnd").val();
                            const eventAllDay = $("#customSwitch").prop('checked');
                            const eventDesc = $("#editEventDesc").val();
                            const eventParticipants = $("#editParticipants").val();
                            //const eventfile = $("#fileAttachmentName").text(fileName);
                            const eventDayStart = $("#editDayStart").val();
                            const eventMonthStart = $("#editMonthStart").val();
                            const eventYearStart = $("#editYearStart").val();
                            const eventTimeStart = $("#editTimeStart").val();
                            const eventDateStartSearchable = $("#editDStartSearchable").val();
                            const eventDayEnd = $("#editDayEnd").val();
                            const eventMonthEnd = $("#editMonthEnd").val();
                            const eventYearEnd = $("#editYearEnd").val();
                            const eventTimeEnd = $("#editTimeEnd").val();
                            const eventDateEndSearchable = $("#editDEndSearchable").val();

                            self.formData.event_pid = eventpID;
                            self.formData.event_title = eventTitle;
                            self.formData.office = eventOffice;
                            self.formData.division_id = eventDivision;
                            self.formData.division_name = eventDivName;
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
                            self.formData.file_attachment = editFileName;
                            self.formData.event_day_start = eventDayStart;
                            self.formData.event_month_start = eventMonthStart;
                            self.formData.event_year_start = eventYearStart;
                            self.formData.event_time_start = eventTimeStart;
                            self.formData.whole_date_start_searchable = eventDateStartSearchable;
                            self.formData.event_day_end = eventDayEnd;
                            self.formData.event_month_end = eventMonthEnd;
                            self.formData.event_year_end = eventYearEnd;
                            self.formData.event_time_end = eventTimeEnd;
                            self.formData.whole_date_end_searchable = eventDateEndSearchable;

                           
                        }
                    }); // end of the $.ajax()
                }
            }); // end of the $('#eventsTable tbody')

            // server side display table for division
            divTable = $('#divdataTable').DataTable({
                'processing': true,
                'serverSide': true,
                'ajax': { 
                    'url': '/get-division-details/',  // Replace with your API endpoint
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
                    {'data': 'division_name', 'searchable': true, 'sortable': true},
                    {'data': 'division_desc', 'searchable': true, 'sortable': true},
                ],
                'order': [[0, 'desc']], // Order by ID column, descending
            
            }); // end of the $('#divdataTable').DataTable()
            
            // edit data using datatable row click
            $('#divdataTable tbody').on('click', 'tr', function () {

                var data = divTable.row(this).data();

                var h5Text = $('#h5-Div').text();

                if (h5Text.includes('Add Division')) {
                    // If it contains "Update Event", replace it with "Add Event"
                    $('#h5-Div').text(h5Text.replace('Add Division', 'Update Division'));
                }

                // show cursor as pointer when hovering over the table row
                $('#divdataTable tbody tr').css('cursor', 'pointer');
               
                if (data) {
                    console.log('Selected Data:', data.id);
                    console.log(data.division_name);
                    console.log(data.division_desc);
                    //query the database for the event details using the event id and display it in the #editEventModal
            
                    //console.log(data.event_code);
                    //populate the editEventModal with the event details
                    $("#div-ID").val(data.id);
                    $("#division-name").val(data.division_name);
                    $("#division-desc").val(data.division_desc);

                    if (data) {
                        $("#div-update").show(); // Show the update button
                        $("#div-save").hide(); // Hide the save button
                    } else {
                        $("#div-update").hide(); // Hide the update button
                        $("#div-save").show(); // Show the save button
                    }

                    $('#myDivModal').modal('show');
                    
                     const divpID = $("#div-ID").val();
                     const divName = $("#division-name").val();
                     const divDesc = $("#division-desc").val();
                
                     self.divFormData.div_pid = divpID;
                     self.divFormData.division_name = divName;
                     self.divFormData.division_desc = divDesc;
                    // self.formData.division_id = eventDivision;
                    // self.formData.division_name = eventDivName;                
                      
                }
            }); // end of the $('#divdataTable tbody')

        // server side display table for unit
        unitTable = $('#unitdataTable').DataTable({
            'processing': true,
            'serverSide': true,
            'ajax': { 
                'url': '/units/get-unit-details/',  // Replace with your API endpoint
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
                {'data': 'unit_name', 'searchable': true, 'sortable': true},
                {'data': 'description', 'searchable': true, 'sortable': true},
                {'data': 'division_name', 'searchable': true, 'sortable': true},
                {'data': 'division_id', 'searchable': true, 'sortable': true},
            ],
            columnDefs: [
                {
                    targets: [4],
                    visible: false
                }
            ],
            'order': [[0, 'desc']], // Order by ID column, descending
        
        }); // end of the $('#unitdataTable').DataTable()

        // edit unit data using datatable row click
        $('#unitdataTable tbody').on('click', 'tr', function () {

            var data = unitTable.row(this).data();

            var h5Text = $('#h5-Unit').text();

            if (h5Text.includes('Add Unit')) {
                // If it contains "Update Event", replace it with "Add Event"
                $('#h5-Unit').text(h5Text.replace('Add Unit', 'Update Unit'));
            }

            // show cursor as pointer when hovering over the table row
            $('#unitdataTable tbody tr').css('cursor', 'pointer');
            
            if (data) {
                
                console.log('Selected Data:', data.id);
                console.log(data.division_name);
                console.log(data.division_desc);
                //query the database for the event details using the event id and display it in the #editEventModal
        
                //console.log(data.event_code);
                //populate the editEventModal with the event details
                $("#unit-ID").val(data.id);
                $("#id-unitName").val(data.unit_name);
                $("#id-unitDesc").val(data.description);
                $("#div-name-id").val(data.division_name);
                $("#divList-id").val(data.division_id);

                if (data) {
                    $("#unit-update").show(); // Show the update button
                    $("#unit-save").hide(); // Hide the save button
                } else {
                    $("#unit-update").hide(); // Hide the update button
                    $("#unit-save").show(); // Show the save button
                }

                $('#myUnitModal').modal('show');
                
                    const unitpID = $("#unit-ID").val();
                    const unitName = $("#id-unitName").val();
                    const unitDesc = $("#id-unitDesc").val();
                    const unitDivId = $("#divList-id").val();
                    const unitDivName = $("#div-name-id").val();
            
                    self.unitFormData.unit_pid = unitpID;
                    self.unitFormData.unit_name = unitName;
                    self.unitFormData.description = unitDesc;
                    self.unitFormData.division_id = unitDivId;
                    self.unitFormData.division_name = unitDivName;
                // self.formData.division_id = eventDivision;
                // self.formData.division_name = eventDivName; 
                    
            }
        }); // end of the $('#unitdataTable tbody')

        // server side display table for unit
        ooTable = $('#oodataTable').DataTable({
            'processing': true,
            'serverSide': true,
            'ajax': { 
                'url': '/orgoutcomes/get-oo-details/',  // Replace with your API endpoint
                'type': 'GET',
            },
            'dom': 'Bfrtip<"clear">l',        // Add this to enable export buttons
            'buttons': [
                {
                    extend: 'copy',
                    exportOptions: {
                        //columns: ':not(:first-child)' // Excludes the first column from copy
                    }
                },
                {
                    extend: 'csv',
                    exportOptions: {
                        //columns: ':not(:first-child)' // Excludes the first column from CSV export
                    }
                },
                {
                    extend: 'excel',
                    exportOptions: {
                        //columns: ':not(:first-child)' // Excludes the first column from Excel export
                    }
                },
                {
                    extend: 'pdf',
                    exportOptions: {
                        //columns: ':not(:first-child)' // Excludes the first column from PDF export
                    }
                },
                {
                    extend: 'print',
                    exportOptions: {
                        //columns: ':not(:first-child)' // Excludes the first column when printing
                    }
                },
            ],

            'columns': [
                {'data': 'id', 'sortable': true, 'searchable': false},
                {'data': 'org_outcome', 'searchable': true, 'sortable': true},
                {'data': 'description', 'searchable': true, 'sortable': true}
            ],

            'order': [[0, 'desc']], // Order by ID column, descending
        
        }); // end of the $('#oodataTable').DataTable()


        // edit orgoutcome
        $('#oodataTable tbody').on('click', 'tr', function () {

            var data = ooTable.row(this).data();

            var h5Text = $('#h5-Oo').text();

            if (h5Text.includes('Add Organizational Outcome')) {
                // If it contains "Add Organizational Outcome", replace it with "Update Organizational Outcome"
                $('#h5-Oo').text(h5Text.replace('Add Organizational Outcome', 'Update Organizational Outcome'));
            }
            
            // show cursor as pointer when hovering over the table row
            $('#oodataTable tbody tr').css('cursor', 'pointer');
            
            if (data) {
                
                console.log('Selected Data:', data.id);
                console.log(data.org_outcome);
                console.log(data.description);
                //query the database for the event details using the event id and display it in the #editEventModal
    
                //populate the editEventModal with the event details
                $("#oo-ID").val(data.id);
                $("#id-orgoutcome").val(data.org_outcome);
                $("#id-oodesc").val(data.description);
    
                if (data) {
                    $("#oo-update").show(); // Show the update button
                    $("#oo-save").hide(); // Hide the save button
                } else {
                    $("#oo-update").hide(); // Hide the update button
                    $("#oo-save").show(); // Show the save button
                }

                $('#orgOutcomeModal').modal('show');
                
                const oopID = $("#oo-ID").val();
                const ooName = $("#id-orgoutcome").val();
                const ooDesc = $("#id-oodesc").val();
        
                self.orgFormData.oo_pid = oopID;
                self.orgFormData.org_outcome = ooName;
                self.orgFormData.description = ooDesc;
                    
            }
        }); // end of the $('#oodataTable tbody')

        // server side display table for paps
        papTable = $('#papdataTable').DataTable({
            'processing': true,
            'serverSide': true,
            'ajax': { 
                'url': '/paps/get-paps-details/',  // Replace with your API endpoint
                'type': 'GET',
            },
            'dom': 'Bfrtip<"clear">l',        // Add this to enable export buttons
            'buttons': [
                {
                    extend: 'copy',
                    exportOptions: {
                        //columns: ':not(:first-child)' // Excludes the first column from copy
                    }
                },
                {
                    extend: 'csv',
                    exportOptions: {
                        //columns: ':not(:first-child)' // Excludes the first column from CSV export
                    }
                },
                {
                    extend: 'excel',
                    exportOptions: {
                        //columns: ':not(:first-child)' // Excludes the first column from Excel export
                    }
                },
                {
                    extend: 'pdf',
                    exportOptions: {
                        //columns: ':not(:first-child)' // Excludes the first column from PDF export
                    }
                },
                {
                    extend: 'print',
                    exportOptions: {
                        //columns: ':not(:first-child)' // Excludes the first column when printing
                    }
                },
            ],

            'columns': [
                {'data': 'id', 'sortable': true, 'searchable': false},
                {'data': 'pap', 'searchable': true, 'sortable': true},
                {'data': 'description', 'searchable': true, 'sortable': true},
                {'data': 'oo_name', 'searchable': true, 'sortable': true},
                {'data': 'org_outcome_id', 'searchable': true, 'sortable': true}
            ],

            'order': [[0, 'desc']], // Order by ID column, descending
        
        }); // end of the $('#oodataTable').DataTable()

        // edit pap data using datatable row click
        $('#papdataTable tbody').on('click', 'tr', function () {

            var data = papTable.row(this).data();

            var h5Text = $('#h5-Paps').text();

            if (h5Text.includes('Add Program and Project')) {
                // If it contains "Update Event", replace it with "Add Event"
                $('#h5-Paps').text(h5Text.replace('Add Program and Project', 'Update Program and Project'));
            }

            // show cursor as pointer when hovering over the table row
            $('#papdataTable tbody tr').css('cursor', 'pointer');
            
            if (data) {
                
                console.log('Selected Data:', data.id);
                console.log(data.pap);
                console.log(data.description);
                //query the database for the event details using the event id and display it in the #editEventModal
        
                //console.log(data.event_code);
                //populate the editEventModal with the event details
                $("#pap-ID").val(data.id);
                $("#id-pap").val(data.pap);
                $("#id-papdesc").val(data.description);
                $("#orgOutcome-id").val(data.org_outcome_id);
                $("#oo-name-id").val(data.oo_name);

                if (data) {
                    $("#pap-update").show(); // Show the update button
                    $("#pap-save").hide(); // Hide the save button
                } else {
                    $("#pap-update").hide(); // Hide the update button
                    $("#pap-save").show(); // Show the save button
                }

                $('#papsModal').modal('show');
                
                    const pappID = $("#pap-ID").val();
                    const papName = $("#id-pap").val();
                    const papDesc = $("#id-papdesc").val();
                    const papOrgId = $("#orgOutcome-id").val();
                    const papOrgName = $("#oo-name-id").val();
            
                    self.papsFormData.pap_pid = pappID;
                    self.papsFormData.pap = papName;
                    self.papsFormData.description = papDesc;
                    self.papsFormData.org_outcome_id = papOrgId;
                    self.papsFormData.oo_name = papOrgName;
                // self.formData.division_id = eventDivision;
                // self.formData.division_name = eventDivName; 
                    
            }
        }); // end of the $('#papdataTable tbody')

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
        // fetch unit data
        this.fetchUnitData();
    } // end of the mounted() function

});

app.mount('#app');
