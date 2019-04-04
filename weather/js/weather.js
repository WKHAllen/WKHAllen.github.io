"use strict";

// var locUrl = "https://ipapi.co/74.207.62.6/json/";
var locUrl = "http://www.geoplugin.net/json.gp"
var apiKey = "be01eab3dff98198cc699228d54aee01";
var apiKey2 = "b8f381522463f5ee0c04df3bfca0ca15";//josh's key in case of too many requests
var conversionapyKey = "v00wb6EzD4xv6ZbTmofXJp5gNo4rkKYCM4g8KxTWgGcqQLvs";
var userid= "jvansant";
var convertUrl="https://neutrinoapi.com/convert";
var birthdayUrl="https://raw.githubusercontent.com/alebelcor/celeb-birthdays/master/output/celeb-birthdays.json";
var favoriteLocations = [];
var currLocation = "";
var d=new Date();
var weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
var bDays=["Josh", "Will", "Roman"];
var locFromApi;

function addFavorite() {
    favoriteLocations.push(currLocation);
    saveFavorites();
    populateFavoriteLocations();
    checkAddFavorites();
}

function removeFavorite() {
    favoriteLocations.splice(favoriteLocations.indexOf(currLocation), 1);
    saveFavorites();
    populateFavoriteLocations();
    checkAddFavorites();
}

async function getBirthdays(date){
    let d = await getData(birthdayUrl);
    return d[date];
}

async function getLocation() {
    let loc = await getData(locUrl);
    return [loc["geoplugin_city"], loc["geoplugin_region"]].join(", ").toUpperCase();
}

async function getData(url) {
    return fetch(url)
    .then(response => response.json())
    .catch(error => console.log(error));
}

function locationFromParams() { //searches for location already in page
    let params = new URLSearchParams(window.location.search);
    let location = params.get("location");
    if (location === null) {
        return null;
    }
    return decodeURI(location);
}

function populateFavoriteLocations(){ // takes localStorage memory of favoriteLocations dictionary
    let listElement = document.getElementById("favoriteList");
    listElement.innerHTML = "";
    for (let item of favoriteLocations) {
        let li = document.createElement("li");
        let a = document.createElement("a");

        a.setAttribute("href", "?location=" + encodeURI(item)); //URL CHANGE HAPPENS HERE
        a.innerHTML = item;
        
        li.appendChild(a);
        listElement.appendChild(li);
    }
}

function saveFavorites(){ // save dictionary "favoriteLocations" to Local storage
    let string = JSON.stringify(favoriteLocations);
    window.localStorage.setItem("favoriteLocations", string);

}

function loadFavorites(){ // load favorites from localStorage in "favoriteLocations"
    let string = window.localStorage.getItem("favoriteLocations");
    if(string!=null){
        favoriteLocations = JSON.parse(string);
        populateFavoriteLocations();
    }
    else{
        // console.log("No favorites saved.");
    }  
}

async function getWeather(location) {//returns dataArray of weather data from given url-(link to API of specified location(weatherUrl))
    let weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + encodeURI(location) + (",%20United%20States") + "&APPID=" + encodeURI(apiKey2);
    let currW = await getData(weatherUrl);//Uses link defined by location api to retrieve data from API
    let dataArray=[];
    //These variables are the important pieces of weather data we will implement:
    dataArray.push(currW["name"]);//city name
    dataArray.push(currW["weather"][0]["main"]);//description
    dataArray.push(currW["weather"][0]["icon"]);//icon
    dataArray.push(currW["main"]["temp"]);//temp
    dataArray.push(currW["main"]["temp_max"]);//high
    dataArray.push(currW["main"]["temp_min"]);///low
    dataArray.push(currW["main"]["humidity"]);///humidity
    dataArray.push(currW["sys"]["sunrise"]);//sunrise
    dataArray.push(currW["sys"]["sunset"]);//sunset
    dataArray.push(location.toUpperCase()); //city name, state
    return dataArray;
}

function kelvinToFahrenheit(kelvin) {
    let celsius = kelvin - 273.15;
    let fahrenheit = celsius * 1.8 + 32;
    return fahrenheit;
}

function round(value, decimals) {
    let tenpower = Math.pow(10, decimals);
    return Math.round(value * tenpower) / tenpower;
}

function formatDate(timestamp) {
    let dateobj = new Date(timestamp * 1000);
    let date = ((dateobj.getHours() - 1) % 12 + 1) + ":" + dateobj.getMinutes();
    if (dateobj.getHours() <= 12) {
        date += " AM";
    } else {
        date += " PM";
    }
    return date;
}

function onEnter(event) {
    if (event.keyCode === 13) {
        changeLocation();
    }
}

function populateMainData(dataArray){
    currLocation=dataArray[9];
    document.getElementById("location").innerHTML = dataArray[0];
    document.getElementById("pic").src = "http://openweathermap.org/img/w/"+dataArray[2]+".png";
    document.getElementById("temp").innerHTML = round(kelvinToFahrenheit(dataArray[3]), 1) + "&deg;F";
    document.getElementById("high").innerHTML = round(kelvinToFahrenheit(dataArray[4]), 1);
    document.getElementById("low").innerHTML = round(kelvinToFahrenheit(dataArray[5]), 1);
    document.getElementById("humidity").innerHTML = dataArray[6] + "%";
    document.getElementById("sunrise").innerHTML = formatDate(dataArray[7]);
    document.getElementById("sunset").innerHTML = formatDate(dataArray[8]);
}

function changeLocation(){
    let loc=document.getElementById("locationInput").value;
    loc=loc.toUpperCase();
    let asd = window.location.href
    let base = asd.split("?location=");
    // console.log(base);
    let url = base[0] + "?location=" + encodeURI(loc);
    window.location.replace(url);
}

function formateDateForApi(da){
    let m = (da.getMonth()).toString();
    if(m.length<2){
        m = "0"+m
    }
    let d = (da.getDate()).toString();
    if(d.length<2){
        d= "0"+d
    }
    // console.log(m);
    // console.log(d);
    let date = m+"-"+d;
    // console.log(date);
    return date;
}

function loadDay(da, peopleArray){
    // console.log(peopleArray);//did not load on first try fix this
    document.getElementById("day").innerHTML = weekDays[da.getDay()];//sets day of week

    let listElement = document.getElementById("peeps");
    listElement.innerHTML = "";
    for(let person of peopleArray){
        let li = document.createElement("li");
        li.innerHTML = person;
        listElement.appendChild(li);
    }
}

function checkAddFavorites() {
    // console.log(favoriteLocations);
    let favoritesButton = document.getElementById("favbutton");
    if (favoriteLocations.includes(locFromApi)) {
        favoritesButton.innerHTML = "Remove City from Favorites";
        favoritesButton.setAttribute("onclick", "removeFavorite()");
    } else {
        favoritesButton.innerHTML = "Add City to Favorites";
        favoritesButton.setAttribute("onclick", "addFavorite()");
    }
}

async function main() {
    loadDay(d, await getBirthdays(formateDateForApi(d)));
    locFromApi = locationFromParams() || await getLocation();
    populateMainData(await getWeather(locFromApi));
    loadFavorites();
    checkAddFavorites();
}

window.addEventListener("load", main);
