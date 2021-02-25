import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { scoped } from '@nti/lib-locale';
import { DateTime } from '@nti/web-commons';

import Styles from './Instructions.css';

const cx = classnames.bind(Styles);

const t = scoped(
	'NTIWebAppLessonItems.overrides.assignment.sidebar-parts.Instructions',
	{
		header: 'Instructions',
		unavailable: {
			header: 'Currently Unavailable',
			message: 'Your assignment will be available on %(date)s',
		},
		available: {
			header: '',
			message:
				'Please read and answer each question carefully before submitting your work.',
		},
		submitted: {
			header: 'We received your submission.',
			message: 'You can always return here to review your work.',
		},
		outsideSubmissionBuffer: {
			header: 'Currently Unavailable',
			message: 'Your assignment is no longer available for submission.',
		},
	}
);

export default class AssignmentSidebarInstructions extends React.Component {
	static propTypes = {
		assignmentModel: PropTypes.shape({
			isAvailable: PropTypes.func,
			isNoSubmit: PropTypes.func,
			isTimed: PropTypes.bool,
			getQuestionCount: PropTypes.func,
			isOutsideSubmissionBuffer: PropTypes.func,
		}),
		activeHistoryItemModel: PropTypes.object,
	};

	render() {
		const { assignmentModel, activeHistoryItemModel } = this.props;

		if (!assignmentModel?.isAvailable) {
			if (assignmentModel) {
				// eslint-disable-next-line no-console
				console.error(
					"Why isn't this an assignment model??? %o",
					assignmentModel
				);
			}
			return null;
		}

		const available = assignmentModel.isAvailable();
		const noSubmit = assignmentModel.isNoSubmit();
		const noQuestions =
			  assignmentModel.isNoSubmit() || !assignmentModel.getQuestionCount();
		const isTimed = assignmentModel.isTimed;
		const outsideBuffer = assignmentModel.isOutsideSubmissionBuffer();
		const submitted = !!activeHistoryItemModel;

		return (
			<div className={cx('assignment-sidebar-instructions')}>
				<div className={cx('header')}>{t('header')}</div>
				{!available &&
					!noSubmit &&
					this.renderUnavailable(
						assignmentModel,
						activeHistoryItemModel
					)}
				{available &&
					!noQuestions &&
					outsideBuffer &&
					this.renderOutsideBuffer(
						assignmentModel,
						activeHistoryItemModel
					)}
				{available &&
					(isTimed || !noQuestions) &&
					!outsideBuffer &&
					!submitted &&
					this.renderAvailable(
						assignmentModel,
						activeHistoryItemModel
					)}
				{available &&
					!noQuestions &&
					!outsideBuffer &&
					submitted &&
					this.renderSubmitted(
						assignmentModel,
						activeHistoryItemModel
					)}
			</div>
		);
	}

	renderUnavailable(assignmentModel) {
		const available = assignmentModel.get('availableBeginning');
		const date = DateTime.format(
			available,
			DateTime.WEEKDAY_MONTH_NAME_DAY_AT_TIME_WITH_ZONE
		);

		return this.renderState(
			t('unavailable.header'),
			t('unavailable.message', { date })
		);
	}

	renderAvailable() {
		return this.renderState(t('available.header'), t('available.message'));
	}

	renderSubmitted() {
		return this.renderState(t('submitted.header'), t('submitted.message'));
	}

	renderOutsideBuffer() {
		return this.renderState(
			t('outsideSubmissionBuffer.header'),
			t('outsideSubmissionBuffer.message')
		);
	}

	renderState(title, message) {
		return (
			<div className={cx('state')}>
				{title && <div className={cx('title')}>{title}</div>}
				{message && <div className={cx('message')}>{message}</div>}
			</div>
		);
	}

}
