Ext.define('NextThought.view.course.info.parts.Title',{
	extend: 'Ext.Component',
	alias: 'widget.course-info-title',

	ui: 'course-info',
	cls: 'title-box',

	renderTpl: Ext.DomHelper.markup([
		{cls:'video'},
		{cls:'title', html: '{title}'}
	]),

	renderSelectors: {
		videoEl: '.video'
	},

	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},{
			title: this.title
		});
	},


	afterRender: function(){
		var me = this;
		this.callParent(arguments);

		if(!Ext.isEmpty(this.videoUrl)){
			this.on('destroy','destroy',
					Ext.widget({
						xtype: 'content-video',
						url: this.videoUrl,
						playerWidth: this.getWidth(),
						renderTo: this.videoEl,
						floatParent: this,
						listeners: {
							beforeRender: function(){
								me.addCls('has-video');
							}
						}
					}));
		}
	}
});
