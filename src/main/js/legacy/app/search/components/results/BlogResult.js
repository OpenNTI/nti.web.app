const Ext = require('extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.search.components.results.BlogResult', {
	extend: 'NextThought.app.search.components.results.Base',
	alias: ['widget.search-result-forums-personalblogentrypost', 'widget.search-result-forums-personalblogcomment'],
	cls: 'search-result search-result-post'
});
