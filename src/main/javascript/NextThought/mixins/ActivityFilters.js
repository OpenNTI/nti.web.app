/**
*	Whatever mixes this needs to implment an applyFilter
*	function that takes an array of mimetypes, and an array of filters
*/
Ext.define('NextThought.mixins.ActivityFilters', {

	mimeTypesMap: {
		'all': ['all'],
		'discussions': [
			'forums.personalblogentry',
			'forums.personalblogcomment',
			'forums.personalblogentrypost',
			'forums.communityheadlinepost',
			'forums.generalforumcomment',
			'forums.communityheadlinetopic'
		],
		'notes': ['highlight', 'note'],
		'contact': ['user']
	},

	filtersMap: {
		'all': 'OnlyMe',
		'notes': 'OnlyMe',
		'bookmarks': 'Bookmarks',
		'inCommunity': 'inCommunity',
		'IFollow': 'IFollow'
	},

	setUpMenu: function(key) {
		this.key = key;
		this.typesMenu = Ext.widget('menu', {
			title: 'Activity Type',
			cls: 'menu types-menu',
			width: 258,
			defaults: {
				ui: 'nt-menuitem',
				xtype: 'menucheckitem',
				plain: true,
				listeners: {
					scope: this,
					'beforecheckchange': function(item, checked) { return checked || item.allowUncheck !== false; },
					'checkchange': 'changeFilter'
				}
			},
			items: [
				{cls: 'option', text: 'Show All', type: 'showall', allowUncheck: false, isAll: true, filter: 'all'}
			]
		});
	},

	afterRender: function() {
		var state = {};
		if (!this.stateApplied) {
			state['types-' + this.key] = ['showall'];
			this.applyState(state);
		}
	},

	getTypesMenu: function() {
		return this.typesMenu;
	},

	addFilterItem: function(text, filter, type) {
		var item = {
			cls: 'option',
			text: text,
			type: type,
			filter: filter
		};
		if (this.checkedTypes && Ext.Array.contains(this.checkedTypes, item.type)) {
			item.checked = true;
			Ext.Array.remove(this.checkedTypes, item.type);
		}

		this.typesMenu.add(item);
		this.setFilters();
	},

	getState: function() {
		var items = this.typesMenu.query('menuitem'),
			types = [],
			state = {};
		Ext.each(items, function(item) {
			if (item.checked) {
				types.push(item.type);
			}
		});
		state['types-' + this.key] = types;
		return state;
	},

	applyState: function(state) {
		var me = this,
			items = me.typesMenu.query('menuitem'),
			types = state['types-' + me.key];

		if (!Ext.isEmpty(types)) {
			me.typesMenu.down('[isAll]').setChecked(false);
			Ext.each(items, function(item) {
				var checked = Ext.Array.contains(types, item.type);

				if (me.rendered) {
					item.setChecked(checked);
				}else {
					me.on('afterrender', function() {
						item.setChecked(checked);
					}, me);
				}
			});

			if (!Ext.isEmpty(types)) {
				this.checkedTypes = types;
			}

			this.stateApplied = true;
		}
	},

	changeFilter: function(item) {
		var allChecked = true, allUnchecked = true,
			allItems = this.typesMenu.query('menuitem');

		function uncheck(items) {
			Ext.each(items, function(i) {
				if (!i.isAll) {
					i.setChecked(false, true);
				}
			});
		}

		if (item.checked) {
			if (item.isAll) {
				uncheck(allItems);
			}else {
				this.typesMenu.query('[isAll]')[0].setChecked(false, true);
			}
		}else {
			Ext.each(allItems, function(i) {
				allUnchecked = allUnchecked && !i.checked;
			});

			if (allUnchecked) {
				item.setChecked(true, true);
			}
		}

		if (this.typesMenu.query('menuitem[checked]').length === 0) {
			this.typesMenu.query('[isAll]')[0].setChecked(true, true);
		}

		this.setFilters();
		this.saveState();
	},

	setFilters: function() {
		var menu = this.typesMenu,
			allItems = menu.query('menuitem'),
			everything = menu.down('[isAll]').checked, me = this,
			mimeTypes = [],
			filterTypes = [];

			Ext.each(allItems, function(item) {
				var mt = this.mimeTypesMap[item.filter],
					ft = this.filtersMap[item.filter];

				if ((everything || item.checked)) {
					if (mt) {
						Ext.each(Ext.Array.from(mt), function(m) {
							mimeTypes.push('application/vnd.nextthought.' + m);
						}, this);
					}

					if (ft && !Ext.Array.contains(filterTypes, ft)) {
						filterTypes.push(ft);
					}
				}
			}, this);

		this.applyFilters(mimeTypes, filterTypes);
	}
});
