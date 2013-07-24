Ext.define('NextThought.view.course.outline.View',{
	extend: 'Ext.view.View',
	alias: 'widget.course-outline',

	ui: 'course',
	cls: 'course-outline',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'Outline'
		]},
		{ cls: 'lesson-list'}
	]),

	renderSelectors: {
		frameBodyEl: '.lesson-list'
	},


	getTargetEl: function(){
		return this.frameBodyEl;
	},

	overItemCls:'over',
	itemSelector:'.course-row',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [
		{ cls: 'course-row {type} {[this.is(values)]}', 'data-qtip': '{label}', cn: [
			{cls: 'label', html:'{label}'},
			{tag:'tpl', 'if':'date', cn: {cls:'date', cn:[
				{html:'{date:date("M")}'},
				{html:'{date:date("j")}'}
			]}}
		]}
	]}),{
		is: function(values){
		}
	}),


	listeners: {
		itemclick: function() { this.fromClick = true; },
		beforeselect: function(s,r){
			var pass = r.get('type') !== 'unit',
				store= s.getStore(),
				last = s.lastSelected || store.first(), next;

			if(this.fromKey && !pass){
				last = store.indexOf(last);
				next = store.indexOf(r);
				next += ((next - last) || 1);

				//do the in the next event pump
				Ext.defer(s.select,1,s,[next]);
			}
			return pass;

		},
		select: function(s,r) {
			if( this.fromClick || this.fromKey ) {
				this.fireEvent('set-location', r.getId());
			}
			delete this.fromClick;
			delete this.fromKey;
		}
	},


	beforeRender: function(){
		this.callParent();
		var me = this, s = this.getSelectionModel();
		s.onNavKey = Ext.Function.createInterceptor(s.onNavKey,function(){me.fromKey=true;});
	},

	
	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.frameBodyEl,'scroll','handleScrolling');
	},


	handleScrolling: function(){
		var selected = this.getSelectedNodes()[0],
			selectedEl = Ext.get(selected);

		if(selectedEl.getY() < this.frameBodyEl.getY()){
			selectedEl.addCls('out-of-view');
		}else{
			selectedEl.removeCls('out-of-view');
		}
	},


	clear: function(){
		this.bindStore('ext-empty-store');
	},


	maybeChangeStoreOrSelection: function(pageInfo, store){
		var r;

		if(this.store !== store){
			this.clear();
			if( store ){
				this.bindStore(store);
			}
		}

		r = store.findRecord('NTIID', pageInfo.getId(), false, true, true);
		if(!r){
			console.debug('No record selected, defaulting to first lesson',pageInfo);
			r = store.findRecord('type','lesson',0,false,false,true);
		}

		this.getSelectionModel().select(r);
	}
});
