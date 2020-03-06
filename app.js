async function GetLocations(startLocation, endLocation) {
    startLocation = encodeURIComponent(startLocation);
    endLocation = encodeURIComponent(endLocation);
    // var response = await fetch(`https://open.mapquestapi.com/directions/v2/route?key=UIyBXWhvrdRUNfGmAGD4U4sR5FGtykWq&fullShape=true&from=${startLocation}&to=${endLocation}`);
    var response = await fetch(`https://open.mapquestapi.com/directions/v2/route?key=UIyBXWhvrdRUNfGmAGD4U4sR5FGtykWq&fullShape=false&generlize=1&doReverseGeocode=true&from=${startLocation}&to=${endLocation}`);
    var responseJson = await response.json();
    console.log("first request response", responseJson);
    // var routePoints = await fetch(`https://open.mapquestapi.com/directions/v2/routeshape?key=UIyBXWhvrdRUNfGmAGD4U4sR5FGtykWq&fullShape=true&sessionId=${responseJson.route.sessionId}`);
    var routePoints = await fetch(`https://open.mapquestapi.com/directions/v2/routeshape?key=UIyBXWhvrdRUNfGmAGD4U4sR5FGtykWq&fullShape=true&sessionId=${responseJson.route.sessionId}`);
    // Session ID?
    var routePointsJson = await routePoints.json();
    console.log(routePointsJson);
    var gpsCoordinates = routePointsJson.route.shape.shapePoints;
    console.log(gpsCoordinates);
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
    

}

    async function GetGeo(latitude, longitude) {
        let url = await fetch(`https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?prox=${latitude}%2C${longitude}%2C3000&mode=retrieveAddresses&maxresults=1&gen=9&apiKey=Sqppyp13Y687AczP7Aw-2qZMXksmAz6isqVUFbq-wxo`);
    
        let jsonResponse = await url.json();
        let address = jsonResponse.Response.View[0].Result[0].Location.Address;
        return {'city': address.City, 'state': address.State}
    };



var app = new Vue({
    el: '#app',
    data: {
        //ishidden: false,

        startLocation: "St George",
        endLocation: "Logan",
        checkpoints: 10,
      
        testdata: "Vue is working",
 
    },

    methods: {

        getLocations: async function() {
            var locations = await GetLocations(this.startLocation, this.endLocation);
            var filteredlocations = await GetCheckPoints(locations, this.checkpoints);
            for (index in filteredlocations) {
                console.log(filteredlocations[index]);
                filteredlocations[index].name = await GetGeo(filteredlocations[index].coordinate.latitude, filteredlocations[index].coordinate.longitude);
            }
            console.log("filtered", filteredlocations)
            var gps = await GetGeo(locations[0].latitude, locations[0].longitude);
            console.log("locations", locations);
            console.log("gps", gps );
            console.log(this.checkpoints);
        }

    },

    created: function () {
        console.log("Vue is Ready.");
    }
})