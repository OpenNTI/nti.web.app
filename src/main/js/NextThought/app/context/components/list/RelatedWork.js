Ext.define('NextThought.app.context.components.list.RelatedWork', {
	extend: 'NextThought.app.context.components.list.Content',
	alias: 'widget.context-relatedwork-list',


	afterRender: function() {
		this.callParent(arguments);

		this.snippetEl.update(this.content.get('label'));
	},


	getContentRootFor: function(path) {
		var root, i = 0, part;

		while (!root) {
			part = path[i];

			if (part.getContentRoots) {
				root = part.getContentRoots()[0];
			}

			i += 1;
		}

		return root;
	},


	setIcon: function(path) {
		if (!this.rendered) {
			this.on('afterrender', this.setIcon.bind(this, path));
			return;
		}

		var root = this.getContentRootFor(path),
			iconUrl = this.content.getIcon(root);

		if (!this.iconEl) {
			return;
		}

		if (iconUrl) {
			this.iconEl.setStyle({
				backgroundImage: 'url(' + iconUrl + ')'
			});
		} else {
			this.iconEl.hide();
		}
	}
});
