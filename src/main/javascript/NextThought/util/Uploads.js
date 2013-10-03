Ext.define('NextThought.util.Uploads', {
	singleton: true,
	requires: [
		'Ext.ProgressBar'
	],

	constructor: function() {
		//deprefix...
		window.Blob = window.Blob || window.WebKitBlob || window.MozBlob || window.MSBlob;
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
		window.URL = window.URL || window.webkitURL;

		var worker, me = this;
		this.requests = {};

		if (window.Worker && this.enabled) {
			worker = (function() {
				var b, bb, result, url, script = [
					'self.addEventListener("message", function(e){dispatch(e.data);}, false);',
					'self.postMessage( {message:"started",time:Date.now()} );',
					me.dispatch.toString(),
					me.abort.toString(),
					me.upload.toString()
				];
				try {
					try {
						b = new Blob(script, {type: 'text/javascript'});//preferred method
					}
					catch (e) {
						//depricated (previous) prefered method
						bb = new BlobBuilder();
						bb.append(script.join('\n'));
						b = bb.getBlob('text/javascript');
					}
					url = URL.createObjectURL(b);
					result = new Worker(url);
					URL.revokeObjectURL(url);
					return result;
				}
				catch (er) {
					//fallback, probably shouldn't allow it
					//return new Worker('data:application/javascript,' + encodeURIComponent(script.join('\n')));
				}
				return null;
			}());
		}

		if (worker) {
			worker.onmessage = function(e) {me.onMessageFromWorker(e.data); };
			worker.onerror = function(e) {
				console.error('Error in file: ' + e.filename + '\nline: ' + e.lineno + '\nDescription: ' + e.message);
			};

			this.worker = worker;

			//ensure we're running these functions in a worker, not in the main thread.
			this.upload = null;
			this.abort = null;
			this.dispatch = null;

			worker.postMessage('');
		}
		else {
			//console.error("Not able to use Workers for uploads");
			this.worker = {
				postMessage: function(data) {
					me.dispatch(data);
				}
			};
			this.postMessage = this.onMessageFromWorker;
		}
	},

	/**
	 *
	 * @param file
	 * @param url
	 * @param progressCallback
	 * @param finishCallback
	 * @param scope
	 */
	postFile: function(file, url, progressCallback, finishCallback, scope) {
		var id = Globals.guidGenerator(),
			bar = this.addUpload(id, file),
			req;

		req = this.requests[id] = {
			id: id,
			file: file,
			url: url
		};

		this.worker.postMessage(Ext.apply({message: 'add'},req));

		Ext.apply(req, {
			bar: bar,
			progress: progressCallback,
			complete: finishCallback,
			scope: scope
		});
	},

	//private
	onMessageFromWorker: function(message) {
		if (message.message === 'beat') {
			console.debug('worker beat');
		}
		else if (message.message === 'started') {
			//gtg
			return;
		}


		if (!this.requests.hasOwnProperty(message.id)) {
			return;
		}

		var request = this.requests[message.id],
        //			id = request.id,
			bar = request.bar,
			file = request.file,
			scope = request.scope,
			msg = message.message,
			cb,
			p = message.progress;

		if (msg === 'progress') {
			cb = request.progress;
			if (p <= 1) {
				bar.updateProgress(p);
			}
			else {
				bar.updateProgress(0, p);
			}
			if (cb) {
				cb.call(scope || window, file, message.progress);
			}
		}
		/*
		else if(msg === 'load'){
			//don't care
		}
		*/
		else if (msg === 'complete') {
			cb = request.complete;
			bar.updateProgress(1);
			setTimeout(function() {bar.destroy();}, 2000);
			if (cb) {
				cb.call(scope || window, file, message.location);
			}
		}
		else {
			console.log(message);
		}

	},

	//private
	dispatch: function dispatch(data) {
		if (!data) {return;}

		var me = self.UploadUtils ? this : self;
		if (data.message === 'add') {
			me.upload(data.id, data.file, data.url);
		}
		else if (data.message === 'abort') {
			me.abort(data.id);
		}
	},

	//private
	abort: function abort(id) {
		var me = self.UploadUtils ? this : self,
			req = me.requests[id];

		delete me.requests[id];

		if (req && req.xhr) {
			req.xhr.onreadystatechange = null;
			req.xhr.abort();
		}
		else {
			me.postMessage('no request to abort: ' + id);
		}
	},

	//private
	upload: function upload(id, file, url) {

		function progress(e) {
			var p = e.loaded;
			if (e.lengthComputable) {
				p = Math.round(p / e.total);
			}
			me.postMessage({progress: p, id: id, message: e.type});
		}

		function readyStateChange(r) {
			if (r.readyState !== 4) { return; }
			me.postMessage({id: id, message: 'complete', location: r.getResponseHeader('Location')});
			delete me.requests[id];
		}

		function buildXHR() {
			var xhr = new XMLHttpRequest();
			xhr.upload.addEventListener('progress', progress, false);
			xhr.upload.addEventListener('load', progress, false);

			xhr.open('POST', url, true);
			xhr.withCredentials = true;
			xhr.setRequestHeader('Slug', file.name || file.fileName);
			xhr.setRequestHeader('Content-Type', file.type);
			xhr.onreadystatechange = function() {readyStateChange(xhr);};
			xhr.overrideMimeType(file.type);

			me.requests = me.requests || {};
			if (!me.requests[id]) {//if we're in a worker this won't exist yet
				me.requests[id] = { id: id, file: file, url: url };
			}
			me.requests[id].xhr = xhr;
			return xhr;
		}

		var me = self.UploadUtils ? this : self;

		buildXHR().send(file);
	},

	//private
	addUpload: function(id,file) {
		var me = this,
			mgr = me.getUploadManager(),
			panel,
			type = file.type;

		function cancel() {
			panel.destroy();
			try {
				me.worker.postMessage({message: 'abort', id: id});
			}
			catch (e) {
				console.error(e.stack);
			}
		}

		panel = mgr.add({
			border: false,
			layout: { type: 'hbox', align: 'middle' },
			anchor: '100%',
			defaults: { margin: 5 },
			listeners: { 'remove': function() {panel.destroy();} },
			items: [
				{html: '<div class="upload-icon ' + type + '"></div>', width: 32, height: 32, border: false, xtype: 'component'},
				{xtype: 'button', text: 'Cancel', handler: cancel}
			]
		});

		return panel.insert(1, {
			flex: 1,
			xtype: 'progressbar',
			text: file.fileName
		});
	},

	//private
	getUploadManager: function() {
		var me = this;
		if (!this.manager) {
			this.manager = Ext.widget('panel', {
				cls: 'file-upload-manager',
				title: 'Uploads',
				border: false,
				frame: true,
				floating: true,
				layout: 'anchor',
				padding: 10,
				closable: false,
				width: 0.3 * Ext.getBody().getWidth(),
				height: 0.3 * Ext.getBody().getHeight(),
				autoScroll: true,
				listeners: {
					'destroy': function() { delete me.manager; },
					'remove': function() {if (!me.manager.items.getCount()) {me.manager.destroy();}}
				}
			});
			this.manager.show();
			this.manager.alignTo(Ext.getBody(), 'br-br', [-10, -10]);
		}

		this.manager.toFront(true);
		return this.manager;
	}


}, function() {
	window.UploadUtils = this;
});
