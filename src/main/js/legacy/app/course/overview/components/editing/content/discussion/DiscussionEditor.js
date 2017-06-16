var Ext = require('extjs');
var Globals = require('../../../../../../../util/Globals');
var {getURL} = Globals;
require('../Editor');
require('legacy/model/DiscussionRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.discussion.DiscussionEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-discussion-editor',
	cls: 'content-editor discussion-link',

	getFormSchema: function () {
		var schema = [
				{name: 'MimeType', type: 'hidden'},
				{name: 'target', type: 'hidden'},
			{type: 'group', name: 'card', inputs: [
				{
					name: 'icon',
					type: 'image',
					height: 115,
					width: 230,
					placeholder: NextThought.model.DiscussionRef.defaultIcon
				},
				{
					type: 'group',
					name: 'meta',
					inputs: [
						{
							name: 'title',
							type: 'textarea',
							placeholder: 'Title',
							required: true,
							keep: true,
							maxlength: NextThought.app.course.overview.components.editing.Actions.MAX_TITLE_LENGTH
						}
					]
				},
					{type: 'saveprogress'}
			]}
		];

		return schema;
	},

	getDefaultValues: function () {
		if (this.record) {
			var data = this.record.isModel && this.record.getData();

			data = Ext.apply(data, {
				'icon': this.getThumbnailURL(),
				'target': this.record.get('Target-NTIID') || this.record.get('ID') || this.record.getId(),
				MimeType: NextThought.model.DiscussionRef.mimeType
			});

			return data;
		}

		return {
			MimeType: NextThought.model.DiscussionRef.mimeType
		};
	},

	afterRender: function () {
		this.callParent(arguments);

		let form = this.getForm(),
			url = this.getThumbnailURL();
		if (Ext.isEmpty(url) && form && form.setPlaceholder) {
			form.setPlaceholder('icon', NextThought.model.DiscussionRef.defaultIcon);
		}
	},

	isDiscussionRef: function (record) {
		if (record && record.get('MimeType') === NextThought.model.DiscussionRef.mimeType) {
			return true;
		}

		return false;
	},

	getFormMethod: function () {
		var isDiscussionRef = this.isDiscussionRef(this.record);
		if (isDiscussionRef) {
			return 'PUT';
		}

		return 'POST';
	},

	getThumbnailURL: function () {
		var iconURL = this.record && this.record.get('icon');
		if (iconURL) {
			if (Globals.ROOT_URL_PATTERN.test(iconURL)) {
				return getURL(iconURL);
			}

			iconURL = (this.basePath || '') + iconURL;
			return getURL(iconURL);
		}

		return '';
	},

	onSave: function () {
		var me = this,
			parentSelection = me.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition(),
			isDiscussionRef = this.isDiscussionRef(this.record),
			rec = isDiscussionRef ? this.record : null;

		me.clearErrors();
		me.disableSubmission();

		return me.EditingActions.saveEditorForm(me.formCmp, rec, originalPosition, currentPosition, me.rootRecord)
			.then(function (rec) {

			})
			.catch(function (reason) {
				me.enableSubmission();

				return Promise.reject(reason);
			});
	}
});
