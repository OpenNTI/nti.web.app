Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Base',
	alias: 'widget.reader-panel',
	requires: [
		'NextThought.providers.Location',
		'NextThought.util.Base64'
	],
	mixins:{
		annotations: 'NextThought.view.content.reader.Annotations',
		assessments: 'NextThought.view.content.reader.AssessmentOverlay',
		content: 'NextThought.view.content.reader.Content',
		iframe: 'NextThought.view.content.reader.IFrame',
		scroll: 'NextThought.view.content.reader.Scroll',
		noteOverlay: 'NextThought.view.content.reader.NoteOverlay'
	},
	cls: 'x-reader-pane',

	ui: 'reader',
	layout: {
		type: 'hbox',
		pack: 'end',
		reserveScrollbar: true
	},
	prefix: 'default',

	initComponent: function() {
		this.callParent(arguments);

		this.addEvents('finished-restore','content-updated');
		this.enableBubble('finished-restore');

		this.mixins.content.constructor.apply(this,arguments);
		this.mixins.iframe.constructor.apply(this,arguments);
		this.mixins.scroll.constructor.apply(this,arguments);
		this.mixins.annotations.constructor.apply(this,arguments);
		this.mixins.assessments.constructor.apply(this,arguments);
		this.mixins.noteOverlay.constructor.apply(this,arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.splash = this.body.insertHtml('beforeEnd','<div class="no-content-splash"></div>',true);
		this.scrollShadow = this.getEl().insertHtml('beforeEnd','<div class="scroll-shadow"></div>',true);
		this.mon(this.body,'scroll', this.scrollShadowMonitor, this);
	},

	scrollShadowMonitor: function(e,dom){
		var el = this.scrollShadow;
		el[dom.scrollTop?'addCls':'removeCls']('active');
	},


	setSplash: function(){
		this.scrollTo(0, false);
		this.updateContent(false);
		this.meta = {};
		this.splash.dom.parentNode.appendChild(this.splash.dom);
		this.splash.show();
	},


	convertRectToScreen: function(r) {
		var iframe = this.getIframe(),
			result;

		result = {
			top: r.top + iframe.getTop(),
			left: r.left + iframe.getLeft(),
			right: r.right + iframe.getLeft(),
			bottom: r.bottom + iframe.getTop(),
			height: r.height,
			width: r.width
		};
		return result;
	},


	getContentRoot: function(){
		if(!this.contentRootElement){
			this.contentRootElement = this.getDocumentElement()
					.querySelector('#NTIContent > .page-contents');
		}

		return this.contentRootElement;
	},


	getAnnotationOffsets: function(){
		var f = this.getIframe(),
			l = f.getLeft()-this.getEl().getLeft(),
			e = Ext.get(this.getContentRoot()),
			contentPadding = 0;

		try {
			if(e){
				if(this.contentPaddingCache === undefined){
					this.contentPaddingCache = e.getMargin('l') + e.getPadding('l');
				}
				contentPadding = this.contentPaddingCache;
			}
		}
		catch(er){
			console.error(Globals.getError(er));
		}
		return {
			top: f.getTop(),
			left: f.getLeft(),
			height: f.getHeight(),
			width: f.getWidth(),
			gutter: l+f.getMargin('l'),
			contentLeftPadding: contentPadding,
			scrollTop: this.body.getScroll().top
		};
	},


	onContextMenuHandler: function(){
		return this.mixins.annotations.onContextMenuHandler.apply(this,arguments);
	},


	onNavigate: function(ntiid) {
		delete this.contentPaddingCache;

		this.clearAnnotations();

		if(!ntiid) {
			this.setSplash();
			this.relayout();
		}

		return true;
	},


    onNavigationAborted: function() {
        this.setSplash();
        this.relayout();
    },


	onNavigateComplete: function(pageInfo, finish, hasCallback){
		var me = this, cls = this.self;
		function f(resp){
			me.splash.hide();
			me.setContent(resp, pageInfo.get('AssessmentItems'), finish, hasCallback);
		}

		function jsonp(script){
			f({
				responseText: cls.getContent(LocationProvider.currentNTIID),
				request: {
					options: {
						url: pageInfo.getLink('content')
					}
				}
			});
			Ext.fly(script).remove();
		}

		function onError(script){
			Ext.fly(script).remove();
			console.error('PROBLEMS!', pageInfo);
		}

		if(!pageInfo.isModel){
			if(pageInfo.responseText){
				me.splash.hide();
				//TODO: make a fun-light-spirited "Oh no!" page.
				me.updateContent(pageInfo.responseText);
			}
			me.relayout();
		}
		else {
			if ($AppConfig.server.jsonp){
				Globals.loadScript(pageInfo.getLink('jsonp_content'), jsonp, onError, this);
				return;
			}
			Ext.Ajax.request({
				url: pageInfo.getLink('content'),
				success: f,
				failure: function(r) {
					console.log('server-side failure with status code ' + r.status+': Message: '+ r.responseText);
					me.splash.hide();
				}
			});
		}
	},


	statics : {
		bufferedContent: {},

		get: function(prefix){
			return Ext.ComponentQuery.query(
					Ext.String.format('reader-panel[prefix={0}]',prefix||'default'))[0];
		},
		getContent: function(ntiid){
			console.log('getContent called...(should be after receiveContent)');
			return this.bufferedContent[ntiid];
		},
		receiveContent: function(content){
			console.log('receiveContent called...');
			var decodedContent;
			//expects: {content:?, contentEncoding:?, NTIID:?, version: ?}
			//1) decode content
			if(/base64/i.test(content['Content-Encoding'])){
				decodedContent = Base64.decode(content.content);
			}
			else {
				Ext.Error.raise('not handing content encoding ' + content['Content-Encoding']);
			}

			//2) put in bucket
			this.bufferedContent[content.ntiid] = decodedContent;
		}

	}
}, function(){
	window.ReaderPanel = this;
	window.jsonpContent = Ext.bind(this.receiveContent, this);

	ContentAPIRegistry.register('NTIHintNavigation',LocationProvider.setLocation,LocationProvider);
	ContentAPIRegistry.register('togglehint',function(e) {
		e = Ext.EventObject.setEvent(e||event);
		Ext.get(e.getTarget().nextSibling).toggleCls("hidden");
		return false;
	});


});
