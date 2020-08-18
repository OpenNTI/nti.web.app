# NextThought Web Developer Initiation Document

## Light Reading

- [React Tutorial](https://reactjs.org/tutorial/tutorial.html)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)

## Setting up the Web Developer Environment

### System Setup/Requirements

1. Install `nodejs`
	* [NVM](https://github.com/nvm-sh/nvm) is the recommended tool for managing Nodejs versions
	* Note: installing node will give you access to the NPM and NPX commands

### NPM Configuration

1. Create a login on [npm.nextthought.com](npm.nextthought.com).
	* npm.nextthought.com is our private npm repo so we don't have to worry about our source code getting accidentally made public.
2. Configure `.npmrc` to look at npm.nextthought.com form "@nti" packages.
	1. Run `npm login --registry=npm.nextthought.com` to setup your access token.
	2. Run `npm set @nti:registry https://npm.nextthought.com` setup the @nti registry

### Text Editor Requirements

There is no specific text editor that you have to use. Most people on the team use VSCode, but one stubborn holdout is still using Sublime Text. No matter what text editor you choose it must meet a few requirements to ensure consistent code quality across developers.

1. Must be setup to enforce the local eslint config.
2. Must be setup to enforce the local stylelint config.

### Checking out the source code

1. Create a directory to contain all the web repos (Note: typically this is named "Projects").
2. Run `npx @nti/clone` to checkout all web repos.

## Setting up the Server Environment

:shrug:

## Workflow

### Starting Dev Server

The dev server allows you to run the applications from your local source code. This allows you to make changes locally and see their impact before committing.

1. `cd` into the app repo you want to run (i.e. nti.web.app, nti.web.mobile, nti.web.login, nti.web.environments etc...).
2. run `npm i` if you have not already, or if its been awhile since you last installed node_modules.
3. run `npm start` to start the webpack dev server.

### Workspace

Our code base is split into many different repos, trying to separate concerns. The apps serve as an orchestrator, pulling in different components/code from different repos. These different repos listed as dependencies of the apps and get installed in the `node_modules`. One side effect of this is the dev server will pull the code for the repos from `node_modules` not your local checkout. To work around this we introduced the concept of the "workspace".

To setup your workspace:

1. `cd` to "Projects" directory (containing all the repo checkouts)
2. make a `.workspace.json` file and add an empty json object ("{}") to it.

Congratulations you setup you workspace! Now when you start the dev server it will look at your local checkouts for the code instead of the app's `node_modules`.

The `.workspace.json` supports both a whitelist and a blacklist for more complicated usecases.

### Issue/Ticket list (What to work on)

We use [JIRA](https://nextthought.atlassian.net/) as our issue tracker. Issues are divided into "releases" and sorted by priority.

ticket workflow:

1. Find the ticket in the current release's `TODO` list you are going to work on.
2. Move the ticket to `IN PROGRESS` to alert others that you are working on it.
3. Once the code to resolve the ticket has been committed and added to a snapshot move the ticket to `READY FOR TESTING`. To let the QA team know that we are ready for them to start testing.

### gitflow



## Releases 
