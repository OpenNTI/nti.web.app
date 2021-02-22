/* eslint-env jest */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Pager from '../Pager';

const pagesToShow = 14;
const currentPage = 13;
const showMoreButton = true;
const showNext = jest.fn();
const loadPage = jest.fn();

describe('<Pager />', () => {
	test('should render a `.pagination-container`', () => {
		const { container } = render(<Pager />);
		expect(container.querySelectorAll('.pagination-container').length).toBe(
			1
		);
	});

	test('should render at least one `.pagination-item`', () => {
		const { container } = render(
			<Pager
				pagesToShow={pagesToShow}
				currentPage={currentPage}
				showNext={showNext}
				loadPage={loadPage}
				showMoreButton={showMoreButton}
			/>
		);
		expect(container.querySelectorAll('.pagination-item').length).toBe(12);
	});

	test('should render a `.next-results-page-button`', () => {
		const { container } = render(
			<Pager
				pagesToShow={pagesToShow}
				currentPage={currentPage}
				showNext={showNext}
				loadPage={loadPage}
				showMoreButton={showMoreButton}
			/>
		);
		expect(
			container.querySelectorAll('.next-results-page-button').length
		).toBe(1);
	});

	test('should render a `.prev-results-page` if the current page is greater than 12', () => {
		const { container } = render(
			<Pager
				pagesToShow={pagesToShow}
				currentPage={currentPage}
				showNext={showNext}
				loadPage={loadPage}
				showMoreButton={showMoreButton}
			/>
		);
		expect(container.querySelectorAll('.prev-results-page').length).toBe(1);
	});

	test('simulates clicks on next results page button', () => {
		const { container } = render(
			<Pager
				pagesToShow={pagesToShow}
				currentPage={currentPage}
				showNext={showNext}
				loadPage={loadPage}
				showMoreButton={showMoreButton}
			/>
		);
		fireEvent.click(container.querySelector('.next-results-page'));
		expect(showNext).toHaveBeenCalled();
	});

	test('simulates clicks on a page number', async () => {
		const { findByText } = render(
			<Pager
				pagesToShow={pagesToShow}
				currentPage={currentPage}
				showNext={showNext}
				loadPage={loadPage}
				showMoreButton={showMoreButton}
			/>
		);
		const pageNum = await findByText('2');
		// Clicks page with key value of 1
		fireEvent.click(pageNum);
		expect(loadPage).toHaveBeenCalledWith(2);
	});

	test('simulates clicks on previous page button', () => {
		const { container } = render(
			<Pager
				pagesToShow={pagesToShow}
				currentPage={currentPage}
				showNext={showNext}
				loadPage={loadPage}
				showMoreButton={showMoreButton}
			/>
		);
		fireEvent.click(container.querySelector('.prev-results-page'));
		expect(loadPage).toHaveBeenCalled();
	});
});
