Ext.define('NextThought.view.form.fields.UserTokenField', {
	extend: 'NextThought.view.form.fields.TagField',
	alias: ['widget.user-sharing-list'],
	requires: [
		'NextThought.view.sharing.ShareSearchList',
		'NextThought.util.Search'
	],

	cls:'sharing-token-field',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'control publish on', 'data-qtip': 'Privacy Setting'},
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


	TIP: {
		'public': {
			title: 'Public Discussion',
			html: 'Use a public discussion when you want to reach the largest possible audience. Add contacts to notify them of your discussion and to encourage participation.'
		},
		'private':{
			title:'Private Discussion',
			html:'Private discussions are limited to the contacts, lists, and groups you specify. Once a discussion has started the audience cannot be expanded.'
		}
	},


	initComponent: function(){
		this.callParent(arguments);
		this.selections = [];

		this.tip = Ext.widget('nt-tooltip',Ext.apply({
			autoHide: false,
			anchor:'bottom',
			minWidth: 250

		},this.TIP['private']));

		if(this.readOnly){
			this.tip.disable();
		}
		this.on('destroy','destroy',this.tip);
	},


	afterRender: function(){
		this.callParent(arguments);

		var me = this,
			spEl = this.scrollParentEl,
			editorEl = this.el.up('.editor');

		this.store = new NextThought.store.UserSearch();
		this.pickerView = Ext.widget('share-search', {
			ownerCls: this.ownerCls,
			store:me.store,
			renderTo: spEl || Ext.getBody()
		});
		this.mon(this.store,'load','alignPicker',this);

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

		this.tip.setTarget(this.el);
		this.mon(this.inputEl,'focus','onTargetOver',this.tip);

		this.setupKeyMap();

		if(spEl){
			this.mon(spEl,'scroll','hide',this.tip);
			this.mon(spEl,'scroll','alignPicker',this,{buffer:300});
		}
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

		this.setPublished(!this.getPublished());
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
		this.store.removeAll();
		this.getPicker().hide().setHeight(null);
	},


	clearResults: function(){
		this.collapse();
	},


	getValue: function(){
		var m = this, r = [];
		Ext.each(m.selections, function(u){
			r.push(u.get('Username'));
		});

		return {
			entities: r,
			publicToggleOn: this.getPublished()
		};
	},


	setValue: function(sharingInfo){
		if(!this.rendered){
			this.on('afterrender', Ext.bind(this.setValue, this, arguments), this, {single:true});
			return;
		}

		var me = this, explicitEntities;
		me.reset();
		explicitEntities = sharingInfo.entities || [];
		UserRepository.getUser(explicitEntities, function(users){
			me.addSelection(users);
		});

		this.setPublished(sharingInfo.publicToggleOn);
	},


	setPublished: function(value){
		var action = value ? 'addCls' : 'removeCls',
			state = value ? 'public' : 'private',
			tip = this.TIP[state];

		if(this.publishEl){
			this.publishEl[action]('on');
		}


		this.tip.suspendLayouts();
		this.tip.setTitle(tip.title);
		this.tip.update(tip.html);
		this.tip.setWidth(this.getWidth());
		this.tip.resumeLayouts(true);
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
				this.inputEl.focus(100);
				return true;
			}
		}

		if(key === e.ESC){
			e.stopEvent();

			if(Ext.isEmpty(val)){
				this.tip.onTargetOut({within:Ext.emptyFn});
				this.tip.hide();
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
			w = this.getWidth();

		value = (value || '').replace(SearchUtils.trimRe,'');
		if(Ext.isEmpty(value)){
			this.clearResults();
		}
		else {
			if(!Ext.isEmpty(w)){
				this.pickerView.setWidth(w);
			}
			this.store.search(value);
			this.alignPicker();
			this.inputEl.focus(100);
		}
	},


	getPicker: function(){
		return this.pickerView;
	},


	alignPicker: function(){
		if(!this.getEl().isVisible(true)){
			return;
		}

		this.getPicker().setHeight(null);
		var me = this, x, y,
			spEl = this.scrollParentEl,
			scrollOffset = (spEl && spEl.getScroll().top) || 0,
			cordinateRootX = (spEl && spEl.getX()) || 0,
			cordinateRootY = (spEl && spEl.getY()) || 0,
			padding = 5,
			above = false,
			align = 't-b',
			picker = me.getPicker(),
			spaceAbove = me.inputEl.getY(),
			spaceBelow = Ext.Element.getViewHeight() - (me.getY() + me.getHeight()),
			pickerHeight = picker.getHeight(),
			firstNode = picker.getNode(0),
			minListHeight = (firstNode && (Ext.fly(firstNode).getHeight()*3)) || 150;//some safe number if we can't resolve the height of 3 items.

		function adjHeight(n){
			if(pickerHeight > n){
				picker.setHeight(n-padding);
			}
		}

		if(spaceBelow < minListHeight){
			align = 'b-t';
			above = true;
		}

		adjHeight(above? spaceAbove : spaceBelow);

		x = picker.getAlignToXY(this.el, 'l-l')[0] - cordinateRootX;
		y = picker.getAlignToXY(this.inputEl, align,[0,padding])[1] - cordinateRootY;

		picker.showAt(x,y + scrollOffset);
	},

	reset: function(){
		Ext.each(this.el.query('.token'), function(t){ Ext.fly(t).remove(); }, this);
		this.selections = [];
		this.inputEl.dom.value = '';
		this.setPublished(false);
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
