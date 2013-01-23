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
		canvas: 'canvas',
		addToContacts: '.meta .add-to-contacts',
		context: '.context .text'
	},


	afterRender: function(){

		var me = this;
		me.callParent(arguments);

		try {
			me.contactsMaybeChanged();

			this.el.hover(this.onMouseOver,this.onMouseOut,this);

			this.on('editorDeactivated', function(){
				var bRecord = me.bufferedRecord;
				if(bRecord){
					console.log('Setting buffered record');
					me.bufferedRecord = null;
					me.setRecord(bRecord);
				}
			});

			me.mon(Ext.getStore('FriendsList'), {scope: me, load: me.contactsMaybeChanged});
		}
		catch(e){
			console.error(Globals.getError(e));
		}
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
		this.el.addCls('hover');
	},


	onMouseOut: function(){
		this.up('window').down('note-carousel').getEl().removeCls('hover');
		this.el.removeCls('hover');
	},


	moveSubstringToWord: function(string, start, left) {
		var c,
			inc = left ? -1: 1;
		try {
			do{
				c = string.charAt(start);
				start += inc;

				if(start < 0 || start > string.length) {
					return left ? 0: undefined;
				}
			} while(!/\s/.test(c));
		}
		catch(e) {
			//pass boundary
			return left ? 0: undefined;
		}

		return start - inc;
	},

	fixUpCopiedContext: function(n){
		var node = Ext.get(n),
			firstChild = node.first();

        if (!firstChild || !(firstChild.is('div') || firstChild.is('object'))){ //node may be null if child is a text node
            node.insertHtml('afterBegin', '[...] ');
            node.insertHtml('beforeEnd', ' [...]');
        }

		node.select('.injected-related-items,.related,iframe,.anchor-magic').remove();

		//WE want to remove redaction text in the node body of the note viewer.
		Ext.each(node.query('.redaction '), function(redaction){
			if( !Ext.fly(redaction).hasCls('redacted') ){
				Ext.fly(redaction).addCls('redacted');
			}
		});

		node.select('.redactionAction .controls').remove();
		node.select('span[itemprop~=nti-data-markupenabled]').setStyle({width:undefined});
		node.select('[itemprop~=nti-data-markupenabled] a').addCls('skip-anchor');
		node.select('a[href]:not(.skip-anchor)').set({target:'_blank'});
		node.select('a[href^=#]:not(.skip-anchor)').set({href:undefined,target:undefined});

		node.select('[itemprop~=nti-data-markupenabled] a').on('click',this.contextAnnotationActions,this);
		this.on('markupenabled-action', this.commentOnZoomedImage);

		node.select('a[href^=tag]').set({href:undefined,target:undefined});

        Ext.each(node.query('.application-highlight'), function(h){
            if(this.record.isModifiable()){
                Ext.fly(h).addCls('highlight-mouse-over');
            }
        }, this);


		//NOTE: THis code was moved, don't expect to uncomment this blindly and have it work
		//
        //for now, don't draw the stupid canvas...
        //this.canvas.width = Ext.fly(this.canvas).getWidth();
        //this.canvas.height = Ext.fly(this.canvas).getHeight();
        //AnnotationUtils.drawCanvas(this.canvas, this.node, range,
        //    this.node.down('.application-highlight').getStyle('background-color'), [-20, 30]);


		return node;
	},

	setRecord: function(r){

		var suppressed, context, doc, range, newContext;

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

		//this.ownerCt.getEl().dom.scrollTop = 0;

		try {
			this.context.setHTML('');
			suppressed = r.get('style') === 'suppressed';
			doc = ReaderPanel.get(this.prefix).getDocumentElement();
			range = Anchors.toDomRange(r.get('applicableRange'), doc, ReaderPanel.get(this.prefix).getCleanContent(), r.get('ContainerId'));
			if(range){
				newContext = this.fixUpCopiedContext(RangeUtils.expandRangeGetNode(range, doc));
                this.context.appendChild(newContext);
			}

			if (Ext.isGecko || Ext.isIE9) { this.resizeMathJax(this.context); }

		}
		catch(e2){
			console.error(Globals.getError(e2));
		}
	},


	onRemove: function(cmp){
		var c = this.items.getCount();
		console.log('removed child, it was deleting: ',cmp.deleting);
		if(cmp.deleting && c === 0 && (!this.record || this.record.placeholder)){
			this.record.destroy();
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
			me.activateReplyEditor();
			WBUtils.createFromImage(img,function(data){
				Ext.defer(me.editorActions.addWhiteboard,400,me.editorActions,[data]);
			});
		}
		else if(/^zoom$/i.test(action)){
			ImageZoomView.zoomImage(dom, null, this);
		}
		else if(/^slide$/.test(action)){
			if(this.editorActive()){
				Ext.Msg.show({
					msg: "This will discard the contents of your current message",
					scope: me,
					buttons: 9,
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

	commentOnZoomedImage: function(dom, action){
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
			    TemplatesForNotes.getEditorTpl(),
			    { tag: 'span', cls: 'time' }
		    ]
	    }]
    },{
	    id: '{id}-body',
	    cls: 'note-replies',
	    tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
    }]);
});
