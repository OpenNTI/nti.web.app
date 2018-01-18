const Ext = require('extjs');

const LTIExternalToolAsset = require('legacy/model/LTIExternalToolAsset');
const EditingActions = require('../../Actions');

require('../Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.ltiexternaltoolasset.LTIExternalToolAssetEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-ltiexternaltoolasset-editor',

	showEditor: function () {
		this.callParent();

		this.parentSelection = this.addParentSelection(this.record, this.parentRecord, this.rootRecord, this.onFormChange.bind(this));

		if (this.selectedItem) {
			this.addPreview(this.selectedItem);
		}

		if (this.record) {
			this.deleteBtn = this.addDeleteButton();
		}
	},

	getFormSchema: function () {
		var schema = [
			{name: 'MimeType', type: 'hidden'},
			{type: 'group', name: 'card', inputs: [
				{type: 'group', name: 'meta', inputs: [
					{
						name: 'label',
						type: 'text',
						placeholder: 'Title',
						required: true,
						maxlength: EditingActions.MAX_TITLE_LENGTH
					},
					{name: 'description', type: 'textarea', placeholder: 'Description'}
				]},
				{type: 'saveprogress'}
			]}
		];
		return schema;
	},

	addPreview: function (item) {
		var me = this,
			parts = [
				{cls: 'consumer-key', html: item.consumer_key},
				{cls: 'secret', html: item.secret}
			];

		me.add({
			xtype: 'box',
			autoEl: {
				cls: 'assignment-preview',
				cn: parts
			},
		});
	},

	getValues: function () {
		var item = this.selectedItem;

		return {
			MimeType: LTIExternalToolAsset.mimeType,
			ConfiguredTool: item.ntiid
		};

	},

	onSave: function () {
		var me = this,
			parentSelection = me.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition(),
			values = me.getValues();

		me.clearErrors();
		me.disableSubmission();

		return me.EditingActions.saveValues(values, me.record, originalPosition, currentPosition, me.rootRecord)
			.catch(function (reason) {
				me.enableSubmission();

				return Promise.reject(reason);
			});
	}

});
