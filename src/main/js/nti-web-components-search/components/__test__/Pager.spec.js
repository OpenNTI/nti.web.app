/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import Pager from '../Pager';

const pagesToShow = 14;
const currentPage = 13;
const showMoreButton = true;
const showNext = jest.fn();
const loadPage = jest.fn();

describe ('<Pager />', () => {

	test ('should render a `.pagination-container`', () => {
		const wrapper = shallow(<Pager />);
		expect(wrapper.find('.pagination-container').length).toBe(1);
	});

	test ('should render at least one `.pagination-item`', () => {
		const wrapper = shallow(<Pager pagesToShow={pagesToShow} currentPage={currentPage} showNext={showNext} loadPage={loadPage} showMoreButton={showMoreButton}/>);
		expect(wrapper.find('.pagination-item').length).toBe(12);
	});

	test ('should render a `.next-results-page-button`', () => {
		const wrapper = shallow(<Pager pagesToShow={pagesToShow} currentPage={currentPage} showNext={showNext} loadPage={loadPage} showMoreButton={showMoreButton}/>);

		if(showMoreButton === true) {
			expect(wrapper.find('.next-results-page-button').length).toBe(1);
		}
	});

	test ('should render a `.prev-results-page` if the current page is greater than 12', () => {
		const wrapper = shallow(<Pager pagesToShow={pagesToShow} currentPage={currentPage} showNext={showNext} loadPage={loadPage} showMoreButton={showMoreButton}/>);

		if(currentPage > 12) {
			expect(wrapper.find('.prev-results-page').length).toBe(1);
		}
	});

	test ('simulates clicks on next results page button', () => {
		const wrapper = shallow(<Pager pagesToShow={pagesToShow} currentPage={currentPage} showNext={showNext} loadPage={loadPage} showMoreButton={showMoreButton}/>);
		wrapper.find('.next-results-page').simulate('click');
		expect(showNext).toHaveBeenCalled();
	});

	test ('simulates clicks on a page number', () => {
		const wrapper = shallow(<Pager pagesToShow={pagesToShow} currentPage={currentPage} showNext={showNext} loadPage={loadPage} showMoreButton={showMoreButton}/>);
		const pageNum = wrapper.find('.pagination-item');
		// Clicks page with key value of 1
		pageNum.at(1).simulate('click');
		expect(loadPage).toHaveBeenCalled();
	});

	test ('simulates clicks on previous page button', () => {
		const wrapper = shallow(<Pager pagesToShow={pagesToShow} currentPage={currentPage} showNext={showNext} loadPage={loadPage} showMoreButton={showMoreButton}/>);
		wrapper.find('.prev-results-page').simulate('click');
		expect(loadPage).toHaveBeenCalled();
	});
});
