Ext.define('NextThought.view.courseware.dashboard.tiles.Base', {
	extend: 'Ext.Component',

	cls: 'tile',

	onClassExtended: function(cls, data) {
		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}
	}
});
