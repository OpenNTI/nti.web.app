const Ext = require('@nti/extjs');
const PropTypes = require('prop-types');
const React = require('react');
const ReactDOM = require('react-dom');
const createReactClass = require('create-react-class');
const {getService} = require('@nti/web-client');
const {encodeForURI} = require ('@nti/lib-ntiids');
const {getHistory} = require('@nti/web-routing');

const AnalyticsUtil = require('legacy/util/Analytics');
const User = require('legacy/model/User');
const ContextStore = require('legacy/app/context/StateStore');

const unwrap = x => (x && x.default) ? x.default : x;

const CATALOG_MIME_TYPES = {
	'application/vnd.nextthought.courses.catalogentry': true,
	'application/vnd.nextthought.courses.coursecataloglegacyentry': true,
	'application/vnd.nextthought.courseware.coursecataloglegacyentry': true
};

const GROUP_MIME_TYPE = 'application/vnd.nextthought.dynamicfriendslist';

function getRouteFor (obj, context) {
	if (obj.isUser) {
		if (context === 'open-chat') {
			return () => {
				alert('Open Chat');
			};
		}

		return `/app/user/${User.getUsernameForURL(obj.Username)}`;
	}

	if (obj.CatalogEntry) {
		return `/app/course/${encodeForURI(obj.NTIID)}/info`;
	}

	if (CATALOG_MIME_TYPES[obj.MimeType]) {
		const href = `uri:${obj.href}`;
		return `./object/${encodeURIComponent(href)}`;
	}

	if (obj.MimeType === GROUP_MIME_TYPE) {
		return `/app/group/${encodeForURI(obj.NTIID)}/info`;
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
		addHistory: PropTypes.bool
	},

	getInitialState () {
		return {
			baseroute: this.props.baseroute
		};
	},

	childContextTypes: {
		defaultEnvironment: PropTypes.object,
		routerLinkComponent: PropTypes.func,
		router: PropTypes.object,
		course: PropTypes.object,
		stickyTopOffset: PropTypes.number,
		analyticsManager: PropTypes.object,
		setRouteViewTitle: PropTypes.func
	},

	getChildContext () {
		const bundle = this.props.bundle || ContextStore.getInstance().getRootBundle();

		let router = {
			makeHref: (x) => x,
			baseroute: this.state.baseroute,
			getRouteFor: this.props.getRouteFor
		};

		if (this.props.addHistory) {
			router.history = getHistory();
		}

		return {
			analyticsManager: AnalyticsUtil.getManager(),
			defaultEnvironment: {
				getPath: () => '',
				setPath: () => {}
			},
			routerLinkComponent: () => {},
			router,
			setRouteViewTitle: this.props.setRouteViewTitle,
			course: bundle && {
				getAssignment (ntiid) {
					return getService()
						.then((reactService) => {
							const link = bundle.getAssessmentURL(ntiid);

							return Service.request(link)
								.then((resp) => {
									const json = JSON.parse(resp);

									return reactService.getObject(json);
								});
						});
				}
			},
			stickyTopOffset: window['nti-sticky-top-offset'] && window['nti-sticky-top-offset']()
		};
	},


	setBaseRoute (baseroute) {
		this.setState({baseroute});
	},


	render () {
		return React.Children.only(this.props.children);
	}
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

	onMsgBarUpdated () {
		this.bridgeInstance && this.bridgeInstance.forceUpdate();
	},


	initComponent () {
		this.callParent(arguments);

		Ext.getCmp('viewport').on('msg-bar-opened', () => this.onMsgBarUpdated());
		Ext.getCmp('viewport').on('msg-bar-closed', () => this.onMsgBarUpdated());

		this.setRouteViewTitle = this.setRouteViewTitle.bind(this);
	},


	/**
	 * @cfg {...} ...  Any additional config properties will be pased as props to the component.
	 */

	getProps () {
		const {initialConfig: config} = this;
		const props = {...config};

		const blacklist = [
			'component',
			'cls',
			'renderTo',
			'xtype',
			'baseroute',
		];

		for ( let prop of blacklist ) {
			delete props[prop];
		}

		return props;
	},


	/**
	 * The primary way to update a component's props. DO NOT externally call setState() unless you
	 * KNOW what you are doing!
	 * @param {object} props - The props for the given component.
	 * @return {void}
	 */
	setProps (props) {
		this.initialConfig = {...this.initialConfig, ...props};

		// There is no need to register an 'afterrender' handler nor
		// onceRendered.then(). Its okay to drop the doRender on the floor.
		// We've merged the props into the config. When the Ext component
		// does render, it will be up to date.
		if (this.rendered) {
			this.doRender();
		}
	},


	afterRender () {
		this.callParent(arguments);
		//See Element_style.js in ExtJS source... they have a selectstart listener that stomps on us.
		//This class tells that handler to piss off...
		this.el.addCls(Ext.Element.selectableCls);
		this.doRender();
	},


	/**
	 * @private
	 *
	 * Executes ReactDOM.render with the current props. If the component is already mounted, it will reuse and update.
	 * @return {void}
	 */
	doRender () {
		//Only check to see if Ext has rendered the component's <div> React will control everything under it.
		if (!this.el) {return;}

		const {initialConfig: config} = this;
		const component = unwrap(config.component);

		const props = this.getProps();


		ReactDOM.render(
			React.createElement(Bridge, {bundle: this.bundle, baseroute: this.baseroute, setRouteViewTitle: this.setRouteViewTitle, ref: x => this.bridgeInstance = x, getRouteFor: config.getRouteFor || getRouteFor, addHistory: config.addHistory },
				//The ref will be called on mount with the instance of the component.
				//The ref will be called on unmount with null.  React will reuse the Component's instance while its
				//mounted. Calling doRender is the primary way to update the component with new props.
				React.createElement(component, {...props, ref: x => this.componentInstance = x})
			),
			Ext.getDom(this.el)
		);
	},


	onRouteActivate () {
		this.doRender();
	},


	onRouteDeactivate () {
		this.unmount();
	},


	unmount () {
		console.debug('Unmounting React Component');

		if(this.el) {
			ReactDOM.unmountComponentAtNode(Ext.getDom(this.el));
		}
	},


	beforeDestroy () {
		//why change this?
		this.onceRendered = Promise.reject('Destroyed');

		//fake out Chrome. Stop it form warning about "unhandled rejection" without swallowing the rejection.
		this.onceRendered.catch(()=>{});

		this.unmount();
	},


	setBaseRoute (baseroute) {
		this.bridgeInstance.setBaseRoute(baseroute);
	},


	/**
	 * @private This is NOT the primary way to communicate with the React component. Use setProps()
	 * This is here primarily as an example of ways to interact with the component. nothing more.
	 *
	 * Merges the imput state with the current state.
	 * @param {Object} state new state values
	 * @returns {void}
	 */
	setState (state) {
		console.warn('Use setProps(), not setState().  The state-manipulations are internal to the react component. Props are external.');
		this.onceRendered.then(() =>
			this.componentInstance.setState(state));
	},


	/**
	 * @private This is NOT the primary way to communicate with the React component. use setProps()
	 * This is here primarily as an example of ways to interact with the component. nothing more.
	 *
	 * Replaces the entire state object.
	 * @param {Object} state new state values
	 * @returns {void}
	 */
	replaceState (state) {
		console.warn('Use setProps(), not setState().  The state-manipulations are internal to the react component. Props are external.');
		this.onceRendered.then(() =>
			this.componentInstance.replaceState(state));
	},


	setRouteViewTitle (title) {
		if (this.setTitle) {
			this.setTitle(title);
		}
	}
});
