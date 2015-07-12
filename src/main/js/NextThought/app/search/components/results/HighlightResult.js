Ext.define('NextThought.app.search.components.results.HighlightResult', {
	extend: 'NextThought.app.search.components.results.Base',
	alias: ['widget.search-result-highlight'],
	cls: 'search-result search-highlight',

	showBreadCrumb: function(path) {
		if (!this.rendered) {
			this.on('afterrender', this.showBreadCrumb.bind(this, path));

			return;
		}

		var i, title;

		for (i = path.length - 1; i >= 0; i--) {
			title = path[i].getTitle && path[i].getTitle();

			if (title) {
				break;
			}
		}

		if (title) {
			this.titleEl.update(title);
		} else {
			this.titleEl.update('Highlight');
		}

		this.callParent(arguments);
	}
});
