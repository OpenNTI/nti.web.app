import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import CreateCourse from '../create-course';

import TypeSelect from './TypeSelect';
import Actions from './Actions';

export default class Toolbar extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		options: PropTypes.arrayOf(PropTypes.string),
		selectedItems: PropTypes.object,
		selectedType: PropTypes.string,
		onTypeToggle: PropTypes.func,
		actions: PropTypes.arrayOf(
			PropTypes.shape({
				name: PropTypes.string,
				handler: PropTypes.func
			})
		),
		onCourseCreated: PropTypes.func
	};

	render () {
		const {
			className,
			options,
			selectedType,
			onTypeToggle,
			selectedItems,
			actions,
			onCourseCreated
		} = this.props;

		const cls = cx('site-admin-list-toolbar', className);

		return (
			<div className={cls}>
				{actions && (
					<Actions actions={actions} selectedItems={selectedItems} />
				)}
				{options && onTypeToggle && (
					<TypeSelect
						options={options}
						selectedType={selectedType}
						onTypeToggle={onTypeToggle}
					/>
				)}
				{selectedType === 'Courses' && (
					<CreateCourse canCreate onCourseCreated={onCourseCreated} />
				)}
			</div>
		);
	}
}
