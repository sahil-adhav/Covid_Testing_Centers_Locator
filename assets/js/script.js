//Not using  var states. Instead getting value directly from user selection.

// var states = ["arizona", "california", "delaware", "florida", "massachusetts", "nevada", "new-jersey", "new-york", "pennsylvania", "texas", "utah", "washington"]; //an array of states. Add

    //changed function name
    function getLocation() {
        var stateSelection = $("#stateSelection").val();
        console.log($("#stateSelection"));
        console.log(document.getElementById("stateSelection"));
        var zoom;
        if(stateSelection == "State"){
            stateSelection = "USA";
            zoom = 4;
         }
        //moved queryURL into function.
        var queryURL = "https://covid-19-testing.github.io/locations/" + stateSelection + "/complete.json";
        // console.log($("#stateSelection").value);

        //empties state location every time new state is selected.
        $("#appendLocations").empty()

        // Google Maps API - generates map on state selected from drop down
        var map;
        $.ajax({
            url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + stateSelection + "&key=AIzaSyCNTqY8YLLPTLLEL4RHISF8IHShThD3QQs",
            method: "GET",
            data: zoom,stateSelection
        }).then(function(latLongData) {

            // Converts state to latitude & longitude
            var latitude = latLongData.results[0].geometry.location.lat;
            var longitude = latLongData.results[0].geometry.location.lng;
            var stateLatLng = {lat: latitude, lng: longitude };
            if(stateSelection !== "USA")
                zoom = 6;
            map = new google.maps.Map(document.getElementById("map"), {
                center: stateLatLng,
                zoom: zoom
            });
        })

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (statesData) {
            console.log(statesData);
            console.log(statesData.length);
            //Building all organization names and address to feed into google call; We'll need to know all in the array before we kick off google api call to create the marker labels
            var data = [];
            var divNum = 0;
            for (var i = 0; i < statesData.length; i++) {
                var org = statesData[i].alternate_name;
                if(statesData[i].physical_address.length !==0){
                    var add = statesData[i].physical_address[0].address_1 + ", " + statesData[i].physical_address[0].city + ", "+ statesData[i].physical_address[0].state_province + " " + statesData[i].physical_address[0].postal_code;
                    var formattedAdd = statesData[i].physical_address[0].address_1;
                }
                data.push({name: org, address: add,formatAdd: formattedAdd, div: divNum});
                divNum++;
            }
            console.log(data);
            //Used for assigning id to created divs below
            var idCount = 0;
            // EXTRACT CODE INTO VARIABLES HERE
            for (var i = 0; i < statesData.length; i++) {
                console.log("Gathering data");
                //Create elements
                var div = $("<div>").attr("class", "uk-card uk-card-hover uk-animation-slide-bottom uk-card-default uk-card-body uk-width-1-1");
                var pTag = $("<p>").attr("class", "uk-card-title");
                var pTag2 = $("<p>");
                var pTag3 = $("<p>");
                var pTag4 = $("<p>");
                //Gather info
                var locName = statesData[i].alternate_name;
                if(statesData[i].physical_address.length !==0){
                    var street = statesData[i].physical_address[0].address_1;
                    var city = statesData[i].physical_address[0].city;
                    var postalCode = statesData[i].physical_address[0].postal_code;
                    var state = statesData[i].physical_address[0].state_province;
                    var address = street + ", " + city + ", " + state + " " + postalCode;
                }
                if(statesData[i].phones.length !== 0)
                    var phone = statesData[i].phones[0].number;
                var openHour = [];
                var buildTimes = "";
                // Build an array of objects for hours of operations
                for (var x = 0; x < statesData[i].regular_schedule.length; x++) {
                    openHour.push({ times: "", day: "" });
                    openHour[x].times = statesData[i].regular_schedule[x].opens_at + "-" + statesData[i].regular_schedule[x].closes_at;
                    openHour[x].day = statesData[i].regular_schedule[x].weekday;
                    // console.log("Retrieving schedule");
                }
                //Fill created p tag and append to  div item
                pTag.html(locName);
                pTag2.html("Address: " + address);
                pTag4.html("Phone: " + phone);

                // //Since the days come in integers we must switch them to days
                // console.log(openHour.length);
                for (var x = 0; x < openHour.length; x++) {
                    if (openHour[x].day == 1) {
                        openHour[x].day = "Mon. | ";
                    }
                    else if (openHour[x].day == 2) {
                        openHour[x].day = "Tues. | "
                    }
                    else if (openHour[x].day == 3) {
                        openHour[x].day = "Wed. | ";
                    }
                    else if (openHour[x].day == 4) {
                        openHour[x].day = "Thurs. | ";
                    }
                    else if (openHour[x].day == 5) {
                        openHour[x].day = "Fri. | ";
                    }
                    else if (openHour[x].day == 6) {
                        openHour[x].day = "Sat. | ";
                    }
                    else if (openHour[x].day == 7) {
                        openHour[x].day = "Sun. | ";
                    }
                    // console.log(openHour[x].day);
                }
                // //Loops through State Data to get hour of operation times and days
                for (var x = 0; x < openHour.length; x++) {
                    buildTimes += openHour[x].times + " " + openHour[x].day + "\n";
                    // console.log(x + "building time");
                }
                if (buildTimes == "") {
                    buildTimes = "Hours Not Available";
                }
                pTag3.html("Hours: " + buildTimes);
                // //Append Loc, Address, Phone & Hours
                div.append(pTag, pTag2, pTag4, pTag3);
                // Adds a id to created div
                var divId = "div"+idCount;
                div.attr("id", divId);
                idCount++;
                //Append list item to page
                $("#appendLocations").append(div);
                // console.log("Appended");
                // Google Maps API - drops markers and info on test locations; Pass in data array for label windows
                $.ajax({
                    url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + data[i].address + "&key=AIzaSyCNTqY8YLLPTLLEL4RHISF8IHShThD3QQs",
                    method: "GET",
                    data: data
                }).then(function(latLongData) {
                    console.log(latLongData);
                    var formattedAdd = latLongData.results[0].address_components[0].short_name + " " +latLongData.results[0].address_components[1].short_name;
                    // Converts address to latitude & longitude
                    var latitude = latLongData.results[0].geometry.location.lat;
                    var longitude = latLongData.results[0].geometry.location.lng;
                    var testLocation = {lat: latitude, lng: longitude };
                    console.log(latitude);
                    console.log(longitude);
                    //Drops a pin at location
                    var marker = new google.maps.Marker({
                        position: testLocation,
                        map: map,
                        animation: google.maps.Animation.DROP});
                    var contentString = {content: "",div: ""}
                    //Creates information window for marker
                    //Iterates through data array which holds our org names and addresses in object form
                    for(var x=0; x < data.length; x++){
                        //Temp variables to compare
                        var tempStringData = "";
                        var tempStringFormatAdd = "";
                        //For loop to build first 4 address digits
                        for(var y=0; y < 4; y++){
                            //Feeds in one char at a time to temp variables
                            tempStringData += data[x].address.charAt(y);
                            tempStringFormatAdd += formattedAdd.charAt(y);
                        }
                        //If the first 4 address digits match then this must be the org's location
                        if(tempStringData == tempStringFormatAdd){
                            //Adds the org name + address to our label
                            contentString.content ="<div class=\"uk-text-center\">"+ data[x].name + "</div><div>"+data[x].address+"</div>"+"<a target=\"_blank\" href=\"http://www.google.com/search?&q="+data[x].name+"+"+data[x].address + "\">Search Location</a>";
                            //Returns the div id and stores it in contentString object w/ property div
                            contentString.div = "div"+data[x].div;
                        }
                    }
                    // console.log(elmnt);
                    var infowindow = new google.maps.InfoWindow({
                        content: contentString.content
                    });
                    //Creating on click for location description
                    marker.addListener("click", function() {
                        infowindow.open(map, this);
                        //Gathers the top position of created div and enables us to scroll to that position
                        var topPos = document.getElementById(contentString.div).offsetTop;
                        document.getElementById("scroll").scrollTop = topPos;
                    });
                });
            }
        });
    }

