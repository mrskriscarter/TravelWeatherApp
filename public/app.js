const hereKey = "Sqppyp13Y687AczP7Aw-2qZMXksmAz6isqVUFbq-wxo"


// GET LONGITUDE AND LATITUDE LOCATIONS 
async function GetLocations(startLocation, endLocation) {
    startLocation = encodeURIComponent(startLocation);
    endLocation = encodeURIComponent(endLocation);
    var response = await fetch(`https://open.mapquestapi.com/directions/v2/route?key=UIyBXWhvrdRUNfGmAGD4U4sR5FGtykWq&fullShape=false&generlize=1&doReverseGeocode=true&from=${startLocation}&to=${endLocation}`);
    var responseJson = await response.json();
    var routePoints = await fetch(`https://open.mapquestapi.com/directions/v2/routeshape?key=UIyBXWhvrdRUNfGmAGD4U4sR5FGtykWq&fullShape=true&sessionId=${responseJson.route.sessionId}`);
    var routePointsJson = await routePoints.json();
    var gpsCoordinates = routePointsJson.route.shape.shapePoints;
    var processedPoints = [];

    while (gpsCoordinates.length > 0) {
        let nextTuple = gpsCoordinates.splice(0,2);
        processedPoints.push({"latitude":nextTuple[0], "longitude":nextTuple[1]});
    }
    return processedPoints;
};

// CHECK POINTS
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

// REVERSE GEOCODE
    async function GetGeo(latitude, longitude) {
        let url = await fetch(`https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?prox=${latitude}%2C${longitude}%2C3000&mode=retrieveAddresses&maxresults=1&gen=9&apiKey=${hereKey}`);
        let jsonResponse = await url.json();
        let address = jsonResponse.Response.View[0].Result[0].Location.Address;
        return {'city': address.City, 'state': address.State}
    };


//GET Segment Weather Data
    async function getDaySegmentWeatherForecastForLocation(latitude, longitude) {
        let segment =`https://weather.ls.hereapi.com/weather/1.0/report.json?product=forecast_7days&latitude=${latitude}&longitude=${longitude}&oneobservation=true&apiKey=${hereKey}&metric=false`;
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

// GET Hourly Weather Data
    async function getHourlyWeatherForecastForLocation(latitude, longitude) {
        let hourly =`https://weather.ls.hereapi.com/weather/1.0/report.json?product=forecast_hourly&latitude=${latitude}&longitude=${longitude}&oneobservation=true&apiKey=${hereKey}&metric=false`;
        let hourlyResponse = await fetch(hourly);
        let hourlyJsonResponse = await hourlyResponse.json();

        return hourlyJsonResponse.hourlyForecasts.forecastLocation.forecast 
    };  


    function hourlyDate(dayoftravel, hourlyForecasts) {
        hourlydayWeatherSegment = [];
        for(index = 0; index < hourlyForecasts.length; index++){
            if (dayoftravel == hourlyForecasts[index].utcTime.split("T")[0]){
                    hourlydayWeatherSegment.push(hourlyForecasts[index]);
            }
        };
        return hourlydayWeatherSegment
    };


// Date Functions
    function DateToIsoDate(date) {
        return date.toISOString().split("T")[0]
    };

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    };

// Rain Hour Function
    function getRain(hourlyForecasts) {
        raindata = []
        for(index = 0; index < hourlyForecasts.length; index++){
            var HourlyTime = hourlyForecasts[index].localTime.substring(0,2);
            var RainProb = hourlyForecasts[index].rainFall != '*' ? hourlyForecasts[index].precipitationProbability : 0;
            raindata.push({'HourlyTime': HourlyTime, 'RainProb': RainProb});

        }
        return raindata;
    };
 
    // Snow Hour Function
    function getSnow(hourlyForecasts) {
        snowdata = []
        for(index = 0; index < hourlyForecasts.length; index++){
            var HourlyTime = hourlyForecasts[index].localTime.substring(0,2);
            var SnowProb = hourlyForecasts[index].SnowProb != '*' ? hourlyForecasts[index].precipitationProbability : 0;
            snowdata.push({'HourlyTime': HourlyTime, 'SnowProb': SnowProb});

        }
        return snowdata;
    };
 




