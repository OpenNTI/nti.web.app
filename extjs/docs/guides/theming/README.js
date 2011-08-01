Ext.data.JsonP.theming({
  "guide": "<h1>Theming</h1>\n\n<p>Ext JS 4 has a brand new theming system to customize the look of your application while still supporting all browsers.</p>\n\n<h2>A Brief Introduction to SASS &amp; Compass</h2>\n\n<iframe src=\"http://player.vimeo.com/video/18084338?byline=0\" width=\"500\" height=\"281\" frameborder=\"0\"></iframe>\n\n\n<p>SASS is a pre-processor which adds new syntax to CSS allowing for things like variables, mixins, nesting, and math/color functions. For example, in SASS we can write:</p>\n\n<pre><code>$blue: #3bbfce;\n$margin: 16px;\n\n.content-navigation {\n    border-color: $blue;\n    color: darken($blue, 9%);\n}\n\n.border {\n    padding: $margin / 2;\n    margin: $margin / 2;\n    border-color: $blue;\n}\n</code></pre>\n\n<p>And it will compile to:</p>\n\n<pre><code>.content-navigation {\n    border-color: #3bbfce;\n    color: #2b9eab;\n}\n\n.border {\n    padding: 8px;\n    margin: 8px;\n    border-color: #3bbfce;\n}\n</code></pre>\n\n<p>To see the wide variety of other features available in SASS, please see http://sass-lang.com/. Compass extends SASS by adding a variety of CSS3 mixins and providing the extension system that Sencha Touch leverages. With Compass, one can include rules like:</p>\n\n<pre><code>$boxheight: 10em;\n\n.mybox {\n    @include border-radius($boxheight/4);\n}\n</code></pre>\n\n<p>Which compiles into:</p>\n\n<pre><code>.mybox {\n    -webkit-border-radius: 2.5em;\n    -moz-border-radius: 2.5em;\n    -o-border-radius: 2.5em;\n    -ms-border-radius: 2.5em;\n    -khtml-border-radius: 2.5em;\n    border-radius: 2.5em;\n}\n</code></pre>\n\n<p>You can learn more about the pre-included mixins with Compass and the other tools it provides here: http://compass-style.org/docs/.</p>\n\n<h2>Requirements</h2>\n\n<h3>- Ruby</h3>\n\n<h4>Mac OSX</h4>\n\n<p>XCode installs Ruby and all necessary dependencies to your Mac when installed.</p>\n\n<p>Xcode can be found on the Apple Developer Website: <a href=\"http://developer.apple.com/xcode/\">http://developer.apple.com/xcode/</a></p>\n\n<h4>Windows</h4>\n\n<p>Visit http://rubyinstaller.org/ and download the latest packaged version of Ruby (1.9.2 at the time of writing)</p>\n\n<h3>- Compass/SASS gem</h3>\n\n<h4>Mac OSX</h4>\n\n<p>In <code>/Applications/Utilities/Terminal.app</code>, run the following code (you will be asked for your password):</p>\n\n<pre><code>sudo gem install compass\n</code></pre>\n\n<p>You can verify you have Compass and Sass installed by running the following in <code>Terminal.app</code>:</p>\n\n<pre><code>compass -v\n\nsass -v\n</code></pre>\n\n<p>At the time of writing, the latest version of Compass is <code>0.11.1 (Antares)</code>. The latest version of Sass is <code>3.1.1 (Brainy Betty)</code></p>\n\n<h4>Windows</h4>\n\n<p>Select <strong>Start Command Prompt with Ruby</strong> from the new Start Menu option.</p>\n\n<p>Type the following:</p>\n\n<pre><code>gem install compass\n</code></pre>\n\n<p>You can verify you have Compass and Sass installed by running the following in <strong>Terminal.app</strong>:</p>\n\n<pre><code>compass -v\nsass -v\n</code></pre>\n\n<p>At the time of writing, the latest version of Compass is <code>0.11.1 (Antares)</code>. The latest version of Sass is <code>3.1.1 (Brainy Betty)</code></p>\n\n<h2>Directory Structure</h2>\n\n<p>The <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS SDK comes with a template which can be used as a base for your new theme. You can find this in the <code>/resources/themes/templates</code> folder.</p>\n\n<p>Everything in the included <code>resources</code> directory should be moved to your application's root folder:</p>\n\n<pre><code>&lt;application-root&gt;/\n&lt;application-root&gt;/resources/\n&lt;application-root&gt;/resources/css/\n&lt;application-root&gt;/resources/sass/\n&lt;application-root&gt;/resources/sass/config.rb\n&lt;application-root&gt;/resources/images/\n</code></pre>\n\n<p>You must also ensure the <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS SDK is in the correct location:</p>\n\n<pre><code>&lt;application-root&gt;/lib/Ext JS\n&lt;application-root&gt;/lib/Ext JS/ext-all.js\n&lt;application-root&gt;/lib/Ext JS/resources/\n&lt;application-root&gt;/lib/Ext JS/...\n</code></pre>\n\n<p>If for some reason the <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS SDK is located elsewhere, you must also change the path in resources/sass/config.rb:</p>\n\n<pre><code># $ext_path: This should be the path of where the <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS SDK is installed\n# Generally this will be in a lib/Ext JS folder in your applications root\n# &lt;root&gt;/lib/Ext JS\n$ext_path = \"../../lib/Ext JS\"\n</code></pre>\n\n<h2>Compiling your CSS</h2>\n\n<p>Compiling your CSS is a very simple process using Compass.</p>\n\n<p>From the application root directory, run the following command in <strong>Terminal.app on Mac OSX</strong> or <strong>Command Prompt on Windows</strong>:</p>\n\n<pre><code>&gt; compass compile resources/sass\n</code></pre>\n\n<p>This should output the following:</p>\n\n<pre><code>&gt; create resources/sass/../css/my-ext-theme.css\n</code></pre>\n\n<p>That is your CSS compiled! You can now view it in the <code>resources/css</code> folder.</p>\n\n<p>You can also setup Compass to watch your SASS directory and compile the CSS when you make a change:</p>\n\n<pre><code>&gt; compass watch resources/sass\n</code></pre>\n\n<h2>Changing global <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS variables</h2>\n\n<p>The <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS theming system comes with a few basic global SASS variables which you can use to change the whole look of your application with just a few lines of code.</p>\n\n<h3>Where</h3>\n\n<p>These SASS variables can be added in your .scss file, but they <strong>must</strong> be inserted before the call to <code>@import 'ext4/default/all'</code>. You can see an example of this in the my-ext-theme.scss file, in the templates/resources/sass folder:</p>\n\n<pre><code>// Unless you want to include all components, you must set $include-default to false\n// IF you set this to true, you can also remove lines 10 to 38 of this file\n$include-default: false;\n\n// Insert your custom variables here.\n$base-color: #aa0000;\n\n@import 'ext4/default/all';\n</code></pre>\n\n<p>In this case, both <code>$include-default</code> and <code>$base-color</code> are being changed. Then the <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS 4 theming files are imported.</p>\n\n<h3>Available Variables</h3>\n\n<p>You can easily find variables that are available by navigating to the <code>resources/themes/stylesheets/ext4/default/variables</code> directory. This directory contains all defined variables for each component in <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS 4.</p>\n\n<p>The naming convention for variables follows CSS property names, prepends by the component name. For example:</p>\n\n<ul>\n<li><p><strong>Panel border radius</strong><br/>\n  <em>CSS Property:</em> border-radius<br/>\n  <em>Variable:</em> $panel-border-radius</p></li>\n<li><p><strong>Panel body background color</strong><br/>\n  <em>CSS Property:</em> background-color<br/>\n  <em>Variable:</em> $panel-body-background-color</p></li>\n<li><p><strong>Toolbar background color</strong><br/>\n  <em>CSS Property:</em> background-color<br/>\n  <em>Variable:</em> $toolbar-background-color</p></li>\n</ul>\n\n\n<h2>Component UIs</h2>\n\n<p>Every component in the <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS framework has a <code>ui</code> configuration (which defaults to <code>default</code>). This property can be changed to allow components in your application to have different styles.</p>\n\n<p>The <code>ui</code> of any component can be changed at any time, even after render, by using the <code>setUI</code> method. An example of this can be found in <code>examples/panel/bubble-panel.html</code>.</p>\n\n<h3>Creating new <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS UIs</h3>\n\n<p>Some <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS components have SASS <code>@mixin</code>'s which allow you to quickly generate new UIs. These include: <code>Ext.panel.Panel</code>, <code>Ext.button.Button</code>, <code>Ext.Toolbar</code> and <code>Ext.window.Window</code>.</p>\n\n<p>Creating these new UIs is simple. Simply call the associated <code>@mixin</code> (found in the documentation) for the component you want to create a new UI for.</p>\n\n<p>Lets look at the Panel <code>@mixin</code> as an example (which can be found in <code>examples/panel/bubble-panel/sass/bubble-panel.scss</code>):</p>\n\n<pre><code>@include <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS-panel-ui(\n    'bubble',\n\n    $ui-header-font-size: 12px,\n    $ui-header-font-weight: bold,\n    $ui-header-color: #0D2A59,\n    $ui-header-background-color: #fff,\n    $ui-header-background-gradient: null,\n\n    $ui-border-color: #fff,\n    $ui-border-radius: 4px,\n    $ui-body-background-color: #fff,\n    $ui-body-font-size: 14px\n);\n</code></pre>\n\n<p>The above code will create a new <code>ui</code> for any <a href=\"#/api/Ext.panel.Panel\" rel=\"Ext.panel.Panel\" class=\"docClass\">Ext.panel.Panel</a> component, which you can then use in your application by specifying the <code>ui</code> configuration:</p>\n\n<pre><code>Ext.create('widget.panel', {\n    ui: 'bubble',\n    width: 300,\n    height: 300,\n    title: 'Panel with a bubble UI!'\n});\n</code></pre>\n\n<h2>Supporting Legacy Browsers</h2>\n\n<p>In most cases when creating new UI's, you will want to include background gradients or rounded corners. Unfortunately legacy browsers do not support the corresponding CSS3 properties, so we must use images instead.</p>\n\n<p>With <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS 4, we have included a Slicing tool which does the hard work for you. Simply pass it a manifest file of your new UI's (if you have created any) and run the tool from the command line.</p>\n\n<h3>How it works</h3>\n\n<p>The slicing tool creates a new browser instance, which loads <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS and a specified CSS file. Once loaded, it parses a JavaScript file which includes every <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS component that needs styling (panel, window, toolbar, etc.). It then analyzes each of those components and determines the size and location of each image that needs to be sliced. It then slices each of the images, sprites them together and saves them in the location defined in the manifest.</p>\n\n<p>The slicer too itself can be run from the command line and is installed as part of the SDK Tools package. It can be run by calling <code>sencha slice theme</code>. Example usage:</p>\n\n<pre><code>sencha slice theme -d ~/Downloads/ext-4.0 -c mytheme.css -o mytheme -v\n</code></pre>\n\n<p>It accepts several arguments:</p>\n\n<ul>\n<li><p><strong>--css[=]value, -c[=]value</strong></p>\n\n<blockquote><p>The path to your theme's complete CSS file, e.g., ext-all-access.css. Uses\nthe default <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS 4 theme CSS if not provided.</p></blockquote></li>\n<li><p><strong>--ext-dir[=]value, -d[=]value (required)</strong></p>\n\n<blockquote><p>The path to the root of your <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS 4 SDK directory.</p></blockquote></li>\n<li><p><strong>--manifest[=]value, -m[=]value</strong></p>\n\n<blockquote><p>The path to your Theme Generator JSON manifest file, e.g., manifest.json.\nUses the default packaged manifest if not provided.</p></blockquote></li>\n<li><p><strong>--output-dir[=]value, -o[=]value</strong></p>\n\n<blockquote><p>The destination path to save all generated theme images. This should be inside the <code>resources/themes/images/&lt;themename&gt;/</code> directory.\nDefaults to the current working directory.</p></blockquote></li>\n<li><p><strong>--verbose, -v</strong></p>\n\n<blockquote><p>Display a message for every image that is generated.</p></blockquote></li>\n</ul>\n\n\n<h3>Usage</h3>\n\n<ol>\n<li><p><strong>Compile your CSS</strong></p>\n\n<p>You must ensure your SASS theme file has been compiled as this is used for the slicer. Passing no CSS file would result in the slicer to revert to the default ext-all.css file, which would be pointless in most cases.</p></li>\n<li><p><strong>Creating your manifest file (optional)</strong></p>\n\n<p>The manifest file is a simple JavaScript file which tells the Slicing tool which custom UI's you would like to slice. This step is only necessary when you have created new UI's.</p>\n\n<p>Let's look at the bubble panel example again:</p>\n\n<pre><code>Ext.onReady(function() {\n    Ext.manifest = {\n        widgets: [\n            {\n                xtype: 'widget.header',\n                ui   : 'bubble'\n            },\n            {\n                xtype: 'widget.panel',\n                ui   : 'bubble'\n            }\n        ]\n    };\n});\n</code></pre>\n\n<p>As you can see, you define an Object called <code>Ext.manifest</code> and give it an Array property called <code>widgets</code>. In this Array you should insert an object containing the <code>xtype</code> and <code>ui</code> of the component you want to generate the images for.</p>\n\n<p><strong>It is important that the <code>Ext.manifest</code> Object is defined inside the <code>Ext.onReady</code> method.</strong></p></li>\n<li><p><strong>Generating your images</strong></p>\n\n<p> Now all that is left is to run the command, including the arguments to the <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS SDK folder, your theme CSS file and the output directory of the sliced images.</p>\n\n<pre><code> sencha slice theme -d ~/Downloads/ext-4.0 -c mytheme.css -o mytheme -v\n</code></pre></li>\n</ol>\n\n\n<h2>FAQ</h2>\n\n<ul>\n<li><p><strong>I am getting a '<code>error resources/sass/my-ext-theme.scss (Line 8: File to import not found or unreadable: ext4/default/all)</code>' error when I compile?</strong></p>\n\n<blockquote><p>This is because Compass cannot file the <a href=\"#/api/Ext\" rel=\"Ext\" class=\"docClass\">Ext</a> JS 4 theme files. Ensure the <code>$ext_path</code> in the <code>sass/config.rb</code> file is correct.</p></blockquote></li>\n</ul>\n\n"
});