//US Stats tracker API below

    var statsURL = "https://api.covid19api.com/total/country/india";  //https://api.covid19api.com/total/country/united-states

// console.log(statsURL)

$.ajax({
    url: statsURL,
    method: "GET"
}).then(function(statsAmerica) {

    // console.log(statsAmerica[statsAmerica.length-1]);

    console.log(statsAmerica[statsAmerica.length-1].Confirmed)
    $(".confirmed").text(thousands_separators(statsAmerica[statsAmerica.length-1].Confirmed));

    console.log(statsAmerica[statsAmerica.length-1].Deaths)
    $(".deaths").text(thousands_separators(statsAmerica[statsAmerica.length-1].Deaths));

    console.log(statsAmerica[statsAmerica.length-1].Recovered)
    $(".recovered").text(thousands_separators(statsAmerica[statsAmerica.length-1].Recovered));

    console.log(statsAmerica[statsAmerica.length-1].Active)
    $(".active").text(thousands_separators(statsAmerica[statsAmerica.length-1].Active));

    var ctx = document.getElementById('myChart').getContext('2d');
                    var myDoughnutChart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Deaths', 'Recovered', 'Active'],
                            datasets: [{
                                label: '%',
                                data: [
                                        statsAmerica[statsAmerica.length-1].Deaths,
                                        statsAmerica[statsAmerica.length-1].Recovered,
                                        statsAmerica[statsAmerica.length-1].Active],
                                backgroundColor: [
                                    'rgb(255, 99, 132)',
                                    'rgb(54, 162, 235)',
                                    'rgb(255, 205, 86)',
                                ],
                                borderColor: [
                                    '#fff',
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            rotation: -0.5 * Math.PI,
                            circumference: 2 * Math.PI,
                        }
                    });

});
//W3 function to add commas
function thousands_separators(num)
  {
    var num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }
