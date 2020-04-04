
# read it...
template = IO.read("template.html")

# generate links
links = Dir.glob("public/*.mp3").map {|f| basename = File.basename(f); title = basename.sub(".mp3","").gsub("-"," "); %(<li><a href="#{basename}">#{title}</a></li>\n)}.sort.reverse

# write it, replacing %%LINKS%% with the generated links
IO.write "public/index.html", template.sub("%%LINKS%%", links.join)
