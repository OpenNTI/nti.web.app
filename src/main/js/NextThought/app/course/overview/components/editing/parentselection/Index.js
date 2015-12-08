Ext.define('NextThought.app.course.overview.components.editing.parentselection.Index', {
	extend: 'Ext.Component',
	//Shouldn't be instantiated, only extended

	requires: [
		'NextThought.app.course.overview.components.editing.parentselection.Menu'
	],


	label: 'Parent: ',
	cls: 'overview-editing-parentselection',


	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'item {cls}', 'data-ntiid': '{id}', html: '{label}'
	})),


	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: '{label}'},
		{cls: 'selection'}
	]),


	renderSelectors: {
		selectionEl: '.selection'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.originalSelection = this.getSelectionFor(this.editingRecord);

		this.menu = this.buildMenu(this.selectionItems, this.editor);

		this.selectRecord(this.originalSelection);
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.label
		});
	},


	parseItemData: function(item) {
		return item.getData();
	},


	getSelectionFor: function(record) {
		if (!record) { return this.selectionItems[0]; }

		//TODO: figure out how to select the right one when given a record
	},


	buildMenu: function(items, editor, selectedRecord) {
		var me = this;

		return new NextThought.app.course.overview.components.editing.parentselection.Menu({
			selectionItems: items,
			activeSelection: selectedRecord,
			itemTpl: this.itemTpl,
			parseItemData: this.parseItemData.bind(this),
			selectRecord: this.selectRecord.bind(this)
		});
	},


	selectRecord: function(record) {
		if (!this.rendered) {
			this.on('afterrender', this.selectRecord.bind(this, record));
			return;
		}

		this.selectionEl.dom.innerHTML = '';

		this.itemTpl.append(this.selectionEl, this.parseItemData(record));
	}

});
