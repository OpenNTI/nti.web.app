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
		select: function(s,r){
			console.log(r.data, r.getChildren());
		}
	},


	clear: function(){
		this.store.removeAll();
		this.bindStore('ext-empty-store');
	},


	onNavigation: function(pageInfo){
		var s,
			l = ContentUtils.getLocation(pageInfo),
			t = l && l.title,
			course = t && t.getId();

		if(this.currentCourse === course){
			return;
		}

		this.currentCourse = course;
		this.clear();

		s = new NextThought.store.course.Navigation();
		this.bindStore(s);

		s.loadRawData(l.toc);
	}
});
