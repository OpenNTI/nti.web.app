Ext.define('NextThought.app.context.components.list.Content', {
	extend: 'Ext.Component',
	alias: 'widget.context-content-list',

	requires: ['NextThought.app.navigation.path.Actions'],

	cls: 'context-list-item',

	pathTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'root', cn: [
			{tag: 'span', html: '{root}'}
		]},
		{tag: 'tpl', 'if': 'extra', cn: [
			{tag: 'span', html: '...'}
		]},
		{tag: 'tpl', 'if': 'leaf', cn: [
			{tag: 'span', html: '{leaf}'}
		]}
	])),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'icon'},
		{cn: [
			{cls: 'location'},
			{cls: 'context', cn: [
				{cls: 'snippet text', html: '{snippet}'}
			]}
		]}
	]),


	renderSelectors: {
		iconEl: '.icon',
		locationEl: '.location',
		snippetEl: '.snippet'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.PathActions = NextThought.app.navigation.path.Actions.create();

		this.PathActions.getPathToObject(this.record)
			.then(this.setPath.bind(this));
	},


	afterRender: function() {
		this.callParent(arguments);

		var div = document.createElement('div');

		if (this.snippet) {
			div.appendChild(this.snippet);

			this.snippetEl.dom.innerHTML = div.innerHTML;
		}
	},


	setPath: function(path) {
		this.setIcon(path);
		this.setLineage(path);
	},


	setIcon: function(path) {
		var iconUrl = '',
			i;

		for (i = path.length - 1; i >= 0; i--) {
			iconUrl = path[i].getIcon && path[i].getIcon();

			if (iconUrl) {
				break;
			}
		}

		iconUrl = iconUrl && 'url(' + getURL(iconUrl) + ')';

		if (iconUrl) {
			this.iconEl.setStyle({
				backgroundImage: iconUrl
			});
		} else {
			this.iconEl.hide();
		}
	},


	setLineage: function(path) {
		if (!this.rendered) {
			this.on('afterrender', this.setLineage.bind(this, path));
			return;
		}

		var rootIdx = 0, root = path[rootIdx],
			leafIdx = path.length - 1, leaf = path[leafIdx];

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
