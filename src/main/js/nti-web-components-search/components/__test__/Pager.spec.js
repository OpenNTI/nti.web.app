import React from 'react';
import { shallow } from 'enzyme';

import Pager from '../Pager';

describe('<Pager />', () => {

	function buildProps (props) {
		const newProps = {props};

		spyOn(newProps, 'onChange');

		return newProps;
	}

	it('should render a `.pagination-container`', () => {
		const wrapper = shallow(<Pager />);
		expect(wrapper.find('.pagination-container')).to.have.length(1);
	});

	it('should render at least one `.pagination-item`', () => {
		const wrapper = shallow(<Pager />);
		expect(wrapper.contains('.pagination-item')).to.equal(true);
	});

	it('should render a `.next-results-page-button`', () => {
		const inputProps = buildProps({});

		const wrapper = shallow(<Pager />);

		if(inputProps.showMoreButton === true) {
			expect(wrapper.find('.next-results-page-button')).to.have.length(1);
		}
	});

	it('should render a `.prev-results-page` if the current page is greater than 12', () => {
		const inputProps = buildProps({});

		const wrapper = shallow(<Pager />);

		if(inputProps.currentPage > 12) {
			expect(wrapper.find('.prev-results-page')).to.have.length(1);
		}
	});

	it('simulates clicks on next results page button', () => {
		const inputProps = buildProps({});

		const wrapper = shallow(<Pager />);
		wrapper.find('.next-results-page-button').simulate('click');
		expect(inputProps.showNext).toHaveBeenCalled();
	});

	it('simulates clicks on a page number', () => {
		const inputProps = buildProps({});

		const wrapper = shallow(<Pager />);
		wrapper.find('.pagination-item').simulate('click');
		expect(inputProps.loadPage).toHaveBeenCalled();
	});

	it('simulates clicks on previous page button', () => {
		const inputProps = buildProps({});

		const wrapper = shallow(<Pager />);
		wrapper.find('.prev-results-page').simulate('click');
		expect(inputProps.loadPage).toHaveBeenCalled();
	});
});
