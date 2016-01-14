Ext.define('NextThought.app.course.overview.components.editing.content.discussion.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-discussion',

	requires: [
		'NextThought.model.DiscussionRef',
		'NextThought.app.course.overview.components.editing.content.discussion.ItemSelection'
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

	addFormCmp: function() {},


	showEditor: function() {
		if (this.record) {
			this.showDiscussionEditor();
		} else {
			this.showDiscussionList();
		}
	},

	showDiscussionEditor: function(){
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
			basePath: this.bundle && this.bundle.getContentRoots()[0]
		});

		me.bundle.getDisucssionAssets()
			.then(me.__sortDiscussions.bind(me))
			.then(function(discussions) {
				me.discussionsListCmp.setSelectionItems(discussions);	
			});
	},


	__sortDiscussions: function(discussions){
		return discussions;
	}

});
