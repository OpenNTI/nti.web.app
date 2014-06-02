Ext.define('NextThought.view.courseware.overview.parts.Discussion', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-discussion',

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
			i = config.locationInfo;

		config.data = {
			title: n.getAttribute('title'),
			icon: getURL(i.root + n.getAttribute('icon')),
			ntiid: n.getAttribute('ntiid').split(' '),
			label: n.getAttribute('label'),
			comments: 0,
			sublabel: 'Comment'
		};

		this.callParent([config]);
	},


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {},this.data);
		this.idsToLookup = Ext.clone(this.data.ntiid) || [];
		this.loadTopic(this.idsToLookup.shift());
	},

	afterRender: function() {
		this.callParent(arguments);
		this.shrinkText();
	},

	//if the title is overflowing take characters off until it will fit with the ellipsis
	shrinkText: function() {
		var title = this.el && this.el.down('.title'),
			text = title && title.dom.innerText;

		if (!text) { return; }

		while (title.getHeight() < title.dom.scrollHeight) {
			text = text.substr(0, text.length - 1);
			title.update(text + '<div class=\'ellipsis\'><div></div><div></div><div></div></div>');
		}
	},


	loadTopic: function(ntiid) {
		Service.getObject(ntiid,
			this.onTopicResolved,
			this.onTopicResolveFailure,
			this,
			true
		);
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
			this.fireEvent('goto-forum-item', this.topic);
		}
	}
});
