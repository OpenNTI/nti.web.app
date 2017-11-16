const Ext = require('extjs');
const { encodeForURI, isNTIID } = require('nti-lib-ntiids');
const {wait} = require('nti-commons');
const {Store, Input} = require('nti-web-search');

const SearchActions = require('./Actions');
const SearchStateStore = require('./StateStore');

require('legacy/overrides/ReactHarness');
require('./components/AdvancedOptions');

const SearchStore = Store.getGlobal();


module.exports = exports = Ext.define('NextThought.app.search.SearchBar', {
	extend: 'Ext.Component',
	alias: 'widget.search-searchbar',
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
					{cls: 'input-container'},
					{tag: 'a', href: '#', cls: 'trigger'},
					{cls: 'search-icon'}
				]
			}
		]
	}),

	renderSelectors: {
		wrapEl: '.search-field-wrap',
		boxEl: '.search-field',
		inputContainerEl: '.input-container',
		inputEl: 'input',
		triggerEl: '.trigger',
		searchIconEl: '.search-icon'
	},

	constructor: function () {
		this.callParent(arguments);
		this.placeholder = 'Search';

		this.SearchActions = SearchActions.create();
		this.SearchStore = SearchStateStore.getInstance();

		this.mon(this.SearchStore, 'sync-term', this.syncTerm.bind(this));

		const onSearchChange = ({type}) => {
			if (type === 'context') {
				if (SearchStore.context) {
					this.onSearchAddContext();
				} else {
					this.onSearchRemoveContext();
				}
			}
		};

		SearchStore.addChangeListener(onSearchChange);

		this.on('destroy', () => {
			SearchStore.removeChangeListener(onSearchChange);
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.input = Ext.widget({
			xtype: 'react',
			renderTo: this.inputContainerEl,
			component: Input,
			store: SearchStore,
			onBlur: (...args) => this.onInputBlur(...args),
			onKeyPress: (...args) => this.keyPressed(...args),
			onKeyDown: (...args) => this.keyDown(...args)
		});

		this.on('destroy', () => this.input.destroy());

		this.mon(this.searchIconEl, {
			click: this.searchClicked.bind(this)
		});

	},

	syncTerm: function (term) {
		if (!this.rendered) {
			this.on('afterrender', this.syncTerm.bind(this, term));
			return;
		}

		SearchStore.setTerm(term);
	},

	focusInput: function () {
		if (this.input.componentInstance) {
			this.input.componentInstance.focus();
		}
	},

	onInputFocus: function () {
		this.isFocused = true;
		this.onSearchFocus();
	},

	onInputBlur: function () {
		var me = this;

		me.isFocused = false;
		me.fromBlur = true;
		me.onSearchBlur();

		wait(1000).then(function () {
			delete me.fromBlur;
		});
	},

	keyDown: function (e) {
		var k = e.key || e.charCode;

		if (this.specialKeys[k]) {
			if (k === Ext.EventObject.ESC) {
				this.syncTerm('');
			}

			e.stopPropagation();
		}
	},

	keyPressed: function (e) {
		e.stopPropagation();

		//taken from the guts of Ext's getKey
		var k = e.keyCode || e.charCode;

		if (k === Ext.EventObject.ENTER) {
			this.doNavigation();
		} else if (k === Ext.EventObject.ESC) {
			this.doSearch();
		} else {
			this.doSearchBuffered();
		}
	},

	searchClicked: function (e) {
		if (!e.getTarget('.collapsed') || this.fromBlur) {
			e.stopPropagation();
			this.doNavigation();
		}
	},

	doNavigation: function () {
		var val = this.getValue();

		// no point in starting up the search process if there is nothing
		// to search on
		if(!val) {
			return;
		}

		if (this.noRouteOnSearch) { return this.doSearch(); }

		this.doSearch(true);

		var params = {},
			route = '/search/?',
			page = this.SearchStore.getPageLocation(),
			bundle = this.SearchStore.getBundleLocation();

		params.q = encodeURIComponent(val);

		if (bundle && isNTIID(bundle)) {
			params.s = encodeForURI(bundle);
		}

		if (page && isNTIID(page)) {
			params.p = encodeForURI(page);
		}

		route += Ext.Object.toQueryString(params);

		this.pushRootRoute('Search', route);
	},

	doSearch: function (silent) {
		clearTimeout(this.searchEventDelayId);

		var val = this.getValue();

		this.SearchActions.setSearchContext(val, silent);
	},

	doSearchBuffered: function () {
		var me = this;

		clearTimeout(this.searchEventDelayId);

		this.searchEventDelayId = setTimeout(function () {
			var val = me.getValue();

			if (!val || val.length > 3) {
				me.doSearch();
			}
		}, me.BUFFER);
	},

	getValue: function () {
		return SearchStore.searchTerm;
	}
});
