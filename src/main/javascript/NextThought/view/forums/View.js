Ext.define('NextThought.view.forums.View', {
	extend:   'NextThought.view.Base',
	alias:    'widget.forums-view-container',
	requires: [
		'NextThought.layout.container.Stack',
		'NextThought.view.forums.Board'
	],

	cls:        'forums-view',
	layout:     'stack',
	title:      'NextThought: Forums',
	typePrefix: 'forums',


	initComponent: function () {
		this.callParent(arguments);
		this.mon(this, 'beforedeactivate', this.onBeforeDeactivate, this);
		this.mon(this, 'beforeactivate', this.onBeforeActivate, this);
	},


	afterRender: function () {
		this.callParent(arguments);
		if (Ext.is.iPad) {
			// Absorb event for scrolling
			this.getEl().dom.addEventListener('touchmove', function (e) {
				e.stopPropagation();
			});
		}
	},


	restore: function (state) {
		this.fireEvent('restore-forum-state', state);
	},


	onBeforeDeactivate: function () {
//		console.log('Forum view received beforeDeactivate event');
		return Ext.Array.every(this.items.items, function (item) {
			return item.fireEvent('beforedeactivate');
		});
	},


	suspendActivateEvents: function () {
		this.getLayout().suspendStackActiveEvents = true;
	},


	resumeActivateEvents: function () {
		delete this.getLayout().suspendStackActiveEvents;
	},


	onBeforeActivate: function () {
//		console.log('Forum view received beforeActivate event');
		return Ext.Array.every(this.items.items, function (item) {
			return item.fireEvent('beforeactivate');
		});
	},


	finishedRestoring: function (state) {
		this.fireEvent('finished-restore');
	},


	getFragment: function () {
		// desired url format: !profile/u/:boardName/:ForumName/:topicName
		var items = this.getStackChildren(), path = [], base = '!forums', t;

		if (items.length >= 4) {
			path.push(items[3].record && items[3].record.get('ID'));
		}
		if (items.length >= 3) {
			path.push(items[2].record && items[2].record.get('ID'));
		}
		if (items.length >= 2) {
			t = items[1].record && items[1].record.get('Creator');
			if (t.isModel) {
				t = t.get('Username');
			}
			path.push(t);
		}
		if (items.length > 1) {
			path.push('u');
		}

		path = path.reverse();
		path.unshift(base);
		console.log('Forum path: ', path);
		return path.join('/');
	}
});
