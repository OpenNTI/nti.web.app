const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.model.forums.Topic', {
	extend: 'NextThought.model.forums.Base',

	isTopic: true,

	fields: [
		{ name: 'BoardNTIID', type: 'string', persist: false},
		{ name: 'PostCount', type: 'int', persist: false },
		{ name: 'title', type: 'string' },
		{ name: 'PublicationState', type: 'string', persist: false },
		{ name: 'NewestDescendant', type: 'singleitem', persist: false },
		{ name: 'NewestDescendantCreatedTime', type: 'date', persist: false, dateFormat: 'timestamp'}
	],

	isModifiable: function () {
		try {
			return this.phantom || (this.getLink('edit') !== null);
		}
		catch (e) {
			console.warn('No getLink()!');
		}
		return false;
	},
});
