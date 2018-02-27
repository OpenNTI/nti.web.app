const Ext = require('extjs');

const LTIExternalToolAsset = require('legacy/model/LTIExternalToolAsset');
const EditingActions = require('../../Actions');

require('../Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.ltiexternaltoolasset.LTIExternalToolAssetEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-ltiexternaltoolasset-editor',

	showEditor: function () {

		this.callParent();

		if (this.record) {
			this.deleteBtn = this.addDeleteButton();
		}
	},

	getFormSchema: function () {
		var schema = [
			{name: 'MimeType', type: 'hidden'},
			{name: 'ConfiguredTool', type: 'hidden'},
			{type: 'group', name: 'card', inputs: [
				{type: 'group', name: 'meta', inputs: [
					{
						name: 'label',
						type: 'text',
						placeholder: 'Title',
						maxlength: EditingActions.MAX_TITLE_LENGTH
					},
					{name: 'description', type: 'textarea', placeholder: 'Description'}
				]},
				{type: 'saveprogress'}
			]}
		];
		return schema;
	},

	getDefaultValues: function () {
		if (this.record) {
			return this.record.isModel && this.record.getData();
		}

		return {
			MimeType: LTIExternalToolAsset.mimeType,
			ConfiguredTool: this.selectedItem.NTIID
		};

	},

	onSave: function () {
		var me = this,
			parentSelection = me.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition();

		me.clearErrors();
		me.disableSubmission();

		return me.EditingActions.saveEditorForm(me.formCmp, me.record, originalPosition, currentPosition, me.rootRecord)
			.catch(function (reason) {
				me.enableSubmission();

				return Promise.reject(reason);
			});
	}

});
