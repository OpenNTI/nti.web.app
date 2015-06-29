Ext.define('NextThought.app.search.components.results.Base', {
	extend: 'Ext.Component',
	alias: 'widget.search-result',

	cls: 'search-result',

	SYSTEM_CREATOR: 'system',

	requires: [
		'NextThought.util.Search'
	],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{title}'},
		{cls: 'fragments', cn: [
			{tag: 'tpl', 'for': 'fragments', cn: [
				{cls: 'fragment', ordinal: '{#}', html: '{.}'}
			]}
		]},
		{cls: 'meta', cn: [
			{tag: 'span', cls: 'list-item type', html: '{label}'},
			{tag: 'span', cls: 'list-item creator', html: '{creator}'}
		]}
	]),


	renderSelectors: {
		titleEl: '.title',
		creatorEl: '.creator'
	},


	initComponent: function() {
		this.callParent(arguments);

		var hit = this.hit,
			name = hit.get('Creator');

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.hit.get('Title') || '',
			fragments: Ext.pluck(hit.get('Fragments'), 'text'),
			label: this.label || ''
		});

		this.fillInData();
	},


	beforeRender: function() {
		this.wrapFragmentHits();
		return this.callParent(arguments);
	},


	fillInData: function() {
		var me = this,
			hit = me.hit,
			name = hit.get('Creator');

		if (isMe(name)) {
			me.renderData.name = getString('NextThought.view.menus.search.Result.me');
		} else if (name === this.SYSTEM_CREATOR) {
			me.renderData.name === '';
		} else if (name) {
			UserRepository.getUser(name)
				.then(function(user) {
					var creator = 'By ' + user.getName();

					me.renderData.name = creator;

					if (me.rendered) {
						me.createEl.update(creator);
					}
				});
		}

		me.getObject = Service.getObject(hit.get('NTIID'));

		if (!me.renderData.title) {
			me.getObject
				.then(function(obj) {
					var title = obj.get('title');

					me.renderData.title = title;

					if (me.rendered) {
						me.titleEl.update(title);
					}

					me.getPathToObject(obj)
						.then(me.showBreadCrumb.bind(me));
				});
		}
	},


	showBreadCrumb: function() {},


	wrapFragmentHits: function() {
		var fragments = this.hit.get('Fragments') || [],
			wrapped = [];

		fragments.forEach(function(fragment) {
			var matches = fragment.matches,
				wrappedText = fragment.text;

			if (!matches || matches.length === 0 || !fragment.text) {
				console.warn('No matches or text for fragment. Dropping', fragment);
			} else {
				matches.sort(function(a, b) { return b[0] - a[0]; });

				matches.forEach(function(match, idx) {
					var next = idx + 1 < matches.length ? matches[idx + 1] : [0, 0],
						newString = '';

					if (next[1] > match[1]) {
						console.warn('Found a match that is a subset of a previous match. Server breaking its promise?', matches);
						return;
					}

					newString += wrappedText.slice(0, match[0]);
					newString += Ext.DomHelper.markup({tag: 'span', html: wrappedText.slice(match[0], match[1])});
					newString += wrappedText.slice(match[1]);

					wrappedText = newString;
				});
			}

			wrapped.push(wrappedText);
		});

		this.renderData.fragments = wrapped || this.renderData.fragments;
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.clicked.bind(this));
	},


	clicked: function(e) {
		var me = this,
			hit = me.hit,
			fragEl = e.getTarget('[ordinal]'),
			fragIndex = fragEl && fragEl.getAttribute('ordinal');

		this.getObject
			.then(function(obj) {
				me.navigateToSearchHit(obj, me.hit, fragIndex);
			});
	}
});
