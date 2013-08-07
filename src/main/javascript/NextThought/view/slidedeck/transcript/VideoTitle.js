Ext.define('NextThought.view.slidedeck.transcript.VideoTitle',{
	extend: 'Ext.Component',
	alias: 'widget.video-title-component',

	mixins: {
		transcriptItem: 'NextThought.view.slidedeck.TranscriptItem'
	},

	renderTpl: Ext.DomHelper.markup({cls: 'title', html: '{title}'}),

	ui: 'video-title',

	renderSelectors: {
		title: '.title'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.mixins.transcriptItem.constructor.apply(this, arguments);
		this.enableBubble(['register-records', 'unregister-records']);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.video.get('title')
		});
	},

	containerIdForData: function(){
		return this.video && this.video.get('NTIID');
	},


	afterRender: function(){
		this.callParent(arguments);
		this.notifyReady();
	},

	openNoteEditor: function(e){
		var data = {startTime: this.slide.get('video-start'), endTime: this.slide.get('video-end')},
			dom = this.slide.get('dom-clone'),
			img = dom.querySelector('img'), range;

		if(!img){
//			onError();
			console.error('Missing img for the slide.');
			return false;
		}

		range = dom.ownerDocument.createRange();
		range.selectNode(img);

		data.range = range;
		data.containerId = this.slide.get('ContainerId');
		data.userDataStore = this.userDataStore;

		data.isDomRange = true;
		this.fireEvent('show-editor', data, e.getTarget('.add-note-here', null, true));
	},

	createDomRange:function(){
		var range = document.createRange(),
			el = this.el;

		if(el){ range.selectNode(el.dom); }
		return range;
	},

	wantsRecord: function(rec){
		return false;
		return rec.get('ContainerId') === this.video.get('NTIID');
	},


	domRangeForRecord: function(rec){
		return this.createDomRange();
	},


	getDomContextForRecord: function(r){
		return Ext.DomHelper.createDom({html: this.video.get('title')});
	}

});