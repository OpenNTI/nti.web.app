const Ext = require('@nti/extjs');
const {getService} = require('@nti/web-client');
const {buffer} = require('@nti/lib-commons');

const RelatedWork = require('legacy/model/RelatedWork');

require('./Base');

const Type = 'application/vnd.nextthought.relatedworkref';

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.URL', {
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
					isAvailable: async (bundle) => {
						const available = await bundle.getAvailableContentSummary();

						return available[Type];
					}
				}
			];
		},

		//TODO: override getEditorForRecord to check if the related work ref
		//is pointing to a url
		getEditorForRecord: function (record) {
			if (record.isExternalLink()) {
				return this;
			}
		}
	},

	cls: 'content-editor content-link url',


	afterRender: function () {
		this.callParent(arguments);

		this.formCmp.setPlaceholder('icon', RelatedWork.getIconForURL());

		const { href } = this.getForm().getValues();
		if (href === 'http://' || !this.hasValues()) {
			this.el.select('.group.card').addCls('blocked');
			this.el.select('.group.card input').set({disabled: true});
			this.el.select('.group.card textarea').set({disabled: true});		}

		this.reallyRendered = true;
	},

	hasValues () {
		const form = this.getForm();
		const { label, byline, description } = form.getValues();
		return !Ext.isEmpty(label) || !Ext.isEmpty(byline) || !Ext.isEmpty(description);
	},


	getDefaultValues: function () {
		var base = this.callParent(arguments);

		base.targetMimeType = RelatedWork.EXTERNAL_TYPE;

		if(this.params && this.params.title) {
			base.label = this.params && this.params.title;
		}

		if(this.params && this.params.url) {
			base.href = this.params && this.params.url;
		}

		return base;
	},


	getFormSchema: function () {
		var base = this.callParent(arguments);

		base.push({type: 'hidden', name: 'targetMimeType'});

		if (!this.record || this.record.hasLink('edit-target')) {
			base.unshift({type: 'url', name: 'href', required: true, onChange: this.onInputChange.bind(this)});
		}

		return base;
	},

	onInputChange (value, valid) {
		this.resolveMeta.cancel();

		const blank = this.el && this.el.select('.group.card').hasCls('blocked');

		if (this.reallyRendered && valid && blank) {
			this.resolveMeta(value);
		}
	},

	resolveMeta: buffer(1000, async function (uri) {
		if (!uri) { return; }
		this.setLoading(true);
		try {
			const data = await (await getService()).getMetadataFor(uri);
			await this.applyMetadata(data);
		} finally {
			this.el.select('.group.card').removeCls('blocked');
			this.el.select('.group.card input').set({disabled: void 0});
			this.el.select('.group.card textarea').set({disabled: void 0});
			this.setLoading(false);
		}
	}),

	async applyMetadata (data) {
		const { images: [image], title, creator, contentLocation: uri, description } = data;
		const form = this.getForm();
		form.setValue('label', title);
		form.setValue('byline', creator || new URL(uri).host);
		form.setValue('description', description);

		if (image) {
			const service = await getService();
			const blob = await service.get({url:image.getLink('safeimage'), blob: true});

			const filename = new URL(image.url).pathname.split('/').pop();

			const icon = form.getInputForField('icon');
			icon.setPreviewFromValue(blob);
			icon.croppedImage = Object.assign(new File([], filename), {
				cleanUp: () => {},
				getBlob: () => blob,
				getName: () => filename
			});
		}
	}
});
