var Ext = require('extjs');
var EmailEditor = require('./Editor');
var WindowsStateStore = require('../../../../../windows/StateStore');
var ComponentsHeader = require('../../../../../windows/components/Header');
var ComponentsLoading = require('../../../../../windows/components/Loading');
var WindowsActions = require('../../../../../windows/Actions');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.email.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-email-window',
	layout: 'none',
	cls: 'email-window',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.onClose.bind(this)
		});
		this.headerCmp.setTitle('New Message');
		this.record = this.record || this.precache && this.precache.record;
		this.showEditor();

		this.WindowActions = NextThought.app.windows.Actions.create();

		// NOTE: Override the default behavior of the doClose function 
		// since we would like to avoid a refresh of the page.
		if (this.doClose) {
			this.doClose = this.onClose.bind(this);
		}
	},

	onClose: function () {
		var win = this.allowNavigation(),
			me = this;

		if (win === false) { return; }
		if (win instanceof Promise) {
			return win
					.then(function () {
						me.WindowActions.closeActiveWindow();				
					});
		}

		this.WindowActions.closeActiveWindow();
	},

	allowNavigation: function () {
		if (!this.editor) {
			return true;
		}

		return this.editor.allowNavigation();
	},

	showEditor: function () {
		var me = this,
			editor;

		editor = me.add({xtype: 'course-email-editor', record: this.record});	

		me.mon(editor, {
			'cancel': function (rec) {
				me.WindowActions.closeActiveWindow();
			},
			'after-save': function (rec) {
				me.record = rec;
				if (me.monitors && me.monitors.afterSave) {
					me.monitors.afterSave(rec);
				}

				me.WindowActions.closeActiveWindow();
			}
		});

		me.editor = editor;
	}
}, function () {
	NextThought.app.windows.StateStore.register('new-email', this);
	NextThought.app.windows.StateStore.register(NextThought.model.Email.mimeType, this);
});