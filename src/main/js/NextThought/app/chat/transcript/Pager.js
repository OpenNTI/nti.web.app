Ext.define('NextThought.app.chat.transcript.Pager', {

	requires: [
		'NextThought.app.chat.Actions',
		'NextThought.app.chat.StateStore',
		'NextThought.model.TranscriptSummary',
		'NextThought.model.Transcript'
	],

	PAGE_SIZE: 20,

	constructor: function (cfg) {
		this.initConfig(cfg || {});
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
	},


	buildTranscriptSummaryStore: function(user) {
		var url = Service.getContainerUrl(Globals.CONTENT_ROOT, Globals.RECURSIVE_USER_GENERATED_DATA),
			s = NextThought.store.PageItem.make(url, Globals.CONTENT_ROOT, true);

		s.pageSize = 100;
		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, {
			sortOn: 'createdTime',
			sortOrder: 'descending',
			pageSize: 100,
			transcriptUser: user || '',
			accept: [
				NextThought.model.TranscriptSummary.prototype.mimeType,
				NextThought.model.Transcript.prototype.mimeType
			].join(',')
		});

		this.transcriptStore = s;
		s.on('load', this.buildChatMessagePages.bind(this));
		s.load();
	},

	// This is the store of the chat window that wants to have a Pager
	bindStore: function(store) {
		this.store = store;
	},


	buildChatMessagePages: function() {
		var me = this,
			pages = [], messageCount = 0,
			transcripts = [], startIndex = 0, endIndex;

		if (!this.transcriptStore) {
			this.pages = {};
			return;
		}

		this.transcriptStore.each(function(transcript) {
			var room = transcript.get('RoomInfo'),
				c = room.get('MessageCount'),
				pCount = Math.ceil(c / me.PAGE_SIZE), i;

			for (i = 0; i < pCount; i++) {
				if (messageCount + c < me.PAGE_SIZE) {
					messageCount += c;
					if (!Ext.Array.contains(transcripts, transcript)) {
						transcripts.push(transcript);
					}
				}
				else {
					endIndex = me.PAGE_SIZE - messageCount - 1;
					if (!Ext.Array.contains(transcripts, transcript)) {
						transcripts.push(transcript);
					}

					pages.push({
						startIndex: startIndex,
						endIndex: endIndex,
						transcripts: transcripts,
						messageCount: me.PAGE_SIZE
					});

					// Last index is the first index for next page.
					startIndex = endIndex + 1 < c ? endIndex + 1 : 0;
					endIndex = null;
					transcripts = [transcript];
					messageCount = 0;

					// update the remaining messages count
					c -= me.PAGE_SIZE;
				}
			}

			if (me.transcriptStore.last() === transcript && messageCount > 0 && messageCount < me.PAGE_SIZE) {
				pages.push({
					startIndex: startIndex,
					endIndex: endIndex,
					transcripts: transcripts,
					messageCount: messageCount
				});
			}
		});

		console.log('pages: ', pages);
		this.pages = pages;
	},


	getChatSummariesForOccupants: function(occupants) {
		var user = Ext.Array.remove(occupants.slice(), $AppConfig.username)[0];

		if (!this.transcriptStore) {
			this.buildTranscriptSummaryStore(user);
		}
	},


	loadNext: function() {
		var pageToLoad = this.currentPage && (this.currentPage + 1) || 0,
			pageCount = this.pages && this.pages.length, page,
			me = this, transcript, i;

		if (pageToLoad < pageCount) {
			page = this.pages[pageToLoad];
			
			for (i=0; i<page.transcripts.length; i++) {
				transcript = page.transcripts[i];
				me.ChatActions.loadTranscript(transcript.get('RoomInfo'))
					.then(function(messages) {
						var toAdd = [];
						// Filter messages
						if(i === 0) {
							if (page.transcripts.length === 1) {
								if (page.endIndex && page.endIndex >= 0) {
									toAdd = messages.slice(page.startIndex, page.endIndex);	
								}
								else {
									toAdd = messages.slice(page.startIndex);
								}
							}
							else {
								toAdd = messages.slice(page.startIndex);
							}
						}

						// TODO: we should only add this once. Not multiple times.
						if (me.store && toAdd.length > 0) {
							me.store.insert(0, toAdd);
						}
					});
			}
		}
	}
});
