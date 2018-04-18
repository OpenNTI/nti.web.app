import React from 'react';
import PropTypes from 'prop-types';
import {Flyout} from '@nti/web-commons';
import cx from 'classnames';

export default class Actions extends React.Component {
	static propTypes = {
		actions: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string,
			handler: PropTypes.func
		})).isRequired,
		selectedItems: PropTypes.object
	}

	attachFlyoutRef = x => this.flyout = x

	renderIcon (disabled) {
		const className = cx('toolbar-actions', { disabled });

		return <div className={className}><i className="icon-settings"/></div>;
	}

	renderAction = (action, clickHandler) => {
		return (<div key={action.name} onClick={clickHandler} className="toolbar-action-item">{action.name}</div>);
	}

	render () {
		const { selectedItems, actions } = this.props;

		if(!selectedItems || selectedItems.size === 0) {
			return this.renderIcon(true);
		}

		return (
			<Flyout.Triggered
				className="toolbar-action-select"
				trigger={this.renderIcon()}
				ref={this.attachFlyoutRef}
				horizontalAlign={Flyout.ALIGNMENTS.LEFT}
			>
				<div>
					{actions.map((action) => {
						const clickHandler = (e) => {
							this.flyout && this.flyout.dismiss();

							return action.handler(e);
						};

						return this.renderAction(action, clickHandler);
					})}
				</div>
			</Flyout.Triggered>);
	}
}
