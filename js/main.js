"use strict";

let api_key = "e82245fa6e18476199e172940232002";
let searchApi = `http://api.weatherapi.com/v1/search.json?key=${api_key}&q=`;
let weatherApi = `https://api.weatherapi.com/v1/forecast.json?key=e82245fa6e18476199e172940232002&q={{QUERY}}&days=3`;

let locationInput = document.querySelector('#locationInput');
let findBtn = document.querySelector('#findBtn');

async function getSuggestions(){
    let query = locationInput.value;
    let regions = [];
    if(!query) return;
    let res = await fetch(searchApi + query);
    let data = await res.json();
    for(let location of data){
        if(regions.includes(location.id)) continue;
        regions.push(location);
    }
    displaySuggestions(regions);
}

function displaySuggestions(regions){
    // To Remove Duplicated Records when searching for some locaions like (Egypt or Cairo)
    // console.log(regions)
    regions = Array.from(new Set(regions.map(el=> JSON.stringify(el)))).map(el=> JSON.parse(el));
    // console.log(regions)
    let regions_suggestions = document.querySelector('#regions_suggestions');
    regions_suggestions.innerHTML = "";
    regions.forEach( location =>{
        regions_suggestions.innerHTML += `<option value="${location.name} - ${location.region} - ${location.country}">`;
    })
}

async function getWeather(query){
    if(query.length <= 2) return;
    let res = await fetch(weatherApi.replace(/\{\{QUERY\}\}/, query));
    let data = await res.json();
    if(data.error) return;
    displayData(data);
}

function displayData(data){
    let currentDay = data.current;
    let forecastDays = data.forecast.forecastday
    let dayMonthsNames = getDayMonthsNames();
    let {condition, temp_c, wind_kph, wind_dir} = currentDay;

    document.querySelector('#locationName').innerText = data.location.name;
    document.querySelector('#currentTemp').innerText = temp_c;
    document.querySelector('.day-name').innerText = dayMonthsNames.days[0];
    document.querySelector('#currentDate').innerText = dayMonthsNames.date;
    document.querySelector('.weather-icon').setAttribute('src', condition.icon);
    document.querySelector('.weather-text').innerText = condition.text;
    document.querySelector('#rain-chance').innerText = forecastDays[0].day.daily_chance_of_rain + '%';
    document.querySelector('#wind-speed').innerText = wind_kph + ' km/h';
    document.querySelector('#wind-direction').innerText = {N: 'North', S: 'South', E: 'East', W: 'West'}[wind_dir];

    for(let i = 1; i < 3; i++){
        let {maxtemp_c, mintemp_c, condition} = forecastDays[i].day;
        document.querySelectorAll('.day-name')[i].innerText = dayMonthsNames.days[i];
        document.querySelectorAll('.weather-icon')[i].setAttribute('src', condition.icon);
        document.querySelectorAll('.min-temp')[i - 1].innerText = mintemp_c;
        document.querySelectorAll('.max-temp')[i - 1].innerText = maxtemp_c;
        document.querySelectorAll('.weather-text')[i].innerText = condition.text;
    }
}



locationInput.addEventListener('input', function(){
    getWeather(this.value);
})

findBtn.addEventListener('click', function(e){
    e.preventDefault();
    getWeather(document.querySelector('#locationInput').value);
})

locationInput.addEventListener('input', function(){
    getSuggestions();
})

function getDayMonthsNames(){
    let days = ['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septemper', 'October', 'November', 'December']
    let date = new Date();
    let dayNum = date.getDay();
    let dayNames = [];
    for(let i = 0; i < 3; i++){
        if(dayNum >= 7) dayNum = 0;
        dayNames.push(days[dayNum]);
        dayNum++;
    }
    return {
        days: dayNames,
        date: `${date.getDate()} ${Months[date.getMonth()]}`
    };
}


getWeather("Cairo");