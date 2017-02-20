#!/usr/bin/env bash
set -e
#sometimes git returns strange things...this seems to clear the bad state.
git status &> /dev/null

function finish {
	# Restore the package.json to original
	git checkout package.json
}
trap finish EXIT

#check for unstaged tracked files
if ! git diff-files --quiet; then
	echo 'There are uncommitted changes. Aborting.'
	exit 1
fi

#check for staged/not committed files
if ! git diff-index --quiet --cached HEAD; then
	echo 'There are uncommitted changes. Aborting.'
	exit 1
fi

if ! make check; then
	echo 'There are lint errors. Aborting.'
	exit 1
fi

if ! make test; then
	echo 'There are test failures. Aborting'
	exit 1
fi

NAME=`cat package.json | jq -r '.name'`
VERSION=`cat package.json | jq -r '.version'`
DATE=`date`

#make sure the version is setup to be snapshotted.
if ! [[ "$VERSION" == *alpha ]]; then
	echo "Version $VERSION, does not have an alpha tag. Aborting."
	exit 1;
fi

VERSION=${VERSION%-alpha}
echo Building $NAME@$VERSION

# update the version property
jq ".version = \"$VERSION\"" package.json > package.tmp
#replace the package.json with the temp...
mv package.tmp package.json

#skip `npm install` for release generation (if dot file exists) -- Only create that file if you are keeping your node_modules updated daily.
if [ -f .release-skip-npm -a -d node_modules ]; then touch node_modules; fi

echo ''
echo 'Generating npm-shrinkwrap...'
npm shrinkwrap
git add npm-shrinkwrap.json

echo ''
echo "Commiting release version $VERSION, tagging..."
git add package.json
git commit -m "$VERSION" > /dev/null
git tag "v$VERSION" -m "Cut on $DATE"

#publish the publish (will build)
echo ''
echo 'Building and publishing...'
npm publish

echo ''
echo -n 'Setting up next release version...'
rm  npm-shrinkwrap.json
git add npm-shrinkwrap.json

# setup next alpha version
npm --no-git-tag-version version minor > /dev/null
VERSION=`cat package.json | jq -r '.version'`
VERSION="$VERSION-alpha"
# update the version property
jq ".version = \"$VERSION\"" package.json > package.tmp
#replace the package.json with the temp...
mv package.tmp package.json

echo $VERSION

git add package.json
git commit -m "$VERSION" > /dev/null

git push
git push --tags
