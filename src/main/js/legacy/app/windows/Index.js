const Ext = require('extjs');
const {wait} = require('@nti/lib-commons');

const StateStore = require('./StateStore');
const Actions = require('./Actions');

require('legacy/mixins/Router');
require('../annotations/note/Window');
require('./components/Container');


module.exports = exports = Ext.define('NextThought.app.windows.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.windows-view',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	activeWindows: [],
	layout: 'none',
	cls: 'window-container',

	items: [{
		xtype: 'window-container'
	}],

	initComponent: function () {
		this.callParent(arguments);

		this.WindowStore = StateStore.getInstance();
		this.WindowActions = Actions.create();

		this.WindowStore.addAllowNavigationHandler(this.allowNavigation.bind(this));

		this.viewContainer = this.down('window-container');

		this.onKeyPress = this.onKeyPress.bind(this);

		this.mon(this.WindowStore, {
			'show-window': this.showWindow.bind(this),
			'close-window': this.closeWindow.bind(this),
			'allow-navigation': this.allowNavigation.bind(this)
		});
	},

	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.el, 'click', this.onClick.bind(this));
	},

	allowNavigation: function () {
		var allow = true;

		this.viewContainer.items.each(function (item) {
			if (item && item.allowNavigation) {
				allow = item.allowNavigation();
			}

			return allow;
		});

		return allow;
	},


	setFullScreen () {
		this.addCls('full-screen');
	},


	removeFullScreen () {
		this.removeCls('full-screen');
	},

	showWindow: function (object, state, el, monitors, precache) {
		var type = this.WindowStore.getComponentForMimeType(object && (object.mimeType || object)),
			cmp;

		if (!type) {
			if (object && object.mimeType) {
				console.error('No component to show object of ', object.mimeType);
			} else {
				console.error('Unable to figure out how to show window');
			}

			this.WindowStore.fireReplaceOpenWindowRoute(object, state, '', '', precache);
			return;
		}

		this.removeFullScreen();

		cmp = type.create({
			record: object && object.isModel && object,//only pass a record when we have an object and it is a model
			precache: precache || {},
			state: state,
			doClose: this.doClose.bind(this, monitors && monitors.doClose, monitors && monitors.afterClose),
			doNavigate: this.doNavigate.bind(this, monitors && monitors.beforeNavigate),
			setFullScreen: this.setFullScreen.bind(this),
			monitors: monitors,
			scrollingParent: this.el
		});

		if (cmp.Router) {
			this.addChildRouter(cmp);
		}

		this.viewContainer.removeAll();
		cmp.addCls('object-window');

		if (cmp.doNotCenter) {
			this.activeWindows.push(this.add(cmp));
		} else {
			this.activeWindows.push(this.viewContainer.add(cmp));
		}

		document.body.addEventListener('keydown', this.onKeyPress);
		this.WindowStore.addOpenCls(cmp.isWindow);
	},

	onKeyPress: function (e) {
		var key = e.key || e.keyCode;
		if (key === Ext.EventObject.ESC) {
			this.closeAllWindows();
		}
	},

	onClick: function (e) {
		if (e.getTarget('.window-content')) { return; }
		this.closeAllWindows();
	},

	closeWindow: function () {
		this.activeWindows.forEach(function (win) {
			Ext.destroy(win);
		});
		this.viewContainer.removeAll();
		this.WindowStore.removeOpenCls();
	},

	closeAllWindows: function () {
		this.viewContainer.items.each(function (item) {
			item.doClose();
		});
	},

	doClose: function (doClose, afterClose, record) {

		if (doClose) {
			doClose();
		} else {
			this.WindowActions.closeWindow();
		}

		document.body.removeEventListener('keydown', this.onKeyPress);
		if (afterClose) {
			//give close a chance to finish before calling afterClose
			wait()
				.then(afterClose.bind(null, record));
		}
	},

	doNavigate: function (beforeNavigate, record) {
		this.WindowStore.navigateToObject(record);
	}
});
