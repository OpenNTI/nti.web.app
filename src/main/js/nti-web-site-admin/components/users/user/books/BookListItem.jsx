import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {Presentation} from '@nti/web-commons';

export default class CourseEnrollmentListItem extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		book: PropTypes.object.isRequired
	}


	render () {
		const {book, className, ...otherProps} = this.props;

		return (
			<div className={cx('nti-course-enrollment-list-item', className)} {...otherProps}>
				{this.renderIcon(book)}
				{this.renderMeta(book)}
			</div>
		);
	}


	renderIcon (book) {
		return (
			<Presentation.Asset contentPackage={book} type="landing">
				<img className="course-enrollment-icon" />
			</Presentation.Asset>
		);
	}


	renderMeta (book) {
		const {label, title} = book.getPresentationProperties();

		return (
			<div className="course-enrollment-meta">
				<div className="label">{label}</div>
				<div className="title">{title}</div>
			</div>
		);
	}

	renderDates () {}
}
