const Ext = require('@nti/extjs');
const DiscussionRef = require('internal/legacy/model/DiscussionRef');
const Globals = require('internal/legacy/util/Globals');

const EditingActions = require('../../Actions');

require('../Editor');
require('internal/legacy/model/DiscussionRef');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.discussion.DiscussionEditor',
	{
		extend:
			'NextThought.app.course.overview.components.editing.content.Editor',
		alias: 'widget.overview-editing-discussion-editor',
		cls: 'content-editor discussion-link',

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
							height: 115,
							width: 230,
							placeholder: DiscussionRef.defaultIcon,
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
									maxlength: EditingActions.MAX_TITLE_LENGTH,
								},
							],
						},
						{ type: 'saveprogress' },
					],
				},
			];
		},

		getDefaultValues() {
			const data = this.record?.getData?.();
			if (data) {
				return Ext.apply(data, {
					icon: this.getThumbnailURL(),
					target:
						this.record.get('Target-NTIID') ||
						this.record.get('ID') ||
						this.record.getId(),
					MimeType: DiscussionRef.mimeType,
				});
			}

			return {
				MimeType: DiscussionRef.mimeType,
			};
		},

		afterRender() {
			this.callParent(arguments);

			const form = this.getForm();
			const url = this.getThumbnailURL();
			if (Ext.isEmpty(url) && form?.setPlaceholder) {
				form.setPlaceholder('icon', DiscussionRef.defaultIcon);
			}
		},

		isDiscussionRef(record) {
			return record?.get('MimeType') === DiscussionRef.mimeType;
		},

		getFormMethod() {
			return this.isDiscussionRef(this.record) ? 'PUT' : 'POST';
		},

		getThumbnailURL() {
			var iconURL = this.record && this.record.get('icon');
			if (iconURL) {
				if (Globals.ROOT_URL_PATTERN.test(iconURL)) {
					return Globals.getURL(iconURL);
				}

				iconURL = (this.basePath || '') + iconURL;
				return Globals.getURL(iconURL);
			}

			return '';
		},

		async onSave() {
			const { parentSelection } = this;
			const originalPosition = parentSelection?.getOriginalPosition();
			const currentPosition = parentSelection?.getCurrentPosition();
			const isDiscussionRef = this.isDiscussionRef(this.record);
			const rec = isDiscussionRef ? this.record : null;

			this.clearErrors();
			this.disableSubmission();

			try {
				await this.EditingActions.saveEditorForm(
					this.formCmp,
					rec,
					originalPosition,
					currentPosition,
					this.rootRecord
				);
			} catch (er) {
				this.enableSubmission();
				throw er;
			}
		},
	}
);
