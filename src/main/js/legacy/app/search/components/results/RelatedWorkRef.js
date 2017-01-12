const Ext = require('extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.app.search.components.results.RelatedWorkRef', {
	extend: 'NextThought.app.search.components.results.Base',
	alias: 'widget.search-result-relatedworkref',


	addCreator () {},

	addByLine (name) {
		const creator = `By ${name}`;

		this.renderData.creator = creator;

		if (this.rendered) {
			this.creatorEl.update(creator);
		}
	},

	addObject (obj) {
		const byline = obj.get('byline');
		const label = obj.get('label');

		if (byline) {
			this.addByLine(byline);
		}

		this.setTitle(label);
	}
});
