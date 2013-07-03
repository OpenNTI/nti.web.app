Ext.define('NextThought.view.video.transcript.Window', {
	extend:'NextThought.view.Window',
	alias: ['widget.video-transcript-window'],

	title: 'Transcripts',
	closeAction: 'hide',
	width: '60%',
	height: '75%',
	layout: 'fit',
	modal: true,
	items: {
		xtype: 'box',
		width: 780,
		autoEl: {
			width: 780,
			tag: 'iframe',
			name: 'iframe-' + guidGenerator() + '-content',
			src: Globals.EMPTY_WRITABLE_IFRAME_SRC,
			frameBorder: 0,
			scrolling: 'no',
			seamless: true,
			overflowY: 'auto',
			overflowX: 'hidden',
			style: 'z-index: 1;'
		}
	},

	afterRender: function(){
		this.callParent(arguments);
		this.setContent();
	},

	setContent: function(){
		function fin(){
			if(body){
				Ext.fly(body).update(this.textContent||'');
			}
			Ext.defer(this.updateLayout, 10, this);
		}

		var iframe = this.el.down('iframe'),
			doc = iframe && iframe.dom.contentDocument,
			body = doc && doc.body;

		//doc.open();
		//		doc.write('<!DOCTYPE html><head><title>Content</title></head><html lang="en"><head></head><body></body></html>');
		//doc.close();
		Ext.defer(this.setupFrame, 10, this, [doc, fin]);
	},


	setupFrame: function(doc, callback){
		var body = doc.body,
			meta,
			base = location.pathname.toString().replace('index.html',''),
			g = Globals, me = this;

		meta = doc.createElement('meta');
		//<meta http-equiv="X-UA-Compatible" content="IE=edge">
		meta.setAttribute('http-equiv','X-UA-Compatible');
		meta.setAttribute('content','IE=9');
		doc.getElementsByTagName('head')[0].appendChild(meta);

		//Move classes down from main body to sub-iframe body for content rendering reference:
		Ext.fly(doc.getElementsByTagName('body')[0]).addCls(this.getTopBodyStyles());

		g.loadStyleSheet({
			url: base+document.getElementById('main-stylesheet').getAttribute('href'),
			document: doc });
		g.loadStyleSheet({
			url: 'https://fonts.googleapis.com/css?family=Droid+Serif:400,700,700italic,400italic|Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800',
			document: doc });

		Ext.defer(function(){
			Ext.callback(callback, me, [body]);
		}, 100);
	},


	getTopBodyStyles: function(){
		var mainBodyStyleString = Ext.getBody().getAttribute('class')||'',
			mainBodyStyleList = mainBodyStyleString.split(' '),
			styleBlacklist = [
				'x-container',
				'x-reset',
				'x-unselectable',
				'x-border-layout-ct'
			];

		return Ext.Array.difference(mainBodyStyleList, styleBlacklist);
	}
});
