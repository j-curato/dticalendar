// var app = new Vue({
//     delimiters: ['{[', ']}'], // Change Vue.js delimiters to avoid conflicts with Django template tags
//     el: '#app',
const app = Vue.createApp({
    delimiters: ['{[', ']}'], // Change Vue.js delimiters to avoid conflicts with Django template tags
    data() {
        return {
            message: '',
            
        };
    },
    created() {
       

    },
    methods: {

    }, // end of methods
    mounted() {


    } // end of the mounted() function

});

app.mount('#app');
