const Ext = require('@nti/extjs');

const WindowsStateStore = require('legacy/app/windows/StateStore');
const ContainerContext = require('legacy/app/context/ContainerContext');
const Note = require('legacy/model/Note');

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

	loadNote: function (record) {
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
	},

	showNewReply () {
		const notePanel = this.down('note-main-view');

		if (!notePanel) {
			this.on({
				single: true,
				'note-panel-set': () => this.showNewReply()
			});
		} else {
			notePanel.activateReplyEditor();
		}
	},

	getReplyCmp (replyId) {
		const notePanel = this.down('note-main-view');

		if (notePanel && notePanel.repliesHaveBeenAdded) {
			return Promise.resolve(notePanel.getReplyCmp(replyId));
		}

		if (notePanel) {
			return new Promise((fulfill, reject) => {
				notePanel.on({
					single: true,
					'replies-added': () => {
						this.getReplyCmp(replyId)
							.then(fulfill, reject);
					}
				});
			});
		}

		return new Promise((fulfill, reject) => {
			this.on({
				single: true,
				'note-panel-set': () => {
					this.getReplyCmp(replyId)
						.then(fulfill, reject);
				}
			});
		});
	}
}, function () {
	WindowsStateStore.register(Note.mimeType, this);
});
