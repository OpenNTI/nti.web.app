Ext.define('NextThought.app.course.overview.components.parts.Poll', {
	extend: 'NextThought.common.components.cards.Card',
	// alias: 'widget.course-overview-pollref', //Comment this out for now since we don't support it yet

	requires: [
		'NextThought.model.PollRef'
	],

	constructor: function() {
		this.callParent(arguments);
	}
});
