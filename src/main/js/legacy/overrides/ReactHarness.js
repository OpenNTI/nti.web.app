const Ext = require('extjs');
const React = require('react');
const ReactDOM = require('react-dom');

const unwrap = x => (x && x.default) ? x.default : x;


const Bridge = React.createClass({

	propTypes: {
		children: React.PropTypes.any
	},

	childContextTypes: {
		router: React.PropTypes.object
	},

	getChildContext () {
		return {
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
		this.callSuper(arguments);
		// The bastard that is ExtJS prevents our DraftJS editiors from functioning correctly...
		// this should prevent Ext's handlers from receiving said evnet(s)
		this.el.addEventListener('selectstart', this.preventEventFromPropagatingToExt);
		this.doRender();
	},


	doRender () {
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


	beforeDestroy () {
		this.el.removeEventListener('selectstart', this.preventEventFromPropagatingToExt);
		delete this.componentInstance;
		this.onceRendered = Promise.reject('Destroyed');
		ReactDOM.unmountComponentAtNode(Ext.getDom(this.el));
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
	},


	preventEventFromPropagatingToExt (e) {
		e.stopPropagation();
	}
});
