Ext.define('NextThought.app.course.assessment.components.admin.email.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-email-window',

	layout: 'none',
	cls: 'email-window',

	requires: [
		'NextThought.app.course.assessment.components.admin.email.Editor',
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading'
	],

	items: [],


	initComponent: function(){
		this.callParent(arguments);

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.onClose.bind(this)
		});

		this.showEditor();
	},


	onClose: function(){
		this.doClose();
	},


	showEditor: function() {
		var me = this,
			editor;

		editor = me.add({xtype: 'course-email-editor', record: this.record});	

		me.mon(editor, {
			'cancel': function(rec) {
				me.remove(editor);
				me.doClose();
			},
			'after-save': function(rec) {
				me.remove(editor);
				me.record = rec;

				if (me.monitors && me.monitors.afterSave) {
					me.monitors.afterSave(rec);
				}

				if(me.doClose) {
					me.doClose();	
				}
			}
		});

		me.editor = editor;
	}
}, function(){
	NextThought.app.windows.StateStore.register('new-email', this);
	NextThought.app.windows.StateStore.register(NextThought.model.Email.mimeType, this);
});