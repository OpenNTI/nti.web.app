/*jslint */
/*global $AppConfig, Globals, ImageZoomView, NextThought, ReaderPanel, SlideDeck, TemplatesForNotes, UserRepository, WBUtils*/
Ext.define('NextThought.view.annotations.note.Main',{
	extend: 'NextThought.view.annotations.note.Panel',
	alias: 'widget.note-main-view',


	requires: [
		'NextThought.ux.SlideDeck'
	],

	root: true,
	enableTitle: true,

	highlightTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'highlight', html: '{0}'}),

	renderTpl: Ext.DomHelper.markup([{
		cls: 'note main-view',
		cn:[{
			cls: 'avatar',
			tag: 'img', src: Ext.BLANK_IMAGE_URL
		},{
			cls: 'meta',
			cn: [
				{ cls: 'controls', cn: [{ cls: 'favorite' },{ cls: 'like' }] },
				{ cls: 'title'},
				{ cls: 'name-wrap', cn:[
					{ tag: 'span', cls: 'name' },
					{ tag: 'span', cls: 'time'},
					{ tag: 'span', cls: 'shared-to' }
				]}
			]
		},{ cls: 'clear' },{
			cls: 'context', cn: [
				{tag: 'canvas'},
				{tag: 'span', cls: 'text'}]
		},{ cls: 'body' },{
			cls: 'respond',
			cn: [
				{
					cls: 'reply-options',
					cn: [
						{ cls: 'reply', html: 'Reply' },
						{ cls: 'share', html: 'Share' },
						{ cls: 'more', 'data-qtip': 'Options', html: '&nbsp;'}
					]
				}
			]
		}]
	},{
		id: '{id}-body',
		cls: 'note-replies',
		cn:['{%this.renderContainer(out,values)%}']
	}]),


	renderSelectors:{
		avatar: 'img.avatar'
	},


	initComponent: function(){
		if(!this.reader){
			this.reader = ReaderPanel.get(this.prefix);
		}
		this.callParent(arguments);
	},


	afterRender: function(){

		var me = this;
		me.callParent(arguments);

		try {

			this.on('editorDeactivated', function(){
				me.editorEl.down('.title').hide();
				var bRecord = me.bufferedRecord;
				if(bRecord){
					console.log('Setting buffered record');
					me.bufferedRecord = null;
					me.setRecord(bRecord);
				}
			});
		}
		catch(e){
			console.error(Globals.getError(e));
		}
	},

	createEditor: function(){
		this.callParent();
		this.editor.el.down('.title')
				.setVisibilityMode(Ext.Element.DISPLAY)
				.addCls('small')
				.hide();
	},

	fillInReplies: function(){
		var r = this.record, me = this;
		this.removeAll(true);

		Ext.defer(function(){
			if(me.isDestroyed){ return; }

			me.loadReplies(r);
			me.record.notifyObserversOfFieldChange('AdjustedReferenceCount');
		}, 1, this);
	},

	disable: function(){
		//don't call the parent, its destructive. This panel is meant to be reused.
		this.replyOptions.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
	},


	fixUpCopiedContext: function(n){
		var node = Ext.get(n), cardTpl, slideDeckTpl, slideVideoTpl,
			maxWidth = 574;//shortcut, probably should figure out how wide the context is...but that returns 0
			// when queried at this point.

		node.select('.injected-related-items,.related,.anchor-magic').remove();

		//WE want to remove redaction text in the node body of the note viewer.
		Ext.each(node.query('.redaction '), function(redaction){
			if( !Ext.fly(redaction).hasCls('redacted') ){
				Ext.fly(redaction).addCls('redacted');
			}
		});

		node.select('.redactionAction .controls').remove();

		Ext.each(node.query('span[itemprop~=nti-data-markupenabled]'),function(i){
			var e = Ext.get(i);
			//only strip off the style for width that are too wide.
			if(parseInt(i.style.width,10) >= maxWidth){
				e.setStyle({width:undefined});
			}
		});

		Ext.each(node.query('iframe'),function(i){
			var e = Ext.get(i),
				w, h, r;
			if(e.parent('div.externalvideo')){
				w = parseInt(e.getAttribute('width'), 10);
				h = parseInt(e.getAttribute('height'), 10);
				r = h !== 0 ? w/h : 0;
				if(w >= maxWidth && r !== 0){
					e.set({width: maxWidth, height: maxWidth/r});
				}
			}
			else{
				e.remove();
			}
		});

		node.select('[itemprop~=nti-data-markupenabled] a').on('click',this.contextAnnotationActions,this);
		this.on('markupenabled-action', this.commentOnAnnototableImage);

		Ext.each(node.query('.application-highlight'), function(h){
			if(this.record.isModifiable()){
				Ext.fly(h).addCls('highlight-mouse-over');
			}
		}, this);

		cardTpl = Ext.DomHelper.createTemplate({cls:'content-card', html:NextThought.view.cards.Card.prototype.renderTpl.html});
		Ext.each(node.query('object[type*=nticard]'), function(c){
			var d = NextThought.view.cards.OverlayedPanel.getData(c);
			cardTpl.insertAfter(c,d,false);
			Ext.fly(c).remove();
		});

		slideDeckTpl = Ext.DomHelper.createTemplate({cls:'content-slidedeck', html:NextThought.view.slidedeck.SlideDeck.prototype.renderTpl.html});
		Ext.each(node.query('object[type*=ntislidedeck]'), function(c){
			var d = NextThought.view.slidedeck.OverlayedPanel.getData(c);
			slideDeckTpl.insertAfter(c,d,false);
			Ext.fly(c).remove();
		});

		slideVideoTpl = Ext.DomHelper.createTemplate({cls:'content-slidevideo', html:NextThought.view.slidedeck.slidevideo.SlideVideo.prototype.renderTpl.html});
		Ext.each(node.query('object[type*=ntislidevideo][itemprop$=card]'), function(c){
			var d = NextThought.view.slidedeck.slidevideo.OverlayedPanel.getData(c);
			slideVideoTpl.insertAfter(c,d,false);
			Ext.fly(c).remove();
		});

		return node.dom;
	},


	setRecord: function(r){
		var reader = this.reader;

		//If we have an editor active for god sake don't blast it away
		if(this.editorActive()){
			console.log('Need to buffer set record', r);
			this.bufferedRecord = r;
			return;
		}

		this.callParent(arguments);
		if(this.record){
			this.mun(this.record,'destroy',this.wasDeleted,this);
		}
		if(!this.rendered){return;}

		this.replyOptions.show();
		this.setContext(
				reader.getDocumentElement(),
				reader.getCleanContent());
	},



	onRemove: function(cmp){
		var c = this.items.getCount();
		console.log('removed child, it was deleting: ',cmp.deleting);
		if(cmp.deleting && c === 0 && (!this.record || this.record.placeholder)){
			this.record.destroy();
			this.destroy();
		}
	},


	onDelete: function(){
		var c = this.items.getCount();
		
		this.callParent(arguments);
		if(c === 0){
			this.destroy();
		}
	},


	onEdit: function(){
		this.text.hide();
		this.editMode = true;
		this.editor.editBody(this.record.get('body'));
		this.editor.setTitle(this.record.get('title'));
		this.activateReplyEditor();
		this.editorEl.down('.title').show();
	},


	hideImageCommentLink: function(){
		var aLink =	 this.context ? this.context.down('a[href=#mark]') : null;
		if(aLink){
			aLink.hide();
		}
	},

	setContext: function(){
		this.callParent(arguments);
		if(this.record.placeholder){
			this.hideImageCommentLink();
		}
	},

	contextAnnotationActions: function(e,dom){
		e.stopEvent();
		var action = (dom.getAttribute('href')||'').replace('#',''),
			d = Ext.fly(dom).up('[itemprop~=nti-data-markupenabled]').down('img'),
			img = d && d.is('img') ? d.dom : null,
			me = this;

		function openSlideDeck(){
			me.up('note-window').close();
			SlideDeck.open(dom, this.reader);
		}


		if(/^mark$/i.test(action)){
			this.commentOnAnnototableImage(img/*, action*/);
		}
		else if(/^zoom$/i.test(action)){
			ImageZoomView.zoomImage(dom, this.reader, this);
		}
		else if(/^slide$/.test(action)){
			if(this.editorActive()){

				/*jslint bitwise: false */ //Tell JSLint to ignore bitwise opperations
				Ext.Msg.show({
					msg: "This will discard the contents of your current message",
					scope: me,
					buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
					icon: 'warning-red',
					title: 'Are you sure?',
					buttonText: {ok: 'caution:OK'},
					fn: function(str){
						if(str === 'ok'){
							openSlideDeck();
						}
					}
				});
			}
			else{
				openSlideDeck();
			}
		}

		return false;
	},


	commentOnAnnototableImage: function(dom /*action*/){
		var me = this;
		if( me.activateReplyEditor() ){
			WBUtils.createFromImage(dom,function(data){
				Ext.defer(me.editor.addWhiteboard,400,me.editor,[data]);
			});
		}
	},


	resizeMathJax: function(/*node*/) {
		var e = Ext.select('div.equation .mi').add(Ext.select('div.equation .mn')).add(Ext.select('div.equation .mo'));
		e.setStyle('font-size','13px');
	}
});
