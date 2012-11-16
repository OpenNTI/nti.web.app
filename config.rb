# Require any additional compass plugins here.
begin
  require "compass-growl"
rescue LoadError
end

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "src/main/resources/css"
sass_dir = "src/main/resources/scss"
images_dir = "src/main/resources/images/"
javascripts_dir = "src/main/javascript/"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false

# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass src/main/resources/scss scss && rm -rf sass && mv scss sass

#on_stylesheet_saved do |filename|
#end

