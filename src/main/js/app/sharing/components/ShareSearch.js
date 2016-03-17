export default Ext.define('NextThought.app.sharing.components.ShareSearch', {
	extend: 'Ext.container.Container',
	alias: 'widget.search-sharesearch',

	floating: true,

	requires: [
		'NextThought.app.sharing.components.ShareSearchList'
	],

	cls: 'share-search-container',
	layout: 'none',

	items: [],


	afterRender: function() {
		this.callParent(arguments);

		this.setupSearchList();

		if (this.store) {
			this.searchList.bindStore(this.store);
		}

		this.mon(this.el, 'click', this.onClicked.bind(this));
	},

	setupSearchList: function(){
		this.searchList = this.add({
			xtype: 'share-search',
			ownerCls: this.ownerCls,
			loadMaskContainer: this.el,
			selectItem: this.selectItem.bind(this)
		});
	},


	onClicked: function() {
		if (this.stopHide) {
			this.stopHide();
		}
	},


	bindStore: function(store) {
		this.store = store;

		if (this.searchList) {
			this.searchList.bindStore(store);
		}
	},


	refresh: function() {
		if (this.searchList) {
			this.searchList.refresh();
		}
	},

	addSelected: function(){
		this.searchList.addSelected();
	},

	getNode: function(index) {
		if (this.searchList) {
			return this.searchList.getNode(index);
		}
	},

	getRecord: function(node){
		return this.searchList.getRecord(node)
	},

	selectNext: function() {
		this.searchList.selectNext();
	},


	selectPrev: function() {
		this.searchList.selectPrev();
	},

	unselectItem: function() {
		this.searchList.unselectItem();
	},

	getSelectionModel: function(){
		return this.searchList.getSelectionModel();
	}
});
