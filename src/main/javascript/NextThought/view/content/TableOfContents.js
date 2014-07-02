Ext.define('NextThought.view.content.TableOfContents', {
	extend: 'Ext.view.View',
	alias: 'widget.table-of-contents-flyout',

	requires: [
		'NextThought.model.TopicNode'
	],

	mixins: {
		menuBehavior: 'NextThought.mixins.MenuShowHideBehavior'
	},

	cls: 'toc-flyout nav-outline',

	floating: true,
	hidden: true,
	renderTo: Ext.getBody(),

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'{{{NextThought.view.content.Navigation.toc}}}'
		]},
		{
			tag: 'form', cls: 'search filter', onsubmit: 'return false',
			cn: [
				{ tag: 'input', placeholder: '{{{NextThought.view.Navigation.search}}}', required: true },
				{ tag: 'button', type: 'reset', cls: 'clear' }
			]
		},
		{ cls: 'outline-list'}
	]),

	renderSelectors: {
		headerEl: '.header',
		formEl: 'form.search',
		clearEl: '.search button',
		filterEl: '.search input',
		frameBodyEl: '.outline-list'
	},


	getTargetEl: function() {
		return this.frameBodyEl;
	},


	overItemCls: 'over',
	itemSelector: '.outline-row',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{ cls: 'outline-row {type}', cn: [
			{cls: 'label', html: '{label}'}
		]}
	]})),


	initComponent: function() {
		this.callParent(arguments);
		this.mixins.menuBehavior.constructor.call(this);
		this.cssRule = CSSUtils.getRule('table-of-content-styles', '#' + this.id);
		CSSUtils.set(this.cssRule, {
			position: 'fixed',
			height: 'auto',
			bottom: '0'
		}, true);


		this.on({
			headerEl: {click: 'hide'},
			clearEl: {click: 'onFilter', buffer: 1},
			filterEl: {
				keypress: 'onFilter',
				keydown: 'onFilter'
			}
		});
	},


	doFilter: Ext.Function.createBuffered(
			function() {
				if (this.isDestroyed) {return;}

				var v = this.filterEl.getValue();
				if (this.filterValue === v) {return;}

				this.filterValue = v;
				if (!v) {
					this.store.removeFilter('search');
				} else {
					this.store.filter({
						id: 'search',
						matchingIds: {},
						fn: function(r) {
							//if we alread know its matching don't check again
							if (this.matchingIds[r.get('NTIID')]) { return true; }

							var matches = r.matches(v);

							this.matchingIds = Ext.apply(this.matchingIds || {}, matches);

							return Object.keys(matches).length;
						}
					});
				}
				this.showSelection();
			},
			100),


	onFilter: function(e) {
		if (e) {
			e.stopPropagation();
			if (e.getKey() === e.ESC) {
				Ext.getDom(this.formEl).reset();
			}
		}

		this.doFilter();
	},


	onItemClick: function(record) {
		this.onSelect(record);
	},


	onSelect: function(record) {
		this.hide();
		this.fireEvent('navigation-selected', record.getId());
	},


	onShow: function() {
		this.callParent(arguments);
		this.showSelection();
		this.stopShowHideTimers();
	},


	showSelection: function() {
		var rec = this.store.getById(this.activeNTIID);
		if (rec) {
			this.getSelectionModel().select(rec, false, true);
			wait(100).then(this.scrollSelectionIntoView.bind(this));
		}
	},


	scrollSelectionIntoView: function() {
		var el, scroll, offset, height,
			sel = this.getSelectionModel().getSelection()[0];
		if (!sel) {return;}

		el = Ext.get(this.getNode(sel));
		if (el) {
			scroll = el.getScrollingEl();
			height = scroll.getHeight();
			offset = el.getOffsetsTo(scroll)[1];

			if (offset < 0 || offset > height) {
				scroll.scrollTo('top', (scroll.getScrollTop() + offset) - (height / 2), true);
			}
		}
		this.filterEl.focus();
	},


	setContentPackage: function(record, active, root) {
		this.activeNTIID = active;
		var rec, store = new Ext.data.Store({
			model: NextThought.model.TopicNode,
			data: Library.getToc(record)
		});

		store.remove(
			store.getRange().filter(function(_) { return _.get('suppressed'); }));

		if (root) {
			rec = store.getById(root);
			if (rec) {
				rec.set('isRoot', true);
			} else {
				console.warn('Strange, we set a root, but did not find it.');
			}

			/*store.filter({
				id: 'root',
				filterFn: function(o) {
					return o.isUnder(root);
				}
			});*/
		}

		this.bindStore(store);

		if (this.filterEl) {
			this.filterEl.set({value: ''});
			this.onFilter();
		}

		this.refresh();
	}
});
