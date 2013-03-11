Ext.define('NextThought.view.account.activity.BlogCommentPreview', {
	extend: 'Ext.Component',
	alias: ['widget.activity-preview-comment-blog', 'widget.activity-preview-PersonalBlogComment'],

	cls: 'activity-preview',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'header',
			cn:[
				{cls: 'title blog-label', html:'{title: ellispis(150)}'},
				{cls: 'tags blog-label', html:'{tags:ellipsis(150)}'}
			]
		},
		{ cls: 'footer', cn: [
			{cls: 'body',html: '{body:ellipsis(400)}'}
	 ]}
	]),

	renderSelectors: {
		author: '.author',
		title: '.title',
		tagsEl:'.tags',
		body:'.body'
	},

	initComponent: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData||{},{
			title: this.record.get('title'),
			tags: '...',
			body: this.record.getBodyText()
		});

		this.fillInData();
	},

	fillInData: function(){
		var me = this,
			containerId = this.record.get('ContainerId'), rec = me.record;

		function success(r){
			var headline= r.get('headline'),
				title = headline.get('title'),
				tags = headline.get('tags') ? 'Tags: '+headline.get('tags') : '';

			rec.container = r;
			if(me.rendered){
				me.tagsEl.update(tags);
				me.title.update(title);
			}
			else{
				Ext.apply(me.renderData, {tags:tags});
				Ext.apply(me.renderData, {title:title});
			}
		}

		function fail(){
			console.log('there was an error retrieving the object.', arguments);
		}

		$AppConfig.service.getObject(containerId, success, fail, me);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick, this);
	},

	onClick: function(e){
		e.stopEvent();
		this.fireEvent('navigate-to-blog', this.user, this.record.container.get('ID'), this.record.get('ID'));
	}
});