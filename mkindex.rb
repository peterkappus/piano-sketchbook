require 'json'

#build the JSON, stripping the 'public/' prefix from the URLs cuz it'll be served from within the public folder
json = JSON.generate(Dir.glob("public/media/*.mp3").sort.reverse.map{|u| u.sub("public\/","")})

#write it
IO.write "public/tracks.json", json
