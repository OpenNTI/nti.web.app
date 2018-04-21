const Ext = require('@nti/extjs');

const RelatedWork = require('legacy/model/RelatedWork');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.URL', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-url',

	statics: {
		getTypes: function () {
			return [
				{
					title: 'External Link',
					category: 'content',
					iconCls: 'link',
					description: 'External links are used for',
					editor: this
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

		return base;
	},


	getFormSchema: function () {
		var base = this.callParent(arguments);

		base.push({type: 'hidden', name: 'targetMimeType'});
		base.unshift({type: 'url', name: 'href', required: true});

		return base;
	}
});
