Ext.define('NextThought.view.contacts.outline.search.ContactSearchMixin',{

	constructor: function(){
		this.on('afterrender', 'attachContactSearch', this);
		this.doSearch = Ext.Function.createBuffered(this.doSearch, 250, this, null);
	},


	attachContactSearch: function(){
		this.searchButton = this.searchButton || this.el.down('.search');
		if(!this.searchButton){
			console.error('Could not attach contact search. No el provided');
			return;
		}

		this.clearNib = this.searchButton.down('.clear');
		this.searchField = this.searchButton.down('input');

		this.clearNib.setVisibilityMode(Ext.Element.DISPLAY);
		this.mon(this.clearNib, 'click', 'clearClicked', this);

		this.mon(this.searchButton, 'click', 'setSearchOverlay', this, {single:true});
		this.mon(this.searchButton, {
			scope: this,
			click: 'onSearchClick'
		});

		this.mon(this.searchField, {
			scope:       this,
			blur:        'onSearchBlur',
			keyup:       'onSearchKeyPressed',
			contextmenu: function (e) {
				e.stopPropagation();
			} //allow context on simple texts
		});

	},

	setSearchOverlay: function(){
		this.contactSearchOverlay = Ext.widget('contact-search-overlay', { renderTo: this.el});
	},

	onSearchBlur: function () {
		var v = this.searchField.getValue();
		if (Ext.isEmpty(v)) {
			this.removeCls('searching');
			this.searchButton.removeCls('active');
			this.clearNib.hide();
		}
		if (Ext.is.iPad) {
			window.scrollTo(0, 0);
		}
	},


	onSearchClick: function () {
		this.searchButton.addCls('active');
		this.searchField.focus();
	},


	clearClicked: function (e) {
		if (e) {
			e.stopEvent();
		}

		this.searchField.dom.value = '';
		this.onSearchBlur();

		return false;
	},


	onSearchKeyPressed: function (e) {
		if (e.ESC === e.getKey()) {
			this.clearClicked();
		}

		var v = this.searchField.getValue();
		this.clearNib[Ext.isEmpty(v) ? 'hide' : 'show']();

		if (this.lastSearchValue !== v) {
			this.lastSearchValue = v;
			this.doSearch(v);
		}
	},


	getSearchStore: function(){
		return this.contactSearchOverlay.getStore();
	},


	doSearch: function (v) {
		var fn = 'removeAll',
			action = 'removeCls',
			param = false,
			searchStore = this.getSearchStore();

		if (!Ext.isEmpty(v)) {
			action = 'addCls';
			fn = 'search';
			param = v;
		}

		this[action]('searching');
		if(searchStore){
			searchStore[fn](param);
		}
	}
});