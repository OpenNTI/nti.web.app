export default Ext.define('NextThought.app.context.components.list.RelatedWork', {
	extend: 'NextThought.app.context.components.list.Content',
	alias: 'widget.context-relatedwork-list',


	afterRender: function() {
		this.callParent(arguments);

		this.snippetEl.update(this.content.get('label'));
	},


	setIcon: function() {
		var iconUrl = this.content.get('icon'),

		iconUrl = iconUrl && 'url(' + getURL(iconUrl) + ')';

		if (!this.iconEl) {
			return;
		}

		if (iconUrl) {
			this.iconEl.setStyle({
				backgroundImage: iconUrl
			});
		} else {
			this.iconEl.hide();
		}
	}
});
