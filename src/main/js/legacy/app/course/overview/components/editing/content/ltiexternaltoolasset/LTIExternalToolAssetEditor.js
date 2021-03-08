const Ext = require('@nti/extjs');
const LTIExternalToolAsset = require('internal/legacy/model/LTIExternalToolAsset');

const EditingActions = require('../../Actions');

require('../Editor');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.ltiexternaltoolasset.LTIExternalToolAssetEditor',
	{
		extend:
			'NextThought.app.course.overview.components.editing.content.Editor',
		alias: 'widget.overview-editing-ltiexternaltoolasset-editor',

		getIconPlaceholder() {
			return null;
		},

		getFormSchema: function () {
			var schema = [
				{ name: 'MimeType', type: 'hidden' },
				{ name: 'ConfiguredTool', type: 'hidden' },
				{
					type: 'group',
					name: 'card',
					inputs: [
						{
							name: 'icon',
							type: 'image',
							height: 125,
							width: 100,
						},
						{
							type: 'group',
							name: 'meta',
							inputs: [
								{
									name: 'title',
									type: 'text',
									placeholder: 'Title',
									maxlength: EditingActions.MAX_TITLE_LENGTH,
								},
								{
									name: 'byline',
									type: 'text',
									placeholder: 'Author',
								},
								{
									name: 'description',
									type: 'textarea',
									placeholder: 'Description',
								},
								{
									name: 'launch_url',
									type: 'text',
									placeholder: 'Launch URL',
								},
							],
						},
					],
				},
			];
			return schema;
		},

		getDefaultValues: function () {
			if (this.record && this.record.isModel) {
				const data = this.record.getData();
				data.ConfiguredTool = this.selectedItem.OID;
				return data;
			}

			return {
				MimeType: LTIExternalToolAsset.mimeType,
				ConfiguredTool: this.selectedItem.OID,
			};
		},

		onSave: function () {
			var me = this,
				parentSelection = me.parentSelection,
				originalPosition =
					parentSelection && parentSelection.getOriginalPosition(),
				currentPosition =
					parentSelection && parentSelection.getCurrentPosition();

			me.clearErrors();
			me.disableSubmission();

			return me.EditingActions.saveEditorForm(
				me.formCmp,
				me.record,
				originalPosition,
				currentPosition,
				me.rootRecord
			).catch(function (reason) {
				me.enableSubmission();

				// reduce the error to just a message and code, no field names, since we don't have a form here
				return Promise.reject({
					msg: reason.message,
					code: reason.code,
				});
			});
		},
	}
);
