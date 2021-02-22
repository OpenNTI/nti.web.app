import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '@nti/web-commons';
import { decorate } from '@nti/lib-commons';
import { Connectors } from '@nti/lib-store';
import cx from 'classnames';

import styles from './Select.css';

class SelectHeaderBase extends React.Component {
	static propTypes = {
		isAllSelected: PropTypes.func,
		selectAll: PropTypes.func,
		deselectAll: PropTypes.func,
	};

	render() {
		const { isAllSelected, selectAll, deselectAll } = this.props;

		return (
			<Checkbox
				className={styles.headerCheckbox}
				checked={isAllSelected()}
				onChange={e => {
					if (e.target.checked) {
						selectAll();
					} else {
						deselectAll();
					}
				}}
			/>
		);
	}
}

const SelectHeader = decorate(SelectHeaderBase, [
	Connectors.Any.connect({
		isAllSelected: 'isAllSelected',
		selectAll: 'selectAll',
		deselectAll: 'deselectAll',
	}),
]);

class Select extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		onSelect: PropTypes.func,
		onDeselect: PropTypes.func,
		isSelected: PropTypes.func,
	};

	static rendersContainer = true;

	static HeaderComponent = SelectHeader;

	static cssClassName = styles.selectColumn;

	onSelectChanged = e => {
		const { item, onSelect, onDeselect } = this.props;

		if (e.target.checked) {
			onSelect(item);
		} else {
			onDeselect(item);
		}
	};

	render() {
		const { item, isSelected } = this.props;

		const isItemSelected = isSelected(item);

		return (
			<td
				className={cx(styles.selectColumn, {
					[styles.rowSelected]: isItemSelected,
				})}
			>
				<div className={styles.cell}>
					<Checkbox
						checked={isItemSelected}
						onChange={this.onSelectChanged}
					/>
				</div>
			</td>
		);
	}
}

export default decorate(Select, [
	Connectors.Any.connect({
		onSelect: 'onSelect',
		onDeselect: 'onDeselect',
		isSelected: 'isSelected',
	}),
]);
