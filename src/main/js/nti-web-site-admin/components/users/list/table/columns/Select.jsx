import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from  '@nti/web-commons';
import {Connectors} from '@nti/lib-store';
import cx from 'classnames';

@Connectors.Any.connect({
	isAllSelected: 'isAllSelected',
	selectAll: 'selectAll',
	deselectAll: 'deselectAll'
})
class SelectHeader extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		isAllSelected: PropTypes.func,
		selectAll: PropTypes.func,
		deselectAll: PropTypes.func
	}

	render () {
		const {isAllSelected, selectAll, deselectAll} = this.props;

		return (
			<Checkbox
				checked={isAllSelected()}
				onChange={(e) => {
					if(e.target.checked) {
						selectAll();
					}
					else {
						deselectAll();
					}
				}
				}/>
		);
	}
}

export default
@Connectors.Any.connect({
	onSelect: 'onSelect',
	onDeselect: 'onDeselect',
	isSelected: 'isSelected'
})
class Select extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		onSelect: PropTypes.func,
		onDeselect: PropTypes.func,
		isSelected: PropTypes.func
	}

	static rendersContainer = true;

	static HeaderComponent = SelectHeader

	static cssClassName = 'select-col';

	onSelectChanged = (e) => {
		const {item, onSelect, onDeselect} = this.props;

		if(e.target.checked) {
			onSelect(item);
		}
		else {
			onDeselect(item);
		}
	}

	render () {
		const {item, isSelected} = this.props;

		const isItemSelected = isSelected(item);

		return (
			<td className={cx('select-col', {'row-selected': isItemSelected})}>
				<div className={cx('cell')}>
					<Checkbox checked={isItemSelected} onChange={this.onSelectChanged}/>
				</div>
			</td>
		);
	}
}
