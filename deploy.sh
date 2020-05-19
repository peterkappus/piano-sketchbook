#load secrets into env 
source secrets.env

./build.sh

#sync 'public' folder to bucket
docker run -v "$(pwd)"/public:/data --env AWS_ACCESS_KEY_ID=$AWS_ID --env AWS_SECRET_ACCESS_KEY=$AWS_SECRET garland/aws-cli-docker aws s3 sync . s3://piano.peterkappus.com --delete --size-only --acl=public-read --exclude=".git*"

docker run -v "$(pwd)"/public:/data --env AWS_ACCESS_KEY_ID=$AWS_ID --env AWS_SECRET_ACCESS_KEY=$AWS_SECRET garland/aws-cli-docker aws cloudfront create-invalidation --distribution-id E1UCHX5XQ0751H --paths /tracks.json /index.html /player.js

#invlidate json (or index, or player.js)
#docker run -v "$(pwd)"/public:/data --env AWS_ACCESS_KEY_ID=$AWS_ID --env AWS_SECRET_ACCESS_KEY=$AWS_SECRET garland/aws-cli-docker aws aws cloudfront create-invalidation --distribution-id E1UCHX5XQ0751H --paths "tracks.json" "index.html" "player.js"
