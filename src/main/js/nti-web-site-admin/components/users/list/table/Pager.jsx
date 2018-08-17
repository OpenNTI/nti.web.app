import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class Pager extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		pageNumber: PropTypes.number,
		numPages: PropTypes.number
	}

	renderPage = (num) => {
		const {pageNumber, store} = this.props;

		const cls = cx('page', { selected: pageNumber === num + 1 });

		return (
			<div
				key={num}
				onClick={()=>{
					if(store.loadPage) {
						store.loadPage(num + 1);
					}
					else {
						store.goToPage(num + 1);
					}
				}}
				className={cls}>
				{num + 1}
			</div>
		);
	}

	render () {
		const {numPages, pageNumber} = this.props;

		const startPage = pageNumber - 4 < 0 ? 0 : pageNumber - 4;
		const lastPage = pageNumber + 2 >= numPages ? numPages - 1 : pageNumber + 2;

		let numbers = [];

		for(let i = startPage; i <= lastPage; i++) {
			numbers.push(i);
		}

		if(numbers.length <= 1) {
			return null;
		}

		return (
			<div className="users-table-pager">
				{(numbers).map(this.renderPage)}
			</div>
		);
	}
}
