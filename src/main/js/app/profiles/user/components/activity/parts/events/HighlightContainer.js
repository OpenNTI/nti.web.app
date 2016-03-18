var Ext = require('extjs');
var MixinsProfileLinks = require('../../../../../../../mixins/ProfileLinks');
var PathActions = require('../../../../../../navigation/path/Actions');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.HighlightContainer', {
    extend: 'Ext.Component',
    alias: 'widget.profile-activity-highlight-container',
    cls: 'activity-highlight-container',

    mixins: {
		profileLink: 'NextThought.mixins.ProfileLinks'
	},

    renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			{tag: 'span', cls: 'name link', html: '{name}'},
			' created ', {tag: 'span', cls: 'count', html: '{count}'},
			' highlight', {tag: 'span', cls: 'plural', html: '{plural}'},
			' on {date}'
		]},
		{ cls: 'box' }
	]),

    renderSelectors: {
		headerEl: '.header',
		nameEl: '.header .name',
		countEl: '.header .count',
		pluralEl: '.header .plural',
		bodyEl: '.box'
	},

    selectedTpl: new Ext.XTemplate(Ext.DomHelper.markup(
			{tag: 'tpl', 'for': '.', cn: [
				{tag: 'tpl', 'if': '.', cn: [
					{tag: 'span', html: '{.}' }
				]}
			]}
	)),

    tpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{ tag: 'tpl', 'for': 'books', cn: [
			{ cls: 'book', cn: [
				{ cls: 'icon', style: 'background-image: url({icon});', 'data-ntiid': '{ntiid}' },
				{ cn: [
					{ tag: 'tpl', 'for': 'pages', cn: [
						{ cls: 'page', cn: [
							{ cls: 'label', html: '{label}', 'data-ntiid': '{ntiid}' },
							{ tag: 'tpl', 'for': 'items', cn: [
								{ cls: 'selected-text {highlightColorName}', 'data-ntiid': '{ntiid}', cn: [
									{tag: 'span', html: '{text}'},{cls: 'tip'}
								]}
							]}
						]}
					]}
				]}
			]}
		]}
	)),

    setupContainerRenderData: function() {
		var me = this,
			c = me.up('[user]'),
			u = me.user || null,
			name = u ? u.getName() : '...',
			items = me.items,
			waitsOn,
			count = items.length,
			books = {},
			pathActions = NextThought.app.navigation.path.Actions.create(),
			d;

		if (this.rendered) { delete me.renderData; }

		d = Ext.apply(me.renderData || {},{
			name: name,
			count: count === 1 ? 'a' : count,
			plural: count === 1 ? '' : 's',
			date: Ext.Date.format(me.date, 'F j, Y')
		});

		function byTime(a, b) {
			function g(x) { return x.get ? x.get('CreatedTime').getTime() : 0; }
			a = g(a);
			b = g(b);
			return a - b;
		}

		Ext.Array.sort(this.items, byTime);

		waitsOn = items.map(function(item) {
			return pathActions.getPathToObject(item)
				.then(function(path) {
					var root = path[0],
						roots, pages,
						page = path.last(),
						iconUrl, i,
						label;

					roots = books[root.get('NTIID')] = books[root.get('NTIID')] || {};
					pages = roots[page.get('NTIID')] = roots[page.get('NTIID')] || [];


					root = root.getTitle();
					page = page.getTitle();

					if (path.length > 2) {
						item.label = root + ' / ... / ' + page;
					} else {
						item.label = root + ' / ' + page;
					}

					for (i = path.length - 1; i >= 0; i--) {
						iconUrl = path[i].getIcon && path[i].getIcon();

						if (iconUrl) {
							break;
						}
					}

					item.icon = iconUrl;

					pages.push(item);
				});
		});

		Promise.all(waitsOn)
			.then(me.setupBookRenderData.bind(me, d, books))
			.then(me.maybeFillIn.bind(me));

		return d;
	},

    /**
	 * This is intended to be a callback. No return value. We modify {data}
	 * @param {Object} data the output
	 * @param {Object} groupings the input
	 */
	setupBookRenderData: function(data, groupings) {
		var toFillIn = [];

		data.books = [];

		Ext.Object.each(groupings, function(k, root) {
			toFillIn.push(new Promise(function(fulfill, reject) {
				var book = {pages: [], ntiid: k};

				data.books.push(book);

				Ext.Object.each(root, function(k, items) {
					var page = {items: [], ntiid: k};

					book.pages.push(page);

					Ext.each(items, function(i) {
						var pp = i.get('presentationProperties');

						page.items.push({
							text: i.get('selectedText'),
							ntiid: i.getId(),
							highlightColorName: pp.highlightColorName
						});

						if (!book.hasOwnProperty('icon')) {
							book.icon = i.icon;
						}

						if (!page.hasOwnProperty('label')) {
							page.label = i.label;
						}

						fulfill();
					});
				});
			}));
		});

		return Promise.all(toFillIn)
			.then(function() {
				return data;
			});
	},

    maybeFillIn: function(data) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.maybeFillIn, this, [data]), this, {single: true});
			return;
		}

		this.tpl.overwrite(this.bodyEl, data);

		var me = this;
		this.bodyEl.select('.selected-text > span').each(function(s) {
			var words = Ext.String.ellipsis(s.dom.innerHTML.trim(), 200, true);
			me.selectedTpl.overwrite(s, words.split(' '));
		});
	},

    /**
	 * @override {Ext.Component#beforeRender}
	 */
	beforeRender: function() {
		this.callParent(arguments);
		this.setupContainerRenderData();
	},

    afterRender: function() {
		var me = this;
		me.callParent(arguments);
		me.enableProfileClicks(me.nameEl);
		me.mon(me.bodyEl, 'click', me.onClick, me);

		me.setupContainerRenderData = Ext.Function.createBuffered(me.setupContainerRenderData, 10, me, null);
		Ext.each(this.items, function(i) { me.mon(i, 'destroy', me.onHighlightRemoved, me); });
	},

    /**
	 * Attempts to add the record to this container.  If the date is a match it adds it. Otherwise it skips it.
	 *
	 * @param {NextThought.model.Highlight} record
	 * @return {boolean} True if it was added, false otherwise.
	 */
	collate: function(record) {
		var d = record.get('CreatedTime'),
			n = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
		if (n === this.date.getTime() && /highlight$/i.test(record.get('Class') || '')) {
			this.addHighlight(record);
			return true;
		}

		return false;
	},

    addHighlight: function(record) {
		this.items.unshift(record);
		this.setupContainerRenderData();
	},

    onHighlightRemoved: function(item) {
		Ext.Array.remove(this.items, item);
		this.mun(item, 'destroy', this.onHighlightRemoved, this);

		if (this.items.length > 0) {
			this.setupContainerRenderData();
			return;
		}

		this.destroy();
	},

    onClick: function(e) {
		var t = e.getTarget('[data-ntiid]', null, true),
			ntiid = t && t.getAttribute('data-ntiid'),
			selectedItem;

		if (!ntiid) { return; }

		this.items.forEach(function(item) {
			if (item.getId() === ntiid || item.get('ContainerId') === ntiid) {
				selectedItem = item;
			}
		});

		if (selectedItem) {
			this.navigateToObject(selectedItem);
			e.stopEvent();
		}
	},

    goToObject: function(id) {
		var item, cid;

		if (!id) {
			return;
		}

		Ext.each(this.items, function(i) {
			if (i.getId() === id) {
				item = i;
				return false;
			}
			return true;
		});

		cid = item.get('ContainerId');

		if (item && cid) {
			this.fireEvent('navigation-selected', cid, item, null);
		}
	}
});
