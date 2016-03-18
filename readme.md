# Web App

	All commands are assuming the path is relative to this checkout.

- **Build Dependencies:** `bundler`, `npm`, `make`
- **Run-Time Dependencies:** Login, Data Server

(FYI: If you do not already have `Ruby` and the `gem` command… I will leave you to figure out how to install it :] It seems to be bundled with MacOS, or XCode, so you should already have it.)

### Getting Started

(work is being done to remove the ruby dependency and only have npm dependencies)

1. Setup CSS Compiler…
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


### Login App & Server...
See buildout docs.


### Recommended

If you haven't already done so, configure `git` to make all new branches rebase on pull by default:
```bash
git config branch.autosetuprebase always --global
```

Set `master`, `develop` to default to rebase on pull
```bash
git config branch.master.rebase true
git config branch.develop.rebase true
```

I can't make this change centrally. It must be made per-clone.  This explains why you would want to rebase on pull: http://stevenharman.net/git-pull-with-automatic-rebase

It basically simplifies your interactions. so you can simply `git pull` to get updated code, instead of `git pull -r` or `git fetch && git rebase... ` etc. With out this change, a `git pull` will make a merge bubble, and thats just ugly.
