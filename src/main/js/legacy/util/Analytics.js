const Ext = require('extjs');
const React = require('react');
const ReactDOM = require('react-dom');
const {createDOM} = require('nti-lib-dom');
const {Session} = require('nti-web-session');
const {wait} = require('nti-commons');

const ContextStateStore = require('legacy/app/context/StateStore');


module.exports = exports = Ext.define('NextThought.util.Analytics', {

	VIEWED_MAP: {},


	getContextRoot () {
		return this.getContext().first();
	},


	getContext () {
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


	beginSession () {
		if (this.mountPoint) {
			return this.sessionPromise;
		}

		this.mountPoint = createDOM({'data-analytics-session': true}/*, document.body*/);

		this.sessionPromise = new Promise(fulfill => {
			ReactDOM.render(
				React.createElement(Session, {ref: x => this.setSession(x, fulfill) }),
				this.mountPoint
			);
		});

		return this.sessionPromise;
	},


	getManager () {
		return this.manager;
	},


	async setSession (session, fulfill) {
		if (!session) {
			return;
		}

		while (!session.state.manager) {
			await wait();
		}

		this.manager = session.state.manager;

		fulfill && fulfill();
	},


	startEvent (resourceId, data) {
		if (typeof data === 'string') {
			data = {
				type: data
			};
		}

		const {type} = data;
		const Event = this.manager[type];

		if (!Event) {
			console.error('%o does not resolve to an event.', type);
			return;
		}

		if (!Event.start && !Event.send) {
			console.error('Attempting to send "%s" event, but it does not have start nor send methods.', type);
			return;
		}

		const context = this.getContext();
		const [first] = context;
		const {course} = data;

		data = {
			...data,
			context: [
				...(
					(course && first !== course)
						? [data.course]
						: []
				),
				...context
			],
			user: $AppConfig.username,
			ResourceId: resourceId,
		};


		this.VIEWED_MAP[resourceId] = true;

		if (Event.send) {
			Event.send(resourceId, data);
		} else {
			Event.start(resourceId, data);
		}
	},


	stopEvent (resourceId, type, data) {
		const Event = this.manager[type];
		if (!Event) {
			console.error('%o does not resolve to an event.', type);
			return;
		}
		if (!Event.stop) {
			console.error('Attempting to stop "%s" event, but it does not have a stop() method.', type);
			return;
		}

		Event.stop(resourceId, data);
	},


	sendEvent (resourceId, data) {
		this.startEvent(resourceId, data);
	},


	/**
	 * Whether or not we have sent a view event for an ntiid
	 * @param  {String}	 id Ntiid to check
	 * @return {Boolean}	[description]
	 */
	hasBeenViewed (id) {
		return this.VIEWED_MAP[id];
	}

}).create();
