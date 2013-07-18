Ext.define('NextThought.view.course.overview.Discussion',{
	extend: 'Ext.Component',
	alias: 'widget.course-overview-discussion',

	ui: 'course',
	cls: 'overview-discussion',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'image', style:{backgroundImage:'url({icon})'}},
		{ cls: 'meta', cn:[
			{ cls: 'label', html: '{label}'},
			{ cls: 'title', html: '{title}'},
			{ cls: 'comments', html:'{comments:plural("Comment")}'}
		]}
	]),


	listeners: {
		click:{
			element: 'el',
			fn: 'onClick'
		}
	},


	constructor: function(config){
		var n = config.node,
			i = config.locationInfo;

		config.data = {
			title: n.getAttribute('title'),
			icon: getURL(i.root+n.getAttribute('icon')),
			ntiid: n.getAttribute('ntiid'),
			label: n.getAttribute('label'),
			comments: 0
		};

		this.callParent([config]);
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},this.data);

		$AppConfig.service.getObject(this.data.ntiid,
				this.onBoardResolved,
				this.onBoardResolveFailure,
				this,
				true
		);
	},


	onBoardResolved: function(topic){
		this.data.comments = topic.get('PostCount');
		if(this.rendered){
			this.renderTpl.overwrite(this.el,this.data);
		}
	},


	onBoardResolveFailure: function(){
		console.warn('Could not load the topic object to show the comment count.');
	},


	onClick: function(){
		this.fireEvent('navigate-to-href',this,this.data.ntiid);
	}
});
