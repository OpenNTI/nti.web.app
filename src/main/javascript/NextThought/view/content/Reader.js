Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Base',
	alias: 'widget.reader-panel',
	requires: [
		'NextThought.providers.Location'
	],
	mixins:{
		annotations: 'NextThought.view.content.reader.Annotations',
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

		this.addEvents('loaded','finished-restore','content-updated');
		this.enableBubble('loaded','finished-restore');

		this.mixins.content.constructor.apply(this,arguments);
		this.mixins.iframe.constructor.apply(this,arguments);
		this.mixins.scroll.constructor.apply(this,arguments);
		this.mixins.annotations.constructor.apply(this,arguments);
		this.mixins.noteOverlay.constructor.apply(this,arguments);
	},


	afterRender: function(){
		this.callParent();
		this.splash = this.body.insertHtml('beforeEnd','<div class="no-content-splash"></div>',true);
		this.scrollShadow = this.getEl().insertHtml('beforeEnd','<div class="scroll-shadow"></div>',true);
	},


	setSplash: function(){
		this.scrollTo(0, false);
		this.updateContent('');
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
		var f = this.getIframe();
		var l = f.getLeft()-this.getEl().getLeft(),
			e = Ext.get(this.getContentRoot());
		return {
			top: f.getTop(),
			left: f.getLeft(),
			height: f.getHeight(),
			width: f.getWidth(),
			gutter: l+f.getMargin('l'),
			contentLeftPadding: e? (e.getMargin('l') + e.getPadding('l')) : 0,
			scrollTop: this.body.getScroll().top
		};
	},


	onContextMenuHandler: function(){
		return this.mixins.annotations.onContextMenuHandler.apply(this,arguments);
	},


	loadPage: function(ntiid, callback) {
		var me = this,
			service = $AppConfig.service;

		if(ntiid === LocationProvider.currentNTIID){
			Ext.callback(callback,null,[me]);
			return false;
		}

		me.clearAnnotations();

		function success(pageInfo){
			function f(resp){
				me.splash.hide();
				me.setContent(resp, callback);
			}

			Ext.Ajax.request({
			    url: pageInfo.getLink('content'),
			    success: f,
			    failure: function(response, opts) {
			        console.log('server-side failure with status code ' + response.status);
			    }
			});
		}

		function failure(q,r){
			console.error(arguments);
			Ext.callback(callback,null,[me,{req:q,error:r}]);
			if(r && r.responseText){
				me.splash.hide();
				me.updateContent(r.responseText);
			}
			me.relayout();
		}

		if(ntiid) {
			me.request = service.getPageInfo(ntiid, success, failure, me);
		}
		else {
			this.setSplash();
			this.relayout();
			Ext.callback(callback,null,[me]);
		}

		return true;
	},


	statics : {
		get: function(prefix){
			return Ext.ComponentQuery.query(
					Ext.String.format('reader-panel[prefix={0}]',prefix))[0];
		}
	}
}, function(){
	window.ReaderPanel = this;

});

