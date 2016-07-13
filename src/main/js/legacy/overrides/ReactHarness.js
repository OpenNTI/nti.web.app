const Ext = require('extjs');
const React = require('react');
const ReactDOM = require('react-dom');

const unwrap = x => (x && x.default) ? x.default : x;


const Bridge = React.createClass({

	propTypes: {
		children: React.PropTypes.any
	},

	childContextTypes: {
		defaultEnvironment: React.PropTypes.object,
		routerLinkComponent: React.PropTypes.func,
		router: React.PropTypes.object
	},

	getChildContext () {
		return {
			defaultEnvironment: {
				getPath: () => '',
				setPath: () => {}
			},
			routerLinkComponent: () => {},
			router: {
				makeHref: (x) => x
			}
		};
	},

	render () {
		return React.Children.only(this.props.children);
	}

});

module.exports = exports = Ext.define('NextThought.ReactHarness', {
	extend: 'Ext.Component',
	alias: 'widget.react',

	/**
	 * @cfg {React.Component} component
	 */

	/**
	 * @cfg {...} ...  Any additional config properties will be pased as props to the component.
	 */

	getProps () {
		const {initialConfig: config} = this;
		return {...config, component: void 0};
	},


	setProps (props) {
		this.initialConfig = {...this.initialConfig, ...props};
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


	doRender () {
		if (!this.el || this.componentInstance) {return;}

		const {initialConfig: config} = this;
		const component = unwrap(config.component);

		const props = this.getProps();


		ReactDOM.render(
			React.createElement(Bridge, {},
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
		ReactDOM.unmountComponentAtNode(Ext.getDom(this.el));
		delete this.componentInstance;
	},


	beforeDestroy () {
		delete this.componentInstance;
		//????why
		this.onceRendered = Promise.reject('Destroyed');
		this.unmount();
	},


	/**
	 * Merges the imput state with the current state.
	 * @param {Object} state new state values
	 * @returns {void}
	 */
	setState (state) {
		this.onceRendered.then(() =>
			this.componentInstance.setState(state));
	},


	/**
	 * Replaces the entire state object.
	 * @param {Object} state new state values
	 * @returns {void}
	 */
	replaceState (state) {
		this.onceRendered.then(() =>
			this.componentInstance.replaceState(state));
	}
});
