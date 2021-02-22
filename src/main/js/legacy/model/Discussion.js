const Ext = require('@nti/extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.model.Discussion', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'icon', type: 'string' },
		{ name: 'label', type: 'string' },
		{ name: 'title', type: 'string' },
	],

	constructor() {
		this.callParent(arguments);

		Object.defineProperties(this, {
			icon: {
				get: () => this.get('icon'),
			},
			title: {
				get: () => this.get('displayTitle') || this.get('title'),
			},
		});
	},
});
