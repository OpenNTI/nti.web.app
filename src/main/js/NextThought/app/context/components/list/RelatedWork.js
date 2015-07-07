Ext.define('NextThought.app.context.components.list.RelatedWork', {
	extend: 'NextThought.app.context.components.list.Content',
	alias: 'widget.context-relatedwork-list',


	setIcon: function() {
		var iconUrl = this.content.get('icon'),

		iconUrl = iconUrl && 'url(' + getURL(iconUrl) + ')';

		if (iconUrl) {
			this.iconEl.setStyle({
				backgroundImage: iconUrl
			});
		} else {
			this.iconEl.hide();
		}
	}
});
