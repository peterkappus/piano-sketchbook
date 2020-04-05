var apiData;
(function() {
  var url = "tracks.json";
  $.getJSON( url)
    .done(function( data ) {
      apiData = data;
      $.each( data, function( i, item ) {
        //grab the date
        var date = item.match(/[\d-]+/)[0]; 
               
        $( "#tracks" ).append( `<div class="col-md-3"><a href="${item}"><div class="track">${item.replace(/.+\//,'').replace(/.mp3/,'')}</div></a></div>` );
        if ( i === 60 ) {
          return false;
        }
      });
      
      //now setup player
      setup();
    });
})();


// Get the video
var video = document.getElementById("myVideo");

// Get the button
var btn = document.getElementById("myBtn");

// Pause and play the video, and change the button text
function myFunction() {
  if (video.paused) {
    video.play();
    btn.innerHTML = "Pause";
  } else {
    video.pause();
    btn.innerHTML = "Play";
  }
}


var audio = document.getElementById("player");
var currentTrackIndex = 0;
var scrubber = document.querySelector('.scrubber');

var isSeeking = false; // for when user is scrubbing through track timeline
var TRACKSPLAYED = new Set(); // tracks which have already been played

var shuffling = false;
var medialistOL;
var medialist = [];
var medialist_UNFILTERED;

function setup() {

  medialistOL = document.querySelector('#tracks');
  medialist_UNFILTERED = document.querySelectorAll('#tracks div a');

  for (var i = 0; i < medialist_UNFILTERED.length; i++) {
      var href = medialist_UNFILTERED[i].href;
      if (href.includes('.mp3') || href.includes('.ogg') || href.includes('.wav')) {
          medialist.push(medialist_UNFILTERED[i]);
      }
  }


  audio.src = medialist[currentTrackIndex].getAttribute('data-src');
  medialist.forEach( function(element, index) {
      element.addEventListener('click', function (event) {
          event.preventDefault();
          var track = getTrack(index);
          audio.src = track['src'];
          audio.play();
          currentTrackIndex = index;
          TRACKSPLAYED.add(currentTrackIndex);
          return true;
      }, true);
  });
}

function getTrack (index) {
    return {
        'src': medialist[index].getAttribute('href')
    }
}
function getNextTrack () {
    return {
        'src': medialist[currentTrackIndex+1].getAttribute('href')
    }
}
function getPrevTrack () {
    return {
        'src': medialist[currentTrackIndex-1].getAttribute('href')
    }
}

function playPrevTrack () {
    try {
        var prevTrack = getPrevTrack();
        document.querySelector('#tracks div a.playing').classList.remove('playing');
        audio.src = prevTrack['src'];
        audio.play();
        currentTrackIndex -= 1;
        TRACKSPLAYED.add(currentTrackIndex);
    } catch(e) {
        // statements
        console.log('no next/prev track to play', e);
        medialistOL.classList.remove('playing');
        try {
            document.querySelector('#tracks div a.playing').classList.remove('playing');
        } catch(e) {}
    }
}
function playNextTrack () {
    if (shuffling) {
        playRandomTrack();
        return;
    }
    try {
        var nextTrack = getNextTrack();
        document.querySelector('#tracks div a.playing').classList.remove('playing');
        audio.src = nextTrack['src'];
        audio.play();
        currentTrackIndex += 1;
        TRACKSPLAYED.add(currentTrackIndex);
    } catch(e) {
        // statements
        console.log('no next/prev track to play', e);
        medialistOL.classList.remove('playing');
        try {
            document.querySelector('#tracks div a.playing').classList.remove('playing');
        } catch(e) {}
    }
}


function getRandomTrackIndex () {
    return Math.round(
        Math.random() * medialist.length
    );
}

function playRandomTrack () {
    // reset and start over if all tracks have been played.
    if (TRACKSPLAYED.length == medialist.length) {
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
    currentTrackIndex = randomTrackIndex;
    TRACKSPLAYED.add(currentTrackIndex);
}


function toggleshuffling () {
    shuffling = (!shuffling);
    if (shuffling == false) {
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


// HANDLE scrubber
function seek(event){
    if(isSeeking){
        var rect = event.target.getBoundingClientRect();
        var x = event.clientX - rect.left;
        if (x < 0) {x=0} else if (x > scrubber.offsetWidth) {x=scrubber.offsetWidth}
        var seekto = (x / scrubber.offsetWidth);
        audio.currentTime = audio.duration * seekto;
        console.log(x);
    }
}
scrubber.addEventListener("mousedown", function(event){ isSeeking=true; seek(event); });
scrubber.addEventListener("mousemove", function(event){ seek(event); });
scrubber.addEventListener("mouseup",function(){ isSeeking=false; });

// Play
audio.addEventListener("play", function() {
    console.log('song played');
    try {
        document.querySelector('#tracks div a.playing').classList.remove('playing');
    } catch(e) {}
    medialistOL.classList.add('playing');
    medialist[currentTrackIndex].classList.add('playing');
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    scrubber.classList.remove('hidden');
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

    if (shuffling) {
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
        medialist[0].click();
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



var randomBtn = document.querySelector('.playback-controls .shuffling');
randomBtn.addEventListener('click', function (e) {
    toggleshuffling();
    console.log(shuffling);
    if (shuffling) {
        randomBtn.classList.add('shuffling-on');
    } else {
        randomBtn.classList.remove('shuffling-on');
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
