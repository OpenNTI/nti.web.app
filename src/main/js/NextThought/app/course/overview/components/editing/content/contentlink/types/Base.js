Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Base', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',

	requires: [
		'NextThought.model.RelatedWork',
		'NextThought.app.course.overview.components.editing.Actions',
		'NextThought.app.course.overview.components.editing.content.ParentSelection',
		'NextThought.app.course.overview.components.editing.controls.Visibility'
	],


	inheritableStatics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.RelatedWork.mimeType
			];
		}
	},

	cls: 'content-editor content-link',

	getFormSchema: function() {
		var schema = [
				{name: 'MimeType', type: 'hidden'},
				{name: 'visibility', type: 'hidden'},
				{type: 'group', name: 'card', inputs: [
					{name: 'icon', type: 'image', height: 125, width: 100},
					{type: 'group', name: 'meta', inputs: [
						{
							name: 'label',
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
			return this.record.isModel && this.record.getData();
		}

		return {
			MimeType: NextThought.model.RelatedWork.mimeType,
			visibility: 'everyone'
		};
	},


	showEditor: function(){
		this.callParent(arguments);

		if (this.record) {
			this.visibilityBtn = this.addVisibilityButton();	
		}	
	},


	addVisibilityButton: function(){
		var visibility = this.record && this.record.get('visibility');

		return this.add({
			xtype: 'overview-editing-controls-visibility',
			record: this.record,
			parentRecord: this.parentRecord,
			defaultValue: visibility,
			onChange: this.onVisibilityChange.bind(this)
		});
	},


	onVisibilityChange: function(cmp){
		var value = cmp && cmp.getValue();

		if (this.formCmp && this.formCmp.updateHiddenField) {
			this.formCmp.updateHiddenField('visibility', value.visibility);
		}
	}
});
