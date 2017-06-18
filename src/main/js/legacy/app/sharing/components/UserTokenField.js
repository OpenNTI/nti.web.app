const Ext = require('extjs');
const {wait} = require('nti-commons');

const UserRepository = require('legacy/cache/UserRepository');
const SearchUtils = require('legacy/util/Search');
const UserSearch = require('legacy/store/UserSearch');

const SharingActions = require('../Actions');

require('legacy/common/form/fields/TagField');
require('./ShareSearch');



module.exports = exports = Ext.define('NextThought.app.sharing.components.UserTokenField', {
	extend: 'NextThought.common.form.fields.TagField',
	alias: ['widget.user-sharing-list'],
	cls: 'user-token-field',
	placeholder: 'Add people to the discussion',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'tokens', cn: [
			{tag: 'span', cls: 'inputArea', cn: [
				{tag: 'span', cls: 'plus'},
				{tag: 'span', cls: 'token-input-wrap', cn: [
					{tag: 'input', type: 'text', tabIndex: '{tabIndex}', placeholder: '{placeholder}'},
					{tag: 'span', cls: 'token-input-sizer', html: '{placeholder}##'}
				]}
			]}
		]}
	]),

	renderSelectors: {
		plusEl: '.plus'
	},

	getType: function (modelData) {
		return UserSearch.getType(modelData);
	},

	initComponent: function () {
		this.callParent(arguments);
		this.selections = [];

		this.SharingActions = SharingActions.create();
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this,
			spEl = this.scrollParentEl,
			editorEl = this.el.up('.editor');

		this.searchStore = this.buildSearchStore();
		this.suggestionStore = this.buildSuggestionStore();
		this.setupPickerView();


		this.mon(this.searchStore, {
			scope: this,
			load: 'onSearchLoaded',
			refresh: 'maybeAlignPicker'
		});

		this.mon(this.suggestionStore, {
			scope: this,
			load: 'onSearchLoaded',
			refresh: 'maybeAlignPicker'
		});

		this.onSearchLoaded();

		this.pickerView.addCls(this.ownerCls).show().hide();

		this.on('destroy', 'destroy', this.pickerView);

		if (editorEl) {
			this.mon(editorEl, {
				scope: this,
				'click': this.maybeHideSearchListMenu,
				'mouseover': this.maybeHideSearchListMenu
			});
		}


		this.setupKeyMap();

		window.addEventListener('scroll', this.windowScrollHandler);

		if (spEl) {
			this.mon(spEl, 'scroll', 'alignPicker', this, {buffer: 300});
		}

		if (Ext.is.iOS) {
			//When input focused, instead of selecting, put cursor at end
			this.mon(this.inputEl, 'focus', function () {
				var dom = me.inputEl.el.dom, length = dom.value.length;
				dom.setSelectionRange(length, length);
			});
			//If there's something in the add people field, search if blurred
			this.mon(this.inputEl, 'blur', function () {
				console.log(me.inputEl.el.dom.value.length);
				if (me.inputEl.el.dom.value.length > 0) {
					clearTimeout(me.searchTimeout);
					me.searchTimeout = Ext.defer(me.search, 250, me);
				}
			});
		}
	},

	setupPickerView: function () {
		var spEl = this.scrollParentEl;

		this.pickerView = Ext.widget('search-sharesearch', {
			ownerCls: this.ownerCls,
			focusOnToFront: false,
			renderTo: spEl || Ext.getBody(),
			selectItem: this.searchItemSelected.bind(this),
			stopHide: this.stopPickerHide()
		});
	},

	buildSearchStore: function () {
		return new UserSearch();
	},

	buildSuggestionStore: function () {
		return this.SharingActions.getSuggestionStore();
	},

	setupKeyMap: function () {
		var me = this,
			selectOnTab = true,
			picker = me.getPicker(),
			keyNav = me.listKeyNav;

		// Handle BoundList navigation from the input field. Insert a tab listener specially to enable selectOnTab.
		if (keyNav) {
			keyNav.enable();
		} else {
			me.listKeyNav = new Ext.view.BoundListKeyNav(this.inputEl, {
				boundList: picker,
				forceKeyDown: true,
				tab: function (e) {
					if (selectOnTab) {
						this.selectHighlighted(e);
					}
					// Tab key event is allowed to propagate to field
					return true;
				},
				enter: function (e) {
					picker.addSelected();
				},
				up: function () {},
				down: function () {}
			});
		}
	},

	addInputListeners: function () {
		this.mon(this.inputEl, {
			'keydown': this.onKeyDown.bind(this),
			'focus': this.onInputFocus.bind(this),
			'blur': this.onInputBlur.bind(this)
		});
	},

	updateSize: function () {
		var i = this.inputEl,
			v = i.getValue();
		i[v ? 'removeCls' : 'addCls']('empty');
	},

	maybeHideSearchListMenu: function (e) {
		var me = this;
		if (e.type === 'mouseover' || e.getTarget('.x-menu') || e.getTarget('.user-token-field')) {
			clearTimeout(this.hideTimer);
		}
		else {
			clearTimeout(this.hideTimer);
			this.hideTimer = Ext.defer(function () { me.pickerView.hide();}, 500);
		}
	},

	setPlaceholderText: function (text) {
		this.placeholder = text;
		this.inputEl.set({'placeholder': text});
		this.sizerEl.update(text + '##');
	},

	updatePlaceholderLabel: function (e) {
		this.setPlaceholderText('Add');
	},

	resetPlaceholderLabel: function () {
		this.setPlaceholderText(this.placeholder);
	},

	getInsertionPoint: function () {
		return this.el.down('.inputArea');
	},

	addSelection: function (users) {
		var m = this;

		if (!Ext.isArray(users)) {
			users = [users];
		}

		Ext.each(users, function (user) {
			if (m.containsToken(user)) {
				m.removeTokenForUser(user);
			} else {
				m.addToken(user);
				m.selections.push(user);
			}
		});

		m.onSearchLoaded();
	},

	containsToken: function (model) {
		if (!model) {return true;}

		var id = model.getId(), c;
		c = Ext.Array.filter(this.selections, function (o, i) { return o.getId() === id; });
		return c.length > 0;
	},

	containsUnresolved: function () {
		const c = Ext.Array.filter(this.selections, function (o, i) { return o.Unresolved === true; });
		return c.length > 0;
	},

	getSnippet: function (value) {
		//Truncate long names.
		return Ext.String.ellipsis(value, 20);
	},

	addToken: function (record) {
		var value = record && record.get('displayName'),
			type = this.getType(record.getData());

		if (this.isToken(value) && !record.Unresolved) {
			this.addTag(value, type);
			this.updatePlaceholderLabel();
		} else if (!this.containsUnresolved() && record.Unresolved) {
			this.addTag('Others', type);
			this.updatePlaceholderLabel();
		}

		this.fireEvent('sync-height', this);
	},

	isToken: function (text) { return !Ext.isEmpty(text); },

	searchItemSelected: function (record) {
		var el = this.inputEl;

		this.addSelection(record);

		wait()
			.then(this.updateSize.bind(this));

		//wait for the blue event to hide the picker, before trying to show it
		wait(400)
			.then(el.focus.bind(el))
			.then(this.onInputFocus.bind(this));

		return true;
	},

	collapse: function () {
		this.searchStore.removeAll();
	},

	clearResults: function (showSuggestions) {
		this.collapse();

		if (showSuggestions) {
			this.showSuggestions();
		}
	},

	getValue: function () {
		var m = this, r = [];
		Ext.each(m.selections, function (u) {
			r.push(u.get('Username'));
		});

		return {
			entities: r
		};
	},

	setValue: function (sharingInfo) {
		if (!this.rendered) {
			if (this.setValueAfterRenderListener) {
				Ext.destroy(this.setValueAfterRenderListener);
			}
			this.setValueAfterRenderListener = this.on({'afterrender': Ext.bind(this.setValue, this, arguments), scope: this, single: true, destroyable: true});
			return;
		}
		delete this.setValueAfterRenderListener;

		var me = this, explicitEntities,
			clientEntities = [];

		this.clear();
		explicitEntities = (sharingInfo && sharingInfo.entities) || [];

		explicitEntities.forEach(function (entity) {
			if (Service.isFakePublishCommunity(entity)) {
				clientEntities.push(Service.getFakePublishCommunity());
			}
		});

		UserRepository.getUser(explicitEntities, function (users) {
			me.addSelection(clientEntities.concat(users));
		});
	},

	setDisabled: function (value) {},

	handledSpecialKey: function (e) {
		var key = e.getKey(),
			val = this.inputEl.getValue(),
			sel = window.getSelection().toString();

		if (key === e.BACKSPACE) {
			if (val === '') {
				this.removeLastToken();
				e.stopEvent();
				return true;
			}

			if (val && (val.length === 1 || val === sel)) {
				this.clearResults(true);
				this.inputEl.focus(100);
				this.alignPicker();
				return true;
			}
		}

		if (key === e.ESC) {
			e.stopEvent();

			if (Ext.isEmpty(val)) {
				this.inputEl.blur();
				this.clearResults();
				this.fireEvent('cancel-indicated');
				return true;
			}

			this.collapse();
			this.inputEl.dom.value = '';
			this.inputEl.focus(100);
			return true;
		}

		if (key === e.DOWN) {
			this.pickerView.selectNext();
			e.stopEvent();
		}

		if (key === e.UP) {
			this.pickerView.selectPrev();
			e.stopEvent();
		}

		if (key === e.DOWN && !this.getPicker().isVisible()) {
			this.search();
		}

		return key === e.DOWN || key === e.UP || key === e.RIGHT || key === e.LEFT || key === e.TAB || this.isDelimiter(key);
	},

	onKeyDown: function (e) {
		e.stopPropagation();

		if (Ext.is.iOS) {
			if (this.inputEl.dom.value.length === 1 && e.getKey() === e.BACKSPACE) {
				this.hidePicker();
			}
		}

		clearTimeout(this.searchTimeout);

		if (this.handledSpecialKey(e)) { return; }


		this.searchTimeout = Ext.defer(this.search, 250, this);
	},

	onInputFocus: function () {
		this.search();
		this.alignPicker();
		clearTimeout(this.hideOnBlurTimeout);
	},

	onInputBlur: function (e) {
		e.stopPropagation();

		var me = this;

		clearTimeout(this.hideOnBlurTimeout);

		//Wait to see if the picker el is being clicked
		this.hideOnBlurTimeout = setTimeout(function () {
			me.hidePicker();
		}, 500);
	},

	search: function () {
		if (!this.inputEl) {
			return;
		}

		var value = this.inputEl.getValue(),
			w = this.getWidth();

		value = (value || '').replace(SearchUtils.trimRe, '');
		this.clearResults();

		if (!Ext.isEmpty(w)) {
			this.pickerView.setWidth(w);
		}

		if (!value) {
			this.showSuggestions();
		} else {
			this.showSearch(value);
		}
	},

	showSearch: function (value) {
		this.pickerView.bindStore(this.searchStore);
		this.pickerView.refresh();

		//Clear results right before making a search.
		this.clearResults();
		this.searchStore.search(value);
	},

	showSuggestions: function () {
		this.pickerView.bindStore(this.suggestionStore);
		this.pickerView.refresh();
	},

	getPicker: function () {
		return this.pickerView;
	},

	onSearchLoaded: function () {
		var me = this;

		function mark (record) {
			var contained = me.containsToken(record);

			record.set('isMarked', contained);
		}

		me.suggestionStore.each(mark);

		me.searchStore.each(mark);

		this.maybeAlignPicker();
	},

	maybeAlignPicker: function () {
		if (this.pickerView.isVisible()) {
			this.alignPicker();
		}
	},

	alignPicker: function () {
		if (!this.el || !this.el.isVisible(true)) {
			return;
		}

		var minSpace = 300,
			picker = this.pickerView,
			pickerHeight = picker.getHeight(),
			viewHeight = Ext.Element.getViewportHeight(),
			rect = this.el.dom.getBoundingClientRect(),
			pickerScrollHeight = picker.el && picker.el.dom && picker.el.dom.scrollHeight,
			maxHeight,
			y, x = rect.left,
			above = false;

		if (rect.top + rect.height + minSpace > viewHeight) {
			above = true;
		}

		if (above) {
			y = Math.max(rect.top - pickerHeight, 0);
			maxHeight = rect.top;
		} else {
			y = rect.top + rect.height;
			maxHeight = viewHeight - y;
		}

		if (Ext.is.iOS) {
			if (this.inputEl.dom.value === '' || document.activeElement !== this.inputEl.dom) {
				this.hidePicker();
			}
		}

		if (pickerScrollHeight === 0 && !(Ext.is.iOS && document.activeElement !== this.inputEl.dom)) {
			wait()
				.then(this.alignPicker.bind(this));
		}

		picker.show();

		picker.el.setStyle({
			height: 'auto',
			right: 'auto',
			left: x + 'px',
			top: y + 'px',
			'max-height': maxHeight + 'px'
		});
	},

	stopPickerHide: function () {
		clearTimeout(this.hideOnBlurTimeout);
	},

	hidePicker: function () {
		console.log('Picker hidden');
		this.pickerView.unselectItem();
		this.pickerView.hide().setHeight(null);
	},

	clear: function () {
		Ext.each(this.el.query('.token'), function (t) { Ext.fly(t).remove(); }, this);
		this.selections = [];
		this.inputEl.dom.value = '';
		this.resetPlaceholderLabel();
		this.clearResults();
	},

	reset: function () {
		this.setValue(this.initialConfig.value);
	},

	removeToken: function (tokenName, tokenEl) {
		var s = [];

		// Remove the element and remove it from the list of selections.
		if (tokenEl) { tokenEl.remove(); }
		Ext.each(this.selections, function (o) {
			if (o.get('displayName') !== tokenName) { s.push(o); }
		});

		this.selections = s;
		if (Ext.isEmpty(this.selections)) {
			this.resetPlaceholderLabel();
		}
		this.fireEvent('sync-height', this);

		this.onSearchLoaded();
	},

	removeTokenForUser: function (user) {
		var name = user.get('displayName'),
			tokenEl = this.el.down('[data-value=' + name + ']');

		tokenEl = tokenEl && tokenEl.up('.token');

		if (tokenEl) {
			this.removeToken(name, tokenEl);
		}
	},

	removeLastToken: function () {
		var lastSelection, tkEl, tkName;
		if (this.selections.length > 0) {
			lastSelection = this.selections.last();
			tkName = lastSelection.get('displayName');
			tkEl = this.el.down('[data-value=' + tkName + ']');
			tkEl = tkEl && tkEl.up('.token');
			this.removeToken(tkName, tkEl);
		}
	},

	onClick: function (e) {
		if (e.getTarget('.readOnly')) {
			e.stopEvent();
			return;
		}

		e.stopEvent();
		var t = e.getTarget('.x', null, true),
			p = t && t.up('.token'),
			v = p && p.down('.value').getAttribute('data-value');

		if (v) { this.removeToken(v, p); }

		if (!Ext.is.iPad) { //Don't focus for iPad, won't bring up keyboard
			this.inputEl.focus();
		}
	},

	destroy: function () {
		this.callParent(arguments);
		window.removeEventListener('scroll', this.windowScrollHandler);
		//console.warn('token field destroyed.');
	}
});
