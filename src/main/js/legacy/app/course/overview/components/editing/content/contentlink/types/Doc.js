const Ext = require('@nti/extjs');

const RelatedWork = require('legacy/model/RelatedWork');

require('./Base');

const Type = 'application/vnd.nextthought.relatedworkref';


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Doc', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-doc',

	statics: {
		specificity: 10,

		getTypes: function () {
			return [
				{
					title: 'Upload a File',
					category: 'content',
					iconCls: 'document',
					description: '',
					editor: this,
					isAvailable: async (bundle) => {
						const available = await bundle.getAvailableContentSummary();

						return available[Type];
					}
				}
			];
		},

		//TODO: override getEditorForRecord to check if the related work ref
		//is pointing to a doc
		getEditorForRecord: function (record) {
			if (record.isDocument()) {
				return this;
			}
		}
	},

	cls: 'content-editor content-link document',


	afterRender: function () {
		this.callParent(arguments);

		if (!this.record) {
			this.addCls('file-only');
		} else {
			this.onFileAdded(this.record.get('targetMimeType'));
		}
	},


	getDefaultValues: function () {
		var base = this.callParent(arguments);

		//For documents, set the target has the href so
		//we can get info about it
		base.href = base.target;

		return base;
	},


	getFormSchema: function () {
		var base = this.callParent(arguments);

		if (!this.record || this.record.hasLink('edit-target')) {
			//TODO: fill info about the existing file
			base.unshift({type: 'file', name: 'href', onFileAdded: this.onFileAdded.bind(this)});
		}

		return base;
	},


	onFileAdded: function (type) {
		this.formCmp.setPlaceholder('icon', RelatedWork.getIconForMimeType(type));
		this.removeCls('file-only');

		this.formCmp.focusField('label');
	}
});
