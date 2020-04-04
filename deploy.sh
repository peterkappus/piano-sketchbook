#load secrets into env 
source secrets.env

#sync new MP3s & midi to public folder
rm -r public/media/*.midi public/media/*.mp3
rsync -a ../all/*.mp3 public/media/
rsync -a ../all/*.midi public/media/

#build index
ruby mkindex.rb

#sync 'public' folder to bucket
docker run -v "$(pwd)"/public:/data --env AWS_ACCESS_KEY_ID=$AWS_ID --env AWS_SECRET_ACCESS_KEY=$AWS_SECRET garland/aws-cli-docker aws s3 sync . s3://piano.kapp.us --delete --size-only --acl=public-read --exclude=".git*"
