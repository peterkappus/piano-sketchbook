
#sync new MP3s & midi to public folder
# delete anythin which isn't in the source folder
rsync -a --delete-excluded  --include="*.mp3" --include="*.midi" --exclude="*" ../all/ public/media/

./mkindex.rb
