import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {Loading, EmptyState} from 'nti-web-commons';

import ViewerRegistry from '../../ViewerRegistry';

import Store from './Store';
import Item from './Item';

const DEFAULT_TEXT = {
	empty: 'There are not assignments'
};
const t = scoped('nti-web-reports.context.course-instance.assignment.View', DEFAULT_TEXT);

@ViewerRegistry.register('course-assignments')
@Store.connect({loading: 'loading', items: 'items'})
export default class CourseAssignments extends React.Component {
	static propTypes = {
		context: PropTypes.object,
		rel: PropTypes.string,
		onSelect: PropTypes.object,

		store: PropTypes.object,
		loading: PropTypes.bool,
		items: PropTypes.array
	}

	componentDidMount () {
		const {context, store} = this.props;

		store.load(context);
	}


	componentWillReceiveProps (nextProps) {
		const {context: nextContext, store} = nextProps; // the store should never change
		const {context:oldContext} = this.props;

		if (nextContext !== oldContext) {
			store.loadCourse(nextContext);
		}
	}


	selectItem = (item) => {
		const {onSelect} = this.props;

		if (onSelect) {
			onSelect(item);
		}
	}


	render () {
		const {loading, items} = this.props;

		return (
			<div className="course-instance-assignment-report-context">
				{loading && (<Loading.Mask />)}
				{!loading && (this.renderItems(items))}
			</div>
		);
	}


	renderItems (items) {
		if (!items || !items.length) {
			return this.renderEmpty();
		}

		return (
			<ul>
				{
					items.map((item) => {
						return (
							<li key={item.getID()}>
								<Item item={item} onSelect={this.selectItem} />
							</li>
						);
					})
				}
			</ul>
		);
	}


	renderEmpty () {
		return (
			<EmptyState header={t('empty')} />
		);
	}
}
