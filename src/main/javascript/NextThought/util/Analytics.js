Ext.define('NextThought.util.Analytics', {
	singleton: true,

	requires: [
		'NextThought.util.Globals'
	],

	BATCH_TIME: 10000,

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


	getResourceTimer: function(resourceId, data) {
		var now = new Date();

		if (Ext.isString(data)) {
			data = {
				type: data
			};
		}

		data.context_path = this.getContext();

		this.TIMER_MAP[resourceId + data.type] = {
			start: now,
			data: data
		};

		return id;
	},


	fillInData: function(resource, data) {
		var now = new Date();

		data.time_length = (now - resource.start) / 1000;

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

		data.resource_id = resourceId;

		if (this.FILL_IN_MAP[data.type]) {
			data = this[this.FILL_IN_MAP[data.type]].call(this, resource, data);
		} else {
			data = this.fillInData(resource, data);
		}

		if (data.course) {
			data.context_path.unshift(data.course);
		}

		data.MimeType = this.TYPE_TO_MIMETYPE[data.type];
		data.user = $AppConfig.username;
		data.timestamp = now.getTime() / 1000;//send seconds back

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
	}
}, function() {

	if (!isFeature('capture-analytics')) {
		this.addContext = function() {};
		this.getResourceTimer = function() {};
		this.stopResourceTimer = function() {};
		this.sendBatch = function() {};
	}
	window.AnalyticsUtil = this;
});
