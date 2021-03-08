const PropTypes = require('prop-types');
const React = require('react');
const ReactDOM = require('react-dom');
const createReactClass = require('create-react-class');

const Ext = require('@nti/extjs');
const { getService, reportError } = require('@nti/web-client');
const { Error: ErrorCmp, Theme, Utils } = require('@nti/web-commons');
const { encodeForURI } = require('@nti/lib-ntiids');
const { getHistory, LinkTo } = require('@nti/web-routing');
const { Models } = require('@nti/lib-interfaces');
const AccountActions = require('internal/legacy/app/account/Actions');
const AnalyticsUtil = require('internal/legacy/util/Analytics');
const ParsingUtils = require('internal/legacy/util/Parsing');
const User = require('internal/legacy/model/User');
const ContextStore = require('internal/legacy/app/context/StateStore');
const ChatActions = require('internal/legacy/app/chat/Actions');

const unwrap = x => (x && x.default ? x.default : x);

const CATALOG_MIME_TYPES = {
	'application/vnd.nextthought.courses.catalogentry': true,
	'application/vnd.nextthought.courses.coursecataloglegacyentry': true,
	'application/vnd.nextthought.courseware.coursecataloglegacyentry': true,
};

const BOOK_MIME_TYPES = {
	'application/vnd.nextthought.publishablecontentpackagebundle': true,
	'application/vnd.nextthought.contentpackagebundle': true,
};

const GROUP_MIME_TYPE = 'application/vnd.nextthought.dynamicfriendslist';
const COMMUNITY_MIME_TYPE = 'application/vnd.nextthought.community';

function lazyReject(reason) {
	return {
		catch(f) {
			return Promise.resolve(f?.(reason));
		},
		then(a, b) {
			return Promise.resolve(b?.(reason) ?? Promise.reject(reason));
		},
	};
}

function getRouteFor(obj, context) {
	if (!obj) {
		return null;
	}

	if (obj.type === 'contact-support') {
		return () => {
			const actions = AccountActions.create();

			actions.showContactUs();
		};
	}

	if (obj.type === 'redeem-course-code') {
		return '/app/catalog/redeem';
	}

	if (obj.isUser) {
		if (context === 'open-chat') {
			return () => {
				const user = ParsingUtils.parseItems([obj.toJSON()])[0];
				const chatActions = ChatActions.create();

				chatActions.startChat(user);
			};
		}

		return `/app/user/${User.getUsernameForURL(obj.Username)}`;
	}

	if (obj instanceof Models.courses.Grade) {
		return `/app/id/${encodeForURI(obj.NTIID)}`;
	}

	if (obj.CatalogEntry) {
		return `/app/course/${encodeForURI(obj.NTIID)}/info`;
	}

	if (BOOK_MIME_TYPES[obj.MimeType]) {
		return `/app/bundle/${encodeForURI(obj.NTIID)}`;
	}

	if (CATALOG_MIME_TYPES[obj.MimeType]) {
		const href = `uri:${obj.href}`;
		return `./object/${encodeURIComponent(href)}`;
	}

	if (obj.MimeType === GROUP_MIME_TYPE) {
		return `/app/group/${encodeForURI(obj.NTIID)}/info`;
	}

	if (obj.MimeType === COMMUNITY_MIME_TYPE) {
		if (obj.isCourseCommunity) {
			return `/app/course/${encodeForURI(obj.courseId)}/community`;
		} else {
			return `/app/community/${encodeURIComponent(obj.Username)}`;
		}
	}
}

/*
 * Bridge React Component so we can pass environment contexts down to components in React.
 */
