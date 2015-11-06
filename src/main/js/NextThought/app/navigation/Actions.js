Ext.define('NextThought.app.navigation.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.navigation.StateStore',
		'NextThought.util.Content',
		'NextThought.app.context.StateStore',
		'NextThought.model.PageInfo'
	],


	statics: {
		getContext: function() {
			if (!this.NavStateStore) {
				this.NavStateStore = NextThought.app.context.StateStore.getInstance();
			}

			return this.NavStateStore.getContext();
		},

		pushRootRoute: function(title, route, precache) {
			if (this.doPushRootRoute) {
				this.doPushRootRoute(title, route, precache);
			}
		},

		replaceRootRoute: function(title, route, precache) {
			if (this.doReplaceRootRoute) {
				this.doReplaceRootRoute(title, route, precache);
			}
		},

		navigateToHref: function(href) {
			var parts = href.split('#'),
				context = this.getContext(),
				newBase = parts[0],
				newFragment = parts[1],
				currentLocation = window.location.href,
				currentParts = currentLocation.split('#'),
				currentBase = currentParts[0],
				currentFragment = currentParts[1];

			//Are we an nttid?
			if (ParseUtils.isNTIID(newBase)) {
				//TODO: figure this out
				Ext.getBody().el.mask('Loading...');
				Service.getObject(newBase)
					.then(function(obj) {
						var i;
						//iterate backwards
						for (i = context.length - 1; i >= 0; i--) {
							if (context[i].cmp && context[i].cmp.navigateToObject) {
								context[i].cmp.navigateToObject(obj, newFragment)
									.then(function() {
										Ext.getBody().el.unmask();
									});
								break;
							}
						}
						//the first item with a cmp that implements navigateToObject
						//Ext.getBody().el.unmask()
					});

				return true;
			}

			//Is href an exteranl url whose base does not match the current base (i.e. not in our app)?
			if (ContentUtils.isExternalUri(href) &&
				(newBase.indexOf(currentBase) !== 0 || (/\/content\//.test(href) && !/\.html$/.test(href)))) {
				try {
					window.open(href, '_blank');
				}
				catch (er) {
					console.error('Unable to open ', href, 'with target _blank.', Globals.getError(href));
				}
				return true;
			//Even is the link is internal, if its a pdf we want to open it in a new tab
			//TODO: Should we open this in a new tab or the same tab?
			} else if (/\.pdf(\?.*|\#.*)?$/.test(href)) {
				try {
					window.open(href, '_blank');
				} catch (er) {
					console.error('Unable to open pdf ', href);
				}

				return true;
			}

			console.error('Expected href to be an interal url/hash change but it was', href, currentLocation);
			return false;
		},


		navigateToCardTarget: function(data, silent, callback, bundle) {
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


	constructor: function() {
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
	updateNavBar: function(config) {
		this.store.updateNavBar(config);
	},


	/**
	 * the active object to set the background from
	 *
	 * @param {Object} obj the thins to set active
	 */
	setActiveContent: function(obj, masked) {
		this.store.fireEvent('set-active-content', obj, masked);
	},



	markReturnPoint: function(route) {
		this.store.markReturnPoint(route);
	},


	/**
	 * Present a message in the main message bar
	 *
	 * Takes a config object:
	 *
	 * type: string // should be unique for each message.
	 * message: string // message or title of the message bar
	 * iconCls: string  // the class of the icon (warning, delete, ok...),
	 * buttons: array // action buttons to be added
	 * Each button has the following:
	 * 	{
	 * 		cls: string // name of the button class,
	 * 		action: string // name of the method to call on click,
	 * 		label: string // label of the button
	 * 	}
	 *
	 * @param  {Object} cfg configuration to build a message bar.
	 */
	presentMessageBar: function(cfg) {
		var messageCmp = Ext.getCmp('message-bar'),
			id = cfg.type || cfg.id,
			// hasBeenSeen = !!this.store.getMessageBarItemFromSession(id),
			htmlEl, me = this;

		if (messageCmp) {
			messageCmp.onceRendered
				.then(function() {
					messageCmp.setIcon(cfg.iconCls);
					messageCmp.setMessage(cfg.message);
					Ext.each(cfg.buttons || [], messageCmp.addButton.bind(messageCmp));
					messageCmp.closeHandler = cfg.closeHandler;

					htmlEl = Ext.query('.x-viewport')[0];
					if (htmlEl) {
						Ext.fly(htmlEl).addCls('msg-bar-open');
					}

					// if (id) {
					// 	me.store.putMessageBarItemIntoSession(id, cfg);
					// }
				});
		}
	}
});
