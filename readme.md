# Web App

	All commands are assuming the path is relative to this checkout.

- **Build Dependencies:** `bundler`, [`Sencha Cmd`][SENCHACMD], `ExtJS` library.
- **Run-Time Dependencies:** Login, Data Server

(FYI: If you do not already have `Ruby` and the `gem` command… I will leave you to figure out how to install it :] It seems to be bundled with MacOS, or XCode, so you should already have it.)

### Getting Started

1. download & extract Sencha's [Ext 4.2][EXTJS]
 * Place a symlink to it under `src/main` with a name of `ext-4.2`
2. download & install the [Sencha Cmd][SENCHACMD]
 * If you had a terminal open, you will need to `source` your bash profile file to pick up the path change needed to execute the command.
 * Generate the bootstrap.js with this command:


			sencha -sdk src/main/ext-4.2 compile \
				-classpath=src/main/javascript/NextThought \
				meta -alias -out src/main/bootstrap.js and \
				meta -alt -append -out src/main/bootstrap.js


3. Setup CSS Compiler…
  1. Setup Ruby environment: `~/.gemrc`: 
     * In your `~/.profile`, `~/.bash_profile`, or `~/.bashrc` and add a new environment variable called `GEM_HOME` with a value of: `~/.gem/ruby/<ruby version>` (on MacOS 10.9, the ruby version is `2.0.0`)
     * Add `$GEM_HOME/bin` to your path.
     * Create the `~/.gemrc` file:
         - In your terminal type: `echo "gem: --no-document --user-install" > ~/.gemrc`  
         This will instruct the ruby package manager to install gems in your local user directory instead of they system directory. (lets not muddy the OS shall we?) The `--no-document` argument is an optimization for not generating the docs and debugging symbols. (it installs much faster)
     * Now type: `gem install bundler`
  2. Install our bundle.
     * type: `bundle install`
  3. you can now compile the styles: `compass compile`

### Unit-Tests

The unit tests in this project are written in javascript and use the `Jasmine` assertion framework.  You can run the unit tests by making your `src/test` directory served by a http server[^*][#httpserver] or using [karma][karma] to run them.

##### Setting up Karma (Optional, but recommended)
Dependencies: `npm`, and thus `node.js`

1. npm install -g karma 
2. npm install -g karma-coverage
3. from `src/test` type `karma start`


### Might be helpfull:

I have a few aliases setup in bash to help shorten many sets of commands. They might be helpful to you as well.

	alias ww='cd ~/Workspace/NextThoughtWebApp'
	alias cw='( ww ; compass watch&>/dev/null& )'
	alias cwx='kill `ps -ef | grep compass | grep -v grep | awk '"'"'{print $2}'"'"'` &>/dev/null'
	alias genbs='( ww; cd src/main; sencha -sdk ext-4.2 compile -classpath=javascript/NextThought meta -alias -out bootstrap.js and meta -alt -append -out bootstrap.js )'

If you don't have Growl, I'd recommend removing the strings `&>/dev/null`

### Login App & Server...
See buildout docs.


#### Git Pre-Commit Hook:
Put this bash script in the `.git/hooks/pre-commit`:

	#!/bin/sh
	FILES=`git diff --cached --name-only | grep -i ".js$"`

    for f in $FILES
    do
    	CHECK=(
    		"/opt/local/bin/jslint $(pwd)/$f continue closure"
    		"/usr/local/bin/gjslint --strict --disable=0005,0220 --max_line_length=160 $(pwd)/$f"
    		)
    	for LINTER in "${CHECK[@]}"
    	do
    		LINT=`$LINTER`;
    		if ! echo $LINT | grep -i -s 'no error' > /dev/null ; then
    			echo "\n\n$LINT\n\n";
    			exit 1
    		fi
    	done
    done

###### Notes
* <a name="httpwebservernote"></a>You can run `python -m SimpleHTTPServer` from any directory to serve it over http on your local machine.

[karma]: http://karma-runner.github.io
[#httpserver]: #httpwebservernote
[EXTJS]: http://www.sencha.com/products/extjs/download/
[SENCHACMD]: http://www.sencha.com/products/sencha-cmd/download/
