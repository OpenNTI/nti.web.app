# Require any additional compass plugins here.
begin
  require "compass-growl"
rescue LoadError
end

#blessc_executable = 'blessc';

environment = :production

sass_options = {:sourcemap => true,}
enable_sourcemaps = true

# Set this to the root of your project when deployed:
http_path = "./"
css_dir = "src/main/resources/css"
sass_dir = "src/main/resources/scss"
images_dir = "src/main/resources/images/"
javascripts_dir = "src/main/javascript/"
relative_assets = true

output_style = :compressed
line_comments = false
enable_sourcemaps

# execute blessc when the stylesheet is generated
#on_stylesheet_saved do |path|
#	print "\n\n\n##############################################\nWARNING: No Blessc found\nExpect problems in IE\n##############################################\n\n\n\n" unless system(blessc_executable+' '+path+' -f -x')
#end
