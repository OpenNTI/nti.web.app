export default Ext.define('NextThought.proxy.IndexedDB', {
	extend: 'Ext.data.proxy.Proxy',
	alias: 'proxy.indexeddb',

	version: 1,

	//<editor-fold desc="Handy definitions">
	/** @type {IndexedDB} */
	indexedDB: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
	/** @type {IDBTransaction} */
	IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction,
	/** @type {IDBKeyRange} */
	IDBKeyRange: window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange,
	//</editor-fold>


	constructor: function(config) {
		config = config || {};
		this.db = null;
		this.id = 'data';
		this.storeName = '';
		this.keyConfig = {keyPath: 'id', autoIncrement: true};
		this.callParent([config]);
		this.open();
	},


	//<editor-fold desc="IndexedDB Wrapper functions">
	open: function() {
		var me = this, store,
			request = me.indexedDB.open(me.id, me.version);

		function useDatabase(db) {
			// Make sure to add a handler to be notified if another page requests a version
			// change. We must close the database. This allows the other page to upgrade the database.
			// If you don't do this then the upgrade won't happen until the user closes the tab.
			db.onversionchange = function(event) {
				db.close();
				alert('A new version of this is ready. Please reload!');
			};
			// Do stuff with the database.
			me.db = db;

			me.fireEvent('opened', me);
		}

		request.onblocked = function(event) {
			// If some other tab is loaded with the database, then it needs to be closed
			// before we can proceed.
			alert('Please close all other tabs with this open!');
		};

		request.onupgradeneeded = function(e) {
			// All other databases have been closed. Set everything up.
			var db = e.target.result;

			// A versionchange transaction is started automatically.
			e.target.transaction.onerror = me.onerror.bind(me);

			if (db.objectStoreNames.contains(me.storeName)) {
				db.deleteObjectStore(me.storeName);
			}

			store = db.createObjectStore(me.storeName, me.keyConfig);
			me.fireEvent('createdstore', me);
			useDatabase(db);
		};

		request.onsuccess = function(e) {
			var db = me.db = e.target.result;
			useDatabase(db);
		};

		request.onerror = me.onerror.bind(me);
	},


	getStore: function(mode) {
		var me = this,
			db = me.db,
			trans = db.transaction([me.storeName], mode || 'readwrite');
		return trans.objectStore(me.storeName);
	},


	onerror: function(e) {
		console.error(arguments);
		this.fireEvent('exception');
	},


	add: function(record) {
		var me = this,
			store = me.getStore('readwrite'),
			request = store.add(me.__getRecordData(record));

		return new Promise(function(fulfill, reject) {
			request.onsuccess = function(e) {
				me.fireEvent('added', '...');
				fulfill();
			};

			request.onerror = function(e) {
				console.log(e.value);
				reject();
			};

		});
	},


	addAll: function(records) {

		var me = this, i = 0,
			store = me.getStore('readwrite');

		return new Promise(function(fulfill, reject) {
			function addNext() {
				var req;
				if (i < records.length) {
					req = store.add(me.__getRecordData(records[i]));
					req.onsuccess = addNext;
					req.onerror = error;
					i++;
				} else {
					console.log('complete');
					fulfill();
				}
			}

			function error(e) {
				console.log(e.value);
				reject();
			}

			addNext();
		});
	},


	remove: function(id) {
		var me = this,
			store = me.getStore(),
			request = store.delete(id);

		return new Promise(function(fulfill, reject) {
			request.onsuccess = function(e) {
				me.fireEvent('removed');
				fulfill();
			};

			request.onerror = function(e) {
				console.log(e);
				reject();
			};
		});
	},


	removeAll: function(ids) {

		var i = 0,
			store = this.getStore('readwrite');

		return new Promise(function(fulfill, reject) {
			function removeNext() {
				var req;
				if (i < ids.length) {
					req = store.delete(ids[i]);
					req.onsuccess = removeNext;
					req.onerror = error;
					i++;
				} else {
					console.log('complete');
					fulfill();
				}
			}

			function error(e) {
				console.log(e.value);
				reject();
			}
			removeNext();
		});
	},


	get: function(id) {
		var me = this,
			store = me.getStore(),
			request = store.get(id);

		return new Promise(function(fulfill, reject) {
			request.onsuccess = function(e) {
				me.fireEvent('got', e.target.result);
				fulfill(e.target.result);
			};

			request.onerror = function(e) {
				console.log(e);
				reject(e);
			};
		});
	},


	put: function(record) {
		var me = this,
			store = me.getStore(),
			request = store.put(this.__getRecordData(record));

		return new Promise(function(fulfill, reject) {

			request.onsuccess = function(e) {
				fulfill();
			};

			request.onerror = function(e) {
				reject();
			};
		});
	},


	putAll: function(records) {
		var i = 0, me = this,
			store = me.getStore('readwrite');

		return new Promise(function(fulfill, reject) {
			function putNext() {
				var req;
				if (i < records.length) {
					req = store.put(me.__getRecordData(records[i]));
					req.onsuccess = putNext;
					req.onerror = error;
					i++;
				} else {
					console.log('complete');
					fulfill();
				}
			}

			function error(e) {
				console.log(e.value);
				reject();
			}

			putNext();
		});
	},


	clear: function() {
		var store = this.getStore(),
			req = store.clear();

		return new Promise(function(fulfill, reject) {
			req.onsuccess = function(evt) {
				fulfill();
			};

			req.onerror = function(evt) {
				console.error('clearObjectStore:', evt.target.errorCode);
				reject();
			};
		});
	},


	getRange: function(start, limit) {
		var me = this,
			store = me.getStore('readonly'),
			cursorRequest = store.openCursor();

		return new Promise(function(fulfill, reject) {
			var results = [], i = 0;
			cursorRequest.onsuccess = function(e) {
				var result = e.target.result;
				if ((!!result) === false || results.length >= limit) {
					fulfill(results);
					return;
				}

				if (i >= start) {
					//handle(result.value);
					results.push(result.value);
				}
				i++;
				result.continue();
			};

			cursorRequest.onerror = function(e) {
				reject(e);
			};
		});
	},
	//</editor-fold>


	__getRecordData: function(record) {
		return this.getWriter().getRecordData(record);
	},


	//<editor-fold desc="ExtJS Proxy implementation">
	create: function(operation, callback, scope) {
		var me = this,
			records = operation.records,
			length = records.length,
			record, i;

		operation.setStarted();

		for (i = 0; i < length; i++) {
			record = records[i];
			record.commit();
		}
		this.addAll(records)
				.done(function() {operation.setSuccessful();})
				.always(function() {
					operation.setCompleted();
					if (typeof callback === 'function') {
						callback.call(scope || me, operation);
					}
				});
	},


	read: function(operation, callback, scope) {
		//TODO: respect sorters, filters, start and limit options on the Operation

		function finish(records) {
			records = Ext.isArray(records) ? records : [records];

			operation.setCompleted();
			if (!operation.wasSuccessful()) {
				records = [];
			} else {
				records = records.map(function(data) {
					return new Model(data, data[idProp], data);
				});
			}

			operation.resultSet = Ext.create('Ext.data.ResultSet', {
				records: records,
				total: records.length,
				loaded: true
			});

			if (typeof callback === 'function') {
				callback.call(scope || me, operation);
			}
		}

		var me = this,
			Model = me.model,
			idProp = Model.prototype.idProperty;

		operation.setStarted();

		//read a single record
		if (operation.id) {
			me.get(operation.id)
					.done(function(v) {operation.setSuccessful(); return v;})
					.always(finish);
			return;
		}

		me.getRange(operation.start, operation.limit)
				.done(function(v) {operation.setSuccessful(); return v;})
				.always(finish);
	},


	update: function(operation, callback, scope) {
		var records = operation.records,
				length = records.length,
				record, i;

		operation.setStarted();

		for (i = 0; i < length; i++) {
			record = records[i];
			record.commit();
		}

		this.putAll(records)
				.done(function() {operation.setSuccessful();})
				.always(function() {
					operation.setCompleted();
					if (typeof callback === 'function') {
						callback.call(scope || me, operation);
					}
				});
	},


	destroy: function(operation, callback, scope) {
		var me = this,
			records = operation.records;

		operation.setStarted();

		me.removeAll(records.map(function(r) {return r.getId();}))
				.done(function() {operation.setSuccessful();})
				.always(function() {
					operation.setCompleted();
					if (typeof callback === 'function') {
						callback.call(scope || me, operation);
					}
				});
	}
	//</editor-fold>
});

/*
window.test = new Ext.data.Store({
	model: 'NextThought.model.User',
	proxy: {
		type: 'indexeddb',
		storeName: 'users',
		keyConfig: { keyPath: 'Username' },
		reader: 'json',
		writer: 'nti'
	}
});
*/
