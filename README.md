# Peter's Musical Notebook

Record audio, compress to Flac & MP3 files, create an index.html with a link to each MP3 and synch the new index and the MP3s to an S3 bucket.

## Recording workflow
- Check your audio settings and ensure you're using the external USB Audio interface
- IMPORTANT: Unplug the laptop to prevent groudloop buzz
- run `record.sh` This will start recording and open a browser to record a midi file
- play something amazing
- Recording will stop automatically.
- If the recording is good, reply with 'y' when asked to save the recording.
- Copy the midi file into the `../all` folder with the other files
- rename the midi file to match the datetime stamp on the audio files
- run `./build.sh` to copy the new audio files and re-generate the JSON file

## Local development setup

### Building the JSON
If you change the filenames, run `./build.sh` to re-copy and generate the JSON. If you're doing this regularly, you might want to `watch -n 20 ./build.sh` in another terminal window to do it every 20 seconds.

### Local HTTP Server (supporting range requests)
Run `docker run --rm -it -p 8080:80 -v "$(pwd)/public":/usr/share/nginx/html:ro -d nginx`
We use the above because it supports "range requests" required for seeking. `python -m SimpleHTTPServer 8000` won't support seeking.


## Deployment
I'm hosting this via AWS Cloudfront pointing to an S3 bucket. The `deploy.sh` script moves files to that bucket for publishing. 
- Create a "secrets.env" file and add your AWS key, AWS Secret, and S3 Bucket name where you want to upload the files.
- `chmod +x build.sh mkjson.rb 

### Need to invalidate the cache?
Use this to create an invalidation. Swap in paths for whatever you want invalidated.
`source secrets.env && docker run -v "$(pwd)"/public:/data --env AWS_ACCESS_KEY_ID=$AWS_ID --env AWS_SECRET_ACCESS_KEY=$AWS_SECRET garland/aws-cli-docker aws cloudfront create-invalidation --distribution-id E1UCHX5XQ0751H --paths /tracks.json /index.html /player.js`


### Legacy: Building w/ Gulp & Docker
Use: https://hub.docker.com/r/huli/gulp/
Run `docker run -it --rm -v "$(pwd)":/srv -w="/srv/src/resource" huli/gulp build`
