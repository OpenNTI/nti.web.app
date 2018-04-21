const Ext = require('@nti/extjs');

const RelatedWork = require('legacy/model/RelatedWork');

const EditingActions = require('../../../Actions');

require('../../../controls/Advanced');
require('../../../settings/Window');
require('../../Editor');
require('../../ParentSelection');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Base', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',

	inheritableStatics: {
		getHandledMimeTypes: function () {
			return [
				RelatedWork.mimeType
			];
		}
	},

	cls: 'content-editor content-link',

	allowTypeSwitch: true,

	getIconPlaceholder () { return null; },

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
						maxlength: EditingActions.MAX_TITLE_LENGTH
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

		const copy = this.copyValues;
		const data = {
			MimeType: RelatedWork.mimeType
		};

		if (copy) {
			data.label = copy.label;
			data.icon = copy.icon;
			data.byline = copy.byline;
			data.description = copy.description;
		}


		return data;
	},

	showEditor: function () {
		this.callParent(arguments);

		this.addAdvancedDisclosure();
	},

	addAdvancedDisclosure: function () {
		var visibility = (this.record && this.record.get('visibility')) || (this.copyVisibility && this.copyVisibility.visibility) ,
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
