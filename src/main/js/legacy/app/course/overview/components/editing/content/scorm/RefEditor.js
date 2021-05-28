const Ext = require('@nti/extjs');

const EditingActions = require('../../Actions');

const PLACEHOLDER_ICON = '/app/resources/images/file-icons/scorm-icon.svg';

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.scorm.RefEditor',
	{
		extend: 'NextThought.app.course.overview.components.editing.content.Editor',
		alias: 'widget.scorm-ref-editor',

		cls: 'content-editor content-link scorm-ref-editor',

		getIconPlaceholder() {
			return null;
		},

		getFormSchema() {
			return [
				{ name: 'MimeType', type: 'hidden' },
				{ name: 'target', type: 'hidden' },
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
									type: 'textarea',
									placeholder: 'Title',
									required: true,
									maxLength: EditingActions.MAX_TITLE_LENGTH,
								},
								{
									name: 'description',
									type: 'textarea',
									placeholder: 'Description',
								},
							],
						},
					],
				},
				{ type: 'saveprogress' },
			];
		},

		afterRender() {
			this.callParent(arguments);

			this.formCmp.setPlaceholder('icon', PLACEHOLDER_ICON);
		},

		getDefaultValues() {
			if (this.record) {
				return {
					MimeType: 'application/vnd.nextthought.scormcontentref',
					title: this.record.get('title'),
					description: this.record.get('description'),
					icon: this.record.get('icon'),
					target: this.record.get('target'),
				};
			}

			if (this.interfaceInstance) {
				const instance = this.interfaceInstance;

				return {
					MimeType: 'application/vnd.nextthought.scormcontentref',
					title: instance.title,
					description: instance.description,
					icon: instance.icon,
					target: instance.getID(),
				};
			}

			return {};
		},
	}
);
