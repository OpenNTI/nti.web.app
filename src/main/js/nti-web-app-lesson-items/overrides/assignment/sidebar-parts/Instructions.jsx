import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {DateTime} from '@nti/web-commons';

import AccountActions from 'legacy/app/account/Actions';

import Styles from './Instructions.css';

const cx = classnames.bind(Styles);

const t = scoped('NTIWebAppLessonItems.overrides.assignment.sidebar-parts.Instructions', {
	header: 'Instructions',
	unavailable: {
		header: 'Currently Unavailable',
		message: 'Your assignment will be available on %(date)s'
	},
	available: {
		header: '',
		message: 'Please read and answer each question carefully before submitting your work.'
	},
	submitted: {
		header: 'We received your submission.',
		message: 'You can always return here to review your work.'
	},
	support: {
		message: 'For support, contact ',
		link: 'help@nextthought.com'
	}
});

export default class AssignmentSidebarInstructions extends React.Component {
	static propTypes = {
		assignmentModel: PropTypes.object,
		activeHistoryItemModel: PropTypes.object
	}

	contactUs = () => {
		const actions = AccountActions.create();

		actions.showContactUs();
	}

	render () {
		const {assignmentModel, activeHistoryItemModel} = this.props;

		if (!assignmentModel) { return null; }

		const available = assignmentModel && assignmentModel.isAvailable();
		const submitted = !!activeHistoryItemModel;

		return (
			<div className={cx('assignment-sidebar-instructions')}>
				<div className={cx('header')}>
					{t('header')}
				</div>
				{!available && this.renderUnavailable(assignmentModel, activeHistoryItemModel)}
				{available && !submitted && this.renderAvailable(assignmentModel, activeHistoryItemModel)}
				{available && submitted && this.renderSubmitted(assignmentModel, activeHistoryItemModel)}
				{this.renderSupport()}
			</div>
		);
	}


	renderUnavailable (assignmentModel) {
		const available = assignmentModel.get('availableBeginning');
		const date = DateTime.format(available, 'dddd, MMMM D [at] h:mmA z');

		return this.renderState(t('unavailable.header'), t('unavailable.message', {date}));
	}


	renderAvailable () {
		return this.renderState(t('available.header'), t('available.message'));
	}


	renderSubmitted () {
		return this.renderState(t('submitted.header'), t('submitted.message'));
	}


	renderState (title, message) {
		return (
			<div className={cx('state')}>
				{title && (<div className={cx('title')}>{title}</div>)}
				{message && (<div className={cx('message')}>{message}</div>)}
			</div>
		);
	}


	renderSupport () {
		if (t.isMissing('support.link')) { return null; }

		return (
			<div className={cx('support')}>
				<span className={cx('message')}>{t('support.message')}</span>
				<span className={cx('link')} onClick={this.contactUs}>{t('support.link')}</span>
			</div>
		);
	}
}
