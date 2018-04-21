const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.app.assessment.components.Sequence', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-components-sequence',

	renderTpl: Ext.DomHelper.markup([
		{html: 'Sequence'}
	])
});
