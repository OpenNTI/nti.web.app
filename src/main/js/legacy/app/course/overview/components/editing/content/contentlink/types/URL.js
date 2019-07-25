const Ext = require('@nti/extjs');

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
			base.unshift({type: 'url', name: 'href', required: true});
		}

		return base;
	}
});
