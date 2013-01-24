Ext.define('NextThought.controller.UserData', {
	extend: 'Ext.app.Controller',


	requires: [
		'NextThought.cache.IdCache',
		'NextThought.util.Sharing',
		'NextThought.providers.Location',
        'NextThought.proxy.Socket'
	],


	models: [
		'GenericObject',
		'PageInfo',
		'Highlight',
		'Note',
		'QuizQuestion',
		'QuizQuestionResponse',
		'QuizResult',
		'TranscriptSummary',
		'Transcript',
        'Bookmark'
	],


	stores: [
		'PageItem'
	],


	views: [
		'Views',
		'annotations.Highlight',
		'annotations.Note',
		'annotations.note.Panel',
		'annotations.note.Window',
		'chat.transcript.Window',
		'content.Reader',
        'content.PageWidgets',
        'content.SimplePopoverWidget',
		'definition.Window',
		'sharing.Window',
		'views.Library',
		'whiteboard.Window',
        'UserDataPanel'
	],


	refs: [],


	statics: {
		events: new Ext.util.Observable()
	},


	init: function() {
        var me = this;

		this.application.on('session-ready', this.onSessionReady, this);

		this.control({
			'reader-panel':{
				'annotations-load': this.onAnnotationsLoad,
				'filter-annotations': this.onAnnotationsFilter,

				'share-with'	: this.shareWith,
				'define'		: this.define,
				'redact'		: this.redact,
				'save-new-note' : this.saveNewNote,
				'bubble-replys-up':this.replyBubble,
                'display-popover': this.onDisplayPopover,
                'dismiss-popover': this.onDismissPopover
			},


			'slide-comment-header': {
				'save-new-note': this.saveNewNote
			},


			'activity-preview': {
				'share': this.shareWith,
				'chat': this.replyAsChat
			},

			'note-gutter-widget': {
				'share': this.shareWith,
				'chat': this.replyAsChat
			},

			'note-panel': {
				'save-new-reply' : this.saveNewReply,
				'share': this.shareWith,
				'chat': this.replyAsChat
			},


			'share-window[record] button[action=save]':{
				'click': this.onShareWithSaveClick
			},

			'share-window button[action=save]':{
				'click': this.onShareSettingsSaveClick
			},

			'chat-log-view': {
				'load-transcript': this.onLoadTranscript
			},
            'user-data-panel': {
                'open-chat-transcript': this.openChatTranscript
            },
            'content-page-widgets': {
                'save-new-bookmark': this.saveNewBookmark
            }

		},{});

        Socket.register({
            'data_noticeIncomingChange': function(){me.incomingChange.apply(me, arguments);}
        });
	},


	onSessionReady: function(){
		var app = this.application,
			me = this,
			token = {};

		function finish(){ app.finishInitializeTask(token); }
		function fail(){
			console.log('Failed to resolve root page info');
			finish();
		}
		function pass(pageInfo){
			console.log('loaded in UserData Controller');
			NextThought.store.PageItem.prototype.proxy.url
					= pageInfo.getLink(Globals.RECURSIVE_STREAM).replace(
						Globals.RECURSIVE_STREAM,
						Globals.RECURSIVE_USER_GENERATED_DATA);
			finish();
		}


		app.registerInitializeTask(token);
		$AppConfig.service.getPageInfo(Globals.CONTENT_ROOT, pass, fail, this);
	},


    incomingChange: function(change) {
        change = ParseUtils.parseItems([change])[0];
        var item = change.get('Item'),
            cid = change.getItemValue('ContainerId'),
			me = this,
			refs = item.get('references') || [],
			c = 'ReferencedByCount',
        pageStore, rootid, root;

		//Don't even try this for Circled events.
		//White list is probably safer in the long term
		if(/circled/i.test(change.get('ChangeType'))){
			return;
		}


		LocationMeta.getMeta(cid,function(meta){
			try{
				if(!meta){
					return;
				}

				//add it to the page items store I guess:
				pageStore = LocationProvider.getStore(cid);
				if(!pageStore || LocationProvider.currentNTIID !== meta.NTIID || (item && !item.isTopLevel())){
					me.maybeAddOrRemoveChild(item,change.get('ChangeType'));

					try{
						if(!pageStore){
							return;
						}

						rootid = refs.length > 0 ? refs[0] : null;
						if(rootid){
							root = pageStore.getById(rootid);
							if(root){
								root.set(c, Math.max((root.get(c)||0) + (/deleted/i.test(change.get('ChangeType')) ? -1 : 1), 0));
							}
						}
					}
					catch(error){
						console.error(Globals.getError(error));
					}
				}
				else if(/deleted/i.test(change.get('ChangeType'))){
					item = pageStore.getById(item.getId());
					me.convertToPlaceholder(item);
				}

				if(/created/i.test(change.get('ChangeType'))){
					pageStore.add(item);
				}

			}
			catch(e2){
				console.error(Globals.getError(e2));
			}
		});

    },


	convertToPlaceholder: function(item){
		if(!item){return;}
		try{
			if(item.wouldBePlaceholderOnDelete()){
				item.convertToPlaceholer(item);
				item.fireEvent('updated',item);
			}
			else{
				item.convertToPlaceholer(item);
				item.destroy();
			}


		} catch(e) {
			console.error('Trouble in the placeholder convertion', Globals.getError(e));
		}
	},


    maybeAddOrRemoveChild: function(item, changeType) {
        if (!item){return;}

        var refs = (item.get('references') || []).slice(), parent, main;
        if(item.isTopLevel()){return;}

        //look for reply
        parent = Ext.getCmp(IdCache.getComponentId(refs.last(), null, 'reply'));

        //attempt for find main
        if (!parent){
            main = Ext.ComponentQuery.query('note-main-view').last();
            if (main && Ext.Array.contains(refs, main.record.getId())){
                 parent = main;
            }
        }

        if (parent){
	        if(/deleted/i.test(changeType)){
		        main = parent.findWithRecordId(item.getId());
		        this.convertToPlaceholder(main.record);
		        return;
	        }
	        parent.record.fireEvent('child-added', item);
        }
    },



    openChatTranscript: function(records, clonedWidgetMarkup){
	    if(!Ext.isArray(records)){ records = [records]; }
        var w = Ext.widget('chat-transcript-window',{waitFor: records.length, errorMsgSupplement:clonedWidgetMarkup});
	    Ext.each(records,function(r){ this.onLoadTranscript(r,w); }, this);
    },


	onAnnotationsFilter: function(cmp){
		var stores = LocationProvider.currentPageStores,
			listParams = FilterManager.getServerListParams(),
			filter = ['TopLevel'];

		if(listParams.filter){
			filter.push(listParams.filter);
		}

		if(!stores){ return; }

		function loaded(store,records,success){
			var bins = store.getBins();

			if(!success){
				return;
			}

			cmp.objectsLoaded(store.getItems(bins), bins, store.containerId);
		}


		Ext.Object.each(stores,function(k,s){
			var params = s.proxy.extraParams || {};
			params = Ext.apply(params, {
				sortOn: 'lastModified',
				sortOrder: 'descending'
			});

			s.on('load', loaded, this, { single: true });

			//Clear out any old filter information.  It has changed after all
			delete params.filter;
			delete params.accept;
			delete params.sharedWith;

			if(!Ext.isEmpty(filter)){
				params.filter = filter.join(',').replace(/,+$/,'');
			}
			if(listParams.accept){
				params.accept = listParams.accept;
			}
			if(!Ext.isEmpty(listParams.sharedWith)){
				params.sharedWith = listParams.sharedWith.join(',');
			}

			s.proxy.extraParams = params;

			s.removeAll();
			s.loadPage(1);
		}, this);
	},


	onAnnotationsLoad: function(cmp, containerId, subContainers) {
		var Store = NextThought.store.PageItem,
			rel = Globals.USER_GENERATED_DATA,
			pi = LocationProvider.currentPageInfo,
			stores = [],
			ps = Store.make(pi.getLink(rel),containerId,true),
			map = { root: ps };

		LocationProvider.currentPageStores = map;

		stores.push(ps);
		Ext.each(subContainers,function(id){
			var p = Store.make(pi.getSubContainerURL(rel,id),id);
			stores.push(p);
			map[id]=p;
		});

		this.onAnnotationsFilter(cmp);
	},


	saveSharingPrefs: function(prefs, callback){
		//TODO - check to see if it's actually different before save...
		var pi = LocationProvider.currentPageInfo;

		//get parent:
		$AppConfig.service.getPageInfo(LocationProvider.getLineage(pi.getId()).last(),
			function(topPi){
				if (topPi){
					topPi.saveField('sharingPreference', {sharedWith: prefs}, function(fieldName, sanitizedValue, pi, refreshedPageInfo){
						//always happens if success only:
						LocationProvider.updatePreferences(refreshedPageInfo);
						Ext.callback(callback, null, []);
					});
				}
			},
			function(){
				console.error('failed to save default sharing');
			},
		this);


	},


	define: function(term, boundingScreenBox){

		if( this.definition ){
			this.definition.close();
			delete this.definition;
		}
		this.definition = Ext.widget(
			'definition-window',{
			term: term,
			pointTo: boundingScreenBox
		}).show();

		setTimeout(function(){
			var head = document.querySelector('iframe.definition');
			head.style.overflowX = 'hidden';
			head.style.overflowY = 'scroll';
		},250);
	},


	onShareSettingsSaveClick: function(btn){
		var win = btn.up('window'),
			shbx= win.down('user-list'),
			cb = win.down('checkbox'),
			saveAsDefault = cb ? cb.checked : false,
			v = shbx.getValue(),
			me = this;

		cb.setValue(false);

		if (saveAsDefault){
			//update default sharing setting if we have a shareWith:
			me.saveSharingPrefs(v, function(){});
		}
	},


	onShareWithSaveClick: function(btn){
		var win = btn.up('window'),
			shbx= win.down('user-list'),
			v = shbx.getValue(),
			rec = win.record, b;

		//extra check here for a close...
		if (btn.text === 'Close'){
			win.close();
			return;
		}

		if (!rec){return;}

		win.el.mask('Sharing...');

		//Clean the body
		//FIXME seems strange we should have to clean the body here...
		b = rec.get('body');
		if(Ext.isArray(b)){
			b = Ext.Array.clean(b);
		}
		rec.set('body', b);

		SharingUtils.setSharedWith(rec,v,function(newRec,op){
			if(op.success){
				rec.fireEvent('updated',newRec);
				win.close();
			}
			else{
				console.error('Failed to save object');
				alert('Opps!\nCould not save');
				win.el.unmask();
			}
		});
	},


    onDismissPopover: function() {
        var me = this;
        if (me.popoverWidget){
            me.popoverWidget.startCloseTimer();
        }
    },


    onDisplayPopover: function(id, html, node) {
        var offsets = AnnotationsRenderer.getReader().getAnnotationOffsets(),
            position = Ext.fly(node).getXY(),
            me=this;

        function adjustPosition(position){
			var horizontalSpaceNeeded = me.popoverWidget.getWidth()/2;

			//adjust position depending on whether it should be shown on top or bottom
            if ((position[1] -offsets.scrollTop) < me.popoverWidget.getHeight()) {
                //bottom
                position[1] = position[1] + offsets.top + 30;
                me.popoverWidget.addCls('top');
            }
            else{
                //top
                position[1] = position[1] + offsets.top;
                position[1] = position[1] - me.popoverWidget.getHeight() - 20;
                me.popoverWidget.addCls('bottom');
            }

			//adjust position for left and right.  If we can be centered above it
			//we allow that, otherwise we move the bubble left and right
			if(position[0] + horizontalSpaceNeeded > offsets.width){
				//the bubble needs to shift left, marker on the right
				position[0] = position[0] - (horizontalSpaceNeeded * 2) + 20;
				me.popoverWidget.addCls('right');
			}
			else if(position[0] - horizontalSpaceNeeded < 0){
				//bubble needs to shift right, arrow on left
				position[0] = position[0] - 66;
				me.popoverWidget.addCls('left');
			}
			else{
				//centered
				position[0] = position[0] - (me.popoverWidget.width/2);
			}
			position[0] = position[0] + offsets.gutter + 80;

            return position;
        }

        if (me.popoverWidget){
            me.popoverWidget.destroy();
            delete this.popoverWidget;
        }

	    Ext.fly(html).select('a[href]', true).set({target:'_blank'});

        me.popoverWidget = Ext.widget('simple-popover-widget', {text: html.innerHTML});
        me.popoverWidget.showAt(adjustPosition(position));
    },


	replyBubble: function(replies){
		var me = this,
			e = this.self.events;

		Ext.each(replies,function(r){
			if(!r.placeholder && r.store && r.stores.length > 0){
				delete r.parent;
				r.pruned = true;
				e.fireEvent('new-note', r, null);
			}
			else if(r.children){
				me.replyBubble(r.children);
			}
		});
	},


	onLoadTranscript: function(record, cmp) {
		var model = this.getModel('Transcript'),
			id = record.get('RoomInfo').getId();

		model.proxy.url = record.getLink('transcript');

		model.load(id,{
			scope: this,
			failure: function() {
				cmp.failedToLoadTranscript();
			},
			success: function(record) {
				cmp.insertTranscript(record);
			}
		});
	},


    saveNewBookmark: function(){
        //create a bookmark model
        var bm = this.getBookmarkModel().create({
            ContainerId: LocationProvider.currentNTIID,
            applicableRange: Ext.create('NextThought.model.anchorables.ContentRangeDescription')
        });

        //now save this:
        bm.save({
            scope: this,
            callback:function(record, operation){
                try{
                    if (operation.success){NextThought.model.events.Bus.fireEvent('bookmark-loaded', record);}
                }
                catch(err){
                    console.error('Something went teribly wrong... ',err);
                }
            }
        });
    },


	saveNewNote: function(body, range, c, shareWith, style, callback){
		//check that our inputs are valid:
		if (!body || (Ext.isArray(body) && body.length < 1)){
			console.error('Note creating a note missing content');
			return;
		}

		if(!range){
			console.log('No range supplied, note will be anchored to container only');
		}

		console.log('Saving new note with body', body);

		//Define our vars and create our content range description:
		var doc = ReaderPanel.get().getDocumentElement(),
			noteRecord,
			rangeDescription = Anchors.createRangeDescriptionFromRange(range, doc),
			container = rangeDescription.container || c;

		//make sure the body is an array:
		if(!Ext.isArray(body)){body = [body];}

		//If a user it not allowed to share, remove any shared with fields
		if (!$AppConfig.service.canShare()){
			shareWith = [];
		}

		//define our note object:
		noteRecord = this.getNoteModel().create({
			applicableRange: rangeDescription.description,
			body: body,
            selectedText: range ? range.toString() : '',
			sharedWith: shareWith,
			style: style,
			ContainerId: container
		});

		console.log('Saving new record', noteRecord);
		//now save this:
		noteRecord.save({
			scope: this,
			callback:function(record, operation){
				var success, rec;
				console.log('New note save callback', success, operation);
				try{
					success = operation.success;
					rec = success ? ParseUtils.parseItems(operation.response.responseText)[0] : null;
					if (success){
						LocationProvider.getStore(container).add(rec);
						this.self.events.fireEvent('new-note', rec, range);
                        AnnotationUtils.addToHistory(rec);
					}
				}
				catch(err){
					console.error('Something went teribly wrong... ',err);
				}
				Ext.callback(callback, this, [success, rec]);
			}
		});
	},


	saveNewReply: function(recordRepliedTo, replyBody, shareWith, callback) {
		//some validation of input:
		if(!recordRepliedTo){Ext.Error.raise('Must supply a record to reply to');}
		if (!Ext.isArray(replyBody)){ replyBody = [replyBody];}

		//define our note object:
		var replyRecord = recordRepliedTo.makeReply();
		replyRecord.set('body', replyBody);
		console.log('Saving reply', replyRecord, ' to ', recordRepliedTo);

		//now save this:
		replyRecord.save({
			scope: this,
			callback:function(record, operation){
				var success = operation.success,
				rec, parent;
				console.log('Reply save successful?', success);
				if (success){
                    rec = success ? ParseUtils.parseItems(operation.response.responseText)[0] : null;
					this.self.events.fireEvent('new-note', rec);
					parent = record.parent ? record : recordRepliedTo;
					console.log('Firing child added on ', parent);
					parent.fireEvent('child-added',rec);
                    AnnotationUtils.addToHistory(rec);
				}
				Ext.callback(callback, this, [success, rec]);
			}
		});
	},


	replyAsChat: function(record) {
		var top = record,
			people, cId, parent, refs;

		//go to the top, it has the info we need:
		while(top.parent) {
			top = top.parent;
		}


		people = Ext.Array.unique([record.get('Creator')].concat(top.get('sharedWith')).concat(top.get('Creator')));
		cId = record.get('ContainerId');
		parent = record.get('NTIID');
		refs = (record.get('references') || []).slice();

		this.getController('Chat').enterRoom(people, {ContainerId: cId, references: refs, inReplyTo: parent});
	},


	shareWith: function(record){
		var options = {};

		if (Ext.ComponentQuery.query('share-window[record]').length > 0) {
			//already a share with window, they are modal, just don't do this:
			return;
		}

		if (arguments[arguments.length-1] === true) {
			options = {
				btnLabel : 'Discuss',
				titleLabel : 'Discuss This...'
			};
		}

		Ext.widget('share-window',Ext.apply({record: record}, options)).show();
	},


	redact: function(record){
		if(!record) {
			return;
		}
		this.self.events.fireEvent('new-redaction',record);
	}

});
