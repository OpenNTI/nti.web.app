const Ext = require('@nti/extjs');
const {Viewer} = require('@nti/web-discussions');

const WindowsStateStore = require('legacy/app/windows/StateStore');
const ContainerContext = require('legacy/app/context/ContainerContext');
const Note = require('legacy/model/Note');

require('legacy/overrides/ReactHarness');

require('legacy/app/windows/components/Header');
require('legacy/app/windows/components/Loading');
require('./Main');


module.exports = exports = Ext.define('NextThought.app.annotations.note.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.note-panel-window',
	layout: 'none',
	cls: 'note-window',

	initComponent: function () {
		this.callParent(arguments);

		this.loadingEl = this.add({xtype: 'window-loading'});

		if (this.record.get('inReplyTo')) {
			this.loadRoot();
		} else {
			this.loadNote(this.record);
		}
	},

	async loadNote (record) {
		const note = await record.getInterfaceInstance();

		if (this.loadingEl) {
			this.remove(this.loadingEl, true);
			delete this.loadingEl;
		}

		this.add({
			baseroute: global?.location?.pathname.replace(/\/?$/, ''),
			// addHistory: true,
			xtype: 'react',
			component: Viewer,
			discussion: note,
			dialog: true,
			onClose: this.doClose.bind(this)
		});
	},

	xloadNote: function (record) {
		var context = ContainerContext.create({
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

		this.fireEvent('note-panel-set');
	},

	loadRoot: function () {
		var root = this.record.get('references')[0];

		Service.getObject(root)
			.then(this.loadNote.bind(this), this.loadParent.bind(this));
	},

	loadParent: function () {
		var parent = this.record.get('inReplyTo');

		Service.getObject(parent)
			.then(this.loadNote.bind(this), this.loadNote.bind(this, this.record));
	},

	allowNavigation: function () {
		var panel = this.down('note-main-view');

		if (!panel) { return true; }

		return panel.allowNavigation();
	}
}, function () {
	WindowsStateStore.register(Note.mimeType, this);
});
