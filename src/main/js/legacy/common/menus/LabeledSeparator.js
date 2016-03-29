var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.common.menus.LabeledSeparator', {
	extend: 'Ext.menu.Separator',
	alias: 'widget.labeledseparator',

	renderTpl: [
		'<div class="label"><span>{text}</span></div>'
	]
});
