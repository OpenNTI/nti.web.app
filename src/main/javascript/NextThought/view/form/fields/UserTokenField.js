Ext.define('NextThought.view.form.fields.UserTokenField', {
	extend: 'NextThought.view.form.fields.TagField',
	alias: ['widget.user-sharing-list'],
	requires: [
		'NextThought.view.sharing.ShareSearchList',
		'NextThought.util.Search'
	],

	cls:'user-token-field',
	placeholder: 'Add people to the discussion',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'control publish on'},
		{cls:'tokens',cn:[
			{tag:'span', cls:'inputArea', cn:[
				{tag:'span', cls:'plus'},
				{tag:'span', cls:'token-input-wrap', cn:[
					{tag:'input', type:'text', tabIndex: '{tabIndex}', placeholder: '{placeholder}'},
					{tag:'span', cls:'token-input-sizer', html:'{placeholder}##'}
				]}
			]}
		]}
	]),


	renderSelectors: {
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
			autoHide: true,
			anchor:'bottom',
			minWidth: 250

		},this.TIP['public']));
		this.tip.blockLeftRightAlign();

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
			focusOnToFront: false,
			renderTo: spEl || Ext.getBody()
		});
		this.mon(this.store, {
			scope: this,
			load:'alignPicker',
			refresh:'alignPicker'
		});

		this.pickerView.addCls(this.ownerCls).show().hide();
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

		this.tip.setTarget(this.publishEl);
		this.mon(this.inputEl,'focus','onTargetOver',this.tip);

		this.setupKeyMap();

		if(spEl){
			this.mon(spEl,'scroll','hide',this.tip);
			this.mon(spEl,'scroll','alignPicker',this,{buffer:300});
		}

        if(Ext.is.iPad){
            var me = this;
            //When input focused, instead of selecting, put cursor at end
            this.mon(this.inputEl, 'focus', function(){
                var dom = me.inputEl.el.dom;
                var length = dom.value.length;
                dom.setSelectionRange(length,length);
            });
            //If there's something in the add people field, search if blurred
            this.mon(this.inputEl, 'blur', function(){
                console.log(me.inputEl.el.dom.value.length);
                if(me.inputEl.el.dom.value.length > 0){
                    clearTimeout(me.searchTimeout);
                    me.searchTimeout = Ext.defer(me.search,250,me);
                }
            });
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
			'keydown': 'onKeyDown'
		});
	},


	updateSize: function(){
		var i = this.inputEl,
			v = i.getValue();
		i[v?'removeCls':'addCls']('empty');
	},


	togglePublish: function(e){
		e.stopEvent();
		if(e.getTarget('.readOnly')){
			return;
		}

		this.setPublished(!this.getPublished());
	},


	maybeHideSearchListMenu: function(e){
		var me = this;
		if(e.type === 'mouseover' || e.getTarget('.x-menu') || e.getTarget('.user-token-field')){
			clearTimeout(this.hideTimer);
		}
		else{
			clearTimeout(this.hideTimer);
			this.hideTimer = Ext.defer( function(){ me.pickerView.hide();}, 500);
		}
	},


	setPlaceholderText: function(text){
		this.placeholder = text;
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


	getSnippet: function(value){
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

		this.fireEvent('sync-height', this);
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
		this.clear();
		explicitEntities = (sharingInfo && sharingInfo.entities) || [];
		UserRepository.getUser(explicitEntities, function(users){
			me.addSelection(users);
		});

		this.setPublished(sharingInfo && sharingInfo.publicToggleOn);
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
			val = this.inputEl.getValue(),
            sel = window.getSelection().toString();

		if(key === e.BACKSPACE){
			if(val === ''){
				this.removeLastToken();
				e.stopEvent();
				return true;
			}

			if(val && (val.length===1 || val === sel)){
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
		e.stopPropagation();

        if(Ext.is.iPad){
            if(this.inputEl.dom.value.length == 1 && e.getKey() == e.BACKSPACE){
                this.hidePicker();
            }
        }
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
		this.clearResults();
		if(!Ext.isEmpty(w)){ this.pickerView.setWidth(w); }

		//Clear results right before making a search.
		this.clearResults();
		this.store.search(value);

	},


	getPicker: function(){
		return this.pickerView;
	},


	alignPicker: function(){
		if(!this.getEl().isVisible(true)){
			return;
		}

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
			pickerScrollHeight = picker.getEl().first().dom.scrollHeight,
			pickerHeight = picker.getHeight(),
			firstNode = picker.getNode(0),
			minListHeight = (firstNode && (Ext.fly(firstNode).getHeight()*3)) || 150;//some safe number if we can't resolve the height of 3 items.

		function adjHeight(n){
			if(pickerScrollHeight > n){
				picker.setHeight(n-padding);
			}

			//NOTE: expand to full picker's scrollHeight, if it doesn't fill the available space.
			if( pickerScrollHeight <= n && pickerScrollHeight > pickerHeight){
				picker.setHeight(pickerScrollHeight);
			}
		}

		if(spaceBelow < minListHeight){
			align = 'b-t';
			above = true;
		}

		adjHeight(above? spaceAbove : spaceBelow);

		x = picker.getAlignToXY(this.el, 'l-l')[0] - cordinateRootX;
		y = picker.getAlignToXY(this.inputEl, align,[0,padding])[1] - cordinateRootY;

		if(pickerScrollHeight === 0){
            if(!(Ext.is.iPad && document.activeElement != this.inputEl.dom)){
                Ext.defer(this.alignPicker, 1, this);
            }
		}

        if(Ext.is.iPad){
            if(this.inputEl.dom.value == '' || document.activeElement != this.inputEl.dom){
                me.hidePicker();
            }
            else{
                picker.el.setStyle('display', '');
                picker.el.setStyle('height', 'auto');
                picker.el.setStyle('width', '303px');
                picker.el.setStyle('right', 'auto');
                picker.el.setStyle('left', x + 'px');
                picker.el.setStyle('top', y + 'px');
            }
        }
        else{
			picker.showAt(x,y + scrollOffset);
        }
	},

    hidePicker: function(){
        this.getPicker().el.setStyle('display', 'none');
    },

	clear: function(){
		Ext.each(this.el.query('.token'), function(t){ Ext.fly(t).remove(); }, this);
		this.selections = [];
		this.inputEl.dom.value = '';
		this.setPublished(false);
		this.resetPlaceholderLabel();
		this.clearResults();
	},

	reset: function(){
		this.setValue(this.initialConfig.value);
	},

	removeToken: function(tokenName, tokenEl){
		var	s = [];

		// Remove the element and remove it from the list of selections.
		if(tokenEl){ tokenEl.remove(); }
		Ext.each(this.selections, function(o){
			if(o.get('displayName')!== tokenName) { s.push(o); }
		});
		
		this.selections = s;
		if(Ext.isEmpty(this.selections)){
			this.resetPlaceholderLabel();
		}
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
        if(!Ext.is.iPad){ //Don't focus for iPad, won't bring up keyboard
            this.inputEl.focus();
        }
	},


	destroy: function(){
		this.callParent(arguments);
		console.warn('token field destoryed.');
	}
});
