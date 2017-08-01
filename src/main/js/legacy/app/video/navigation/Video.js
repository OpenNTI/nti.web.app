const Ext = require('extjs');

require('../VideoPlayer');


module.exports = exports = Ext.define('NextThought.app.video.navigation.Video', {
	extend: 'NextThought.app.video.VideoPlayer',
	alias: 'widget.content-video-navigation',

	cls: 'content-video-navigation',

	overlayTpl: Ext.DomHelper.createTemplate({
		cls: '{cls} navigation ext-hidden', cn: {
			cls: 'nav-container', cn: [
				{cls: 'arrow'},
				{cls: 'content', cn: [
					{cls: 'thumbnail', style: {backgroundImage: 'url({thumbURL});'}},
					{cls: 'about', cn: [
						{cls: 'pre-title', html: '{preTitle}'},
						{cls: 'title', html: '{title}', 'data-qtip': '{title}'}
					]}
				]}
			]
		}
	}),


	afterRender: function () {
		this.callParent(arguments);

		this.setPrev(this.prevVideo);
		this.setNext(this.nextVideo);
	},


	getThumbnail: function (video) {
		var source = video.get('sources')[0];
		return source && source.thumbnail;
	},

	getPreTitle: function (video) {
		return '';
	},

	getTitle: function (video) {
		return video.get('title');
	},


	updateNav: function (el, video) {
		var thumb, title, preTitle,
			navEl = el && el.down('.nav-container'),
			contentEl = navEl && navEl.down('.content'),
			iconEl = contentEl && contentEl.down('.thumbnail'),
			aboutEl = contentEl && contentEl.down('.about'),
			preEl = aboutEl && aboutEl.down('.pre-title'),
			titleEl = aboutEl && aboutEl.down('.title');

		if (!titleEl || !video || !video.get('NTIID')) {
			Ext.destroy(el);
			return;
		}

		thumb = this.getThumbnail(video);
		preTitle = this.getPreTitle(video);
		title = this.getTitle(video);

		if (thumb && iconEl) {
			iconEl.setStyle('background-image', 'url(' + thumb + ')');
		}

		if (preTitle && preEl) {
			preEl.update(preTitle);
		}

		if (title && titleEl) {
			titleEl.update(title);
			titleEl.set({'data-qtip': title});
		}

	},


	setPrev: function (video) {
		this.prevVideo = video;

		if (!this.rendered || !video) {
			return;
		}

		var el = this.el.down('.prev');

		if (!el) {
			el = this.overlayTpl.append(this.el, {cls: 'prev'}, true);
			this.mon(el, 'click', 'navigationSelected');
		}

		this.updateNav(el, video);
	},

	setNext: function (video) {
		this.nextVideo = video;

		if (!this.rendered || !video) {
			return;
		}

		var el = this.el.down('.next');


		if (!el) {
			el = this.overlayTpl.append(this.el, {cls: 'next'}, true);
			this.mon(el, 'click', 'navigationSelected');
		}

		this.updateNav(el, video);
	},

	navigationSelected: function (e) {
		var target = e.getTarget('.navigation', null, true);

		if (!target || !target.hasCls) { return; }

		e.stopEvent();

		if (target.hasCls('next') && this.nextVideo) {
			this.fireEvent('next-navigation-selected', this.nextVideo);
		} else if (target.hasCls('prev') && this.prevVideo) {
			this.fireEvent('prev-navigation-selected', this.prevVideo);
		}
	}

});
