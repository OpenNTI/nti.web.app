Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Base', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',

	requires: [
		'NextThought.model.RelatedWork',
		'NextThought.app.course.overview.components.editing.Actions',
		'NextThought.app.course.overview.components.editing.content.ParentSelection',
		'NextThought.app.course.overview.components.editing.controls.Advanced',
		'NextThought.app.course.overview.components.editing.settings.Window'
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
			MimeType: NextThought.model.RelatedWork.mimeType
		};
	},


	showEditor: function(){
		this.callParent(arguments);

		if (this.record) {
			this.addAdvancedDisclosure();	
		}
	},


	addAdvancedDisclosure: function(){
		var visibility = this.record && this.record.get('visibility'),
			AdvancedWindow = NextThought.app.course.overview.components.editing.settings.Window,
			canHaveAdvancedWindow = AdvancedWindow.canChangeVisibility(this.record);

		if (!canHaveAdvancedWindow || this.visibilityCmp) { return; }

		this.visibilityCmp = this.add({
			xtype: 'overview-editing-controls-advanced-settings',
			record: this.record,
			parentRecord: this.parentRecord,
			defaultValue: visibility,
			onChange: this.onVisibilityChange.bind(this)
		});
	},


	onVisibilityChange: function(cmp){
		var value = cmp && cmp.getValue();

		console.log('changed visibility to: ', value.visibility);
	}
});
