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
		'annotations.note.Window',
		'chat.transcript.Window',
		'content.Reader',
        'content.PageWidgets',
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
				'bubble-replys-up':this.replyBubble
			},


			'activity-preview': {
				'share': this.shareWith,
				'chat': this.replyAsChat
			},

			'note-gutter-widget': {
				'share': this.shareWith,
				'chat': this.replyAsChat
			},

			'note-reply': {
				'share': this.shareWith,
				'chat': this.replyAsChat
			},

			'note-window': {
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
					me.maybeFireChildAdded(item);

					try{
						if(!pageStore){
							return;
						}

						rootid = refs.length > 0 ? refs[0] : null;
						if(rootid){
							root = pageStore.getById(rootid);
							if(root){
								root.set(c, Math.max((root.get(c)||0) + (1 * (/deleted/i.test(change.get('ChangeType')) ? -1 : 1)), 0));
							}
						}
					}
					catch(error){
						console.error(Globals.getError(error));
					}

					return;
				}

				if(!/deleted/i.test(change.get('ChangeType'))){
					pageStore.add(item);
				}
				else {
					item = pageStore.getById(item.getId());
					if(item){
						pageStore.remove(item);
					}
				}
			}
			catch(error){
				console.error(Globals.getError(error));
			}
		});

    },


    maybeFireChildAdded: function(item) {
        if (!item){return;}

        var refs = (item.get('references') || []).slice(), parent, main;
        if(refs.length===0){return;}

        //look for reply
        parent = Ext.getCmp(IdCache.getComponentId(refs.last(), null, 'reply'));

        //attempt for find main
        if (!parent){
            main = Ext.ComponentQuery.query('note-main-view').last();
            if (main && Ext.Array.contains(refs, main.record.getId())){
                 parent = main;
            }
        }

        if (parent){parent.record.fireEvent('child-added', item);}
    },



    openChatTranscript: function(records){
	    if(!Ext.isArray(records)){ records = [records]; }
        var w = Ext.widget('chat-transcript-window',{waitFor: records.length});
	    Ext.each(records,function(r){ this.onLoadTranscript(r,w); }, this);
    },


	onAnnotationsFilter: function(cmp){
		var stores = LocationProvider.currentPageStores,
			listParams = FilterManager.getServerListParams(),
			filter = ['TopLevel',listParams.filter];

		if(!stores){ return; }

		function loaded(store,records,success){
			var bins = store.getBins();

			if(!success){
				return;
			}

			cmp.objectsLoaded(store.getItems(bins), bins, store.containerId);
		}


		Ext.Object.each(stores,function(k,s){
			s.on('load', loaded, this, { single: true });

			s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
				filter: filter.join(',').replace(/,+$/,''),
				accept: listParams.accept,
				sortOn: 'lastModified',
				sortOrder: 'descending'
			});

			s.removeAll();
			s.loadPage(1);
		}, this);
	},


	onAnnotationsLoad: function(cmp, containerId, subContainers) {

		function make(url,id,disablePaging){
			var ps = NextThought.store.PageItem.create({
				clearOnPageLoad: false,
				containerId: id
			});
			ps.proxy.url = url;
			if(disablePaging){
				ps.proxy.limitParam = undefined;
				ps.proxy.startParam = undefined;
				delete ps.pageSize;
			}
			return ps;
		}

		var rel = Globals.USER_GENERATED_DATA,
			pi = LocationProvider.currentPageInfo,
			stores = [],
			ps = make(pi.getLink(rel),containerId,true),
			map = { root: ps };

		LocationProvider.currentPageStores = map;

		stores.push(ps);
		Ext.each(subContainers,function(id){
			var p = make(pi.getSubContainerURL(rel,id),id);
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
			rec = win.record;

		//extra check here for a close...
		if (btn.text === 'Close'){
			win.close();
			return;
		}

		if (!rec){return;}

		win.el.mask('Sharing...');

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


	replyBubble: function(replies){
		var me = this,
			e = this.self.events;

		Ext.each(replies,function(r){
			if(!r.placeHolder && r.store && r.stores.length > 0){
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
        bm.mimeType = 'application/vnd.nextthought.highlight';
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

		//now save this:
		noteRecord.save({
			scope: this,
			callback:function(record, operation){
				var success, rec;
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


		//now save this:
		replyRecord.save({
			scope: this,
			callback:function(record, request){
				var success = request.success,
					rec = success ? record: null;
				if (success){
					this.self.events.fireEvent('new-note', rec);
					(rec.parent?rec:recordRepliedTo).fireEvent('child-added',rec);
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
