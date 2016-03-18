var Ext = require('extjs');
var EventsPostReply = require('./PostReply');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.TopicReply', {
	extend: 'NextThought.app.profiles.user.components.activity.parts.events.PostReply',
	alias: [
		'widget.profile-activity-generalforumcomment-item',
		'widget.profile-activity-generalforumcomment-reply-item'
	],
	description: 'discussion',

	childEls: ['body', 'liked', 'pathEl'],


	pathTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'tpl', 'for': 'paths', cn: [
			{tag: 'span', html: '{.}'}
		]
	})),


	renderTpl: Ext.DomHelper.markup([
		{ cls: 'profile-activity-item', cn: [
			{ cls: 'path', id: '{id}-pathEl'},
			{ cls: 'item', style: 'padding:0;'}
		]},
		'{super}'
	]),

	initComponent: function() {
		this.callParent();
		this.addCls('x-container-profile');

		this.PathActions.getPathToObject(this.record)
			.then(this.fillInPath.bind(this));
		// this.fillInPath();
	},

	redraw: function() {
		if (!this.el) { return; }
		var path = this.pathEl.getHTML();
		this.callParent(arguments);

		this.pathEl.update(path);
	},


	fillInPath: function(path) {
		if (!this.rendered) {
			this.on('afterrender', this.fillInPath.bind(this, path));
			return;
		}

		var labels;

		labels = path.map(function(p) {
			return p.getTitle && p.getTitle();
		}).filter(function(p) { return !!p; });

		this.pathTpl.append(this.pathEl, {
			paths: labels
		});
	},


	onClick: function() {
		this.navigateToObject(this.record);
	}
});
