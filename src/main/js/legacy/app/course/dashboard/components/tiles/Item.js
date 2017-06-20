const Ext = require('extjs');

require('./BaseCmp');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.tiles.Item', {
	extend: 'NextThought.app.course.dashboard.components.tiles.BaseCmp',

	inheritableStatics: {
		height: 200
	},

	cls: 'dashboard-item',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'path', html: '{Path}'},
		{cls: 'title', html: '{Title}'},
		{cls: 'bullets', cn: [
			{tag: 'tpl', 'for': 'Bullets', cn: [
				{tag: 'span', cls: 'list-item', html: '{.}'}
			]}
		]},
		{cls: 'footer', html: '{Footer}'}
	]),


	renderSelectors: {
		pathEl: '.path',
		titleEl: '.title',
		bulletsEl: '.bullets',
		footerEl: '.footer'
	},


	beforeRender: function () {
		this.callParent(arguments);

		var me = this, renderData = {},
			fields = {
				Path: this.getPath(),
				Title: this.getTitle(),
				Bullets: this.getBullets(),
				Footer: this.getFooter()
			};

		Ext.Object.each(fields, function (key, value) {
			//if the get* returns a promise what for it to fulfill and call set*
			if (value instanceof Promise) {
				value.then(me.callWhenRendered.bind(me, 'set' + key));
			//else render with that value
			} else {
				renderData[key] = value;
			}
		});

		this.renderData = Ext.apply(this.renderData || {}, renderData);
	},


	callWhenRendered: function (name, value) {
		if (!this.rendered) {
			this.on('afterrender', this[name].bind(this, value));
			return;
		}

		this[name].call(this, value);
	},


	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'itemClicked');
	},


	itemClicked: function (e) {
		if (this.handleNavigation) {
			this.handleNavigation();
		}
	},


	getPath: function () { return ''; },
	getTitle: function () { return ''; },
	getBullets: function () { return ''; },
	getFooter: function () { return ''; },


	setPath: function (value) {
		this.pathEl.update(value.join(' / '));
	},


	setTitle: function (value) {
		this.titleEl.update(value);
	},

	//TODO: fill this out when we need it
	setBullets: function () {},


	setFooter: function (value) {
		this.footerEl.update(value);
	}
});
