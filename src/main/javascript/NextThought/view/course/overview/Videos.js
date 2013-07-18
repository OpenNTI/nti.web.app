Ext.define('NextThought.view.course.overview.Videos',{
	extend: 'Ext.view.View',
	alias: ['widget.course-overview-video-section','widget.course-overview-video'],


	ui: 'course',
	cls: 'overview-videos',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'h2', cls:'{type}', cn:[{tag:'span',html: '{title}'}] },
		{ cls: 'body', cn:[
			{ cls: 'curtain' },
			{ cls: 'video-list'}
		]}
	]),

	renderSelectors: {
		frameBodyEl: '.video-list'
	},


	getTargetEl: function(){ return this.frameBodyEl; },

	overItemCls:'over',
	itemSelector:'.video-row',
	tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [
		{ cls: 'video-row', cn: [
			{ cls:'label', html: '{label}' },
			{ cls:'comments', html: '{comments:plural("Comment")}' }
		]}
	]}),

	constructor: function(config){

		var data = this.convertItems(config.items || []);
		delete config.items;

		config.store = new Ext.data.Store({
			fields: [
				{name:'id', type:'string', mapping: 'ntiid'},
				{name:'label', type:'string'},
				{name:'poster', type:'string'},
				{name:'comments', type:'auto', defaultValue:'Loading... '}
			],
			data: data
		});

		this.callParent([config]);
	},


	convertItems: function(items){
		var out = [];

		Ext.each(items,function(item) {
			var n = item.node,
				i = item.locationInfo;

			out.push({
				poster: getURL(i.root+n.getAttribute('poster')),
				ntiid: n.getAttribute('ntiid'),
				label: n.getAttribute('label'),
				comments: 0
			});
		});

		return out;
	},


	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData||{},{
			title: this.title || 'Untitled',
			type: this.type || ''
		});

		if( this.type ){
			this.addCls(this.type);
		}
	}
});
