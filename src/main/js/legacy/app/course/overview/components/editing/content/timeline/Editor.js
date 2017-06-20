const Ext = require('extjs');

const Timeline = require('legacy/model/Timeline');

require('../Editor');
require('./ItemSelection');
require('./TimelineEditor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.timeline.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-timeline',

	statics: {
		getHandledMimeTypes: function () {
			return [
				Timeline.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Pick a Timeline',
					advanced: true,
					category: 'Timeline',
					iconCls: 'timeline',
					description: '',
					editor: this
				}
			];
		}
	},

	addFormCmp: function () {},

	showEditor: function () {
		if (this.selectedItems || this.record) {
			this.showTimelineEditor();
		} else {
			this.showTimelineList();
		}
	},

	showTimelineEditor: function () {
		if (this.timelineEditorCmp) {
			this.timelineEditorCmp.destroy();
			delete this.timelineEditorCmp;
		}

		this.removeAll(true);

		this.editorCmp = this.add({
			xtype: 'overview-editing-timeline-editor',
			parentRecord: this.parentRecord,
			record: this.record,
			selectedItems: this.selectedItems,
			rootRecord: this.rootRecord,
			doClose: this.doClose,
			showError: this.showError,
			basePath: this.bundle && this.bundle.getContentRoots()[0],
			enableSave: this.enableSave,
			disableSave: this.disableSave
		});

		this.maybeEnableBack('Timeline');
	},

	showTimelineList: function () {
		var me = this;

		if (this.listCmp) {
			this.listCmp.destroy();
			delete this.listCmp;
		}

		if (this.editorCmp) {
			this.editorCmp.destroy();
			delete this.editorCmp;
		}

		this.maybeEnableBack(this.backText);
		this.removeAll(true);

		this.listCmp = this.add({
			xtype: 'overview-editing-timeline-item-selection',
			basePath: this.bundle && this.bundle.getContentRoots()[0],
			onSelectionChanged: this.onDiscussionSelectionChange.bind(this)
		});

		me.bundle.getTimelineAssets()
			.then(me.__sortTimelines.bind(me))
			.then(function (items) {
				me.listCmp.setSelectionItems(items);
			});
	},

	__sortTimelines: function (items) {
		return items;
	},

	onDiscussionSelectionChange: function (selection) {
		var length = selection.length;

		if (length === 0) {
			this.disableSave();
		} else {
			this.selectedItems = selection;
			this.enableSave();
		}
	},

	maybeEnableBack: function (text) {
		if (!this.record && this.enableBack) {
			this.enableBack(text);
		}
	},

	onSave: function () {
		var me = this;
		if (!me.editorCmp) {
			me.showTimelineEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.editorCmp.onSave()
			.catch(function (reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	},

	onSaveFailure: function (reason) {
		if (reason === this.SWITCHED) { return; }

		this.callParent(arguments);
	}
});
