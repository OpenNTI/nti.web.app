const Ext = require('@nti/extjs');
const { getService } = require('@nti/web-client');
const { buffer } = require('@nti/lib-commons');
const RelatedWork = require('internal/legacy/model/RelatedWork');

require('./Base');

const Type = 'application/vnd.nextthought.relatedworkref';

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.contentlink.types.URL',
	{
		extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
		alias: 'widget.overview-editing-contentlink-url',

		statics: {
			getTypes: function () {
				return [
					{
						title: 'Website Link',
						category: 'content',
						iconCls: 'link',
						description: 'External links are used for',
						editor: this,
						isAvailable: async bundle => {
							const available =
								await bundle.getAvailableContentSummary();

							return available[Type];
						},
					},
				];
			},

			//TODO: override getEditorForRecord to check if the related work ref
			//is pointing to a url
			getEditorForRecord: function (record) {
				if (record.isExternalLink()) {
					return this;
				}
			},
		},

		cls: 'content-editor content-link url',

		afterRender: function () {
			this.callParent(arguments);

			this.formCmp.setPlaceholder('icon', RelatedWork.getIconForURL());

			const { href } = this.getForm().getValues();
			if (href === 'http://' || !this.hasValues()) {
				this.el.select('.group.card').addCls('blocked');
				this.el.select('.group.card input').set({ disabled: true });
				this.el.select('.group.card textarea').set({ disabled: true });
			}

			this.reallyRendered = true;
		},

		hasValues() {
			const form = this.getForm();
			const { label, byline, description } = form.getValues();
			return (
				!Ext.isEmpty(label) ||
				!Ext.isEmpty(byline) ||
				!Ext.isEmpty(description)
			);
		},

		getDefaultValues: function () {
			var base = this.callParent(arguments);

			base.targetMimeType = RelatedWork.EXTERNAL_TYPE;

			if (this.params && this.params.title) {
				base.label = this.params && this.params.title;
			}

			if (this.params && this.params.url) {
				base.href = this.params && this.params.url;
			}

			return base;
		},

		getFormSchema: function () {
			var base = this.callParent(arguments);

			base.push({ type: 'hidden', name: 'targetMimeType' });

			if (!this.record || this.record.hasLink('edit-target')) {
				base.unshift({
					type: 'url',
					name: 'href',
					required: true,
					onChange: this.onInputChange.bind(this),
				});
			}

			return base;
		},

		onInputChange(value, valid) {
			this.resolveMeta.cancel();
			if (this.reallyRendered && valid) {
				this.resolveMeta(value);
			}
		},

		resolveMeta: buffer(1000, async function (uri) {
			this.matadataCache = this.matadataCache || {};

			const blank = this.el.select('.group.card').hasCls('blocked');

			if (!uri || !blank || this.matadataCache[uri]) {
				return;
			}

			const nonce = {};

			try {
				this.el.select('.group.card').addCls('blocked');
				this.el.select('.url-field').addCls('loading');
				this.resolveNonce = nonce;

				const data = (this.matadataCache[uri] = await (
					await getService()
				).getMetadataFor(uri));

				if (this.resolveNonce === nonce) {
					await this.applyMetadata(data);
				}
			} finally {
				if (this.resolveNonce === nonce) {
					delete this.resolveNonce;
					this.el.select('.url-field').removeCls('loading');
					this.el.select('.group.card').removeCls('blocked');
					this.el
						.select('.group.card input')
						.set({ disabled: void 0 });
					this.el
						.select('.group.card textarea')
						.set({ disabled: void 0 });
				}
			}
		}),

		async applyMetadata(data) {
			const {
				images = [],
				title,
				creator,
				contentLocation,
				sourceLocation,
				description,
			} = data;
			const [image] = images;
			const uri = contentLocation || sourceLocation;
			const form = this.getForm();
			form.setValue('label', title);
			form.setValue('byline', creator || new URL(uri).host);
			form.setValue('description', description);

			if (image) {
				const service = await getService();
				const blob = await service.get({
					url: image.getLink('safeimage'),
					blob: true,
				});

				form.getInputForField('icon').setValueFromBlob(blob, image.url);
			}
		},
	}
);
