Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-overviewgroup-editog',

	requires: [
		'NextThought.model.courses.overview.Group',
		'NextThought.app.course.overview.components.editing.content.overviewgroup.InlineEditor'
	],


	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.overview.Group.mimeType
			];
		},


		getTypes: function() {
			return [
				{
					title: 'Group',
					category: 'content',
					iconCls: 'group',
					description: 'Groups are used for',
					editor: this
				}
			];
		}
	},


	addFormCmp: function() {
		return this.add({
			xtype: 'overview-editing-overviewgroup-inlineeditor',
			record: this.record,
			onChange: this.onFormChange.bind(this)
		});
	},


	doSave: function() {
		return this.EditingActions.saveValues(this.formCmp.getValue(), this.record, this.parentRecord, this.parentRecord, this.rootRecord);
	}
});
