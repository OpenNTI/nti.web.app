Ext.define('NextThought.app.course.overview.components.parts.Discussion', {
	extend: 'Ext.Component',
	alias: [
		'widget.course-overview-discussion',
		'widget.course-overview-discussionref'
	],

	requires: [
		'NextThought.model.Discussion',
		'NextThought.model.DiscussionRef'
	],

	mixins: {
		EllipsisText: 'NextThought.mixins.EllipsisText'
	},

	ui: 'course',
	cls: 'overview-discussion',

	containerCls: 'discussions',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'image', style: {backgroundImage: 'url({icon})'}},
		{ cls: 'meta', cn: [
			{ cls: 'label', html: '{label}'},
			{ cls: 'title', html: '{title}'},
			{ cls: 'comments', html: '{sublabel}'}
		]}
	]),


	listeners: {
		click: {
			element: 'el',
			fn: 'onClick'
		}
	},


	constructor: function(config) {
		var n = config.node || {getAttribute: function(a) { return config[a];} },
			i = config.locationInfo || {};

		config.data = {
			title: n.getAttribute('title'),
			icon: getURL((i.root || '') + n.getAttribute('icon')),
			ntiid: n.getAttribute('ntiid').split(' '),
			label: n.getAttribute('label'),
			comments: 0,
			sublabel: 'Comment'
		};

		this.callParent([config]);
	},


	getBundle: function() {
		var container = this.up('content-view-container');
		return container && container.currentBundle;
	},


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {},this.data);
		this.idsToLookup = Ext.clone(this.data.ntiid) || [];
		this.loadTopic(this.idsToLookup.shift());
		this.WindowActions = NextThought.app.windows.Actions.create();
	},

	afterRender: function() {
		this.callParent(arguments);

		this.ellipsisTitle();
	},


	ellipsisTitle: function() {
		var title = this.el.down('.title');

		if (title && title.dom) {
			this.truncateText(title.dom);
		}
	},


	loadTopic: function(ntiid) {
		var parsedId = ParseUtils.parseNTIID(ntiid),
			bundle = this.getBundle(),
			e;
		/*
		* Here is a hack.  The crux of which is to supply context about the subinstance we are in
		* when we resolving a topic. We do this primarily for instructors who may instruct multiple
		* subinstances that contain this discussion although strickly speaking it coudl happen for any
		* account type if the account is enrolled in multiple subinstances of a course that contain
		* the same named topic.  The issue is without the contexxt of the course we are in when the topic
		* is selected on the overview the server as multiple topics to choose from (one for each section)
		* and it is ambiguous as to which one to select.  Now the problem with this particular hack
		& is that when we are in a section but trying to get to the root (because the topics are set up
		* in the root rather than the section) the provider id no longer matches the root and we 404.  In most
		* cases the section is what contains the topic making this a non issue, but we now have courses where
		* the topic only exists in the parent.  We need another way to pass the context of the such that we
		* get the proper context in the event it is ambiguous.  While we have this in the context of a course (from
		* the overview or content) we aren't going to have this in the stream right?  I think this manifests
		* as course roulette but that is already a problem right?
		*/
		if (parsedId && (/^Topic:EnrolledCourse(Section|Root)$/).test(parsedId.specific.type)) {
			if (bundle && bundle.getCourseCatalogEntry) {
				e = bundle.getCourseCatalogEntry(); //this may not be filled in yet.
				parsedId.specific.$$provider = ((e && e.get('ProviderUniqueID')) || '').replace(/[\W\-]/g, '_');
				ntiid = parsedId.toString();
			} else {
				console.warn('Did not get the thing we were expecting...', bundle);
			}
		}

		Service.getObject(ntiid, this.onTopicResolved, this.onTopicResolveFailure, this, true);
	},


	onTopicResolved: function(topic) {
		if (!/topic$/i.test(topic.get('Class'))) {
			console.warn('Got something other than what we were expecting. Was expecting a Topic, got:', topic);
		}
		this.topic = topic;

		if (topic.get('TopicCount') !== undefined) {
			this.data.comments = topic.get('TopicCount');
			this.data.sublabel = Ext.util.Format.plural(this.data.comments, 'Discussion');
		}
		else if (topic.get('PostCount') !== undefined) {
			this.data.comments = topic.get('PostCount') || 0;
			this.data.sublabel = Ext.util.Format.plural(this.data.comments, 'Comment');
		}

		if (this.rendered) {
			this.renderTpl.overwrite(this.el, this.data);
			this.ellipsisTitle();
		}
	},


	onTopicResolveFailure: function() {
		console.warn('Could not load the topic object: ', arguments);

		if (!Ext.isEmpty(this.idsToLookup)) {
			this.loadTopic(this.idsToLookup.shift());
		}
	},


	onClick: function() {
		if (!this.topic) {
			alert('An error occurred showing this discussion.');
		}
		else {
			this.WindowActions.pushWindow(this.topic);
		}
	}
});
