var Ext = require('extjs');
var ContentEditor = require('../../Editor');
var ModelRelatedWork = require('../../../../../../../../model/RelatedWork');
var EditingActions = require('../../../Actions');
var ContentParentSelection = require('../../ParentSelection');
var ControlsAdvanced = require('../../../controls/Advanced');
var SettingsWindow = require('../../../settings/Window');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Base', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',

	inheritableStatics: {
		getHandledMimeTypes: function () {
			return [
				NextThought.model.RelatedWork.mimeType
			];
		}
	},

	cls: 'content-editor content-link',

	getFormSchema: function () {
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

	getDefaultValues: function () {
		if (this.record) {
			return this.record.isModel && this.record.getData();
		}

		return {
			MimeType: NextThought.model.RelatedWork.mimeType
		};
	},

	showEditor: function () {
		this.callParent(arguments);

		if (Service.canDoAdvancedEditing()) {
			this.addAdvancedDisclosure();
		}
	},

	addAdvancedDisclosure: function () {
		var visibility = this.record && this.record.get('visibility'),
			me = this;

		if (this.visibilityCmp) { return; }

		this.getSchema()
			.then(function (schema) {
				me.visibilityCmp = me.add({
					xtype: 'overview-editing-controls-advanced-settings',
					record: me.record,
					parentRecord: me.parentRecord,
					defaultValue: visibility,
					schema: schema && schema.Fields && schema.Fields.visibility,
					onChange: me.onVisibilityChange.bind(me)
				});
			});
	},

	onVisibilityChange: function (cmp) {
		var value = cmp && cmp.getValue();

		console.log('changed visibility to: ', value.visibility);
	}
});
