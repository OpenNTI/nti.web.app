Ext.define('NextThought.view.slidedeck.transcript.VideoTitle',{
	extend: 'Ext.Component',
	alias: 'widget.video-title-component',

	mixins: {
		transcriptItem: 'NextThought.view.slidedeck.TranscriptItem'
	},

	renderTpl: Ext.DomHelper.markup({
		cn:[
			{cls: 'title', html: '{title}'},
			{tag: 'span', cls:'control-container', cn:{
				cls:'note-here-control-box add-note-here hidden', tag:'span'
			}}
		]
	}),

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

		this.mon(this.el.select('.title'), {
			scope: this,
			'mouseover':'mouseOver',
			'mouseout':'mouseOut'
		});

		this.mon(this.el.select('.add-note-here'), {
			scope: this,
			'click': 'openNoteEditor'
		});
	},

	mouseOver: function(e){
		var t = e.getTarget('.title', null, true),
			box = t && this.el.down('.add-note-here'),
			currentDivs = this.el.query('.add-note-here:not(.hidden)');

		if(this.suspendMoveEvents || !t || !box){ return; }
		clearTimeout(this.mouseEnterTimeout);

		this.mouseLeaveTimeout = setTimeout(function () {
			box.removeCls('hidden');

			Ext.each(currentDivs, function(cur){
				if(cur !== box.dom){
					Ext.fly(cur).addCls('hidden');
				}
			});
		}, 100);
	},


	mouseOut: function(e){
		var target = e.getTarget('.title', null, true),
			box = target && this.el.down('.add-note-here');

		if(this.suspendMoveEvents || !target || !box){ return; }

		if(!box.hasCls('hidden')){
			this.mouseEnterTimeout = setTimeout(function(){
				if(box && !box.hasCls('hidden')){
					box.addCls('hidden');
				}
			}, 500);
		}
	},

	openNoteEditor: function(e){
		var data = {range: null, containerId: this.video.get('NTIID'), isDomRange: true};
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
		//return rec.get('ContainerId') === this.video.get('NTIID');
	},


	domRangeForRecord: function(rec){
		return this.createDomRange();
	},


	getDomContextForRecord: function(r){
		return Ext.DomHelper.createDom({html: this.video.get('title')});
	}

});