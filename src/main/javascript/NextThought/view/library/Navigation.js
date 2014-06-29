Ext.define('NextThought.view.library.Navigation', {
	extend: 'Ext.Component',
	alias: 'widget.library-navigation',

	cls: 'library-navigation',

	renderTpl: Ext.DomHelper.markup({cls: 'container', cn: [
		{cls: 'x-component-branding', cn: [
			{cls: 'logo', 'data-qtip': '{logo-alt-text:htmlEncode}'},
			{cls: 'box', cn: [
				{ cls: 'flourish1' },
				{ cls: 'flourish2' },
				{ cls: 'title', html: '{title}' },
				{ cls: 'message', html: '{message}', cn: { cls: 'ellipsis', cn: [{},{},{}] }}
			]}
		]},
		{cls: 'nav-bar', cn: [
			{cls: 'dropdown', html: 'Your Courses'},
			{cls: 'nav'},
			{cls: 'add-courses', html: 'Add Courses'}
		]}
	]}),

	renderSelectors: {
		dropdownEl: '.dropdown',
		navEl: '.nav',
		addEl: '.add-courses'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.navStore = new Ext.data.Store({
			fields: [
				{name: 'label', type: 'string'},
				{name: 'viewId', type: 'string'}
			]
		});

		this.currentView = 'courses';
	},


	setItems: function(items) {
		this.navStore.loadData(items);
	},


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {},{
			'logo-alt-text': getString('library:branding logo-alt-text'),
			'title': getString('library:branding message-title'),
			'message': getString('library:branding message')
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.nav = Ext.widget({
			xtype: 'dataview',
			ui: 'nav',
			overItemCls: 'over',
			selectedItemCls: 'selected',
			itemSelector: '.outline-row',
			store: this.navStore,
			cls: 'library-nav',
			renderTo: this.navEl,
			selModel: {
				allowDeselect: false,
				toggleOnClick: false,
				deselectOnContainerClick: false
			},
			tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
				{
					cls: 'outline-row', 'data-text': '{label}',
					cn: [
						{ tag: 'tpl', 'if': 'count', cn: { cls: 'count', html: '{count}' } },
						{ cls: 'label', html: '{label}'}
					]
				}
			]}),
			listeners: {
				scope: this,
				select: 'selectionChanged'//,
				//beforeSelect: 'beforeSelect'
			}

		});

		this.on('destroy', 'destory', this.nav);

		this.buildViewMenu();
		this.mon(this.dropdownEl, 'click', 'showViewMenu', this);

		this.mon(this.addEl, 'click', 'showAvailable', this);
	},


	buildViewMenu: function() {
		var active = this.currentView,
			items = [];

		items.push({text: 'Your Courses', type: 'courses', checked: active === 'courses'});

		if (this.shouldEnableAdmin) {
			items.push({text: 'Your Administered Courses', type: 'admins', checked: active === 'admins'});
		}

		items.push({text: 'Your Books', type: 'books', checked: active === 'books'});

		this.viewMenu = Ext.widget('menu', {
			cls: 'library-view-menu',
			ui: 'library-menu',
			ownerCmp: 'this',
			offsets: [0, 0],
			defaults: {
				ui: 'nt-menuitem',
				xtype: 'menucheckitem',
				group: 'groupByOptions',
				cls: 'group-by-option',
				height: 50,
				plain: true,
				listeners: {
					scope: this,
					'checkchange': 'switchView'
				}
			},
			items: items
		});
	},


	enableAdmin: function() {
		this.shouldEnableAdmin = true;

		if (this.viewMenu) {
			this.viewMenu.insert(1, {text: 'Your Administered Courses', type: 'admins', checked: this.currentView === 'admins'});
		}
	},


	showViewMenu: function() {
		this.viewMenu.showBy(this.dropdownEl, 'tl-tl', this.viewMenu.offsets);
	},


	switchView: function(item, status) {
		if (!status) { return; }

		var offsets = item.getOffsetsTo(this.viewMenu),
			x = offsets && offsets[1];

		this.dropdownEl.update(item.text);
		this.viewMenu.offsets = [0, -x];

		this.currentView = item.type;

		if (item.type === 'courses') {
			this.fireEvent('show-my-courses');
			this.updateAvailable();
		} else if (item.type === 'admins') {
			this.fireEvent('show-my-admins');
			this.updateAvailable();
		} else if (item.type === 'books') {
			this.fireEvent('show-my-books');
			this.updateAvailable(true);
		}
	},


	updateAvailable: function(isBook) {
		this.isBook = isBook;

		if (isBook) {
			this.addEl.update('Add Books');
		} else {
			this.addEl.update('Add Courses');
		}
	},


	showAvailable: function() {
		this.fireEvent('show-available', this.isBook);
	},


	selectionChanged: function(sel, rec) {
		this.fireEvent('show-library-view', rec.get('viewId'));
	},


	updateSelection: function(active) {
		if (!this.rendered) {
			this.on('afterrender', this.updateSelection.bind(this, active));
			return;
		}

		var viewId = active.id || active,
			selModel,
			i = this.navStore.findBy(function(rec) {
				return rec.get('viewId') === viewId;
			});

		selModel = this.nav.getSelectionModel();
		selModel.select(i, false);
	}
});
