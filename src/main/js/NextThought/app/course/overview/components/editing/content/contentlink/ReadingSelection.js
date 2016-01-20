Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.ReadingSelection', {
	extend: 'NextThought.app.course.overview.components.editing.itemselection.Index',
	alias: 'widget.overview-editing-reading-selection',

	cls: 'reading-item-selection item-selection',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		 cls: 'reading-item', cn: [
			{tag: 'tpl', 'if': 'hasChildren', cn: [
				{cls: 'expand'},
				{cls: 'icon folder'}
			]},
			{tag: 'tpl', 'if': '!hasChildren', cn: [
				{cls: 'expand hidden'},
				{cls: 'icon file'}
			]},
			{tag: 'span', cls: 'label', html: '{title}'}
		]
	})),


	getItemData: function(item) {
		var children = this.getItemChildren(item);

		return {
			hasChildren: children.length > 0,
			title: item.getAttribute('label')
		};
	},


	getItemChildren: function(item) {
		var children = item.children;

		children = Array.prototype.slice.call(children);

		return children.filter(function(node) {
			var tagName = node.tagName,
				href = node.getAttribute('href'),
				parts = Globals.getURLParts(href);

			return tagName === 'topic' && !parts.hash;
		});
	},


	itemMatchesSearch: function(item, searchTerm) {
		var label = item.getAttribute('label'),
			ntiid = item.getAttribute('ntiid');

		searchTerm = searchTerm.toLowerCase();
		label = label.toLowerCase();
		ntiid = ntiid.toLowerCase();

		return label.indexOf(searchTerm) >= 0 || searchTerm === ntiid;
	},


	onSelectItem: function(el) {
		el.classList.add('selected');
	},


	onUnselectItem: function(el) {
		el.classList.remove('selected');
	},


	getSelectionItemId: function(item) {
		return item.getAttribute('ntiid');
	},


	onItemCollapse: function(item) {
		this.unselectChildren(item);
	},


	unselectChildren: function(item) {
		var me = this,
			children = me.getItemChildren(item);

		children.forEach(function(child) {
			if (me.isSelected(child)) {
				me.unselectItem(child);
			}

			me.unselectChildren(child);
		});
	},


	selectItem: function(item) {
		this.callParent(arguments);

		var path = [], node;

		path.push(item);

		node = item.parentNode;

		while (node && (node.tagName === 'topic' || node.tagName === 'toc')) {
			path.push(node);
			node = node.parentNode;
		}

		this.showBreadCrumb(path.reverse());
	},


	showBreadCrumb: function(path) {
		var me = this;

		if (me.breadcrumbCmp) {
			me.breadcrumbCmp.destroy();
		}

		me.breadcrumbCmp = me.add({
			xtype: 'container',
			layout: 'none',
			cls: 'reading-selection-breadcrumb',
			items: []
		});

		me.breadcrumbCmp.add(path.map(function(part) {
			var hasChildren, label, cls = [];

			label = part.getAttribute('label');

			if (part.tagName === 'toc') {
				hasChildren = true;
				cls.push('root');
			} else {
				hasChildren = (me.getItemChildren(part) || []).length > 0;
			}

			cls.push(hasChildren ? 'folder' : 'file');

			return {
				xtype: 'box',
				autoEl: {
					cls: cls.join(' '),
					html: label
				},
				listeners: {
					click: {
						element: 'el',
						fn: function(e) {
							if (part.tagName !== 'toc') {
								me.clearSearch();
								me.selectItem(part);
							}
						}
					}
				}
			};
		}));
	},


	onSearchCleared: function() {
		var me = this,
			selection = me.getSelection(),
			selectedItem = selection && selection[0],
			expand = {}, node;

		node = selectedItem;

		while (node && node.tagName === 'topic') {
			expand[me.getSelectionItemId(node)] = true;
			node = node.parentNode;
		}

		me.itemsContainer.items.each(function(item) {
			var selectionItem = item.selectionItem,
				selectionId = selectedItem && me.getSelectionItemId(selectionItem);

			if (expand[selectionId]) {
				item.doExpand();
			} else {
				item.doCollapse();
			}
		});
	}
});
