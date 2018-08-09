import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from  '@nti/web-commons';
import cx from 'classnames';

export default class Select extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		store: PropTypes.object
	}

	static HeaderComponent = ({store}) => (
		<Checkbox
			checked={store.isAllSelected()}
			onChange={(e) => {
				if(e.target.checked) {
					store.selectAll();
				}
				else {
					store.deselectAll();
				}
			}
			}/>
	);

	static cssClassName = 'select-col';

	onSelectChanged = (e) => {
		const {store, item} = this.props;

		if(e.target.checked) {
			store.onSelect(item);
		}
		else {
			store.onDeselect(item);
		}
	}

	render () {
		const {store, item} = this.props;

		const isSelected = store.isSelected(item);

		return (
			<div className={cx('cell', {'row-selected': isSelected})}>
				<Checkbox checked={isSelected} onChange={this.onSelectChanged}/>
			</div>
		);
	}
}
