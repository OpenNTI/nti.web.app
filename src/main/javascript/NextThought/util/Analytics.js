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
		'thought-viewed': '',
		'note-viewed': '',
		'discussion-viewed': '',
		'course-catalog-viewed': ''
	},

	TIMER_MAP: {},

	batch: [],

	getResourceTimer: function(resourceId, data) {
		var now = new Date();

		if (Ext.isString(data)) {
			data = {
				type: data
			};
		}

		this.TIMER_MAP[resourceId + data.type] = {
			start: now,
			data: data
		};

		return id;
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
		data.time_length = (now - resource.start) / 1000;//send seconds back
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
		this.getResourceTimer = function() {};
		this.stopResourceTimer = function() {};
		this.sendBatch = function() {};
	}
	window.AnalyticsUtil = this;
});
