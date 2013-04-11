Ext.define('NextThought.view.annotations.note.Main',{
	extend: 'NextThought.view.annotations.note.Panel',
	alias: 'widget.note-main-view',


	requires: [
		'NextThought.providers.Location',
		'NextThought.ux.SlideDeck'
	],

	root: true,

	highlightTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'highlight', html: '{0}'}),


	renderSelectors:{
		avatar: 'img.avatar',
		addToContacts: '.meta .add-to-contacts'
	},


	afterRender: function(){

		var me = this;
		me.callParent(arguments);

		try {
			me.contactsMaybeChanged();

			this.on('editorDeactivated', function(){
				var bRecord = me.bufferedRecord;
				if(bRecord){
					console.log('Setting buffered record');
					me.bufferedRecord = null;
					me.setRecord(bRecord);
				}
			});

			me.mon(Ext.getStore('FriendsList'), {scope: me, 'contacts-updated': me.contactsMaybeChanged});
		}
		catch(e){
			console.error(Globals.getError(e));
		}
	},

	fillInReplies: function(){
		var r = this.record, me = this;
		Ext.suspendLayouts();
		this.removeAll(true);
		Ext.resumeLayouts(true);

		Ext.defer(function(){
			if(me.isDestroyed){ return; }

			Ext.suspendLayouts();
			me.loadReplies(r);
			me.record.notifyObserversOfFieldChange('AdjustedReferenceCount');
			Ext.resumeLayouts(true);
		}, 1, this);
	},

	disable: function(){
		//don't call the parent, its destructive. This panel is meant to be reused.
		this.replyOptions.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
	},


	contactsMaybeChanged: function(){
		var me = this, r = this.record;
		if(me.addToContacts){
			me.mun(me.addToContacts, 'click');
		}
		if(r.placeholder || !me.shouldShowAddContact(r.get('Creator'))){
			me.addToContacts.hide();
		}
		else{
			me.addToContacts.show();
			me.mon(me.addToContacts, {scope: me, click: me.addToContactsClicked});
		}
	},


	shouldShowAddContact: function(username){
		if(!$AppConfig.service.canFriend()){
			return false;
		}
		return username && username !== $AppConfig.username && !Ext.getStore('FriendsList').isContact(username);
	},


	addToContactsClicked: function(e){
		var me = this;
		console.log('Should add to contacts');
		UserRepository.getUser(this.record.get('Creator'), function(record){
			var pop,
				el = e.target,
				alignmentEl = e.target,
				alignment = 'tl-tr?',
				play = Ext.dom.Element.getViewportHeight() - Ext.fly(el).getTop(),
				id = record.getId(),
				open = false,
				offsets = [10, -18];

				Ext.each(Ext.ComponentQuery.query('activity-popout,contact-popout'),function(o){
					if(o.record.getId()!==id || record.modelName !== o.record.modelName){ o.destroy(); }
					else { open = true;  o.toFront();}
				});

			if(open){return;}

			pop = NextThought.view.account.contacts.management.Popout.create({record: record, refEl: Ext.get(el)});

			me.mon(pop, {scope: me, 'destroy': me.showCarouselArrows, 'show': me.hideCarouselArrows});

			pop.addCls('note-add-to-contacts-popout');
			pop.show();
			pop.alignTo(alignmentEl,alignment,offsets);

		}, this);
	},


	showOrHideArrows: function(show){
		var car = this.up('window').down('note-carousel'),
			f = show ? 'show' : 'hide';
		if(car){
			if(car.navNext && Ext.isFunction(car.navNext[f])){
				car.navNext[f]();
			}
			if(car.navPrev && Ext.isFunction(car.navPrev[f])){
				car.navPrev[f]();
			}
		}
	},


	hideCarouselArrows: function(){
		this.showOrHideArrows(false);
	},


	showCarouselArrows: function(){
		this.showOrHideArrows(true);
	},


	onMouseOver: function(){
		this.up('window').down('note-carousel').getEl().addCls('hover');
		this.callParent(arguments);
	},


	onMouseOut: function(){
		this.up('window').down('note-carousel').getEl().removeCls('hover');
		this.callParent(arguments);
	},



	fixUpCopiedContext: function(n){
		var node = Ext.get(n),
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

		return node.dom;
	},


	setRecord: function(r){
		var reader = ReaderPanel.get(this.prefix);

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
		}
	},

	onDelete: function(){
		this.callParent(arguments);
		this.hideImageCommentLink();
	},

	hideImageCommentLink: function(){
		var aLink =  this.context ? this.context.down('a[href=#mark]') : null;
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
			me.up('window').close();
			SlideDeck.open(dom, LocationProvider.currentNTIID);
		}


		if(/^mark$/i.test(action)){
			this.commentOnAnnototableImage(img, action);
		}
		else if(/^zoom$/i.test(action)){
			ImageZoomView.zoomImage(dom, null, this);
		}
		else if(/^slide$/.test(action)){
			if(this.editorActive()){
				/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
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


	commentOnAnnototableImage: function(dom, action){
		var me = this;
		me.activateReplyEditor();
		WBUtils.createFromImage(dom,function(data){
			Ext.defer(me.editorActions.addWhiteboard,400,me.editorActions,[data]);
		});
	},


	resizeMathJax: function(node) {
		var e = Ext.select('div.equation .mi').add(Ext.select('div.equation .mn')).add(Ext.select('div.equation .mo'));
		e.setStyle('font-size','13px');
	},


	updateFromRecord:function(newRecord){
		this.callParent(arguments);
		this.contactsMaybeChanged();
	},


	activateReplyEditor: function(){
		var r = this.callParent(arguments);
		if(r){
			this.up('window').down('note-carousel').addCls('editor-active');
		}
		return r;
	},


	deactivateReplyEditor: function(){
		this.up('window').down('note-carousel').removeCls('editor-active');
		this.callParent();
	}

},
function(){
    this.prototype.renderTpl = Ext.DomHelper.markup([{
	    cls: 'note main-view',
	    cn:[{
		    cls: 'avatar',
		    tag: 'img', src: Ext.BLANK_IMAGE_URL
	    },{
		    cls: 'meta',
		    cn: [
			    { cls: 'controls', cn: [{ cls: 'favorite' },{ cls: 'like' }] },
			    { tag: 'span', cls: 'name' },
			    { cls: 'add-to-contacts', html: 'ADD'},
			    { cls: 'shared-to' }
		    ]
	    },{ cls: 'clear' },{
		    cls: 'context', cn: [
			    {tag: 'canvas'},
			    {tag: 'span', cls: 'text'}]
	    },{ cls: 'body' },{
		    cls: 'respond',
		    cn: [
			    TemplatesForNotes.getReplyOptions(),
			    { tag: 'span', cls: 'time' },
			    TemplatesForNotes.getEditorTpl()
		    ]
	    }]
    },{
	    id: '{id}-body',
	    cls: 'note-replies',
	    html:'{%this.renderContainer(out,values)%}'
    }]);
});
