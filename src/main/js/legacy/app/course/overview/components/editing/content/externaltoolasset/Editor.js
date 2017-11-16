const Ext = require('extjs');

const EditingActions = require('../../Actions');
const ExternalToolAsset = require('legacy/model/ExternalToolAsset');

require('../Editor');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.externaltoolasset.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-externaltoolasset',

	statics: {
		getHandledMimeTypes: function () {
			return [
				ExternalToolAsset.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Add an LTI Tool',
					advanced: false,
					category: 'externaltoolasset',
					iconCls: 'link',
					description: '',
					editor: this
				}
			];
		}
	},

	cls: 'content-editor externaltoolasset',

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

});
