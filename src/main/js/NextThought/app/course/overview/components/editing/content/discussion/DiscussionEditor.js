Ext.define('NextThought.app.course.overview.components.editing.content.discussion.DiscussionEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-discussion-editor',

	cls: 'content-editor content-link',


	getFormSchema: function() {
		var schema = [
				{name: 'MimeType', type: 'hidden'},
				{name: 'target', type: 'hidden'},
				{type: 'group', name: 'card', inputs: [
					{name: 'icon', type: 'image', height: 125, width: 100},
					{type: 'group', name: 'meta', inputs: [
						{
							name: 'title',
							type: 'text',
							placeholder: 'Title',
							required: true,
							maxlength: NextThought.app.course.overview.components.editing.Actions.MAX_TITLE_LENGTH
						},
						{name: 'byline', type: 'text', placeholder: 'Author'},
						{name: 'description', type: 'textarea', placeholder: 'Description'}
					]},
					{type: 'saveprogress'}
				]}
			];

		return schema;
	},


	getDefaultValues: function() {
		if (this.record) {
			var data = this.record.isModel && this.record.getData();

			data = Ext.apply(data, {
				'icon': this.getThumbnailURL(),
				'target': this.record.get('ID') || this.record.getId(),
				MimeType: NextThought.model.DiscussionRef.mimeType
			});

			return data;
		}

		return {
			MimeType: NextThought.model.DiscussionRef.mimeType
		};
	},

	getFormMethod: function() {
		return 'POST';
	},

	getThumbnailURL: function() {
		var iconURL = this.record && this.record.get('icon');
		if (iconURL) {
			iconURL = (this.basePath || '') + iconURL;
			return getURL(iconURL);
		}

		return '';
	},


	onSave: function() {
		var me = this,
			parentSelection = me.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition();

		me.clearErrors();
		me.disableSubmission();

		return me.EditingActions.saveEditorForm(me.formCmp, null, originalPosition, currentPosition, me.rootRecord)
			.then(function(rec) {

			})
			.fail(function(reason) {
				me.enableSubmission();

				return Promise.reject(reason);
			});
	}
});
