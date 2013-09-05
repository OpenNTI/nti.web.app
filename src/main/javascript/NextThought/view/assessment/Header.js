Ext.define('NextThought.view.assessment.Header',{
	extend: 'Ext.Component',
	alias: 'widget.question-header',

	requires: [
		'NextThought.ux.VideoPopout'
	],

	cls: 'header',
	ui: 'assessment',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'controls',
			cn: [
//				{ cls: 'favorite' },
//				{ cls: 'like' },
				{ cls: 'video', html: 'Related Videos' }
			]
		},
		{cls:'title',html:'{title}'},
		{cls: 'status {status}',html:'{status}'}
	]),

	renderSelectors: {
//		liked: '.controls .like',
//		favorites: '.controls .favorite',
		myTitle: '.title',
		status: '.status',
		video: '.video'
	},


	initComponent: function(){
		this.videos = [];
		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		var r = this.question,
//			l = this.liked,
//			f = this.favorites,
			v = this.video;

		if(!this.videos.length){
			v.remove();
		}
		else {
			this.mon(v, 'click', this.openVideos, this);
		}

//		this.mon(l, 'click', function(){ r.like(l); }, this);
//		this.mon(f, 'click', function(){ r.favorite(f); }, this);
//		l.update(r.getFriendlyLikeCount());
//		l[(r.isLiked()?'add':'remove')+'Cls']('on');
//		f[(r.isFavorited()?'add':'remove')+'Cls']('on');


	},


	onAdded: function(assessmentParent){
		var id = '?unresolved title?';

		try {
			this.question = assessmentParent.question;

			//HACK: there should be a more correct way to get the problem name/number...
			id = this.question.getId().split('.').last() + '.';

			this.videos = this.question.getVideos() || [];
		}
		catch(e){
			console.warn(Globals.getError(e));
		}

		this.setTitle(id);
	},


	setTitle: function(title){
		if(!this.rendered){
			this.renderData.title = title;
			return;
		}
		this.myTitle.update(title);
	},


	markCorrect: function(){
		this.el.removeCls('incorrect').addCls('correct');
		this.status.update('Correct!');
	},

	markIncorrect: function(){
		this.el.removeCls('correct').addCls('incorrect');
		this.status.update('Incorrect');
	},

	reset: function(){
		this.el.removeCls(['incorrect','correct']);
		this.status.update('');
	},


	openVideos: function(){
		Ext.widget('video-lightbox',{ data: this.videos }).show();
	}
});
