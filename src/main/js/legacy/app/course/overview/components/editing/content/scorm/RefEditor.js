const Ext = require('@nti/extjs');

const EditingActions = require('../../Actions');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.scorm.RefEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.scorm-ref-editor',

	cls: 'content-editor content-link scorm-ref-editor',

	getIconPlaceholder () { return null; },

	getFormSchema () {
		return [
			{name: 'MimeType', type: 'hidden'},
			{name: 'scorm_id', type: 'hidden'},
			{type: 'group', name: 'card', inputs: [
				{name: 'icon', type: 'image', height: 125, width: 100},
				{type: 'group', name: 'meta', inputs: [
					{name: 'title', type: 'text', placeholder: 'Title', required: true, maxLength: EditingActions.MAX_TITLE_LENGTH},
					{name: 'byline', type: 'text', placeholder: 'Author'},
					{name: 'description', type: 'textarea', placeholder: 'Description'}
				]}
			]},
			{type: 'saveprogress'}
		];
	},


	getDefaultValues () {
		const instance = this.interfaceInstance;

		return {
			MimeType: 'application/vnd.nextthought.scormcontentref',
			title: instance.title,
			description: instance.description,
			byline: instance.byline,
			icon: instance.icon,
			'scorm_id': instance.scormId
		};
	}
});