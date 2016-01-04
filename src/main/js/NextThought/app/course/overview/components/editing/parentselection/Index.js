Ext.define('NextThought.app.course.overview.components.editing.parentselection.Index', {
	extend: 'Ext.Component',
	//Shouldn't be instantiated, only extended

	requires: [
		'NextThought.app.course.overview.components.editing.parentselection.Menu',
		'NextThought.app.course.overview.components.editing.parentselection.PositionMenu'
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
		]},
		{cls: 'position', cn: [
			{cls: 'active'}
		]}
	]),


	renderSelectors: {
		selectionEl: '.selection',
		activeEl: '.selection .active',
		positionEl: '.position',
		activePositionEl: '.position .active'
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

		this.selectionMenu = this.buildMenu(this.selectionItems, this.getEditor(), this.rootRecord);
		this.hideSelectionMenu();

		this.positionMenu = this.buildPositionMenu();
		this.hidePositionMenu();

		//If there is no original selection (ie we aren't editing a record), just pick the first one
		this.selectRecord(this.originalSelection || this.selectionItems[0]);

		this.mon(this.activeEl, 'click', this.toggleSelectionMenu.bind(this));
		this.mon(this.activePositionEl, 'click', this.togglePositionMenu.bind(this));
	},


	parseItemData: function(item) {
		return item.getData();
	},


	getEditor: function() {},


	/**
	 * Build the menu components to choose parents from.
	 *
	 * NOTE: for now we are assuming that the max depth of the tree is 2
	 * so the root is the parent of the parents.
	 *
	 * @param  {Array} items        the parents to choose from
	 * @param  {Component} editor       the editor to create a new parent
	 * @param  {Object} parentRecord the parent record of the parents
	 * @return {Component}              the menu component
	 */
	buildMenu: function(items, editor, parentRecord) {
		var me = this,
			menu;

		menu = new NextThought.app.course.overview.components.editing.parentselection.Menu({
			selectionItems: items,
			parentRecord: parentRecord,
			itemTpl: this.itemTpl,
			close: this.hideSelectionMenu.bind(this),
			parseItemData: this.parseItemData.bind(this),
			doSelectRecord: this.selectRecord.bind(this),
			renderTo: Ext.getBody(),
			editor: editor,
			scrollingParent: this.scrollingParent
		});

		this.on('destroy', menu.destroy.bind(menu));

		return menu;
	},


	buildPositionMenu: function() {
		var menu;

		menu = new NextThought.app.course.overview.components.editing.parentselection.PositionMenu({
			renderTo: Ext.getBody(),
			close: this.hidePositionMenu.bind(this),
			doSelectPosition: this.selectPosition.bind(this),
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

		var index;

		this.activeEl.dom.innerHTML = '';

		if (!record) {
			this.activeEl.update(this.emptyText);
		} else {
			this.itemTpl.append(this.activeEl, this.parseItemData(record));
			this.selectionMenu.selectRecord(record);

			index = record.indexOfId && this.editingRecord && record.indexOfId(this.editingRecord.getId());

			if (record.getItemsCount) {
				this.positionMenu.setTotalPositions(record.getItemsCount(), index);
			}

			this.selectPosition(index);
		}

		if (this.onChange) {
			this.onChange(record);
		}
	},


	selectPosition: function(index) {
		var active = this.positionMenu.selectPosition(index);

		this.activePositionEl.update(active || '');
	},


	toggleSelectionMenu: function(e) {
		if (this.selectionEl.hasCls('closed')) {
			this.showSelectionMenu();
		} else {
			this.hideSelectionMenu();
		}
	},


	showSelectionMenu: function() {
		this.selectionEl.removeCls('closed');
		this.selectionMenu.show();

		this.hidePositionMenu();

		this.alignMenuTo(this.activeEl.dom, this.selectionMenu);
	},


	hideSelectionMenu: function() {
		this.selectionEl.addCls('closed');
		this.selectionMenu.hide();

		if (this.selectionMenu.onHide) {
			this.selectionMenu.onHide();
		}

		this.unalignMenu();
	},


	togglePositionMenu: function() {
		if (this.positionEl.hasCls('closed')) {
			this.showPositionMenu();
		} else {
			this.hidePositionMenu();
		}
	},


	showPositionMenu: function() {
		this.positionEl.removeCls('closed');
		this.positionMenu.show();

		this.hideSelectionMenu();

		this.alignMenuTo(this.activePositionEl.dom, this.positionMenu);
	},


	hidePositionMenu: function() {
		this.positionEl.addCls('closed');
		this.positionMenu.hide();

		if (this.positionMenu.onHide) {
			this.positionMenu.onHide();
		}

		this.unalignMenu();
	},


	onBodyClick: function(e) {
		var onSelection = e.getTarget('.overview-editing-parentselection'),
			onSelectionMenu = e.getTarget('.overview-editing-parentselection-menu'),
			onPosition = e.getTarget('.overview-editing-parentselection-position-menu');

		onSelection = onSelection && (e.getTarget('.selection') || e.getTarget('.position'));
		onSelection = onSelection && (e.getTarget('.active') || e.getTarget('.menu'));

		if (!onSelection) {
			if (!onSelection) {
				this.hideSelectionMenu();
			}

			if (!onPosition) {
				this.hidePositionMenu();
			}
		}
	},


	onParentScroll: function() {
		this.alignMenuTo(this.menuAlignedTo);
	},


	alignMenuTo: function(el, menu) {
		this.unalignMenu();

		var menuDom = menu && menu.el && menu.el.dom,
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
		return this.selectionMenu.getSelection();
	},


	getOriginalIndex: function() {
		if (this.originalSelection && this.originalSelection.indexOfId && this.editingRecord) {
			return this.originalSelection.indexOfId(this.editingRecord.getId());
		}
	},


	getCurrentIndex: function() {
		return this.positionMenu.getCurrentPosition();
	},


	getOriginalPosition: function() {
		return {
			parent: this.getOriginalSelection(),
			index: this.getOriginalIndex()
		};
	},


	getCurrentPosition: function() {
		return {
			parent: this.getCurrentSelection(),
			index: this.getCurrentIndex()
		};
	}
});
