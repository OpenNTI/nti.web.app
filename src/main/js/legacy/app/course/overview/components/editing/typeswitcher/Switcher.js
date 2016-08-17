const Ext = require('extjs');

require('../creation/ChildCreation');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.typeswitcher.Switcher', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.outline-editing-type-switcher',


	getTypes () {
		if (this.group) {
			return this.group.getTypes();
		}

		return [];
	},

	onSave () {}
});
