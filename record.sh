#record

echo "Make sure the input is set to your audio interface (not internal microphone)"

##open this page to record midi simultaneously:
open -na "Google Chrome" --args --incognito "https://midi-recorder.web.app/"

#file="../all/"$(date +%Y-%m-%dT%H%M%S%Z) 
file="../all/"$(date +%Y-%m-%dT%H%M) 
#rec -c2 $file.flac silence 1 0:01 0.00599% 1 0:03 0.00599% norm

#lower thresholds. FYI: set keyboard output volume 3 ticks from the max
rec -c2 $file.flac silence 1 0:01 0.00008% 1 0:02 0.0003% norm

sox $file.flac $file.mp3 compand 0.3,1 6:-70,-60,-40 -5 -90 0.2

echo "Any good?"

read save

if [ "$save" = "n" ]
then
  rm $file.mp3 $file.flac
fi

#file="../all/"$(date +%Y-%m-%dT%H%M%S%Z) 

#rec $file.flac # silence 1 0:01 0.00599% 1 0:03 0.00599% norm compand 0.3,1 -5,-5

#sox $file.flac $file.mp3