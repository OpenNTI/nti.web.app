Ext.define('NextThought.view.courseware.dashboard.tiles.Deadline', {
	extend: 'Ext.Component',
	alias: 'widget.dashboard-deadline',

	initComponent: function() {
		this.callParent(arguments);

		this.loaded
			.then(function(deadlines) {

			});
	}
});
