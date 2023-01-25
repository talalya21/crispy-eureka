// initialize page after HTML loads
window.onload = function() {
   closeLightBox();  // close the lightbox because it's initially open in the CSS
   document.getElementById("button").onclick = function () {
     searchTvShows();
   };
   document.getElementById("lightbox").onclick = function () {
     closeLightBox();
   };
} // window.onload

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

//respond to enter being pressed as look up tv show button being clicked
document.addEventListener("keydown", function(e){
  if(event.key === "Enter"){
    searchTvShows();
  }
})//key event listener

// get data from TV Maze
function searchTvShows() {
  document.getElementById("main").innerHTML = "";
  
  var search = document.getElementById("searchBox").value;  
    
  fetch('http://api.tvmaze.com/search/shows?q=' + search)
    .then(response => response.json())
    .then(data => showSearchResults(data) 
    );
} // window.onload 
 

// change the activity displayed 
function showSearchResults(data) {
  
  // show data from search
  console.log(data); 
  
  // show each tv show from search results in webpage
  for (let tvshow in data) {
    createTVShow(data[tvshow]);
  } // for


} // showSearchResults

// in the json, genres is an array of genres associated with the tv show 
// this function returns a string of genres formatted as a bulleted list
function showGenres(genres) {
   var g;
   var output = "<ul>";
   for (g in genres) {
      output += "<li>" + genres[g] + "</li>"; 
   } // for       
   output += "</ul>";
   return output; 
} // showGenres

// constructs one TV show entry on webpage
function createTVShow (tvshowJSON) {
  
    // get the div tags
    var elemMain = document.getElementById("main");

    // create a number of new html elements to display tv show data
    var elemDiv = document.createElement("div");
    var elemImage = document.createElement("img");
    var elemShowTitle = document.createElement("h2");
    elemShowTitle.setAttribute('id', 'showtitle');
    var elemInfo = document.createElement("div");

    //add the same class to the show title, summary, genre, rating
    elemDiv.classList.add("showBox");
    elemInfo.classList.add("colOne");
    
    // add JSON data to elements
    elemImage.src = tvshowJSON.show.image.medium;
    elemShowTitle.innerHTML = tvshowJSON.show.name;
    elemInfo.innerHTML = "Genres: " + showGenres(tvshowJSON.show.genres);
    elemInfo.innerHTML += "<br>Rating: " + tvshowJSON.show.rating.average;
    elemInfo.innerHTML += "<br>" + tvshowJSON.show.summary;
    
    // add 5 elements to the div tag elemDiv
    elemDiv.appendChild(elemShowTitle);  
    elemDiv.appendChild(elemInfo);
    elemDiv.appendChild(elemImage);
    elemImage.classList.add("image");

    
    // get id of show and add episode list
    var showId = tvshowJSON.show.id;
    fetchEpisodes(showId, elemDiv);
    
    
    // add this tv show to main
    elemMain.appendChild(elemDiv);


} // createTVShow

// fetch episodes for a given tv show id
function fetchEpisodes(showId, elemDiv) {
     
  console.log("fetching episodes for showId: " + showId);
  
  fetch('http://api.tvmaze.com/shows/' + showId + '/episodes')  
    .then(response => response.json())
    .then(data => showEpisodes(data, elemDiv));
    
} // fetch episodes

// list all episodes for a given showId in an ordered list 
// as a link that will open a light box with more info about
// each episode
function showEpisodes (data, elemDiv) {
  
    // print data from function fetchEpisodes with the list of episodes
    console.log("episodes");
    console.log(data); 
    
    var elemEpisodes = document.createElement("div");  // creates a new div tag
    var output = "<ol>";
    for (episode in data) {
        output += "<li><a href='javascript:fetchEpisodeInfo(" + data[episode].id + ")'>" + data[episode].name + "</a></li>";
    }
    output += "</ol>";
    elemEpisodes.innerHTML = output;
    elemDiv.appendChild(elemEpisodes);  // add div tag to page
    elemEpisodes.classList.add("episodes");
        
} // showEpisodes

// open lightbox and display information
function showLightBox(episodeData){
  var message = document.getElementById("message");
  
  //open lightbox
  document.getElementById("lightbox").style.display = "block";

  //print name of episode including the season and number if available
  if("name" in episodeData && episodeData.name != undefined && episodeData.name != ""){
    //if season data is not available, only print the episode name
    if("season" in episodeData && episodeData.season != undefined && episodeData.season != ""){
      //if number data is not available, only print the episode name and season
      if("number" in episodeData && episodeData.number != undefined && episodeData.number != ""){
        message.innerHTML += "<strong>" + episodeData.name + "</strong> (Season " + episodeData.season + ", Episode " + episodeData.number + ")";
      } else{
        message.innerHTML += "<strong>" + episodeData.name + "</strong> (Season " + episodeData.season + ")";
      }
    } else{
      message.innerHTML += "<strong>" + episodeData.name + "</strong>";
    }
  }

  //print summary of episode if available
  if("summary" in episodeData && episodeData.summary != undefined && episodeData.summary != ""){
    message.innerHTML += episodeData.summary;
  }

  //print image of episode if available
  if("image" in episodeData && episodeData.image.medium != undefined && episodeData.image.medium != "" && episodeData.image.medium != "null"){
    console.log(episodeData.image.medium);
    var episodeImage = document.createElement("img");
    message.appendChild(episodeImage);
    episodeImage.src = episodeData.image.medium;
  }

} // showLightBox

function fetchEpisodeInfo(id){


  fetch('https://api.tvmaze.com/episodes/' + id)  
  .then(response => response.json())
  .then(data => showLightBox(data));
  
}

 // close the lightbox
 function closeLightBox(){
     document.getElementById("lightbox").style.display = "none";
     document.getElementById("message").innerHTML = "";
 } // closeLightBox 






