var apiData;
(function() {
  var url = "tracks.json";
  $.getJSON( url)
    .done(function( data ) {
      apiData = data;
      $.each( data, function( i, item ) {
        //grab the date
        var dateTime = item.match(/[\d-]+(T\d{4})?/)[0].replace(/-/g,' ').replace(/T(\d{2})(\d{2})/," @ $1:$2");
        
        var name = item.replace(/.+\//,'').replace(/^[\d-T]*/,"").replace(/-/g," ").replace(/.mp3/,'');
        
        if(name == ""){
          name = dateTime
          dateTime = '';
        }

        $( "#tracks" ).append( `<div class="col-md-3"><a href="${item}"><div class="track"><div class="trackName">${titleCase(name)}</div><div class="date">${dateTime}</div></div></a></div>` );
        
      });
      
      //now setup player
      setup();
      
      //do we have a bookmark to play?
      getAnchor();
    });
})();

var audio = document.getElementById("player");
var currentTrackIndex = 0;
var scrubber = document.querySelector('.scrubber');

var isSeeking = false; // for when user is scrubbing through track timeline
var tracksPlayed = new Set(); // tracks which have already been played

var shuffling = false;
var mediaListOL;
var mediaList = [];
var dict = [];
var mediaListUnfiltered;

function setup() {
  mediaListOL = document.querySelector('#tracks');
  mediaListUnfiltered = document.querySelectorAll('#tracks div a');

  for (var i = 0; i < mediaListUnfiltered.length; i++) {
      var href = mediaListUnfiltered[i].href;
      if (href.includes('.mp3') || href.includes('.ogg') || href.includes('.wav')) {
          mediaList.push(mediaListUnfiltered[i]);
      }
  }

  mediaList.forEach( function(element, index) {
      element.addEventListener('click', function (event) {
          event.preventDefault();
          var track = getTrack(index);
          
          if(index == currentTrackIndex) {
            if (!audio.paused) {
                pauseBtn.click();
            } else {
                playBtn.click();
            }
            return true;
          }
          
          audio.src = track['src'];
          audio.play();
          currentTrackIndex = index;
          tracksPlayed.add(currentTrackIndex);
          setAnchor(track['src'].replace("media/","").replace(".mp3",""));
          return true;
      }, true);
  });
}

scrubber.addEventListener("mousedown", function(event){ isSeeking=true; seek(event); });
scrubber.addEventListener("mousemove", function(event){ seek(event); });
scrubber.addEventListener("mouseup", function(){ isSeeking=false; });


function getAnchor(){
  var match = document.location.href.match(/#(.+)/);
  
  if(match != null) {
    url = "media/" + match[1] + ".mp3";
    
    //find it
    for(i in mediaList) {
      if(mediaList[i].href.replace(/http.+?\/media/,'media') == url) {
        currentTrackIndex = i;
        mediaList[currentTrackIndex].classList.add('playing');
        return;
      }
    }
    
    console.log(`Track ${url} not found`);
    
  }
  
  return null;
  
}

function setAnchor(key){
  document.location.assign(document.location.href.replace(/#.+/,"") + "#" + key);
}

function getTrack (index) {
    return {
        'src': mediaList[index].getAttribute('href')
    }
}

function playTrack(index) {
  currentTrackIndex = index;
  try {
    document.querySelector('#tracks div a.playing').classList.remove('playing');  
  }catch(e){
    //no currently playing track
  }
  audio.src = getTrack(currentTrackIndex)['src'];

  try {
    audio.play();    
  }catch(e){
    //awaiting interaction to play...
  }
  tracksPlayed.add(currentTrackIndex);
}

function playNextTrack () {
    if (shuffling) {
        playRandomTrack();
        return;
    }
    try {
      playTrack(currentTrackIndex + 1);            
    } catch(e) {
        // statements
        console.log('no next/prev track to play', e);
        mediaListOL.classList.remove('playing');
        try {
            document.querySelector('#tracks div a.playing').classList.remove('playing');
        } catch(e) {}
    }
}


function getRandomTrackIndex () {
    return Math.round(
        Math.random() * mediaList.length
    );
}

function playRandomTrack () {
    // reset and start over if all tracks have been played.
    if (tracksPlayed.length == mediaList.length) {
        tracksPlayed = new Set();
    }

    var randomTrackIndex = getRandomTrackIndex();
    while (tracksPlayed.has(randomTrackIndex)) {
        randomTrackIndex = getRandomTrackIndex();
    }
    audio.src = getTrack(randomTrackIndex)['src'];
    audio.play();
    currentTrackIndex = randomTrackIndex;
    tracksPlayed.add(currentTrackIndex);
}


function toggleShuffling () {
    shuffling = (!shuffling);
    if (shuffling == false) {
        tracksPlayed = new Set();
    } else {
        if (audio.paused) {
            playRandomTrack();
        }
    }
}


// Countdown
audio.addEventListener("timeupdate", function() {
    var timeleft = document.querySelector('.playback-time-remaining'),
        duration = parseInt( audio.duration ),
        currentTime = parseInt( audio.currentTime ),
        timeLeft = duration - currentTime,
        s, m;

    var timePercent = parseInt((currentTime / duration) * 100);
    
    s = timeLeft % 60;
    m = Math.floor( timeLeft / 60 ) % 60;
    
    s = s < 10 ? "0"+s : s;
    m = m < 10 ? "0"+m : m;
    
    timeleft.innerHTML = (m||"00")+":"+(s||"00");
    if (isSeeking) {return}
    if (!duration == 0){
        scrubber.value = timePercent;
    } 
}, false);

// Countup
audio.addEventListener("timeupdate", function() {
    var timeline = document.querySelector('.playback-time');
    var s = parseInt(audio.currentTime % 60);
    var m = parseInt((audio.currentTime / 60) % 60);
    m = m < 10 ? "0"+m : m;

    if (s < 10) {
        timeline.innerHTML = m + ':0' + s;
    }
    else {
        timeline.innerHTML = m + ':' + s;
    }
}, false);

function seek(event){
    if(isSeeking){
        var rect = event.target.getBoundingClientRect();
        var x = event.clientX - rect.left;
        if (x < 0) {x=0} else if (x > scrubber.offsetWidth) {x=scrubber.offsetWidth}
        var seekto = (x / scrubber.offsetWidth);
        audio.currentTime = audio.duration * seekto;
    }
} 

// Play
audio.addEventListener("play", function() {
    try {
        document.querySelector('#tracks div a.playing').classList.remove('playing');
    } catch(e) { 
      //nothing playing 
    }
    
    //google tag manager event tracking from Angela
    dataLayer.push({
      'event': 'player',
      'playerEvent': 'start',
      'playerFile': audio.src
    });

    // legacy GA code - remove so we don't double-track
    /*  gtag('event', audio.src, {
        'event_category': 'play'
      });
    */

    mediaList[currentTrackIndex].classList.add('playing');
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    scrubber.classList.remove('hidden');
}, false);
audio.addEventListener("pause", function() {
    pauseBtn.classList.add('hidden');
    playBtn.classList.remove('hidden');
}, false);

// End
audio.addEventListener("ended", function() {
    pauseBtn.classList.add('hidden');
    playBtn.classList.remove('hidden');

    if (shuffling) {
        playRandomTrack();
    } else {
        playNextTrack();
    }
}, false);




// Playback
var playBtn = document.querySelector('.playback-controls .play');
playBtn.addEventListener('click', function (e) {
    if (document.querySelector('#tracks div a.playing') == null) {
      currentTrackIndex = 0;
    }
    mediaList[currentTrackIndex].click();
    audio.play();
}, true);
var pauseBtn = document.querySelector('.playback-controls .pause');
pauseBtn.addEventListener('click', function (e) {
    audio.pause();
}, true);
var prevBtn = document.querySelector('.playback-controls .prev');
prevBtn.addEventListener('click', function (e) {
    playPrevTrack();
}, true);
var nextBtn = document.querySelector('.playback-controls .next');
nextBtn.addEventListener('click', function (e) {
    playNextTrack();
}, true);



var randomBtn = document.querySelector('.playback-controls .shuffle');
randomBtn.addEventListener('click', function (e) {
    toggleShuffling();
    console.log(shuffling);
    if (shuffling) {
        randomBtn.classList.add('on');
    } else {
        randomBtn.classList.remove('on');
    }
}, true);


$(window).keypress(function(e) {
    if (e.which === 32) {
        e.preventDefault();
        if (!audio.paused) {
            pauseBtn.click();
        } else {
            playBtn.click();
        }
        return true;
    }
});



function titleCase(string) {
    return string.split(" ").map(function(s){return s.charAt(0).toUpperCase() + s.slice(1)}).join(" ");
  }
