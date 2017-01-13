const Ext = require('extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.app.search.components.results.Timeline', {
	extend: 'NextThought.app.search.components.results.Base',
	alias: 'widget.search-result-ntitimeline',


	addCreator () {},


	addObject (obj) {
		const label = obj.get('label');

		this.setTitle(label);
	}
});
