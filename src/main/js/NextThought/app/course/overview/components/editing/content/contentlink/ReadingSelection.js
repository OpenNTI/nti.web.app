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
		//TODO fill this out
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
	}
});
