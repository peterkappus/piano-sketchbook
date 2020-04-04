var apiData;
(function() {
  var url = "tracks.json";
  $.getJSON( url)
    .done(function( data ) {
      apiData = data;
      $.each( data, function( i, item ) {
        //grab the date
        var date = item.match(/[\d-]+/)[0]; 
               
        $( "#tracks" ).append( `<div><a href="${item}">${item.replace(/.+\//,'').replace(/.mp3/,'')}</a></div>` );
        if ( i === 60 ) {
          return false;
        }
      });
      
      //now setup player
      setup();
    });
})();

var audio = document.getElementById("player");
var CURRENTTRACKINDEX = 0;
var AUDIOSCRUBBER = document.querySelector('.scrubber');

var ISSEEKING = false; // for when user is scrubbing through track timeline
var TRACKSPLAYED = new Set(); // tracks which have already been played

var SHUFFLE = false;
var MEDIALISTOL;
var MEDIALIST = [];
var MEDIALIST_UNFILTERED;

function setup() {

  MEDIALISTOL = document.querySelector('#tracks');
  MEDIALIST_UNFILTERED = document.querySelectorAll('#tracks div a');

  for (var i = 0; i < MEDIALIST_UNFILTERED.length; i++) {
      var href = MEDIALIST_UNFILTERED[i].href;
      if (href.includes('.mp3') || href.includes('.ogg') || href.includes('.wav')) {
          MEDIALIST.push(MEDIALIST_UNFILTERED[i]);
      }
  }


  audio.src = MEDIALIST[CURRENTTRACKINDEX].getAttribute('data-src');
  MEDIALIST.forEach( function(element, index) {
      element.addEventListener('click', function (event) {
          event.preventDefault();
          var track = getTrack(index);
          audio.src = track['src'];
          audio.play();
          CURRENTTRACKINDEX = index;
          TRACKSPLAYED.add(CURRENTTRACKINDEX);
          return true;
      }, true);
  });
}

function getTrack (index) {
    return {
        'src': MEDIALIST[index].getAttribute('href')
    }
}
function getNextTrack () {
    return {
        'src': MEDIALIST[CURRENTTRACKINDEX+1].getAttribute('href')
    }
}
function getPrevTrack () {
    return {
        'src': MEDIALIST[CURRENTTRACKINDEX-1].getAttribute('href')
    }
}

function playPrevTrack () {
    try {
        var prevTrack = getPrevTrack();
        document.querySelector('#tracks div a.playing').classList.remove('playing');
        audio.src = prevTrack['src'];
        audio.play();
        CURRENTTRACKINDEX -= 1;
        TRACKSPLAYED.add(CURRENTTRACKINDEX);
    } catch(e) {
        // statements
        console.log('no next/prev track to play', e);
        MEDIALISTOL.classList.remove('playing');
        try {
            document.querySelector('#tracks div a.playing').classList.remove('playing');
        } catch(e) {}
    }
}
function playNextTrack () {
    if (SHUFFLE) {
        playRandomTrack();
        return;
    }
    try {
        var nextTrack = getNextTrack();
        document.querySelector('#tracks div a.playing').classList.remove('playing');
        audio.src = nextTrack['src'];
        audio.play();
        CURRENTTRACKINDEX += 1;
        TRACKSPLAYED.add(CURRENTTRACKINDEX);
    } catch(e) {
        // statements
        console.log('no next/prev track to play', e);
        MEDIALISTOL.classList.remove('playing');
        try {
            document.querySelector('#tracks div a.playing').classList.remove('playing');
        } catch(e) {}
    }
}


function getRandomTrackIndex () {
    return Math.round(
        Math.random() * MEDIALIST.length
    );
}

function playRandomTrack () {
    // reset and start over if all tracks have been played.
    if (TRACKSPLAYED.length == MEDIALIST.length) {
        TRACKSPLAYED = new Set();
    }

    var randomTrackIndex = getRandomTrackIndex();
    console.log(randomTrackIndex);
    while (TRACKSPLAYED.has(randomTrackIndex)) {
        randomTrackIndex = getRandomTrackIndex();
    }

    console.log('playing random track');
    audio.src = getTrack(randomTrackIndex)['src'];
    audio.play();
    CURRENTTRACKINDEX = randomTrackIndex;
    TRACKSPLAYED.add(CURRENTTRACKINDEX);
}


function toggleShuffle () {
    SHUFFLE = (!SHUFFLE);
    if (SHUFFLE == false) {
        TRACKSPLAYED = new Set();
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
    if (ISSEEKING) {return}
    if (!duration == 0){
        AUDIOSCRUBBER.value = timePercent;
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


// HANDLE AUDIOSCRUBBER
function seek(event){
    if(ISSEEKING){
        var rect = event.target.getBoundingClientRect();
        var x = event.clientX - rect.left;
        if (x < 0) {x=0} else if (x > AUDIOSCRUBBER.offsetWidth) {x=AUDIOSCRUBBER.offsetWidth}
        var seekto = (x / AUDIOSCRUBBER.offsetWidth);
        audio.currentTime = audio.duration * seekto;
        console.log(x);
    }
}
AUDIOSCRUBBER.addEventListener("mousedown", function(event){ ISSEEKING=true; seek(event); });
AUDIOSCRUBBER.addEventListener("mousemove", function(event){ seek(event); });
AUDIOSCRUBBER.addEventListener("mouseup",function(){ ISSEEKING=false; });

// Play
audio.addEventListener("play", function() {
    console.log('song played');
    try {
        document.querySelector('#tracks div a.playing').classList.remove('playing');
    } catch(e) {}
    MEDIALISTOL.classList.add('playing');
    MEDIALIST[CURRENTTRACKINDEX].classList.add('playing');
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    AUDIOSCRUBBER.classList.remove('hidden');
}, false);
audio.addEventListener("pause", function() {
    pauseBtn.classList.add('hidden');
    playBtn.classList.remove('hidden');
    console.log('paused');    
}, false);

// End
audio.addEventListener("ended", function() {
    pauseBtn.classList.add('hidden');
    playBtn.classList.remove('hidden');

    if (SHUFFLE) {
        playRandomTrack();
    } else {
        playNextTrack();
    }
    console.log('song ended');
}, false);



// Playback
var playBtn = document.querySelector('.playback-controls .play');
playBtn.addEventListener('click', function (e) {
    if (document.querySelector('#tracks div a.playing') == null) {
        MEDIALIST[0].click();
    }
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
    toggleShuffle();
    console.log(SHUFFLE);
    if (SHUFFLE) {
        randomBtn.classList.add('shuffle-on');
    } else {
        randomBtn.classList.remove('shuffle-on');
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
