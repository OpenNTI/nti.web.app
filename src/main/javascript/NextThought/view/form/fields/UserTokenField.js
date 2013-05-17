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

		this.store = Ext.getStore('UserSearch');
		this.shareListView = Ext.widget('share-search', {store:me.store, renderTo: this.scrollParentEl || Ext.getBody()});
		this.shareListView.addCls(this.ownerCls);
		this.mon(this.shareListView, 'select', this.searchItemSelected, this);
		this.on('destroy','destroy',this.shareListView);
		this.mon(me.publishEl, 'click', this.togglePublish, this);
		if(editorEl){
			this.mon(editorEl,{
				scope: this,
				'click': this.maybeHideSearchListMenu,
				'mouseover': this.maybeHideSearchListMenu,
				'keyup': this.didChangeText
			});
		}

	},


	addInputListeners: function(){
		this.mon(this.inputEl, {
			scope: this,
			'keydown': this.search
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
			this.hideTimer = Ext.defer( function(){ me.shareListView.hide();}, 500);
		}
	},


	didChangeText: function(e) {
		var input = e.getTarget('input', undefined, true);
		if (input && input.getValue().length == 0) {
			var me = this;
			clearTimeout(this.hideTimer);
			this.hideTimer = Ext.defer( function(){ 
				me.shareListView.hide();
				input.focus(500);
			}, 500);
		}
	},


	updatePlaceholderLabel:function(e){
		this.inputEl.set({'placeholder':'Add'});
	},


	resetPlaceholderLabel: function(){
		this.inputEl.set({'placeholder':'Add people to the discussion'});
		this.sizerEl.update('Add people to the discussion##');
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


	clearResults: function(){
		this.store.removeAll();
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
		console.debug('Init user token field with: ', value);

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


	//We buffer this slightly to avoid unecessary searches
	search: Ext.Function.createBuffered(function(e){
		var value = this.inputEl.getValue(),
			t = this.el.down('.tokens'),
			w = t && t.getWidth();

		if(!value || value.replace(SearchUtils.trimRe,'').length < 1 ){
			this.clearResults();
		}
		else {
			if(!Ext.isEmpty(w)){
				this.shareListView.setWidth(w);
			}
			this.shareListView.showBy(this.el, 'tl-bl',[0,0]);
			this.store.search(value);
		}
	}, 250),


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
	}
});