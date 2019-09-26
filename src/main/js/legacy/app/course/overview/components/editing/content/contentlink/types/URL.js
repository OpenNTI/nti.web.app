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
		if (!valid || !this.rendered) {
			delete this.lastValid;
			return;
		}

		this.lastValid = value;
		if (!this.hasValues()) {
			this.resolveMeta();
		}
	},

	resolveMeta: buffer(1000, async function () {
		const uri = this.lastValid;
		if (!uri) { return; }

		delete this.lastValid;
		this.setLoading(true);
		try {
			const data = await (await getService()).getMetadataFor(uri);
			this.applyMetadata(data);
		} finally {
			this.el.select('.group.card').removeCls('blocked');
			this.el.select('.group.card input').set({disabled: null});
			this.el.select('.group.card textarea').set({disabled: null});
			this.setLoading(false);
		}
	}),

	applyMetadata (data) {
		const { images: [image], title, creator, contentLocation: uri, description } = data;
		const { url: imageUrl } = image || {};
		const form = this.getForm();
		form.setValue('label', title);
		form.setValue('byline', creator || new URL(uri).host);
		form.setValue('description', description);

		console.log(imageUrl);
	}
});
