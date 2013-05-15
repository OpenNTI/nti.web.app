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
		{cls:'tokens',cn:
		{tag:'span', cls:'token-input-wrap', cn:[
			{tag:'input', type:'text', tabIndex: '{tabIndex}', placeholder: 'Add people to the discussion'},
			{tag:'span', cls:'token-input-sizer', html:'Add people to the discussion##'}
		]}}
	]),


	tokenTpl: Ext.DomHelper.createTemplate({tag: 'span', cls:'token {1}', cn:[
		{tag:'span', cls:'value', html:'{0}', 'data-value':'{0}'},
		{tag:'span', cls:'x'}
	]}),


	renderSelectors: {
		wrapEl: '.token-input-wrap',
		sizerEl: '.token-input-sizer',
		inputEl: 'input[type="text"]',
		valueEl: 'input[type="hidden"]',
		publishEl: '.control.publish'
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

		var me = this;
		this.store = Ext.getStore('UserSearch');
		this.shareListView = Ext.widget('share-search', {store:me.store, renderTo: me.el.parent()});
		this.mon(this.shareListView, 'select', this.searchItemSelected, this);
		this.mon(this.shareListView, 'select', this.updateSize, this);
		this.mon(me.publishEl, 'click', function togglePublish(e){
			var action = e.getTarget('.on') ? 'removeCls' : 'addCls';
			me.publishEl[action]('on');
		});

		this.on('destroy','destroy',this.shareListView);
	},


	addInputListeners: function(){
		this.mon(this.inputEl, {
			scope: this,
			'keydown': this.search,
			'mousedown': this.updatePlaceholderLabel
		});
	},


	updatePlaceholderLabel:function(e){
		this.inputEl.set({'placeholder':'Add'});
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

		me.clearTokens();
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
		var value = this.inputEl.getValue();

		console.log('Should be searching for: ', value);
		if(!value || value.replace(SearchUtils.trimRe,'').length < 2 ){
			this.clearResults();
		}
		else {
			this.shareListView.showBy(this.el, 'tl-bl',[0,0]);
			this.store.search(value);
		}
	}, 250),


	clearTokens: function(){
		Ext.each(this.el.query('.token'), function(t){ t.remove(); }, this);
		this.selections = [];
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
		e.stopEvent();
		var t = e.getTarget('.x',null,true),
			p = t && t.up('.token'),
			v = p && p.down('.value').getAttribute('data-value');

		if( v ){ this.removeToken(v, p); }
		this.inputEl.focus();
	}
});