const Bridge = createReactClass({
	propTypes: {
		bundle: PropTypes.object,
		baseroute: PropTypes.string,
		children: PropTypes.any,
		setRouteViewTitle: PropTypes.func,
		getRouteFor: PropTypes.func,
		addHistory: PropTypes.bool,
		addRouteTo: PropTypes.bool,
		themeScope: PropTypes.string,
	},

	getInitialState() {
		return {
			baseroute: this.props.baseroute,
			themeScope: this.props.themeScope,
		};
	},

	childContextTypes: {
		defaultEnvironment: PropTypes.object,
		routerLinkComponent: PropTypes.func,
		router: PropTypes.object,
		course: PropTypes.object,
		stickyTopOffset: PropTypes.number,
		analyticsManager: PropTypes.object,
		setRouteViewTitle: PropTypes.func,
	},

	getChildContext() {
		const bundle =
			this.props.bundle || ContextStore.getInstance().getRootBundle();

		let router = {
			makeHref: x => x,
			baseroute: this.state.baseroute,
			getRouteFor: this.props.getRouteFor,
		};

		if (this.props.addHistory) {
			router.history = getHistory();
		}

		if (this.props.addRouteTo) {
			router.routeTo = {
				object: (...args) => LinkTo.Object.routeTo(router, ...args),
			};
		}

		return {
			analyticsManager: AnalyticsUtil.getManager(),
			defaultEnvironment: {
				getPath: () => '',
				setPath: () => {},
			},
			routerLinkComponent: () => {},
			router,
			setRouteViewTitle: this.props.setRouteViewTitle,
			course: bundle && {
				getAssignment(ntiid) {
					return getService().then(reactService => {
						const link = bundle.getAssessmentURL(ntiid);

						return Service.request(link).then(resp => {
							const json = JSON.parse(resp);

							return reactService.getObject(json);
						});
					});
				},
			},
			stickyTopOffset:
				window['nti-sticky-top-offset'] &&
				window['nti-sticky-top-offset'](),
		};
	},

	setBaseRoute(baseroute) {
		this.setState({ baseroute });
	},

	setThemeScope(scope) {
		this.setState({ themeScope: scope, time: Date.now() });
	},

	componentDidCatch(error, info) {
		this.setState({ error, info, hasError: true });
		reportError(error);
	},

	render() {
		if (this.state.hasError) {
			return React.createElement(
				ErrorCmp,
				this.state,
				'Something went wrong.'
			);
		}
		const { themeScope } = this.state;
		const content = React.Children.only(this.props.children);

		if (!themeScope) {
			return content;
		}

		return <Theme.Scope scope={themeScope}>{content}</Theme.Scope>;
	},
});

/*
 * ReactHarness. Mount React Components in ExtJS.
 *
 * To use, simply:
 *
 *	 let ref = Ext.widget({renderTo: this.el, xtype: 'react', component: MyReactComponent, ...props});
 *
 * or in a container:
 *
 *	items: [
 *		{xtype: 'react', component: MyReactComponent, ...props},
 *	],
 *
 * or:
 *
 *	this.ref = this.add({xtype: 'react', component: MyReactComponent, ...props});
 *
 * You can also extend the ReactHarness and hard-code the Component config property.
 */
