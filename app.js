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
    // Session ID?
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

    async function getWeatherForecastForLocation(latitude, longitude) {
        let forecast =`https://weather.ls.hereapi.com/weather/1.0/report.json?product=forecast_hourly&latitude=${latitude}&longitude=${longitude}&oneobservation=true&apiKey=${hereKey}&metric=false`
        let forcastResponse = await fetch(forecast);
        let forcastJsonRespnse = await forcastResponse.json();

        return forcastJsonRespnse.hourlyForecasts.forecastLocation.forecast
        

    };

    function DateToIsoDate(date) {
        return date.toISOString().split("T")[0]
    };

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    // async function loopThurDates() {
    //     let inputDate = userDate;
    //     let hereDate = `https://weather.ls.hereapi.com/weather/1.0/report.json?product=forecast_7days&latitude=${latitude}&longitude=${longitude}&oneobservation=true&apiKey=${hereKey}&metric=false`
    //     let hereDateResponse = await fetch(hereDate);
    //     let hereDateJsonResponse = await hereDateResponse.json();


    // }
 



var app = new Vue({
    el: '#app',
    data: {

        startLocation: "St George",
        endLocation: "Logan",
        checkpoints: 0,
        filteredlocations: [],
        dayoftravel: DateToIsoDate(new Date()),
        minDateOfTravel: DateToIsoDate(new Date()),
        maxDateOfTravel: DateToIsoDate(new Date().addDays(15)),
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
                //console.log(filteredlocations[index]);
                filteredlocations[index].name = await GetGeo(filteredlocations[index].coordinate.latitude, filteredlocations[index].coordinate.longitude);
                //filteredlocations[index].forcast = await getWeatherForecastForLocation(filteredlocations[index].coordinate.latitude, filteredlocations[index].coordinate.longitude);
                
            }
            this.filteredlocations = filteredlocations;
            console.log("filtered", filteredlocations);
    


            //console.log(filteredlocations[1].name.city)
            //var gps = await GetGeo(locations[0].latitude, locations[0].longitude);
            //console.log("locations", locations);
            //console.log("gps", gps );
            this.isSecondPage = true,
            this.isMainPage = false,
            this.isThirdPage = false
            
        },
        backButton1: function () {
                this.SecondPage = false,
                this.isMainPage = true,
                this.isThirdPage = false
        },

        backButton2: function () {
            this.isThirdPage = false,
            this.SecondPage = true,
            this.isMainPage = false
    },
        formatDate: function (userDate) {
            return moment(userDate).format();

        },

        moreInfo: function () {
            this.isMainPage = false,
            this.SecondPage = false,
            this.isThirdPage = true
        }

    },

    created: function () {
        console.log("Vue is Ready.");
    }
})