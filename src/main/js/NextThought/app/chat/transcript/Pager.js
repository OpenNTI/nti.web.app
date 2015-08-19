Ext.define('NextThought.app.chat.transcript.Pager', {

	requires: [
		'NextThought.app.chat.Actions',
		'NextThought.app.chat.StateStore',
		'NextThought.model.TranscriptSummary',
		'NextThought.model.Transcript',
		'NextThought.app.chat.components.log.PagerEntry'
	],


	mixins: {
     	observable: 'Ext.util.Observable'
    },

	PAGE_SIZE: 20,

	constructor: function (cfg) {
		this.initConfig(cfg || {});
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();

		this.mixins.observable.constructor.apply(this);
	},


	buildTranscriptStore: function(occupants) {
		var user = Ext.Array.remove(occupants.slice(), $AppConfig.username)[0],
			url = Service.getContainerUrl(Globals.CONTENT_ROOT, Globals.RECURSIVE_USER_GENERATED_DATA),
			s = NextThought.store.PageItem.make(url, Globals.CONTENT_ROOT, true);

		if (!user) { return; }

		s.pageSize = 100;
		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, {
			sortOn: 'CreatedTime',
			sortOrder: 'descending',
			pageSize: 100,
			transcriptUser: user || '',
			accept: [
				NextThought.model.TranscriptSummary.prototype.mimeType,
				NextThought.model.Transcript.prototype.mimeType
			].join(',')
		});

		this.transcriptStore = s;
		s.on('load', this.fillInHistory.bind(this));
		s.load();
	},


	bindWindow: function(win) {
		this.chatWindow = win;
		this.pages = [];
	},


	fillInHistory: function() {
		var win = this.chatWindow;

		this.currentPage = 1;
		this.getPages()
			.then(win.maskWindow.bind(win))
			.then(this.loadPage.bind(this, 1))
			.then(this.addBulkMessages.bind(this))
			.then(this.maybeAddMoreEntry.bind(this))
			.then(win.unmaskWindow.bind(win))
			.fail(win.unmaskWindow.bind(win));
	},


	getPages: function() {
		var me = this,
			pages = [], messageCount = 0,
			transcripts = [], startIndex = 0, endIndex;

		if (!this.transcriptStore) {
			this.pages = {};
			return;
		}

		this.transcriptStore.each(function(transcript) {
			var room = transcript.get('RoomInfo'),
				mCount = room.get('MessageCount'),
				pCount = Math.ceil(mCount / me.PAGE_SIZE), i, diff;

			for (i = 0; i < pCount; i++) {
				if (messageCount + mCount < me.PAGE_SIZE) {
					messageCount += mCount;
					if (!Ext.Array.contains(transcripts, transcript)) {
						transcripts.push(transcript);
					}
				}
				else {
					diff = me.PAGE_SIZE - messageCount;
					if (i > 0) {
						endIndex = startIndex + me.PAGE_SIZE - 1;
					}
					else {
						endIndex = (i * me.PAGE_SIZE) + diff - 1;
					}

					if (!Ext.Array.contains(transcripts, transcript)) {
						transcripts.push(transcript);
					}

					// console.debug('startIndex: ', startIndex, 'endIndex: ', endIndex, 'transcripts: ', transcripts, 'messageCount: ', me.PAGE_SIZE);
					pages.push({
						startIndex: startIndex,
						endIndex: endIndex,
						transcripts: transcripts,
						messageCount: me.PAGE_SIZE
					});

					// Last index is the first index for next page.
					startIndex = (endIndex + 1) < room.get('MessageCount') ? endIndex + 1 : 0;
					endIndex = null;
					transcripts = [];
					messageCount = 0;
					mCount -= diff;

					// If we're the last page, make sure we don't leave any message unaccounted for.
					if (i === (pCount - 1) && mCount > 0) {
						messageCount = mCount;
						transcripts.push(transcript);
					}
				}
			}

			if (me.transcriptStore.last() === transcript && messageCount > 0 && messageCount <= me.PAGE_SIZE) {
				// console.debug('startIndex: ', startIndex, 'endIndex: ', endIndex, 'transcripts: ', transcripts, 'messageCount: ', messageCount);
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
		return Promise.resolve(pages);
	},


	filterChatMessages: function(messages, page, pageTranscriptIndex, pageTranscriptCount) {
		var toAdd = [];

		// Filter messages
		if (pageTranscriptCount === 1) {
			if (page.endIndex !== null && page.endIndex >= 0) {
				toAdd = messages.slice(page.startIndex, page.endIndex + 1);
			}
			else {
				toAdd = messages.slice(page.startIndex);
			}
		}
		else {
			if(pageTranscriptIndex === 0) {
				toAdd = messages.slice(page.startIndex);
			}
			else if (pageTranscriptIndex === (pageTranscriptCount - 1)) {
				if (page.endIndex !== null && page.endIndex >= 0) {
					toAdd = messages.slice(0, page.endIndex + 1);
				}
				else {
					toAdd = messages.slice();
				}
			}
			else {
				toAdd = messages.slice();
			}
		}

		return Promise.resolve(toAdd);
	},


	loadPage: function(pageToLoad) {
		var pageCount = this.pages && this.pages.length, page,
			i, toAdd = [], p;

		if (pageToLoad > pageCount || pageCount === 0) {
			return Promise.reject();
		}

		page = this.pages[pageToLoad - 1];

		for (i = 0; i < page.transcripts.length; i++) {
			p = this.getMessages(page, i, page.transcripts.length);
			toAdd.push(p);
		}

		return new Promise(function(fulfill, reject) {
			Promise.all(toAdd)
			.then(function(results) {
				var allMessages = [];
				Ext.each(results, function(msgs) {
					allMessages = allMessages.concat(msgs);
				});

				fulfill(allMessages);
			});
		});
	},


	getMessages: function(page, index, count) {
		var me = this,
			transcript = page.transcripts && page.transcripts[index];

		return me.ChatActions.loadTranscript(transcript.get('RoomInfo'))
				.then(function(t) {
					var messages = t && t.get('Messages') || [];
					return me.filterChatMessages(messages.reverse(), page, index, count);
				});
	},


	sortMessages: function(messages) {
		function timeSort(a, b) {
			var aRaw = a.raw || {CreatedTime: 0},
					bRaw = b.raw || {CreatedTime: 0};

			return aRaw.CreatedTime - bRaw.CreatedTime;
		}

		messages = Ext.Array.sort(messages, timeSort);
		return messages;
	},


	addBulkMessages: function(records) {
		this.clearPaging();

		records = this.sortMessages(records);
		if (this.chatWindow) {
			this.chatWindow.addBulkMessages(records);
		}
		return Promise.resolve();
	},


	insertBulkMessages: function(records) {
		this.clearPaging();

		records = this.sortMessages(records);
		if (this.chatWindow) {
			this.chatWindow.insertBulkMessages(0, records);
		}
		return Promise.resolve();
	},


	clearPaging: function() {
		var logView = this.chatWindow && this.chatWindow.logView;
		if (this.pagingCmp && logView) {
			logView.remove(this.pagingCmp);
			delete this.pagingCmp;
		}
	},


	maybeAddMoreEntry: function() {
		var hasMore = this.hasMorePages(),
			logView = this.chatWindow && this.chatWindow.logView;

		if (logView && hasMore) {
			this.pagingCmp = logView.insert(0, {
				xtype: 'chat-pager-entry'
			});

			this.mon(this.pagingCmp.messageEl, 'click', this.loadNext.bind(this));
		}

		return Promise.resolve();
	},


	hasMorePages: function(){
		var pageCount = this.pages && this.pages.length;
		return (this.currentPage + 1 > 0) && (this.currentPage + 1 <= pageCount);
	},


	loadNext: function() {
		var win = this.chatWindow;
		if (!this.hasMorePages()) {
			return Promise.reject();
		}

		this.currentPage += 1;
		this.loadPage(this.currentPage)
			.then(function(messages) {
				win.maskWindow.bind(win);
				return Promise.resolve(messages);
			})
			.then(this.insertBulkMessages.bind(this))
			.then(this.maybeAddMoreEntry.bind(this))
			.then(win.unmaskWindow.bind(win))
			.fail(win.unmaskWindow.bind(win));

		return Promise.resolve();
	}
});