var app = new Vue({
    el: '#app',
    data: {

        startLocation: "St George UT",
        endLocation: "Logan UT",
        checkpoints: 0,
        filteredlocations: [],
        dayoftravel: DateToIsoDate(new Date()),
        minDateOfTravel: DateToIsoDate(new Date()),
        maxDateOfTravel: DateToIsoDate(new Date().addDays(5)),
        isSecondPage: false,
        isThirdPage: false,
        isMainPage: true,
        hourlydata: [],
        threeHourTemp: [],
        cityName: ""
    
 
    },

    methods: {

        //FIRST ON CLICK - FIRST PAGE TO SECOND PAGE -
        getLocations: async function() {
            var locations = await GetLocations(this.startLocation, this.endLocation);
            var filteredlocations = await GetCheckPoints(locations, this.checkpoints);
            
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

        // SECOND ON CLICK - SECOND PAGE TO THIRD PAGE -
        moreInfo: async function (coordinate, name) {
            var morelocations = hourlyDate(this.dayoftravel, await getHourlyWeatherForecastForLocation(coordinate.latitude, coordinate.longitude));
            this.hourlydata = morelocations;
            this.threeHourTemp = []
            this.cityName = name

            for (index=6; index<=21; index+=3) {
                this.threeHourTemp.push({Temp:Math.floor(this.hourlydata[index].temperature), Hour:index})
            }

            var RainData = getRain(morelocations);
            var SnowData = getSnow(morelocations);


            this.isMainPage = false,
            this.isSecondPage = false,
            this.isThirdPage = true,
            this.createRainChart('rainprop', RainData);
            this.createSnowChart('snowprop', SnowData);
        },

        // BACKGROUND COLOR FUNCTION DEPENDS ON WEATHER
        backgroundColorFunction: function (forcastObject) {
            alert = ["Thunderstorms", "Tornado", "Heavy rain", "Lots of rain", "Tons of rain", "Flash floods", "Strong thunderstorms", "Severe thunderstorms", "Hail", "Tropical storm", "Hurricane", "Blizzard","Heavy snow", "Snowstorm"  ]
            rain = ["a few showers", "Rain", "Heavy rain", "Drizzle", "Sprinkles", "Scattered showers", "Light showers", "Passing showers", "Light rain", "Rain showers", "Numerous showers", "Showery", "Widely scattered TStorms", "Isolated TStorms", "A few TStorms", "Thundershowers", "Thunderstorms", "Mixture of precip", "Heavy mixture of precip", "Light Rain"] 
            snow = ["Sleet", "Snow", "Icy mix", "Freezing rain", "Snow changing to rain", "Snow changing to an icy mix", "An icy mix changing to snow", "An icy mix changing to rain", "Rain changing to snow", "Scattered flurries", "Rain changing to an icy mix", "Snow flurries", "Light snow showers", "Snow showers", "Light snow", "Moderate snow" ]
            
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

        // H6 HEADER TAG CHANGE DEPEND ON WEATHER
        iconText: function(forcastObject) {
            if (this.backgroundColorFunction(forcastObject).indexOf("rain") >= 0) {
                return "Rain"
            }
            if (this.backgroundColorFunction(forcastObject).indexOf("snow") >= 0) {
                return "Snow"
            }
            if (this.backgroundColorFunction(forcastObject).indexOf("alert") >= 0) {
                return "Alert"
            }
            else {
                return "Clear"
            }
        },

        //Charts 
         createRainChart(rainprop, rainChartData) {
             const rain = document.getElementById(rainprop);
             const myChart = new Chart(rain, {
                type: 'line',
                data: {
                  labels: rainChartData.map((data)=>{
                      if (data.HourlyTime == 12 || data.HourlyTime == 0) {
                          return 12
                      }
                      else {
                          return data.HourlyTime%12
      
                      }
                      
                    }),
                
                  datasets: [
                    { 
                      label: 'Chance of Rain',
                      data: rainChartData.map((data)=> data.RainProb),
                      backgroundColor: [
                        'rgba(72 140 224)',
                      ],
                      borderColor: [
                        'rgba(72 140 224)',
                      ],
                      borderWidth: 2
                    }
                  ]
                },
                options: {
                  responsive: true,
                  lineTension: 1,
                  scales: {
                    yAxes: [{
                      ticks: {
                        beginAtZero: true,
                        max: 100,
                        padding: 1,
                      }
                    }]
                  }
                }
         }
             )},
                
             createSnowChart(snowprop, snowChartData) {
                const snow = document.getElementById(snowprop);
                const myChart = new Chart(snow, {
                   type: 'line',
                   data: {
                     labels: snowChartData.map((data)=>{
                         if (data.HourlyTime == 12 || data.HourlyTime == 0) {
                             return 12
                         }
                         else {
                             return data.HourlyTime%12
         
                         }
                         
                       }),
                   
                     datasets: [
                       { 
                         label: 'Chance of Snow',
                         data: snowChartData.map((data)=> data.SnowProb),
                         backgroundColor: [
                           '#9b9b9b',
                         ],
                         borderColor: [
                           '#9b9b9b',
                         ],
                         borderWidth: 1
                       }
                     ]
                   },
                   options: {
                     responsive: true,
                     lineTension: 1,
                     scales: {
                       yAxes: [{
                         ticks: {
                           beginAtZero: true,
                           max: 100,
                           padding: 1,
                         }
                       }]
                     }
                   }
            }
                )},
                

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

