# Peter's Musical Notebook

Record audio, compress to Flac & MP3 files, create an index.html with a link to each MP3 and synch the new index and the MP3s to an S3 bucket.

## Setup
Create an S3 bucket.
Create a CNAME to point to it.

Create a "secrets.env" file and add your AWS key, AWS Secret, and S3 Bucket name where you want to upload the files.

Copy the below into a script and run it. Read the comments

## Building w/ Gulp & Docker
Use: https://hub.docker.com/r/huli/gulp/
Run `docker run -it --rm -v "$(pwd)":/srv -w="/srv/src/resource" huli/gulp build`



## simple http server
python -m SimpleHTTPServer 8000


```
#load secrets into env 
source secrets.env

#record
# https://gist.github.com/peterkappus/c1b8dfc621077c42019d21cf6f9ab624
file=$(date +%Y-%m-%dT%H%M%S%Z) && rec $file.flac silence 1 0:01 0.00599% 1 0:03 0.00599% norm compand 0.3,1 -5,-5 && sox $file.flac $file.mp3

#move mp3 to public folder
mv $file.mp3 public/$file.mp3

#build index
ruby mkindex.rb

#sync 'public' folder to bucket
docker run -v "$(pwd)"/public:/data --env AWS_ACCESS_KEY_ID=$AWS_ID --env AWS_SECRET_ACCESS_KEY=$AWS_SECRET garland/aws-cli-docker aws s3 sync . s3://$AWS_S3_BUCKET_NAME --delete --size-only --acl=public-read --exclude=".git*"
```
