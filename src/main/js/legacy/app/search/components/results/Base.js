var Ext = require('extjs');
var UserRepository = require('../../../../cache/UserRepository');
var UtilSearch = require('../../../../util/Search');
var {isMe} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.search.components.results.Base', {
    extend: 'Ext.Component',
    alias: 'widget.search-result',
    cls: 'search-result',
    SYSTEM_CREATOR: 'system',

    pathTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'tpl', 'for': 'labels', cn: [
			{tag: 'span', cls: 'list-item{[values.cls ? " " + values.cls : ""]}', html: '{label}'}
		]
	})),

    renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{title}'},
		{tag: 'span', cls: 'list-item creator', html: '{creator}'},
		{cls: 'fragments', cn: [
			{tag: 'tpl', 'for': 'fragments', cn: [
				{cls: 'avatar-container hidden'},
				{cls: 'fragment', ordinal: '{#}', html: '{.}'}
			]}
		]},
		{cls: 'meta', cn: [
			{cls: 'root-icon hidden'},
			{cls: 'path'}
		]}
	]),

    renderSelectors: {
		titleEl: '.title',
		rootIconEl: '.root-icon',
		pathEl: '.path',
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
			this.addCls('me');
		}

		if (name === this.SYSTEM_CREATOR) {
			me.renderData.creator === '';
		} else if (name) {
			UserRepository.getUser(name)
				.then(function(user) {
					me.setCreator(user);
				});
		}

		me.getObject = Service.getObject(hit.get('NTIID'));

		me.getObject
			.then(function(obj) {
				me.setTitle(obj);
				me.hitRecord = obj;

				me.getPathToObject(obj)
					.then(me.showBreadCrumb.bind(me));
			});
	},

    setCreator: function(user) {
		var creator = 'By ' + user.getName();

		this.renderData.creator = creator;

		if (this.rendered) {
			this.creatorEl.update(creator);
		}
	},

    setTitle: function(record) {
		var title = record.get('title');

		this.renderData.title = title;

		if (this.rendered) {
			this.titleEl.update(title);
		}
	},

    showBreadCrumb: function(path) {
		if (!this.rendered) {
			this.on('afterrender', this.showBreadCrumb.bind(this, path));
			return;
		}

		var me = this,
			root = path[0],
			labels;

		labels = path.map(function(x) {
			if (x.getTitle) {
				return {
					label: x.getTitle()
				};
			}
		}).filter(function(x) { return !! x; });

		me.pathTpl.append(me.pathEl, {labels: labels});

		if (root && root.getIconImage) {
			root.getIconImage()
				.then(function(src) {
					if (me.rootIconEl) {
						me.rootIconEl.removeCls('hidden');
						me.rootIconEl.setStyle({backgroundImage: 'url(' + src + ')'});
					}
				});
		}
	},

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

		if (this.typeCls) {
			this.addCls(this.typeCls);
		}

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
