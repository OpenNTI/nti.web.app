Ext.define('NextThought.app.course.overview.components.editing.content.discussion.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-discussion',

	requires: [
		'NextThought.model.DiscussionRef',
		'NextThought.app.course.overview.components.editing.content.discussion.ItemSelection',
		'NextThought.app.course.overview.components.editing.content.discussion.DiscussionEditor'
	],

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.DiscussionRef.mimeType,
				NextThought.model.Discussion.mimeType
			];
		},

		getTypes: function() {
			return [
				{
					title: 'Pick a Discussion',
					advanced: true,
					category: 'Discussion',
					iconCls: 'Discussion',
					description: '',
					editor: this
				}
			];
		}
	},

	SWITCHED: 'switched-items',

	addFormCmp: function() {},


	showEditor: function() {
		if (this.record) {
			this.showDiscussionEditor();
		} else {
			this.showDiscussionList();
		}
	},

	showDiscussionEditor: function(){
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
			basePath: this.bundle && this.bundle.getContentRoots()[0] 
		});
	},


	showDiscussionList: function(selectedItems){
		var me = this;

		if (this.discussionsListCmp) {
			this.discussionsListCmp.destroy();
			delete this.discussionsListCmp;
		}

		this.removeAll(true);

		this.discussionsListCmp = this.add({
			xtype: 'overview-editing-discussion-item-selection',
			selectedItems: selectedItems,
			basePath: this.bundle && this.bundle.getContentRoots()[0],
			onSelectionChanged: this.onDiscussionSelectionChange.bind(this)
		});

		me.bundle.getDiscussionAssets()
			.then(me.__sortDiscussions.bind(me))
			.then(function(discussions) {
				me.discussionsListCmp.setSelectionItems(discussions);	
			});
	},


	__sortDiscussions: function(discussions){
		return discussions;
	},


	onDiscussionSelectionChange: function(selection) {
		var length = selection.length;

		if (length === 0) {
			this.disableSave();
		} else {
			this.record = selection[0];
			this.enableSave();
		}
	},


	onSave: function(){
		var me = this;
		if (!me.discussionEditorCmp) {
			me.showDiscussionEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.discussionEditorCmp.onSave()
			.fail(function(reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	},


	onSaveFailure: function(reason) {
		if (reason === this.SWITCHED) { return; }

		this.callParent(arguments);
	}
});
