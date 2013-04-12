# Web App

	All commands are assuming the path is relative to this checkout.

- **Build Dependencies:** `Compass`, `Sass`, [`Blesscss`][BLESS], [`Sencha Cmd`][SENCHACMD], `ExtJS` library.
- **Run-Time Dependencies:** Login, Data Server

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
2. Setup CSS Compiler…
  1. Install `Compass`:
     * If you do not already have `Ruby` and the `gem` command… I will leave you to figure out how to install it :] 
     * In your term: `sudo gem install sass compass oily_png compass-growl`
     * ***Optional Parts:***
         * `oily_png`: an optional library that speeds up sprite generation 
         * `compass-growl`
  2. Install [Blesscss][BLESS] for IE stupidness.
     * This is unfortunately going to use yet another language, and its package manager. We need `npm` to install `blesscss`.  If you do not already have `npm`, use the package manager for your system to install it.
     * In the term: `sudo npm install bless -g`
  3. you can now compile the styles: `compass compile`
  

### Might be helpfull:

I have a few aliases setup in bash to help shorten many sets of commands. They might be helpful to you as well.

	alias ww='cd ~/Workspace/NextThoughtWebApp'
	alias cw='( ww ; compass watch&>/dev/null& )'
	alias cwx='kill `ps -ef | grep compass | grep -v grep | awk '"'"'{print $2}'"'"'` &>/dev/null'
	alias genbs='( ww; cd src/main; sencha -sdk ext-4.2 compile -classpath=javascript/NextThought meta -alias -out bootstrap.js and meta -alt -append -out bootstrap.js )'

If you don't have Growl, I'd recommend removing the strings `&>/dev/null`

### Login & Server section...
 
 
[EXTJS]: http://www.sencha.com/products/extjs/download/
[SENCHACMD]: http://www.sencha.com/products/sencha-cmd/download/
[BLESS]: http://blesscss.com/