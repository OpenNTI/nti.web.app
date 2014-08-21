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
		{cls: 'nav-container', cn: [
			{cls: 'nav-bar', cn: [
				{cls: 'dropdown disabled', html: 'Your Courses'},
				{cls: 'nav'},
				{cls: 'add-courses', html: 'Add Courses'}
			]}
		]}
	]}),

	renderSelectors: {
		dropdownEl: '.dropdown',
		navEl: '.nav',
		navBarEl: '.nav-bar',
		navContainerEl: '.nav-container',
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
	},


	setDefault: function(type) {
		if (type === 'courses') {
			this.currentView = 'courses';
			this.dropText = 'Your Courses';
		} else if (type === 'admin') {
			this.currentView = 'admins';
			this.dropText = 'Your Administered Courses';
		} else if (type === 'books') {
			this.currentView = 'books';
			this.dropText = 'Your Books';
		}

		if (this.rendered) {
			this.dropdownEl.update(this.dropText);
			this.updateAvailable();
		}
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

		this.navContainerEl.setHeight(this.navBarEl.getHeight());

		if (this.dropText) {
			this.dropdownEl.update(this.dropText);
		}

		this.updateAvailable();
	},


	buildViewMenu: function() {
		var active = this.currentView || 'courses',
			items = [];

		if (this.shouldEnableCourses) {
			items.push({text: 'Your Courses', type: 'courses', checked: active === 'courses'});
			this.dropdownEl.update('Your Courses');
		}

		if (this.shouldEnableAdmin) {
			items.push({text: 'Your Administered Courses', type: 'admins', checked: active === 'admins'});
			this.dropdownEl.update('Your Administerd Courses');
		}

		if (this.shouldEnableBooks) {
			items.push({text: 'Your Books', type: 'books', checked: active === 'books'});

			if (!this.shouldEnableCourses) {
				this.dropdownEl.update('Your Books');
				//this.fireEvent('show-my-books');
			}
		}

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
			items: items,
			listeners: {
				scope: this,
				'add': 'maybeEnableDropDown'
			}
		});

		this.maybeEnableDropDown(this.viewMenu);
	},


	maybeEnableDropDown: function(menu) {
		if (menu.items.length > 1 && !this.enableDropDown) {
			this.dropdownEl.removeCls('disabled');
		} else if (menu.items.length <= 1 && this.enableDropDown) {
			this.dropdownEl.addCls('disabled');
		}
	},

	enableCourses: function() {
		if (this.viewMenu && !this.shouldEnableCourses) {
			this.viewMenu.insert(0, {text: 'Your Courses', type: 'courses', checked: this.currentView === 'courses'});
		}

		this.shouldEnableCourses = true;
	},


	enableAdmin: function() {
		if (this.viewMenu && !this.shouldEnableAdmin) {
			this.viewMenu.insert(1, {text: 'Your Administered Courses', type: 'admins', checked: this.currentView === 'admins'});
		}

		this.shouldEnableAdmin = true;
	},


	enableBooks: function() {
		if (this.viewMenu && !this.shouldEnableBooks) {
			this.viewMenu.insert(2, {text: 'Your Books', type: 'books', checked: this.currentView === 'books'});

			if (!this.shouldEnableCourses) {
				this.dropdownEl.update('Your Books');
			}
		}

		this.shouldEnableBooks = true;
	},


	showViewMenu: function(e) {
		if (e.getTarget('.disabled')) { return; }

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
		} else if (item.type === 'admins') {
			this.fireEvent('show-my-admins');
		} else if (item.type === 'books') {
			this.fireEvent('show-my-books');
		}

		this.updateAvailable();
	},


	updateAvailable: function() {
		this.isBook = this.currentView === 'books';

		if (!this.rendered) { return; }

		//if the current view is books and we can allow books add show it
		if (this.isBook && this.allowBookAdd) {
			this.addEl.update('Add Books');
			this.addEl.show();
		} else if (this.currentView === 'courses' && this.allowCourseAdd) {
			//if the current view is courses and we can allow courses add show it
			this.addEl.update('Add Courses');
			this.addEl.show();
		} else {
			//otherwise we can't show it so hide it
			this.addEl.hide();
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

		if (viewId === 'current-courses-page') {
			this.currentView = 'courses';
		} else if (viewId === 'current-admins-page') {
			this.currentView = 'admins';
		} else if (viewId === 'books') {
			this.currentView = 'books';
		}

		this.updateAvailable();

		selModel = this.nav.getSelectionModel();
		selModel.select(i, false);
	},


	maybeFixHeader: function(el) {
		if (!el) { return; }

		el = Ext.get(el);

		var navTop = this.navEl.dom.getBoundingClientRect().top,
			elTop = el.getScrollTop(),
			delta = (navTop - elTop) || 0,
			offset = -(el.getTop() + 30);

		if (delta < offset && !this.fixedHeader) {
			this.addCls('fixed');
			this.fixedHeader = true;
		} else if (delta >= offset && this.fixedHeader) {
			this.removeCls('fixed');
			this.fixedHeader = false;
		}

		return this.fixedHeader;
	}
});
