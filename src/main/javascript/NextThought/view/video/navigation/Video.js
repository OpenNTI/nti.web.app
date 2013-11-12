Ext.define('NextThought.view.video.navigation.Video', {
	extend: 'NextThought.view.video.Video',
	alias: 'widget.content-video-navigation',

	cls: 'content-video-navigation',

	overlayTpl: Ext.DomHelper.createTemplate({
		cls: '{cls} navigation ext-hidden', cn:[
			{cls: 'nav-container',cn: [
				{cls: 'arrow'},
				{cls: 'content', cn: [
					{cls: 'thumbnail', style: {backgroundImage: 'url({thumbURL});'}},
					{cls: 'about', cn: [
						{cls: 'pre-title', html: '{preTitle}'},
						{cls: 'title', html: '{title}', 'data-qtip': '{title}'}
					]}
				]}
			]}
		]
	}),

	afterRender: function(){
		this.callParent(arguments);

		this.overlayTpl.append(this.el,{cls: 'prev'});
		this.overlayTpl.append(this.el,{cls: 'next'});

		if(this.prevVideo){
			this.setPrev(this.prevVideo);
		}

		if(this.nextVideo){
			this.setNext(this.nextVideo);
		}
	},

	
	getThumbnail: function(video){
		var source = video.get('sources')[0],
			thumb = source && source.thumbnail;

		return thumb;
	},

	getPreTitle: function(video){
		return 'Thursday, August 27';
	},

	getTitle: function(video){
		return video.get('title');
	},

	
	updateNav: function(el, video){
		var thumb, title, preTitle,
			navEl = el.down('.nav-container'),
			contentEl = navEl && navEl.down('.content'),
			iconEl = contentEl && contentEl.down('.thumbnail'),
			aboutEl = contentEl && contentEl.down('.about'),
			preEl = aboutEl && aboutEl.down('.pre-title'),
			titleEl = aboutEl && aboutEl.down('.title');

		if(!titleEl || !video.get('NTIID')){
			el && el.destroy();
			return;
		}

		thumb = this.getThumbnail(video);
		preTitle = this.getPreTitle(video);
		title = this.getTitle(video);

		if(thumb && iconEl){
			iconEl.setStyle('background-image', 'url('+thumb+')');
		}

		if(preTitle && preEl){ 
			preEl.update(preTitle); 
		}

		if(title && titleEl){ 
			titleEl.update(title);
			titleEl.set({'data-qtip': title});
		}

	},

	
	setPrev: function(video){
		if(!this.rendered){
			this.prevVideo = video;
			return;
		}

		var el = this.el.down('.prev');

		if(el){
			this.updateNav(el, video);
		}
	},

	setNext: function(video){
		if(!this.rendered){
			this.nextVideo = video;
			return;
		}

		var el = this.el.down('.next');

		if(el){
			this.updateNav(el, video);
		}
	},

	navigationSelected: function(e){
		//debugger;
	}

});