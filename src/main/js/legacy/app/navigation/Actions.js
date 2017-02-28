var Ext = require('extjs');
var Globals = require('../../util/Globals');
var ParseUtils = require('../../util/Parsing');
var CommonActions = require('../../common/Actions');
var NavigationStateStore = require('./StateStore');
var UtilContent = require('../../util/Content');
var ContextStateStore = require('../context/StateStore');
var ModelPageInfo = require('../../model/PageInfo');


module.exports = exports = Ext.define('NextThought.app.navigation.Actions', {
	extend: 'NextThought.common.Actions',

	statics: {
		getContext: function () {
			if (!this.NavStateStore) {
				this.NavStateStore = NextThought.app.context.StateStore.getInstance();
			}

			return this.NavStateStore.getContext();
		},

		pushRootRoute: function (title, route, precache) {
			if (this.doPushRootRoute) {
				this.doPushRootRoute(title, route, precache);
			}
		},

		replaceRootRoute: function (title, route, precache) {
			if (this.doReplaceRootRoute) {
				this.doReplaceRootRoute(title, route, precache);
			}
		},

		navigateToHref: function (href) {
			var parts = href.split('#'),
				context = this.getContext(),
				newBase = parts[0],
				newFragment = parts[1];

			//If we are an NTIID find a component in the context
			//that can handle showing it
			if (ParseUtils.isNTIID(newBase)) {
				//TODO: figure this out
				Ext.getBody().el.mask('Loading...');
				Service.getObject(newBase)
					.then(function (obj) {
						var i;
						//iterate backwards
						for (i = context.length - 1; i >= 0; i--) {
							if (context[i].cmp && context[i].cmp.navigateToObject) {
								context[i].cmp.navigateToObject(obj, newFragment)
									.then(function () {
										Ext.getBody().el.unmask();
									});
								break;
							}
						}
						//the first item with a cmp that implements navigateToObject
						//Ext.getBody().el.unmask()
					})
					.catch(function (reason) {
						console.error('Failed to navigate to href: ', href, reason);
						alert('Unable to navigate to link.');
						Ext.getBody().el.unmask();
					});
			} else {
				//if we aren't an ntiid, just open the href in a new tab.
				try {
					window.open(href, '_blank');
				} catch (er) {
					console.error('Unable to open ', href, ' with target _blank.', Globals.getError(er));
				}
			}

			return true;
		},


		navigateToCardTarget: function (data, silent, callback, bundle) {
			var ntiid = data.ntiid,
				postfix = data.notTarget ? '' : '-target',
				DH = Ext.DomHelper,
				s = encodeURIComponent('Pages(' + ntiid + ')'),
				u = encodeURIComponent($AppConfig.username),
				context = this.getContext(), i;

			pi = NextThought.model.PageInfo.create({
				ID: ntiid,
				NTIID: ntiid,
				content: DH.markup([
					{tag: 'head', cn: [
						{tag: 'title', html: data.title},
						{tag: 'meta', name: 'icon', content: data.thumbnail}
					]},
					{tag: 'body', cn: {
						cls: 'page-contents no-padding',
						cn: Ext.applyIf({
							tag: 'object',
							cls: 'nticard' + postfix,
							type: 'application/vnd.nextthought.nticard' + postfix,
							'data-ntiid': ntiid,
							html: DH.markup([
								{tag: 'img', src: data.thumbnail},
								{tag: 'span', cls: 'description', html: data.description}
							])
						}, data.asDomSpec())
					}}
				]),
				Links: [
					{
						Class: 'Link',
						href: '/dataserver2/users/' + u + '/' + s + '/UserGeneratedData',
						rel: 'UserGeneratedData'
					}
				]
			});

			for (i = context.length - 1; i >= 0; i--) {
				if (context[i].cmp && context[i].cmp.navigateToObject) {
					context[i].cmp.navigateToObject(pi);
					break;
				}
			}
		}
	},

	constructor: function () {
		this.store = NextThought.app.navigation.StateStore.getInstance();
	},

	/**
	 * Takes an object config
	 *
	 * cmp: Ext.Component, //a component to render in the header, tabs are ignored if this is present
	 * hideBranding: Boolean, //if true hide the environment branding and show a back button
	 * noLibraryLink: Boolean, //if true don't let the branding link to the library
	 * noRouteOnSearch: Boolean, //if true don't do a navigation on search, should really only be used by the search route
	 *
	 * @param  {Object} configuration to build the nav
	 */
	updateNavBar: function (config) {
		this.store.updateNavBar(config);
	},


	/**
	 * the active object to set the background from
	 *
	 * @param {Object} obj the thins to set active
	 */
	setActiveContent: function (obj, masked, whiteMask) {
		this.store.fireEvent('set-active-content', obj, masked, whiteMask);
	},

	markReturnPoint: function (route) {
		this.store.markReturnPoint(route);
	},

	/**
	 * Present a message in the main message bar
	 *
	 * Takes a config object:
	 *
	 * type: string // should be unique for each message.
	 * message: string // message or title of the message bar
	 * iconCls: string	// the class of the icon (warning, delete, ok...),
	 * buttons: array // action buttons to be added
	 * Each button has the following:
	 *	{
	 *		cls: string // name of the button class,
	 *		action: string // name of the method to call on click,
	 *		label: string // label of the button
	 *	}
	 *
	 * @param  {Object} cfg configuration to build a message bar.
	 */
	presentMessageBar: function (cfg) {
		var messageCmp = Ext.getCmp('message-bar'),
			id = cfg.type || cfg.id,
			// hasBeenSeen = !!this.store.getMessageBarItemFromSession(id),
			htmlEl, me = this;

		if (messageCmp) {
			messageCmp.onceRendered
				.then(function () {
					messageCmp.setIcon(cfg.iconCls);
					messageCmp.setMessage(cfg.message);
					Ext.each(cfg.buttons || [], messageCmp.addButton.bind(messageCmp));
					messageCmp.closeHandler = cfg.closeHandler;

					htmlEl = Ext.query('.x-viewport')[0];
					if (htmlEl) {
						Ext.fly(htmlEl).addCls('msg-bar-open');
					}

					// if (id) {
					//	me.store.putMessageBarItemIntoSession(id, cfg);
					// }
				});
		}
	},


	closeMessageBar: function() {
		var messageCmp = Ext.getCmp('message-bar');

		if (messageCmp) {
			messageCmp.close();
		}
	}
});
