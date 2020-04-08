const hereKey = "Sqppyp13Y687AczP7Aw-2qZMXksmAz6isqVUFbq-wxo"

async function GetLocations(startLocation, endLocation) {
    startLocation = encodeURIComponent(startLocation);
    endLocation = encodeURIComponent(endLocation);
    // var response = await fetch(`https://open.mapquestapi.com/directions/v2/route?key=UIyBXWhvrdRUNfGmAGD4U4sR5FGtykWq&fullShape=true&from=${startLocation}&to=${endLocation}`);
    var response = await fetch(`https://open.mapquestapi.com/directions/v2/route?key=UIyBXWhvrdRUNfGmAGD4U4sR5FGtykWq&fullShape=false&generlize=1&doReverseGeocode=true&from=${startLocation}&to=${endLocation}`);
    var responseJson = await response.json();
    //console.log("first request response", responseJson);
    // var routePoints = await fetch(`https://open.mapquestapi.com/directions/v2/routeshape?key=UIyBXWhvrdRUNfGmAGD4U4sR5FGtykWq&fullShape=true&sessionId=${responseJson.route.sessionId}`);
    var routePoints = await fetch(`https://open.mapquestapi.com/directions/v2/routeshape?key=UIyBXWhvrdRUNfGmAGD4U4sR5FGtykWq&fullShape=true&sessionId=${responseJson.route.sessionId}`);
    var routePointsJson = await routePoints.json();
    //console.log(routePointsJson);
    var gpsCoordinates = routePointsJson.route.shape.shapePoints;
    //console.log(gpsCoordinates);
    var processedPoints = [];
    while (gpsCoordinates.length > 0) {
        let nextTuple = gpsCoordinates.splice(0,2);
        processedPoints.push({"latitude":nextTuple[0], "longitude":nextTuple[1]});
    }
    return processedPoints;
};

async function GetCheckPoints(processedPoints, checkpoints) {
    let step = Math.floor(processedPoints.length / (checkpoints));
    let firstLocation = {'coordinate': processedPoints[0], name:''};
        locations = [firstLocation];
        for(let i=step, index=0; index < (checkpoints -2); i += step, index++) { 
            locations.push({'coordinate':processedPoints[i], name:''});
        }
        locations.push({'coordinate': processedPoints[processedPoints.length-1], name:''});
        return locations;
    

};

    async function GetGeo(latitude, longitude) {
        let url = await fetch(`https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?prox=${latitude}%2C${longitude}%2C3000&mode=retrieveAddresses&maxresults=1&gen=9&apiKey=${hereKey}`);
        let jsonResponse = await url.json();
        let address = jsonResponse.Response.View[0].Result[0].Location.Address;
        return {'city': address.City, 'state': address.State}
    };



    //does the date match and grab all the hours. just matching date

    async function getDaySegmentWeatherForecastForLocation(latitude, longitude) {
        let segment =`https://weather.ls.hereapi.com/weather/1.0/report.json?product=forecast_7days&latitude=${latitude}&longitude=${longitude}&oneobservation=true&apiKey=${hereKey}&metric=false`
        let segmentResponse = await fetch(segment);
        let segmentJsonResponse = await segmentResponse.json();

        return segmentJsonResponse.forecasts.forecastLocation.forecast
        
    };

    function dateSegment(dayoftravel, findDate){
        let apiFoundDate = findDate[0];
        dayWeatherSegment = []
        for(index = 0; index < findDate.length; index++){
            if (dayoftravel == findDate[index].utcTime.split("T")[0]){
                if (findDate[index].daySegment != "Night"){
                    dayWeatherSegment.push(findDate[index]);
            }}
        };

        return dayWeatherSegment
            
    };

    //Function that passes the data returned from day segements , pass in day of travel
    //if date = and daysegment then return and(daySegment is not evening)

    function DateToIsoDate(date) {
        return date.toISOString().split("T")[0]
    };

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    };
 



