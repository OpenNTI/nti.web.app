var Ext = require('extjs');
var ComponentsQuestion = require('../Question');
var PathActions = require('../../../navigation/path/Actions');


module.exports = exports = Ext.define('NextThought.app.context.components.list.Question', {
	extend: 'NextThought.app.context.components.Question',
	alias: 'widget.question-context-list',
	cls: 'context-content question-context list-context',

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
		{cls: 'location'},
		{cls: 'content', cn: [
			{cls: 'snippet text', html: '{content}'}
		]}
	]),

	renderSelectors: {
		locationEl: '.location',
		snippetEl: '.snippet'
	},

	initComponent: function() {
		this.callParent(arguments);

		this.PathActions = NextThought.app.navigation.path.Actions.create();

		this.PathActions.getPathToObject(this.record)
			.then(this.setLineage.bind(this));
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
