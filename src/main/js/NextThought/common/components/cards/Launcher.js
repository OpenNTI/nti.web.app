/*global DomUtils */
Ext.define('NextThought.common.components.cards.Launcher', {
	extend: 'Ext.Component',
	alias: 'widget.content-launcher',

	statics: {
		getData: function(dom, reader, items, getThumb) {
			var data = DomUtils.parseDomObject(dom);

			Ext.apply(data, {
				ntiid: reader && reader.getLocation().NTIID,
				basePath: reader && reader.basePath,
				description: data.description,
				title: data.title,
				thumbnail: getThumb(dom, data),
				items: items
			});
			return data;
		}
	},


	ui: 'content-launcher',
	cls: 'content-launcher',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'description', html: '{description}' },
			{ cls: 'launcher-button', html: 'View' }
		]}
	]),


	initComponent: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {},this.data);

		this.on({
			el: {
				click: 'onLaunch'
			}
		});
	},


	onLaunch: function(e) {
		e.stopEvent();
		this.fireEvent('launch', this.data);
	}
});
