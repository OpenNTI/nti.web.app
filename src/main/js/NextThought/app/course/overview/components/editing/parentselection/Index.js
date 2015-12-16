Ext.define('NextThought.app.course.overview.components.editing.parentselection.Index', {
	extend: 'Ext.Component',
	//Shouldn't be instantiated, only extended

	requires: [
		'NextThought.app.course.overview.components.editing.parentselection.Menu'
	],


	label: 'Parent: ',
	cls: 'overview-editing-parentselection',

	emptyText: 'Create New Parent',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'item {cls}', 'data-ntiid': '{id}', html: '{label}'
	})),


	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: '{label}'},
		{cls: 'selection closed', cn: [
			{cls: 'active'}
		]}
	]),


	renderSelectors: {
		selectionEl: '.selection',
		activeEl: '.selection .active'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.onParentScroll = this.onParentScroll.bind(this);
		this.onBodyClick = this.onBodyClick.bind(this);
		this.selectionItems = this.selectionItems || [];

		this.on({
			destroy: this.unalignMenu.bind(this)
		});
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.label
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.originalSelection = this.selectedItem;

		this.menu = this.buildMenu(this.selectionItems, this.getEditor(), this.parentRecord);
		this.hideMenu();

		//If there is no original selection (ie we aren't editing a record), just pick the first one
		this.selectRecord(this.originalSelection || this.selectionItems[0]);

		this.mon(this.activeEl, 'click', this.toggleMenu.bind(this));
	},


	parseItemData: function(item) {
		return item.getData();
	},


	getEditor: function() {},


	buildMenu: function(items, editor, parentRecord) {
		var me = this,
			menu;

		menu = new NextThought.app.course.overview.components.editing.parentselection.Menu({
			selectionItems: items,
			parentRecord: parentRecord,
			itemTpl: this.itemTpl,
			close: this.hideMenu.bind(this),
			parseItemData: this.parseItemData.bind(this),
			doSelectRecord: this.selectRecord.bind(this),
			renderTo: Ext.getBody(),
			editor: editor,
			scrollingParent: this.scrollingParent
		});

		this.on('destroy', menu.destroy.bind(menu));

		return menu;
	},


	selectRecord: function(record) {
		if (!this.rendered) {
			this.on('afterrender', this.selectRecord.bind(this, record));
			return;
		}

		this.activeEl.dom.innerHTML = '';

		if (!record) {
			this.activeEl.update(this.emptyText);
		} else {
			this.itemTpl.append(this.activeEl, this.parseItemData(record));
			this.menu.selectRecord(record);
		}

		if (this.onChange) {
			this.onChange(record);
		}
	},


	toggleMenu: function(e) {
		if (this.selectionEl.hasCls('closed')) {
			this.showMenu();
		} else {
			this.hideMenu();
		}
	},


	showMenu: function() {
		this.selectionEl.removeCls('closed');
		this.menu.show();

		this.alignMenuTo(this.activeEl.dom);
	},


	hideMenu: function() {
		this.selectionEl.addCls('closed');
		this.menu.hide();

		if (this.menu.onHide) {
			this.menu.onHide();
		}

		this.unalignMenu();
	},


	onBodyClick: function(e) {
		var onSelection = e.getTarget('.overview-editing-parentselection'),
			onMenu = e.getTarget('.overview-editing-parentselection-menu');

		onSelection = onSelection && e.getTarget('.selection');
		onSelection = onSelection && (e.getTarget('.active') || e.getTarget('.menu'));

		if (!onSelection && !onMenu) {
			this.hideMenu();
		}
	},


	onParentScroll: function() {
		this.alignMenuTo(this.menuAlignedTo);
	},


	alignMenuTo: function(el) {
		this.unalignMenu();

		var menuDom = this.menu && this.menu.el && this.menu.el.dom,
			viewportHeight = Ext.Element.getViewportHeight(),
			rect = el.getBoundingClientRect(),
			maxHeight = viewportHeight - rect.bottom - 5;

		if (menuDom) {
			menuDom.style.top = rect.bottom + 'px';
			menuDom.style.left = rect.left + 'px';
			menuDom.style.width = rect.width + 'px';
			menuDom.style.maxHeight = maxHeight + 'px';
		}

		this.menuAlignedTo = el;

		//TODO: figure out where to listen to scroll to keep it aligned
		// this.scrollingParent.dom.addEventListener('scroll', this.onParentScroll);
		Ext.EventManager.onWindowResize(this.onParentScroll);
		this.bodyClickListener = this.mon(Ext.getBody(), {
			destroyable: true,
			click: this.onBodyClick
		});
	},


	unalignMenu: function() {
		Ext.EventManager.removeResizeListener(this.onParentScroll);
		// this.scrollingParent.dom.removeEventListener('scroll', this.onParentScroll);
		Ext.destroy(this.bodyClickListener);
	},


	getOriginalSelection: function() {
		return this.originalSelection;
	},


	getCurrentSelection: function() {
		return this.menu.getSelection();
	}
});
