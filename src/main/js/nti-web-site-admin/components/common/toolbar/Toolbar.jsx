import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import TypeSelect from './TypeSelect';
import Actions from './Actions';

export default class Toolbar extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		options: PropTypes.arrayOf(PropTypes.string),
		selectedItems: PropTypes.object,
		selectedType: PropTypes.string,
		onTypeToggle: PropTypes.func,
		onCreate: PropTypes.func,
		actions: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string,
			handler: PropTypes.func
		}))
	}

	constructor (props) {
		super(props);
	}

	renderCreateButton () {
		const {onCreate} = this.props;

		if(!onCreate) {
			return null;
		}

		return (<div className="toolbar-create" onClick={onCreate}>Create</div>);
	}

	render () {
		const { className, options, selectedType, onTypeToggle, selectedItems, actions } = this.props;

		const cls = cx('site-admin-list-toolbar', className);

		return (
			<div className={cls}>
				{actions && (<Actions actions={actions} selectedItems={selectedItems}/>)}
				<TypeSelect options={options} selectedType={selectedType} onTypeToggle={onTypeToggle}/>
				{this.renderCreateButton()}
			</div>
		);
	}
}
