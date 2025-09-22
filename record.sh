#record

# See: https://gist.github.com/peterkappus/c1b8dfc621077c42019d21cf6f9ab624

echo "Make sure the input is set to your audio interface (not internal microphone).\n\nUNPLUG YOUR LAPTOP POWER SUPPLY WHILE RECORDING :); plug keyboard into inputs 3 and 4 since mic is using in put 1"

echo "Ready??? Press ENTER"
read ready

start_threshold="0.05%"
end_threshold="0.04%"
#threshold="0.005%"


##open this page to record midi simultaneously:
open -na "Google Chrome" --args --incognito "https://midi-recorder.web.app/"

#file="../all/"$(date +%Y-%m-%dT%H%M%S%Z) 
file="../all/"$(date +%Y-%m-%dT%H%M) 
#rec -c2 $file.flac silence 1 0:01 0.00599% 1 0:03 0.00599% norm

#lower thresholds. FYI: set keyboard output volume 3 ticks from the max

#something bad happened in Apr 2020 and I started getting a buzzzzzz so I've had to change the thresholds to be higher
#rec -c2 $file.flac silence 1 0:01 0.00008% 1 0:02 0.0003% norm

#rec -c2 $file.flac silence 1 0:01 $threshold 1 0:02 $threshold norm

#NOTE! get channels 3 and 4 since mic is now plugged into channel 1
rec -c2 $file.flac silence 1 0:01 $start_threshold 1 0:01 $end_threshold remix 3 4 norm


sox $file.flac $file.mp3 compand 0.3,1 6:-70,-60,-40 -5 -90 0.2

echo "Any good? Press 'n' to discard."

read save

if [ "$save" = "n" ]
then
  rm -v $file.mp3 $file.flac
fi

#file="../all/"$(date +%Y-%m-%dT%H%M%S%Z) 

#rec $file.flac # silence 1 0:01 0.00599% 1 0:03 0.00599% norm compand 0.3,1 -5,-5

#sox $file.flac $file.mp3
