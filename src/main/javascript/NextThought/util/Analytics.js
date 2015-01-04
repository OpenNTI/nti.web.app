Ext.define('NextThought.util.Analytics', {
	singleton: true,

	requires: [
		'NextThought.util.Globals',
		'Ext.util.Cookies'
	],

	BATCH_TIME: 10000,

	TYPES_TO_TRACK: {
		'video-watch': true,
		'resource-viewed': true,
		'discussion-viewed': true
	},

	//types we need to send an event when it starts
	START_EVENT_TYPES: {
		'video-watch': true,
		'resource-viewed': true,
		'thought-viewed': true,
		'note-viewed': true,
		'discussion-viewed': true,
		'course-catalog-viewed': true
	},

	VIEWED_MAP: {},

	TYPE_TO_MIMETYPE: {
		'video-watch': 'application/vnd.nextthought.analytics.watchvideoevent',
		'video-skip': 'application/vnd.nextthought.analytics.skipvideoevent',
		'assessment': '',
		'resource-viewed': 'application/vnd.nextthought.analytics.resourceevent',
		'thought-viewed': 'application/vnd.nextthought.analytics.blogviewevent',
		'note-viewed': 'application/vnd.nextthought.analytics.noteviewevent',
		'discussion-viewed': 'application/vnd.nextthought.analytics.topicviewevent',
		'course-catalog-viewed': 'application/vnd.nextthought.analytics.coursecatalogviewevent'
	},

	FILL_IN_MAP: {
		'video-watch': 'fillInVideo',
		'video-skip': 'fillInVideo'
	},

	TIMER_MAP: {},

	batch: [],
	context: [],


	addContext: function(context, isRoot) {
		if (!context) {
			this.context = [];
			return;
		}

		if (isRoot) {
			this.context = [];
		}

		this.context.push(context);
	},


	getContextRoot: function() {
		return this.context[0];
	},


	getContext: function() {
		return this.context;
	},


	beginSession: function() {
		var collection = Service.getWorkspace('Analytics'),
			links = collection && collection.Links,
			url = links && Service.getLinkFrom(links, 'analytics_session');

		if (url) {
			Service.post(url)
				.then(function() {
					console.log('Analytics session started.');
				})
				.fail(function() {
					console.error('Failed to start analytic session: ', arguments);
				});
		}
	},


	getResourceTimer: function(resourceId, data) {
		var now = new Date();

		if (Ext.isString(data)) {
			data = {
				type: data
			};
		}

		data.context_path = this.getContext();
		data.timestamp = now.getTime() / 1000;//send seconds back
		data.MimeType = this.TYPE_TO_MIMETYPE[data.type];
		data.user = $AppConfig.username;
		data.resource_id = resourceId;

		if (data.course) {
			data.context_path.unshift(data.course);
		}



		this.TIMER_MAP[resourceId + data.type] = {
			start: now,
			data: data
		};

		if (this.START_EVENT_TYPES[data.type]) {
			this.batch.push(data);
			this.__maybeStartBatchTimer();
		}
	},


	fillInData: function(resource, data) {
		var now = new Date();

		data.time_length = (now - resource.start) / 1000;//send seconds back

		return data;
	},


	fillInVideo: function(resource, data) {
		data.time_length = Math.abs(data.video_end_time - data.video_start_time);

		return data;
	},


	stopResourceTimer: function(resourceId, type, data) {
		var resource = this.TIMER_MAP[resourceId + type],
			now = new Date();

		data = data || {};

		if (!resource) {
			console.error('No resource for ID: ', id);
			return;
		}

		data = Ext.applyIf(data, resource.data);

		if (this.FILL_IN_MAP[data.type]) {
			data = this[this.FILL_IN_MAP[data.type]].call(this, resource, data);
		} else {
			data = this.fillInData(resource, data);
		}

		if (this.TYPES_TO_TRACK[data.type]) {
			this.VIEWED_MAP[resourceId] = true;
		}

		this.batch.push(data);

		this.__maybeStartBatchTimer();
	},


	__maybeStartBatchTimer: function() {
		if (!this.batchTimer) {
			this.batchTimer = wait(this.BATCH_TIME)
				.then(this.sendBatch.bind(this));
		}
	},


	__getURL: function() {
		if (this.url) { return this.url; }

		var collection = Service.getWorkspace('Analytics'),
			links = collection && collection.Links,
			link = links && Service.getLinkFrom(links, 'batch_events');

		this.url = link;

		return this.url;
	},


	sendBatch: function() {
		var me = this,
			url = me.__getURL();

		if (!url) {
			console.error('No url to send the analytics batch to');
			return;
		}

		delete this.batchTimer;

		Service.post(url, {
			MimeType: 'application/vnd.nextthought.analytics.batchevents',
			events: this.batch
		})
			.then(function(response) {
				me.batch = [];
			})
			.fail(function(response) {
				console.error('Failed to save the analytic batch', response, me.batch);
			});
	},


	__SuperTopSecretFn: function(name) {
		var cookieName = 'nti.auth_tkt',
			cookieValue = Ext.util.Cookies.get(cookieName) || '';

		if (name && cookieValue.indexOf('!' + name) > 0) {
			this.addContect = function() {};
			this.beginSession = function() {};
			this.getResourceTimer = function() {};
			this.stopResourceTimer = function() {};
			this.sendBatch = function() {};
		}
	},

	/**
	 * Whether or not we have sent a view event for an ntiid
	 * @param  {String}  id Ntiid to check
	 * @return {Boolean}    [description]
	 */
	hasBeenViewed: function(id) {
		return this.VIEWED_MAP[id];
	}
}, function() {

	if (!isFeature('capture-analytics')) {
		this.addContext = function() {};
		this.beginSession = function() {};
		this.getResourceTimer = function() {};
		this.stopResourceTimer = function() {};
		this.sendBatch = function() {};
	}
	window.AnalyticsUtil = this;
});
