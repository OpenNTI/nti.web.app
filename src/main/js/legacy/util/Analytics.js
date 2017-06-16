const Ext = require('extjs');
const {wait} = require('nti-commons');

const ContextStateStore = require('../app/context/StateStore');

const Globals = require('./Globals');
const PageVisibility = require('./Visibility');

const {isFeature} = Globals;


module.exports = exports = Ext.define('NextThought.util.Analytics', {

	mixins: {
		observable: 'Ext.util.Observable'
	},

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
		'course-catalog-viewed': true,
		'assignment-viewed': true,
		'assessment-viewed': true,
		'profile-about-viewed': true,
		'profile-activity-viewed': true,
		'profile-membership-viewed': true
	},

	TYPE_TO_MIMETYPE: {
		'video-watch': 'application/vnd.nextthought.analytics.watchvideoevent',
		'video-skip': 'application/vnd.nextthought.analytics.skipvideoevent',
		'video-speed-change': 'application/vnd.nextthought.analytics.videoplayspeedchange',
		'assessment': '',
		'resource-viewed': 'application/vnd.nextthought.analytics.resourceevent',
		'thought-viewed': 'application/vnd.nextthought.analytics.blogviewevent',
		'note-viewed': 'application/vnd.nextthought.analytics.noteviewevent',
		'discussion-viewed': 'application/vnd.nextthought.analytics.topicviewevent',
		'course-catalog-viewed': 'application/vnd.nextthought.analytics.coursecatalogviewevent',
		'assessment-viewed': 'application/vnd.nextthought.analytics.selfassessmentviewevent',
		'assignment-viewed': 'application/vnd.nextthought.analytics.assignmentviewevent',
		'profile-about-viewed': 'application/vnd.nextthought.analytics.profileviewevent',
		'profile-activity-viewed': 'application/vnd.nextthought.analytics.profileactivityviewevent',
		'profile-membership-viewed': 'application/vnd.nextthought.analytics.profilemembershipviewevent'
	},

	FILL_IN_MAP: {
		'video-watch': 'fillInVideo',
		'video-skip': 'fillInVideo'
	},

	TIMER_MAP: {},
	VIEWED_MAP: {},
	batch: [],
	context: [],

	constructor: function (config) {
		this.callParent(arguments);

		this.mixins.observable.constructor.call(this, config);

		if (!isFeature('no-analytic-end') && isFeature('capture-analytics')) {
			window.addEventListener('beforeunload', this.endSession.bind(this));
			this.mon(PageVisibility, 'inactive', this.endSession.bind(this));
			this.mon(PageVisibility, 'active', this.beginSession.bind(this));
		}
	},

	addContext: function (/*context, isRoot*/) {},

	getContextRoot: function () {
		return this.getContext().first();
	},

	getContext: function () {
		var ContextSS = ContextStateStore.getInstance(),
			contextObjects = ContextSS.getContext(),
			contextStrings = [];

		function mapContextObjectToAnalyticContextString (contextPart) {
			var contextObject = contextPart && contextPart.obj,
				contextCmp = contextPart && contextPart.cmp,
				contextStr = null;

			if (contextObject && Ext.isFunction(contextObject.get)) {
				contextStr = contextObject.get('NTIID');
			}
			if (!contextStr) {
				contextStr = contextCmp && contextCmp.contextIdentifier;
			}

			return contextStr;
		}

		contextStrings = Ext.Array.map(contextObjects, mapContextObjectToAnalyticContextString);
		contextStrings = Ext.Array.filter(contextStrings, function (str) {return !Ext.isEmpty(str);});
		return contextStrings || [];
	},

	beginSession: function () {
		//if we've already started one don't start another
		if (this['session_started']) { return; }

		var me = this,
			collection = Service.getWorkspace('Analytics'),
			links = collection && collection.Links,
			url = links && Service.getLinkFrom(links, 'analytics_session');

		if (url) {
			Service.post(url)
				.then(function () {
					me['session_started'] = true;
					console.log('Analytics session started.');
				})
				.catch(function () {
					console.error('Failed to start analytic session: ', arguments);
				});
		} else {
			this.addContext = function () {};
			this.beginSession = function () {};
			this.getResourceTimer = function () {};
			this.stopResourceTimer = function () {};
			this.sendBatch = function () {};
		}
	},

	endSession: function () {
		this.closeOnGoing();

		var collection = typeof Service === 'undefined' ? null : Service.getWorkspace('Analytics'),
			links = collection && collection.Links,
			link = links && Service.getLinkFrom(links, 'end_analytics_session'),
			xmlhttp = new XMLHttpRequest();

		if (!link) {
			console.error('No Link for end analytics session');
			return;
		}

		xmlhttp.open('POST', link, false);
		xmlhttp.setRequestHeader('Content-Type', 'application/json');
		xmlhttp.send(JSON.stringify({
			MimeType: 'application/vnd.nextthought.analytics.batchevents',
			events: this.batch
		}));

		this['session_started'] = false;
	},

	getResourceTimer: function (resourceId, data) {
		var now = new Date();

		if (Ext.isString(data)) {
			data = {
				type: data
			};
		}

		data['context_path'] = this.getContext();
		data.timestamp = now.getTime() / 1000;//send seconds back
		data.MimeType = this.TYPE_TO_MIMETYPE[data.type];
		data.user = $AppConfig.username;
		data.ResourceId = resourceId;
		data.RootContextID = data.RootContextId || data['context_path'][0] || '';

		if (data.course && data['context_path'].first() !== data.course) {
			data['context_path'].unshift(data.course);
		}

		//if we need to track this type client side add it to the map
		if (this.TYPES_TO_TRACK[data.type]) {
			this.VIEWED_MAP[resourceId] = true;
		}

		this.TIMER_MAP[resourceId + data.type] = {
			start: now,
			data: data
		};

		//if we need to send this event when it starts send it
		if (this.START_EVENT_TYPES[data.type]) {
			this.batch.push(data);
			this.__maybeStartBatchTimer();
		}
	},

	fillInData: function (resource, data) {
		var now = new Date();

		data['time_length'] = (now - resource.start) / 1000;//send seconds back

		return data;
	},

	fillInVideo: function (resource, data) {
		data['time_length'] = Math.abs(data.video_end_time - data.video_start_time);

		return data;
	},

	maybePush: function (data) {
		//if the data isn't for an event that adds a resource when it
		//is started, then we know its not going to be in the batch yet
		if (!this.START_EVENT_TYPES[data.type]) {
			delete data.isStart;
			this.batch.push(data);
			return;
		}

		//if a resource is added on start, check if we've sent it to the
		//server yet. (look if its still in the batch)
		var notInBatch = this.batch.every(function (item) {
			return item !== data;
		});

		//if its not in the batch add it
		if (notInBatch) {
			this.batch.push(data);
		}
	},

	stopResourceTimer: function (resourceId, type, data, doNotStartTimer) {
		var resource = this.TIMER_MAP[resourceId + type];

		data = data || {};

		if (!resource) {
			console.error('No resource for ID: ', resourceId);
			return;
		}

		data = Ext.applyIf(data, resource.data);

		if (this.FILL_IN_MAP[data.type]) {
			data = this[this.FILL_IN_MAP[data.type]].call(this, resource, data);
		} else {
			data = this.fillInData(resource, data);
		}

		this.maybePush(data);

		if (!doNotStartTimer) {
			this.__maybeStartBatchTimer();
		}

		//remove the resource from the timer map, since its already in the batch
		delete this.TIMER_MAP[resourceId + type];
	},

	addResource: function (resourceId, data) {
		var now = new Date();

		if (Ext.isString(data)) {
			data = {
				type: data
			};
		}

		data['context_path'] = this.getContext();
		data.timestamp = now.getTime() / 1000;//send seconds back
		data.MimeType = this.TYPE_TO_MIMETYPE[data.type];
		data.user = $AppConfig.username;
		data.ResourceId = resourceId;

		this.maybePush(data);
		this.__maybeStartBatchTimer();

	},

	__maybeStartBatchTimer: function () {
		if (!this.batchTimer) {
			this.batchTimer = wait(this.BATCH_TIME)
				.then(this.sendBatch.bind(this));
		}
	},

	__getURL: function () {
		if (this.url) { return this.url; }

		var collection = Service.getWorkspace('Analytics'),
			links = collection && collection.Links,
			link = links && Service.getLinkFrom(links, 'batch_events');

		this.url = link;

		return this.url;
	},

	sendBatch: function () {
		var me = this,
			url = me.__getURL();

		if (!url) {
			console.error('No url to send the analytics batch to');
			return Promise.reject('No url to send analytics batch to');
		}

		delete this.batchTimer;

		return Service.post(url, {
			MimeType: 'application/vnd.nextthought.analytics.batchevents',
			events: this.batch
		})
			.then(function () {
				me.batch = [];
			})
			.catch(function (response) {
				console.error('Failed to save the analytic batch', response, me.batch);
			});
	},

	closeOnGoing: function () {
		var key, resource;

		for (key in this.TIMER_MAP) {
			if (this.TIMER_MAP.hasOwnProperty(key)) {
				resource = this.TIMER_MAP[key];

				this.stopResourceTimer(resource.data.ResourceId, resource.data.type, null, true);
			}
		}
	},

	__SuperTopSecretFn: function (name) {
		var cookieName = 'nti.auth_tkt',
			cookieValue = Ext.util.Cookies.get(cookieName) || '';

		if (name && cookieValue.indexOf('!' + name) > 0) {
			this.addContect = function () {};
			this.beginSession = function () {};
			this.getResourceTimer = function () {};
			this.stopResourceTimer = function () {};
			this.sendBatch = function () {};
		}
	},

	/**
	 * Whether or not we have sent a view event for an ntiid
	 * @param  {String}	 id Ntiid to check
	 * @return {Boolean}	[description]
	 */
	hasBeenViewed: function (id) {
		return this.VIEWED_MAP[id];
	}
}, function () {
	if (!isFeature('capture-analytics')) {
		this.addContext = function () {};
		this.beginSession = function () {};
		this.getResourceTimer = function () {};
		this.stopResourceTimer = function () {};
		this.sendBatch = function () {};
	}
}).create();
