Ext.define('NextThought.view.course.dashboard.widgets.AbstractForumView',{
	extend: 'Ext.Component',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	ui: 'tile',

	constructor: function(){
		this.callParent(arguments);
		this.mixins.likeAndFavoriteActions.constructor.call(this);
	},

	
	setBody: function(body){
		this.renderData.compiledBody = body;
		if(this.rendered){
			this.snip.update(body);
		}
		this.maybeEllipse();
	},

	maybeEllipse: function(){
		if(!this.rendered){
			this.needToMaybeEllipse = true;
			return;
		}
		var snip = this.snip,
			content;
			
		if(snip.getHeight() < snip.dom.scrollHeight){
			content = ContentUtils.getHTMLSnippet(snip.getHTML(), this.snippetSize || 150);
			content = content + "<div class='ellipse'><div></div><div></div><div></div></div>";
			snip.setHTML(content);
			snip.addCls('overflowing');
		}
	},

	beforeRender: function(){
		this.callParent(arguments);
		if(!this.record){
			return;
		}
		var h = this.record.get('headline');
		this.renderData = Ext.apply(this.renderData||{},this.record.getData());

		if(h){
			h.compileBodyContent(this.setBody,this,null,100);
		}
		else{
			console.error('Forum has no headline.  Were we given something we didnt expect', this.record, this);
		}
	},

	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.el,'click','handleClick');

		if(this.needToMaybeEllipse){
			this.maybeEllipse();
		}
	},

	handleClick: function(e){
		if(e.getTarget('.controls')){
			return;
		}
		this.fireEvent('navigate-to-course-discussion', this.contentNtiid, this.record.get('ContainerId'), this.record.getId());
	}
});