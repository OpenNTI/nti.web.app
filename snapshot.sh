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

NAME=`cat package.json | jq -r '.name'`
VERSION=`cat package.json | jq -r '.version'`
DATE=`date +%Y%m%d-%H%M`

#make sure the version is setup to be snapshotted.
if ! [[ "$VERSION" == *alpha ]]; then
	echo "Version $VERSION, does not have an alpha tag. Aborting."
	exit 1;
fi

echo Building $NAME@$VERSION$DATE

# Update the package.json to a snapshot version, and point all "nti-" dependencies to the snapshot tag.
node <<EOF | jq ".version = \"$VERSION$DATE\"" > package.tmp
	process.stdout.write(
		JSON.stringify(
			(json => ([
					json.dependencies,
					json.devDependencies
				].forEach(deps =>
					Object.keys(deps)
						.filter(x => x.startsWith('nti-'))
						.forEach(x => (o => o[x] = 'alpha || ' + o[x])(deps))
				),
				json
			))(require('./package.json'))
		)
	)
EOF
# just update the version property
# jq ".version = \"$VERSION$DATE\"" package.json > package.tmp

#replace the package.json with the temp...
mv package.tmp package.json

#skip `npm install` for snapshot generation (if dot file exists) -- Only create that file if you are keeping your node_modules updated daily.
if [ -f .snapshot-skip-npm -a -d node_modules ]; then touch node_modules; fi

#publish the snapshot (will build)
npm publish --tag alpha

git push --delete origin snapshot &> /dev/null | true
git tag --delete snapshot &> /dev/null | true
git tag snapshot
git push --tags
# cat package.json
