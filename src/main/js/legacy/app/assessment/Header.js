var Ext = require('extjs');
var Globals = require('../../util/Globals');
var {isFeature} = Globals;
var UxVideoPopout = require('../../common/ux/VideoPopout');


module.exports = exports = Ext.define('NextThought.app.assessment.Header', {
	extend: 'Ext.Component',
	alias: 'widget.question-header',
	cls: 'header',
	ui: 'assessment',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'controls',
			cn: [
		//				{ cls: 'favorite' },
		//				{ cls: 'like' },
				{ cls: 'video', html: '{{{NextThought.view.assessment.Header.related-videos}}}' }
			]
		},
		{cls: 'title', html: '{title}'},
		{cls: 'status {status}', html: '{status}'}
	]),

	renderSelectors: {
	//		liked: '.controls .like',
	//		favorites: '.controls .favorite',
		myTitle: '.title',
		status: '.status',
		video: '.video'
	},

	initComponent: function() {
		this.videos = [];
		this.callParent(arguments);
	},

	afterRender: function() {
		this.callParent(arguments);
		var //r = this.question,
		//			l = this.liked,
		//			f = this.favorites,
			v = this.video;

		if (!this.videos.length) {
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

	onAdded: function(assessmentParent) {
		var id = '?unresolved title?';

		try {
			this.question = assessmentParent.question;

			if (isFeature('mathcounts-question-number-hack')) {
				//HACK: there should be a more correct way to get the problem name/number...
				id = this.question.getId().split('.').last() + '.';
			} else {
				id = '';
			}

			this.videos = this.question.getVideos() || [];
		}
		catch (e) {
			console.warn(Globals.getError(e));
		}

		this.setTitle(id);
	},

	maybeShow: function() {
		if (this.currentTitle) {
			this.show();
		}
	},

	maybeHide: function(title) {
		var v = this.videos.length;
		this[!v && Ext.isEmpty(title) ? 'hide' : 'show']();
	},

	setTitle: function(title) {
		this.maybeHide(title);
		if (!this.rendered) {
			this.renderData.title = title;
			return;
		}
		this.currentTitle = title;
		this.myTitle.update(title);
	},

	markCorrect: function() {
		this.show();
		this.el.removeCls('incorrect').addCls('correct');
		this.status.update('Correct!');
	},

	markIncorrect: function() {
		this.show();
		this.el.removeCls('correct').addCls('incorrect');
		this.status.update('Incorrect');
	},

	markSubmitted: function() {
		this.show();
		this.el.removeCls('correct').removeCls('incorrect');
		this.status.update('Submitted');
	},

	reset: function() {
		this.el.removeCls(['incorrect', 'correct']);
		this.status.update('');

		this.maybeHide(this.myTitle.getHTML());
	},

	openVideos: function() {
		Ext.widget('video-lightbox', { data: this.videos }).show();
	}
});
