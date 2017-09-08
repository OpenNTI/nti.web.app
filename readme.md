

### Requirements

You'll need to have the following items installed before continuing.

  * [Node.js](http://nodejs.org):
    * Use [nvm](https://github.com/creationix/nvm) to install NodeJS.
        * `nvm install v8`
        * Setup default node:
          ```
          nvm alias default stable
          ```

Optional:
  * Node Inspector: `npm install -g node-inspector`

#### private npm
All internal projects at NextThought are published into a private npm instance. You will need to configure npm to point to it before you can continue. It is located at https://npm.nextthought.com. For read-only access use the support credentials. When/if you need publishing (write) permissions, we can create a unique user for you.

```bash
npm set registry https://npm.nextthought.com
npm login --registry https://npm.nextthought.com
```

## Quickstart

```bash
git clone git@github.com:NextThought/nti.web.app
cd nti.web.app
npm install
```

While you're working on this project, run:

```bash
npm start
```

##### Building:
```bash
$ npm run build
```

##### Running Tests:
```bash
#for continuous integration (calls karma with extra reports, see package.json)
$ npm test

The test run using jest, you can pass the same arguments to npm test as jest
```

---

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


---


## Working on dependent projects:

Clone the library, install its dependent modules, and `npm-link` it.

```bash
git clone {repository:source} {dependency-name}
cd {dependency-name}
npm install
npm link
```

from `nti.web.app`:

```bash
npm link {dependency-name}
```

| dependency-name        | repository:source                                        |
|------------------------|----------------------------------------------------------|
| nti-lib-anchorjs       | git@github.com:NextThought/nti.lib.anchorjs             |
| nti-lib-dom            | git@github.com:NextThought/nti.lib.domjs                |
| nti-lib-interfaces     | git@github.com:NextThought/nti.lib.interfaces           |
| nti-lib-ranges         | git@github.com:NextThought/nti.lib.ranges               |
| nti-lib-whiteboardjs   | git@github.com:NextThought/nti.lib.whiteboardjs         |
| react-editor-component | git@github.com:NextThought/react-editor-component.git    |


---

### Text Editor

[Atom](https://atom.io/) is the main editor editor used. Built on open web tech, for web tech :)

You can use the package manger either in app on on the command line with `apm` (like `npm`)

#### These packages are a **must**:
 * `linter` - shows errors in files as you type/save.
 * `linter-eslint` - linter plugin to run eslint on files.

#### These are helpfull:
 * `project-quick-open` - quickly open/switch to projects.
 * `merge-conflicts` - a merge conflict ui
 * `docblockr` - auto formats jsdoc comment blocks. as well as sippets.
 * `autocomplete-modules` - adds autocomplete suggestions your resolvable packages.
 * `git-plus` - an awesome git command pallet (branch, checkout/revert, commit, push, pull, etc)
 * `git-history` - search git history and show the diff.
 * `language-gitignore` - makes commit messages colored

#### These are fun:
 * `autocomplete-emojis` - self explanatory
 * `file-icons` - makes file icons code-type specific.

[Visual Studio Code](http://code.visualstudio.com/) (also built on Electron -- like atom) is a nice alternative.  [Sublime Text](http://www.sublimetext.com/) is another text editor available. As well as [TextMate](http://macromates.com/download).

As long as you can have a LIVE eslint plugin with your editor, you should be good to go. If you prefer an editor that can't do that, you need to run `make check` pretty regularly.
