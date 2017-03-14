var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.search.components.AdvancedOptions', {
	extend: 'Ext.Component',
	alias: 'widget.search-advanced-menu',

	OPTIONS: {
		'all': {
			label: 'All',
			accepts: []
		},
		'social': {
			label: 'Social',
			accepts: [
				'note',
				'forums.personalblogcomment',
				'forums.personalblogentrypost',
				'forums.communityheadlinepost',
				'forums.generalforumcomment',
				'messageinfo'//Does chat results go here?
			]
		},
		'readings': {
			label: 'Readings',
			accepts: [
				'bookcontent'
			]
		},
		'videos': {
			label: 'Videos',
			accepts: [
				'videotranscript',
				'ntivideo'
			]
		},
		'highlights': {
			label: 'Highlights',
			accepts: [
				'highlight'
			]
		}
	},

	cls: 'search-advanced-menu-items',


	renderTpl: Ext.DomHelper.markup({
		tag: 'tpl', 'for': 'options', cn: [
			{tag: 'span', cls: 'search-item', 'data-type': '{type}', html: '{label}'}
		]
	}),


	beforeRender: function () {
		var options = this.OPTIONS,
			keys = Object.keys(options) || [],
			labels = [];

		keys.forEach(function (key) {
			labels.push({
				type: key,
				label: options[key].label
			});
		});

		this.renderData = Ext.apply(this.renderData || {}, {
			options: labels
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.doClick.bind(this));
	},


	doClick: function (e) {
		var option = e.getTarget('.search-item');

		if (this.changeFilter && option) {
			this.changeFilter(option.getAttribute('data-type'));
		}
	},


	getMimeTypes: function (type) {
		var option = this.OPTIONS[type];

		return option && option.accepts;
	},


	selectType: function (type) {
		if (!this.rendered) {
			this.on('after', this.selectType.bind(this, type));
			return;
		}

		var option = this.el.down('.search-item[data-type="' + type + '"]'),
			active = this.el.down('.search-item.active');

		if (active) {
			active.removeCls('active');
		}

		if (option) {
			option.addCls('active');
		}
	}
});
