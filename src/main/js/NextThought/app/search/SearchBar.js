Ext.define('NextThought.app.search.SearchBar', {
	extend: 'Ext.Component',
	alias: 'widget.search-searchbar',

	requires: [
		'NextThought.app.search.Actions',
		'NextThought.app.search.components.AdvancedOptions'
	],

	BUFFER: 500,

	specialKeys: {
		8: true,	//Ext.EventObject.BACKSPACE
		13: true,	//Ext.EventObject.ENTER
		27: true,	//Ext.EventObject.ESC
		32: true,	//Ext.EventObject.SPACE
		46: true,	//Ext.EventObject.DELETE
		37: true,	//Ext.EventObject.LEFT
		39: true	//Ext.EventObject.RIGHT
	},


	renderTpl: Ext.DomHelper.markup({
		cls: 'search-field-wrap',
		cn: [
			{
				cls: 'search-field',
				cn: [
					{tag: 'input', type: 'text', placeholder: getString('NextThought.view.form.fields.SearchField.placeholder')},
					{tag: 'a', href: '#', cls: 'trigger'},
					{cls: 'search-icon'}
				]
			}
		]
	}),


	renderSelectors: {
		wrapEl: '.search-field-wrap',
		boxEl: '.search-field',
		inputEl: 'input',
		triggerEl: '.trigger',
		searchIconEl: '.search-icon'
	},


	constructor: function() {
		this.callParent(arguments);
		this.placeholder = 'Search';

		this.SearchActions = NextThought.app.search.Actions.create();
		this.SearchStore = NextThought.app.search.StateStore.getInstance();

		this.mon(this.SearchStore, 'sync-term', this.syncTerm.bind(this));
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.inputEl, {
			// focus: this.onInputFocus.bind(this),
			blur: this.onInputBlur.bind(this),
			keypress: this.keyPressed.bind(this),
			keydown: this.keyDown.bind(this)
		});

		this.mon(this.searchIconEl, {
			click: this.searchClicked.bind(this)
		});
	},


	syncTerm: function(term) {
		if (!this.rendered) {
			this.on('afterrender', this.syncTerm.bind(this, term));
			return;
		}

		this.inputEl.dom.value = term;
	},


	focusInput: function() {
		this.inputEl.focus();
	},


	onInputFocus: function() {
		this.isFocused = true;
		this.onSearchFocus();
	},


	onInputBlur: function() {
		var me = this;

		me.isFocused = false;
		me.fromBlur = true;
		me.onSearchBlur();

		wait(1000).then(function() {
			delete me.fromBlur;
		});
	},


	keyDown: function(e) {
		var k = e.getKey();

		if (this.specialKeys[k]) {
			if (k === e.ESC) {
				this.inputEl.dom.value = '';
			}

			e.stopPropagation();
		}
	},


	keyPressed: function(e) {
		e.stopPropagation();

		var k = e.getKey();

		if (k === e.ENTER) {
			this.doNavigation();
		} else if (k === e.ESC) {
			this.doSearch();
		} else {
			this.doSearchBuffered();
		}
	},


	searchClicked: function(e) {
		if (!e.getTarget('.collapsed') || this.fromBlur) {
			e.stopPropagation();
			this.doNavigation();
		}
	},


	doNavigation: function() {
		if (this.noRouteOnSearch) { return this.doSearch(); }

		this.doSearch(true);

		var params = {},
			route = '/search/?',
			page = this.SearchStore.getPageLocation(),
			bundle = this.SearchStore.getBundleLocation();

		params.q = encodeURIComponent(this.getValue());

		if (bundle) {
			params.s = ParseUtils.encodeForURI(bundle);
		}

		if (page) {
			params.p = ParseUtils.encodeForURI(page);
		}

		route += Ext.Object.toQueryString(params);

		this.pushRootRoute('Search', route);
	},


	doSearch: function(silent) {
		clearTimeout(this.searchEventDelayId);

		var val = this.getValue();

		this.SearchActions.setSearchContext(val, silent);
	},


	doSearchBuffered: function() {
		var me = this;

		clearTimeout(this.searchEventDelayId);

		this.searchEventDelayId = setTimeout(function() {
			var val = me.getValue();

			if (!val || val.length > 3) {
				me.doSearch();
			}
		}, me.BUFFER);
	},


	getValue: function() {
		return this.inputEl.getValue();
	}
});
