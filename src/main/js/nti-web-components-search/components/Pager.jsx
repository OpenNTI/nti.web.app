import PropTypes from 'prop-types';
import cx from 'classnames';

Pager.propTypes = {
	pagesToShow: PropTypes.number,
	currentPage: PropTypes.number,
	showNext: PropTypes.func,
	loadPage: PropTypes.func,
	showMoreButton: PropTypes.bool,
};

export default function Pager({
	pagesToShow,
	currentPage,
	showNext,
	loadPage,
	showMoreButton,
}) {
	const pages = [];
	// The max amount of pages to show in the pager
	const maxPagesToShow = 12;
	let pageToStart = currentPage - maxPagesToShow + 1;

	if (pageToStart <= 0 || isNaN(pageToStart)) {
		pageToStart = 1;
	}

	if (pagesToShow - pageToStart >= maxPagesToShow + 1) {
		pagesToShow = maxPagesToShow + pageToStart;
	}

	for (pageToStart; pageToStart < pagesToShow; pageToStart++) {
		const pgcls = cx({
			'pagination-item': true,
			active: currentPage === pageToStart,
		});

		pages.push({
			className: pgcls,
			pageNum: pageToStart,
		});
	}

	// Fix so last page will be shown
	if (currentPage === pagesToShow && !showMoreButton) {
		const pgcls = cx({
			'pagination-item': true,
			active: currentPage === pageToStart,
		});

		pages.push({
			className: pgcls,
			pageNum: pageToStart,
		});
	}

	// Load the previous page
	function showPrev() {
		loadPage(currentPage - 1);
	}

	return (
		<ul className="pagination-container">
			{currentPage > maxPagesToShow && (
				<li className="prev-results-page" onClick={showPrev}>
					<i className="icon-chevron-left" />
				</li>
			)}
			{pages.map(({ className, pageNum }, index) => {
				function goToPage() {
					loadPage(pageNum);
				}

				return (
					<li className={className} key={index} onClick={goToPage}>
						<a
							className={
								pageNum < 10 ? 'page-num' : 'page-num-large'
							}
						>
							{pageNum}
						</a>
					</li>
				);
			})}
			{showMoreButton && (
				<li className="next-results-page" onClick={showNext}>
					<a className="next-results-page-button">
						<span>More Results</span>
						<i className="icon-chevron-right" />
					</a>
				</li>
			)}
		</ul>
	);
}