module.exports = exports = Ext.define('NextThought.ReactHarness', {
	extend: 'Ext.Component',
	alias: 'widget.react',

	/**
	 * @cfg {React.Component} component
	 */

	onMsgBarUpdated() {
		this.bridgeInstance && this.bridgeInstance.forceUpdate();
	},

	initComponent() {
		this.callParent(arguments);

		Ext.getCmp('viewport').on('msg-bar-opened', () =>
			this.onMsgBarUpdated()
		);
		Ext.getCmp('viewport').on('msg-bar-closed', () =>
			this.onMsgBarUpdated()
		);

		this.setRouteViewTitle = this.setRouteViewTitle.bind(this);
	},

	/**
	 * @cfg {...} ...  Any additional config properties will be pased as props to the component.
	 */

	getProps() {
		const { initialConfig: config } = this;
		const props = { ...config };

		const blacklist = [
			'component',
			'cls',
			'renderTo',
			'xtype',
			'baseroute',
		];

		for (let prop of blacklist) {
			delete props[prop];
		}

		return props;
	},

	/**
	 * The primary way to update a component's props. DO NOT externally call setState() unless you
	 * KNOW what you are doing!
	 * @param {Object} props - The props for the given component.
	 * @param {boolean} skipIfUnchanged - Don't re-render if props haven't changed. (Shallow comparison)
	 * @returns {void}
	 */
	setProps(props, skipIfUnchanged) {
		const changed = () =>
			Object.entries(props || {}).some(
				([key, value]) => this.initialConfig[key] !== props[key]
			);

		if (skipIfUnchanged && !changed()) {
			return;
		}

		this.initialConfig = { ...this.initialConfig, ...props };

		// There is no need to register an 'afterrender' handler nor
		// onceRendered.then(). Its okay to drop the doRender on the floor.
		// We've merged the props into the config. When the Ext component
		// does render, it will be up to date.
		if (this.rendered) {
			this.doRender();
		}
	},

	afterRender() {
		this.callParent(arguments);
		//See Element_style.js in ExtJS source... they have a selectstart listener that stomps on us.
		//This class tells that handler to piss off...
		this.el.addCls(Ext.Element.selectableCls);
		this.doRender();
	},

	getHarnessRouteFor(...args) {
		const config = this.initialConfig.getRouteFor
			? this.initialConfig.getRouteFor(...args)
			: null;

		return config || getRouteFor(...args);
	},

	/**
	 * @private
	 *
	 * Executes ReactDOM.render with the current props. If the component is already mounted, it will reuse and update.
	 * @returns {void}
	 */
	doRender() {
		//Only check to see if Ext has rendered the component's <div> React will control everything under it.
		if (!this.el) {
			return;
		}

		const { initialConfig: config } = this;
		const component = unwrap(config.component);

		const props = this.getProps();

		ReactDOM.render(
			React.createElement(
				Bridge,
				{
					bundle: this.bundle,
					baseroute: this.baseroute,
					setRouteViewTitle: this.setRouteViewTitle,
					ref: x => (this.bridgeInstance = x),
					getRouteFor: (...args) => this.getHarnessRouteFor(...args),
					addHistory: config.addHistory,
					addRouteTo: config.addRouteTo,
					themeScope: this.themeScope,
				},
				// The ref will be called on mount with the instance of the component.
				// The ref will be called on unmount with null.
				// React will reuse the Component's instance while its mounted.
				// Calling doRender is the primary way to update the component with new props.
				React.createElement(component, {
					...props,
					...(Utils.maybeSupportsRefs(component)
						? {
								ref: x => (this.componentInstance = x),
						  }
						: {}),
				})
			),
			Ext.getDom(this.el)
		);
	},

	onRouteActivate() {
		this.doRender();
	},

	onRouteDeactivate() {
		this.unmount();
	},

	unmount() {
		// console.debug('Unmounting React Component');

		if (this.el) {
			ReactDOM.unmountComponentAtNode(Ext.getDom(this.el));
		}
	},

	beforeDestroy() {
		this.onceRendered = lazyReject(new Error('Destroyed'));
		this.unmount();
	},

	setBaseRoute(baseroute) {
		this.bridgeInstance.setBaseRoute(baseroute);
	},

	setThemeScope(scope) {
		this.bridgeInstance.setThemeScope(scope);
	},

	/**
	 * @private This is NOT the primary way to communicate with the React component. Use setProps()
	 * This is here primarily as an example of ways to interact with the component. nothing more.
	 *
	 * Merges the imput state with the current state.
	 * @param {Object} state new state values
	 * @returns {void}
	 */
	setState(state) {
		console.warn(
			'Use setProps(), not setState().  The state-manipulations are internal to the react component. Props are external.'
		);
		this.onceRendered.then(() => this.componentInstance.setState(state));
	},

	/**
	 * @private This is NOT the primary way to communicate with the React component. use setProps()
	 * This is here primarily as an example of ways to interact with the component. nothing more.
	 *
	 * Replaces the entire state object.
	 * @param {Object} state new state values
	 * @returns {void}
	 */
	replaceState(state) {
		console.warn(
			'Use setProps(), not setState().  The state-manipulations are internal to the react component. Props are external.'
		);
		this.onceRendered.then(() =>
			this.componentInstance.replaceState(state)
		);
	},

	setRouteViewTitle(title) {
		if (this.setTitle) {
			this.setTitle(title);
		}
	},
});
