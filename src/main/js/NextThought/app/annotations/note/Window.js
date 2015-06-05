Ext.define('NextThought.app.annotations.note.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.note-panel-window',

	layout: 'none',

	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.annotations.note.Main',
		'NextThought.app.context.ContainerContext'
	],

	initComponent: function() {
		this.callParent(arguments);

		var context = NextThought.app.context.ContainerContext.create({
			container: this.record.get('ContainerId'),
			range: this.record.get('applicableRange')
		});

		this.add([{
			xtype: 'window-header',
			doClose: this.doClose.bind(this)
		},{
			xtype: 'note-main-view',
			record: this.record,
			readerContext: context
		}]);
	}
}, function() {
	NextThought.app.windows.StateStore.register(NextThought.model.Note.mimeType, this);
});
