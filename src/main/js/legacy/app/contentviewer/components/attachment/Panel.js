const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.contentviewer.components.attachment.Panel', {
	extend: 'Ext.Component',
	alias: 'widget.attachment-preview-panel',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'attachment-part preview-mode', contentEditable: 'false', 'data-fileName': '{filename}', 'name': '{name}', cn: [
		]}
	]),


	renderSelectors: {
		previewEl: '.preview-mode'
	},


	TEMPLATES: {
		image: new Ext.XTemplate(Ext.DomHelper.markup([
			{tag: 'img', src: '{url}'}
		])),

		document: new Ext.XTemplate(Ext.DomHelper.markup([
			{cls: 'iframe-container', cn: [
				{tag: '{tag}', src:'{url}', data: '{url}', type: '{type}', border: 0, frameBorder: 0}
			]}
		]))
	},


	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, this.record ? this.record.getData() : {});
	},


	afterRender: function () {
		this.callParent(arguments);
		if (this.record) {
			this.addAttachmentRenderer();
		}
		this.setSaveText('');
	},

	addAttachmentRenderer: function () {
		let type = this.record.get('fileMimeType') || this.record.get('contentType'),
			data = this.record.getData(),
			tpl;

		if (type === 'application/pdf') {
			let tag = Ext.isIE10m ? 'object' : 'iframe';
			tpl = this.TEMPLATES.document;
			data.tag = tag;
			data.type = type;

			tpl.append(this.previewEl, data);
			this.previewEl.addCls('has-iframe');
		}
		else {
			tpl = this.TEMPLATES.image;
			tpl.append(this.previewEl, data);
		}
	}
});
