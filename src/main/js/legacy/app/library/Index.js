const {isFeature} = require('legacy/util/Globals');

if (isFeature('library-searchable')) {
	require('./LibrarySearchable');
} else {
	require('./Library');
}
