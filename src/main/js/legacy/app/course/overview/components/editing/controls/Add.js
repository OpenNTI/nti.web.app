const Ext = require('extjs');

require('./Edit');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.controls.Add', {
	extend: 'NextThought.app.course.overview.components.editing.controls.Edit',
	alias: 'widget.overview-editing-controls-add',

	promptName: 'overview-creation',

	name: 'Add',

	cls: 'nt-button add',

	renderTpl: '{name}'
});
