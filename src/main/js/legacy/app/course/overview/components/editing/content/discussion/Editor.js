var Ext = require('extjs');
var ContentEditor = require('../Editor');
var ModelDiscussionRef = require('../../../../../../../model/DiscussionRef');
var DiscussionItemSelection = require('./ItemSelection');
var DiscussionDiscussionEditor = require('./DiscussionEditor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.discussion.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-discussion',

	statics: {
		getHandledMimeTypes: function () {
			return [
				NextThought.model.DiscussionRef.mimeType,
				NextThought.model.Discussion.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Pick a Discussion',
					advanced: false,
					category: 'Discussion',
					iconCls: 'discussion',
					description: '',
					editor: this
				}
			];
		}
	},

	SWITCHED: 'switched-items',
	addFormCmp: function () {},

	showEditor: function () {
		if (this.record) {
			this.showDiscussionEditor();
		} else {
			this.showDiscussionList();
		}
	},

	onBack: function () {
		if (this.discussionEditorCmp) {
			this.showDiscussionList();
		} else if (this.doBack) {
			this.doBack();
		}
	},

	maybeEnableBack: function (text) {
		if (!this.record && this.enableBack) {
			this.enableBack(text);
		}
	},

	showDiscussionEditor: function () {
		if (this.discussionEditorCmp) {
			this.discussionEditorCmp.destroy();
			delete this.discussionEditorCmp;
		}

		this.removeAll(true);

		this.discussionEditorCmp = this.add({
			xtype: 'overview-editing-discussion-editor',
			parentRecord: this.parentRecord,
			record: this.record,
			rootRecord: this.rootRecord,
			doClose: this.doClose,
			showError: this.showError,
			basePath: this.bundle && this.bundle.getContentRoots()[0],
			enableSave: this.enableSave,
			disableSave: this.disableSave
		});

		this.maybeEnableBack('Discussions');
	},

	showDiscussionList: function (selectedItems) {
		var me = this;

		if (this.discussionsListCmp) {
			this.discussionsListCmp.destroy();
			delete this.discussionsListCmp;
		}

		if (this.discussionEditorCmp) {
			this.discussionEditorCmp.destroy();
			delete this.discussionEditorCmp;
		}

		this.maybeEnableBack(this.backText);
		this.removeAll(true);

		this.discussionsListCmp = this.add({
			xtype: 'overview-editing-discussion-item-selection',
			selectedItems: selectedItems,
			basePath: this.bundle && this.bundle.getContentRoots()[0],
			onSelectionChanged: this.onDiscussionSelectionChange.bind(this)
		});

		me.bundle.getDiscussionAssets()
			.then(me.__sortDiscussions.bind(me))
			.then(function (discussions) {
				me.discussionsListCmp.setSelectionItems(discussions);
			});
	},

	__sortDiscussions: function (discussions) {
		return discussions;
	},

	onDiscussionSelectionChange: function (selection) {
		var length = selection.length;

		if (length === 0) {
			this.disableSave();
		} else {
			this.record = selection[0];
			this.enableSave();
		}
	},

	onSave: function () {
		var me = this;
		if (!me.discussionEditorCmp) {
			me.showDiscussionEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.discussionEditorCmp.onSave()
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
