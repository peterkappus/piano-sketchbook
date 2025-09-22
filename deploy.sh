#load secrets into env 
source secrets.env

./build.sh

#sync 'public' folder to bucket
docker run -v "$(pwd)"/public:/aws --env AWS_ACCESS_KEY_ID=$AWS_ID --env AWS_SECRET_ACCESS_KEY=$AWS_SECRET public.ecr.aws/aws-cli/aws-cli:2.15.56 s3 sync . s3://piano.peterkappus.com --delete --size-only --acl=public-read --exclude=".git*"

docker run -v "$(pwd)"/public:/aws --env AWS_ACCESS_KEY_ID=$AWS_ID --env AWS_SECRET_ACCESS_KEY=$AWS_SECRET public.ecr.aws/aws-cli/aws-cli:2.15.56 cloudfront create-invalidation --distribution-id E1UCHX5XQ0751H --paths /tracks.json /index.html /player.js

