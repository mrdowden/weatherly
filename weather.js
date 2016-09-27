$(function () {
    var darkSkyKey = "78f6328193f7b52d3bcfade54f1a13a1";
    var googleKey = "AIzaSyDBu_KG2WaW9j-80xEBDnCQm20tgxW97wU";
    var round = function(num, places) {
        return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
    };
    var farenheitToCelsius = function(t) {
        return round((t - 32) * 5 / 9, 1);
    }
    var displayWeatherCard = function(locationData, weatherData) {
        var card = $('<div></div>').addClass('card').addClass(weatherData.icon);
        card.append( $('<div></div>').addClass('remove').append( $('<span></span>').addClass('glyphicon glyphicon-remove') ));
        card.append( $('<div></div>').addClass('location').append(locationData.city).append(', ').append(locationData.state) );
        card.append( $('<div></div>').addClass('icon') );
        card.append( $('<div></div>').addClass('current').addClass('temperature').append(weatherData.currentTemp) );
        card.append( $('<div></div>').addClass('summary').append(weatherData.summary) );
        var minTempSpan = $('<span></span>').addClass('temperature').append(weatherData.minTemp);
        var maxTempSpan = $('<span></span>').addClass('temperature').append(weatherData.maxTemp);
        card.append( $('<div></div>').addClass('highlow').append(minTempSpan).append(' / ').append(maxTempSpan) );
        card.append( $('<div></div>').addClass('chance-of-rain').append(weatherData.rainChance) );
        var cell = $('<div></div>').addClass('col-sm-4').append(card);
        cell.hide(); 
        $(".row").append(cell);
        cell.show('clip', {}, 500);
    };
    var locationAtAddress = function(zipCode) {
        var dfd = jQuery.Deferred();
        var googleUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + zipCode + "&key=" + googleKey;
        $.ajax(googleUrl).done(function(data) {
            var results = data.results[0];
            //Lookup City & State by Type
            var city,state;
            for(var i in results.address_components) {
                var addressPart = results.address_components[i];
                if(addressPart.types.includes('locality')) {
                    city = addressPart.long_name;
                } else if(addressPart.types.includes('administrative_area_level_1')) {
                    state = addressPart.short_name;
                }
            }
            //Resolve with the Location data
            dfd.resolve({
                lat: results.geometry.location.lat,
                lng: results.geometry.location.lng,
                city: city,
                state: state
            });
        });
        return dfd.promise();
    };
    var weatherAtLocation = function(lat, lng) {
        var dfd = jQuery.Deferred();
        var darkSkyUrl = "https://api.darksky.net/forecast/" + darkSkyKey + "/" + lat + "," + lng + "?exclude=minutely,flags"
        $.ajax(darkSkyUrl, { dataType: "jsonp" }).done(function (data) {
            dfd.resolve({
                icon : data.currently.icon,
                summary : data.currently.summary,
                currentTemp: round(data.currently.temperature, 1),
                minTemp: round(data.daily.data[0].temperatureMin, 1),
                maxTemp: round(data.daily.data[0].temperatureMax, 1),
                rainChance: Math.round(data.currently.precipProbability * 100)
            });
        });
        return dfd.promise();
    };
    var textWithLabel = function(label, text) {
        return $('<span></span>').text(label + ': ' + text);
    };
    var addWeatherForLocation = function(address) {
        locationAtAddress(address).done(function(loc) {

            weatherAtLocation(loc.lat, loc.lng).done(function(weather) {
                displayWeatherCard(loc, weather);
            });
        });
    };

    $(".container").click(".remove", function(ev) {
        console.log(ev.target);
        $(ev.target).parent().parent().parent().remove();
    })

    $("#add").submit(function(ev) {
        var address = $("#address").val();
        $("#address").val("");
        if(address) {
            addWeatherForLocation(address);
        }
        return false;
    });
});
