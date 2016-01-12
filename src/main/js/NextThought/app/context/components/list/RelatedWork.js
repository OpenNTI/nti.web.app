Ext.define('NextThought.app.context.components.list.RelatedWork', {
	extend: 'NextThought.app.context.components.list.Content',
	alias: 'widget.context-relatedwork-list',

	requires: ['NextThought.model.PageInfo'],


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
	},

	setLineage: function(path){
		if (!this.rendered) {
			this.on('afterrender', this.setLineage.bind(this, path));
			return;
		}

		var rootIdx = 0,
			root = path[rootIdx],
			leafIdx = path.length - 1,
			leaf = path[leafIdx];

		if (leaf instanceof NextThought.model.PageInfo) {
			leafIdx -= 1;
			leaf = path[leafIdx];
		}

		while ((!root.getTitle || !leaf.getTitle) && rootIdx < leafIdx) {
			if (!root.getTitle) {
				rootIdx += 1;
				root = path[rootIdx];
			}

			if (!leaf.getTitle) {
				leafIdx -= 1;
				leaf = path[leafIdx];
			}
		}

		this.pathTpl.append(this.locationEl, {
			leaf: leaf && leaf.getTitle(),
			root: root && root.getTitle(),
			extra: leafIdx - rootIdx > 1
		});
	}
});
