const Ext = require('extjs');
const React = require('react');
const ReactDOM = require('react-dom');

const unwrap = x => x.default ? x.default : x;

module.exports = exports = Ext.define('NextThought.ReactHarness', {
	extend: 'Ext.Component',
	alias: 'widget.react',

	/**
	 * @cfg {React.Component} component
	 */

	/**
	 * @cfg {...} ...  Any additional config properties will be pased as props to the component.
	 */


	afterRender () {
		const {initialConfig: config} = this;
		const component = unwrap(config.component);


		const props = Object.assign({}, config, {component: void 0});

		this.componentInstance = ReactDOM.render(
			React.createElement(component, props),
			Ext.getDom(this.el)
		);
	},


	beforeDestroy () {
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
	}
});
