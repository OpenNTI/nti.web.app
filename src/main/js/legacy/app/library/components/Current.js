var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.library.components.Current', {
	extend: 'Ext.container.Container',

	layout: 'none',
	cls: 'current-collection',
	title: '',
	addText: 'Add',
	seeAllText: 'See All',

	getTargetEl: function () {
		return this.body;
	},

	childEls: ['body'],
	getDockedItems: function () { return []; },


	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'add hidden', html: '{add}'},
			{cls: 'space'},
			{cls: 'see-all hidden', html: '{seeAll}'}
		]},
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	renderSelectors: {
		addEl: '.header .add',
		seeAllEl: '.header .see-all'
	},


	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.title,
			add: this.addText,
			seeAll: this.seeAllText
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		var me = this;

		me.mon(me.el, 'click', function (e) {
			if (e.getTarget('.add')) {
				me.onAddClick();
			} else if (e.getTarget('.see-all')) {
				me.onSeeAllClick();
			}
		});
	},


	onAddClick: function () {},


	onSeeAllClick: function () {},


	showSeeAll: function () {
		if (!this.rendered) {
			this.on('afterrender', this.showSeeAll.bind(this));
			return;
		}

		this.seeAllEl.removeCls('hidden');
	},


	hideSeeAll: function () {
		if (!this.rendered) {
			this.on('afterrender', this.hideSeeAll.bind(this));
			return;
		}

		this.seeAllEl.addCls('hidden');
	},


	showAdd: function () {
		if (!this.rendered) {
			this.on('afterrender', this.showAdd.bind(this));
			return;
		}

		this.addEl.removeCls('hidden');
	},


	hideAdd: function () {
		if (!this.rendered) {
			this.on('afterrender', this.hideAdd.bind(this));
			return;
		}

		this.addEl.addCls('hidden');
	}
});
