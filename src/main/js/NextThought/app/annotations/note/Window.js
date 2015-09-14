Ext.define('NextThought.app.annotations.note.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.note-panel-window',

	layout: 'none',

	cls: 'note-window',

	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading',
		'NextThought.app.annotations.note.Main',
		'NextThought.app.context.ContainerContext'
	],

	initComponent: function() {
		this.callParent(arguments);

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.doClose.bind(this),
			doNavigate: this.doNavigate.bind(this)
		});

		this.loadingEl = this.add({xtype: 'window-loading'});

		if (this.record.get('inReplyTo')) {
			this.loadRoot();
		} else {
			this.loadNote(this.record);
		}
	},


	loadNote: function(record) {
		var context = NextThought.app.context.ContainerContext.create({
				container: record.get('ContainerId'),
				range: record.get('applicableRange'),
				contextRecord: record,
				doNavigate: this.doNavigate.bind(this)
			});

		this.headerCmp.showPathFor(record, null, 3);

		if (this.loadingEl) {
			this.remove(this.loadingEl, true);
			delete this.loadingEl;
		}

		this.add({
			xtype: 'note-main-view',
			triggerAnalyticsViews: true,
			record: record,
			readerContext: context,
			doClose: this.doClose.bind(this),
			state: this.state,
			scrollingParent: this.scrollingParent,
			scrollToId: record.getId() !== this.record.getId() ? this.record.getId() : null
		});
	},


	loadRoot: function() {
		var root = this.record.get('references')[0];

		Service.getObject(root)
			.then(this.loadNote.bind(this), this.loadParent.bind(this));
	},


	loadParent: function() {
		var parent = this.record.get('inReplyTo');

		Service.getObject(parent)
			.then(this.loadNote.bind(this), this.loadNote.bind(this, this.record));
	},


	allowNavigation: function() {
		var panel = this.down('note-main-view');

		if (!panel) { return true; }

		return panel.allowNavigation();
	}
}, function() {
	NextThought.app.windows.StateStore.register(NextThought.model.Note.mimeType, this);
});
