import React from 'react';
import cx from 'classnames';

Pager.propTypes = {
	pagesToShow: React.PropTypes.number,
	currentPage: React.PropTypes.number,
	showNext: React.PropTypes.func,
	loadPage: React.PropTypes.func,
	showMoreButton: React.PropTypes.bool
};

export default function Pager ({pagesToShow, currentPage, showNext, loadPage, showMoreButton}) {
	let pages = [];
	// The max amount of pages to show in the pager
	const maxPagesToShow = 12;
	let pageToStart = currentPage - maxPagesToShow + 1;

	if(pageToStart <= 0) {
		pageToStart = 1;
	}

	if(pagesToShow - pageToStart >= maxPagesToShow + 1) {
		pagesToShow = maxPagesToShow + pageToStart;
	}

	for(pageToStart; pageToStart < pagesToShow; pageToStart++) {
		const pgcls = cx({
			'pagination-item': true,
			'active': currentPage === pageToStart
		});

		pages.push({
			className: pgcls,
			pageNum: pageToStart
		});
	}

	// Fix so last page will be shown
	if(currentPage === pagesToShow && !showMoreButton) {
		const pgcls = cx({
			'pagination-item': true,
			'active': currentPage === pageToStart
		});

		pages.push({
			className: pgcls,
			pageNum: pageToStart
		});
	}

	// Load the previous page
	function showPrev () {
		loadPage(currentPage - 1);
	}

	return (
		<ul className="pagination-container">
			{currentPage > maxPagesToShow &&
				<li className="prev-results-page" onClick={showPrev}><i className="icon-chevron-left" /></li>
			}
			{
				pages.map((page, index) => {
					function goToPage () {
						loadPage(page.pageNum);
					}

					if(page.pageNum < 10) {
						return <li className={page.className} key={index} onClick={goToPage}><a className="page-num">{page.pageNum}</a></li>;
					} else {
						return <li className={page.className} key={index} onClick={goToPage}><a className="page-num-large">{page.pageNum}</a></li>;
					}
				})
			}
			{showMoreButton &&
				<li className="next-results-page" onClick={showNext}><a className="next-results-page-button"><span>More Pages</span><i className="icon-chevron-right" /></a></li>
			}
		</ul>
	);
}
