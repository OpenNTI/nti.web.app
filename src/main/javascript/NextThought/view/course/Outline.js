Ext.define('NextThought.view.course.Outline',{
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
		{ cls: 'course-row {type} {[this.is(values)]}', cn: [
			'{label}',
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
			return r.get('type') !== 'unit';
		},
		select: function(s,r) {
			if( this.fromClick ) {
				this.fireEvent('set-location', r.getId());
			}
			delete this.fromClick;
		}
	},


	clear: function(){
		this.bindStore('ext-empty-store');
	},


	onNavigation: function(pageInfo){
		var s = this.getCourseStore(pageInfo),
			r;

		if(this.store !== s){
			this.clear();
			if( s ){
				this.bindStore(s);
			}
		}

		r = s.findRecord('NTIID', pageInfo.getId(), false, true, true);
		if(!r){
			console.warn('No record',pageInfo);
			return;
		}
		console.debug('Hey');
		this.getSelectionModel().select(r);
	},


	getCourseStore: DelegateFactory.getDelegated()
});