var app = new Vue({
    el: '#app',
    data: {

        startLocation: "St George",
        endLocation: "Logan",
        checkpoints: 0,
        filteredlocations: [],
        dayoftravel: DateToIsoDate(new Date()),
        minDateOfTravel: DateToIsoDate(new Date()),
        maxDateOfTravel: DateToIsoDate(new Date().addDays(5)),
        isSecondPage: false,
        isThirdPage: false,
        isMainPage: true,

        
      
 
    },

    methods: {

        getLocations: async function() {
            console.log(this.checkpoints);
            console.log(this.dayoftravel)
            var locations = await GetLocations(this.startLocation, this.endLocation);
            var filteredlocations = await GetCheckPoints(locations, this.checkpoints);
            //this.filteredlocations = filteredlocations;
            for (index in filteredlocations) {
               
                filteredlocations[index].name = await GetGeo(filteredlocations[index].coordinate.latitude, filteredlocations[index].coordinate.longitude);
                filteredlocations[index].forcast = dateSegment(this.dayoftravel, await getDaySegmentWeatherForecastForLocation(filteredlocations[index].coordinate.latitude, filteredlocations[index].coordinate.longitude));
    
            }
            this.filteredlocations = filteredlocations;
            console.log("filtered", filteredlocations);
         

            this.isSecondPage = true,
            this.isMainPage = false,
            this.isThirdPage = false
            
        },

        backgroundColorFunction: function (forcastObject) {
            alert = ["Thunderstorms", "Tornado", "Heavy Rain", "Lots of Rain", "Tons of Rain", "Flash Floods", "Strong Thunderstorms", "Severe Thunderstorms", "Hail", "Tropical Storm", "Hurricane", "Blizzard","Heavy Snow", "Snowstorm"  ]
            rain = ["a few showers", "Rain", "Heavy Rain", "Drizzle", "Sprinkles", "Scattered Showers", "Light Showers", "Passing Showers", "Light Rain", "Rain Showers", "Numerous Showers", "Showery", "Widely Scattered TStorms", "Isolated TStorms", "A Few TStorms", "Thundershowers", "Thunderstorms", "Mixture of Precip", "Heavy Mixture of Precip"] 
            snow = ["Sleet", "Snow", "Icy Mix", "Freezing Rain", "Snow Changing to Rain", "Snow Changing to an Icy Mix", "An Icy Mix Changing to Snow", "An Icy Mix Changing to Rain", "Rain Changing to Snow", "Scattered Flurries", "Rain Changing to an Icy Mix", "Snow Flurries", "Light Snow Showers", "Snow Showers", "Light Snow", "Moderate Snow" ]
            
            if (alert.indexOf(forcastObject.precipitationDesc) >= 0) {
                return "alert"
                
            }
            if (rain.indexOf(forcastObject.precipitationDesc) >= 0) {
            
                return "rain"
            }
            if (snow.indexOf(forcastObject.precipitationDesc) >= 0) {
                return "snow"
            }
            else { 
                return "normal"
            }

        },

        iconText: function() {
        if (element.classList.contains('rain')) {
            
          }
        },

        backButton1: function () {
                this.isSecondPage = false,
                this.isMainPage = true,
                this.isThirdPage = false
        },

        backButton2: function () {
            this.isThirdPage = false,
            this.isSecondPage = true,
            this.isMainPage = false
    },
        formatDate: function (userDate) {
            return moment(userDate).format();

        },

        moreInfo: function () {
            this.isMainPage = false,
            this.isSecondPage = false,
            this.isThirdPage = true
        },

        minusButton: function () {
            event.preventDefault();
            const currentValue = Number(inputField.value) || 0;
            inputField.value = currentValue - 1;
        },
          
        addButton: function () {
            event.preventDefault();
            const currentValue = Number(inputField.value) || 0;
            inputField.value = currentValue + 1;
          
        },
    },

    created: function () {
        console.log("Vue is Ready.");
    }
})