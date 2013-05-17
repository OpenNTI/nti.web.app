Ext.define('NextThought.view.form.fields.UserTokenField', {
	extend: 'NextThought.view.form.fields.TagField',
	alias: ['widget.user-sharing-list'],
	requires: [
		'NextThought.view.sharing.ShareSearchList',
		'NextThought.util.Search'
	],

	mixins: {
		'sharingUtils': 'NextThought.mixins.SharingPreferences'
	},

	cls:'sharing-token-field',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'control publish', 'data-qtip': 'Publish State'},
		{cls:'tokens',cn:[
			{tag:'span', cls:'inputArea', cn:[
				{tag:'span', cls:'plus'},
				{tag:'span', cls:'token-input-wrap', cn:[
					{tag:'input', type:'text', tabIndex: '{tabIndex}', placeholder: 'Add people to the discussion'},
					{tag:'span', cls:'token-input-sizer', html:'Add people to the discussion##'}
				]}
			]}
		]}
	]),


	tokenTpl: Ext.DomHelper.createTemplate({tag: 'span', cls:'token {1}', cn:[
		{tag:'span', cls:'value', html:'{0}', 'data-value':'{2}'},
		{tag:'span', cls:'x'}
	]}),


	renderSelectors: {
		wrapEl: '.token-input-wrap',
		sizerEl: '.token-input-sizer',
		inputEl: 'input[type="text"]',
		valueEl: 'input[type="hidden"]',
		publishEl: '.control.publish',
		plusEl: '.plus'
	},


	getType: function(modelData){
		return NextThought.model.UserSearch.getType(modelData);
	},


	initComponent: function(){
		this.callParent(arguments);
		this.selections = [];
	},


	afterRender: function(){
		this.callParent(arguments);

		var me = this,
			editorEl = this.el.up('.editor');

		this.store = new NextThought.store.UserSearch();
		this.pickerView = Ext.widget('share-search', {
			ownerCls: this.ownerCls,
			store:me.store,
			renderTo: this.scrollParentEl || Ext.getBody()
		});
		this.pickerView.addCls(this.ownerCls);
		this.mon(this.pickerView, 'select', this.searchItemSelected, this);
		this.on('destroy','destroy',this.pickerView);
		this.mon(me.publishEl, 'click', this.togglePublish, this);
		if(editorEl){
			this.mon(editorEl,{
				scope: this,
				'click': this.maybeHideSearchListMenu,
				'mouseover': this.maybeHideSearchListMenu
			});
		}

		this.setupKeyMap();
	},


	setupKeyMap: function(){
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
				tab: function(e) {
					if (selectOnTab) {
						this.selectHighlighted(e);
					}
					// Tab key event is allowed to propagate to field
					return true;
				},
				enter: function(e){
					var selModel = picker.getSelectionModel(),
						count = selModel.getCount();

					this.selectHighlighted(e);

					// Handle the case where the highlighted item is already selected
					// In this case, the change event won't fire, so just collapse
					if (!me.multiSelect && count === selModel.getCount()) {
						me.collapse();
					}
				}
			});
		}
	},


	addInputListeners: function(){
		this.mon(this.inputEl, {
			scope: this,
			'keydown': this.onKeyDown
		});
	},


	updateSize: function(){
		this.callParent(arguments);
		this.updatePlaceholderLabel();
	},


	togglePublish: function(e){
		if(e.getTarget('.readOnly')){
			e.stopEvent();
			return;
		}
		var action = e.getTarget('.on') ? 'removeCls' : 'addCls';
		this.publishEl[action]('on');
	},


	maybeHideSearchListMenu: function(e){
		var me = this;
		if(e.getTarget('.x-menu') || e.getTarget('.sharing-token-field')){
			clearTimeout(this.hideTimer);
		}
		else{
			clearTimeout(this.hideTimer);
			this.hideTimer = Ext.defer( function(){ me.pickerView.hide();}, 500);
		}
	},


	setPlaceholderText: function(text){
		this.inputEl.set({'placeholder': text});
		this.sizerEl.update(text+'##');
	},


	updatePlaceholderLabel: function(e){
		this.setPlaceholderText('Add');
	},


	resetPlaceholderLabel: function(){
		this.setPlaceholderText('Add people to the discussion');
	},


	getInsertionPoint: function(){
		return this.el.down('.inputArea');
	},


	addSelection: function(users){
		var m = this;

		if(!Ext.isArray(users)){
			users = [users];
		}

		Ext.each(users,function(user){
			if(m.containsToken(user)) { return; }
			m.addToken(user);
			m.selections.push(user);
		});
	},


	containsToken: function(model){
		if(!model){return true;}

		var id = model.getId(), c;
		c = Ext.Array.filter(this.selections, function(o, i){ return o.getId()===id; });
		return c.length > 0;
	},


	getNameSnippet: function(value){
		//Truncate long names.
		return Ext.String.ellipsis(value, 20);
	},


	addToken: function(record){
		var value = record && record.get('displayName'),
			type = this.getType(record.getData());

		if(this.isToken(value)){
			this.addTag(value, type);
			this.updatePlaceholderLabel();
		}
	},


	isToken: function(text) { return !Ext.isEmpty(text); },


	searchItemSelected: function(sel, record){
		var	el = this.inputEl;

		this.addSelection(record);
		Ext.defer(el.focus,10,el);
		Ext.defer(this.updateSize, 1, this);
		return true;
	},


	collapse: function(){
		this.getPicker().hide();
	},


	clearResults: function(){
		this.store.removeAll();
		this.collapse();
	},


	getValue: function(){
		var m = this, r = [];
		Ext.each(m.selections, function(u){
			r.push(u.get('Username'));
		});
		return this.computeSharedWithList(r);
	},


	setValue: function(value){
		if(!this.rendered){
			this.on('afterrender', Ext.bind(this.setValue, this, arguments), this, {single:true});
			return;
		}

		var me = this, explicitEntities;
		if(Ext.isEmpty(value)){ return; }
		if(!Ext.isArray(value)){ value = [value]; }
		me.reset();
		explicitEntities = this.resolveExplicitShareTarget(value);
		UserRepository.getUser(explicitEntities, function(users){
			me.addSelection(users);
		});

		this.setPublished(this.isPublic(value));
	},


	setPublished: function(value){
		var action = value ? 'addCls' : 'removeCls';
		if(this.publishEl){
			this.publishEl[action]('on');
		}
	},


	getPublished: function(){
		return this.publishEl ? this.publishEl.is('.on') : undefined;
	},


	handledSpecialKey: function(e){
		var key = e.getKey(),
			val = this.inputEl.getValue();

		if(key === e.BACKSPACE){
			if(val === ''){
				this.removeLastToken();
				e.stopEvent();
				return true;
			}

			if(val && val.length===1){
				this.clearResults();
				return true;
			}
		}

		if(key === e.ESC){
			this.collapse();
			e.stopEvent();
			this.inputEl.focus(100);
			return true;
		}

		if(key === e.DOWN && !this.getPicker().isVisible()){
			this.search();
		}

		return key === e.DOWN || key === e.UP || key === e.RIGHT  || key === e.LEFT || key === e.TAB || this.isDelimiter(key);
	},


	onKeyDown: function(e){
		clearTimeout(this.searchTimeout);

		if(this.handledSpecialKey(e)){ return; }

		this.searchTimeout = Ext.defer(this.search,250,this);
	},


	search: function(){
		if(!this.inputEl){
			return;
		}

		var value = this.inputEl.getValue(),
			t = this.el.down('.tokens'),
			w = t && t.getWidth();

		if(!value || value.replace(SearchUtils.trimRe,'').length < 1){
			this.clearResults();
		}
		else {
			if(!Ext.isEmpty(w)){
				this.pickerView.setWidth(w);
			}
			this.store.search(value);
			this.pickerView.showBy(this.el, 'tl-bl',[0,0]);
			Ext.defer(this.alignPicker, 1, this);
			this.inputEl.focus(100);
		}
	},


	getPicker: function(){
		return this.pickerView;
	},


	alignPicker: function(){
		var me = this,
			picker = me.getPicker(),
			heightAbove = me.getPosition()[1] - Ext.getBody().getScroll().top,
			heightBelow = Ext.Element.getViewHeight() - heightAbove - me.getHeight(),
			space = Math.max(heightAbove, heightBelow),
			anchor = 'tl-bl', x, y;

		if(picker.getHeight() > (space-5)){
			picker.setHeight(space-5);

			if(heightAbove > heightBelow){
				anchor = 'bl-tl';
				x = picker.getAlignToXY(this.el, anchor, [0,0]);
				y = picker.getAlignToXY(this.inputEl, anchor, [0,0]);
			}else{
				x = picker.getAlignToXY(this.el, anchor, [0,0]);
				y = picker.getAlignToXY(this.el, anchor, [0,0]);
			}
			picker.setPagePosition(x[0], y[1], false);
		}
	},

	reset: function(){
		Ext.each(this.el.query('.token'), function(t){ t.remove(); }, this);
		this.selections = [];
		this.inputEl.dom.value = '';
		this.publishEl.removeCls('on'); // Default is private state.
		this.resetPlaceholderLabel();
	},


	removeToken: function(tokenName, tokenEl){
		var	s = [];

		// Remove the element and remove it from the list of selections.
		if(tokenEl){ tokenEl.remove(); }
		Ext.each(this.selections, function(o){
			if(o.get('displayName')!== tokenName) { s.push(o); }
		});
		
		this.selections = s;
		this.fireEvent('sync-height', this);
	},


	removeLastToken: function(){
		var lastSelection, tkEl, tkName;
		if (this.selections.length > 0) {
			lastSelection = this.selections.last();
			tkName = lastSelection.get('displayName');
			tkEl = this.el.down('[data-value='+tkName+']');
			tkEl = tkEl && tkEl.up('.token');
			this.removeToken(tkName, tkEl);
		}
	},


	onClick: function(e){
		if(e.getTarget('.readOnly')){
			e.stopEvent();
			return;
		}

		e.stopEvent();
		var t = e.getTarget('.x',null,true),
			p = t && t.up('.token'),
			v = p && p.down('.value').getAttribute('data-value');

		if( v ){ this.removeToken(v, p); }
		this.inputEl.focus();
	},

	destroy: function(){
		this.callParent(arguments);
		console.warn('token field destoryed.');
	}
});
