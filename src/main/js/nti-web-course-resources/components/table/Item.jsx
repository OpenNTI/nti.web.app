import './Item.scss';
import React from 'react';
import PropTypes from 'prop-types';

import { scoped } from '@nti/lib-locale';
import { DateTime } from '@nti/web-commons';

const DEFAULT_TEXT = {
	published: 'Published',
	draft: 'Draft',
	edit: 'Edit',
};

const t = scoped('nti-course-resources.readings.ListItem', DEFAULT_TEXT);

export default class ReadingListItem extends React.Component {
	static propTypes = {
		reading: PropTypes.object,
		gotoResource: PropTypes.func,
	};

	gotoResource = () => {
		const { reading, gotoResource } = this.props;

		if (gotoResource) {
			gotoResource(reading);
		}
	};

	isPublished() {
		const { reading } = this.props;

		if (typeof reading.isPublished === 'function') {
			return reading.isPublished();
		}

		return reading.isPublished;
	}

	render() {
		const { reading } = this.props;

		return (
			<div className="course-resources-reading-list-item">
				{this.renderMeta(reading)}
				{this.renderPublish(reading)}
				{this.renderModified(reading)}
			</div>
		);
	}

	renderMeta = reading => {
		const { icon, title } = reading;
		const canEdit = reading.hasLink('edit');
		const iconFallback = iconUrl =>
			iconUrl || '/app/resources/images/file-icons/generic.png';

		return (
			<div className="meta" role="cell">
				<div
					className="icon"
					style={{ backgroundImage: `url(${iconFallback(icon)})` }}
				/>
				<div className="wrap">
					<div className="title">{title}</div>
					<div className="published-inline">
						{t(this.isPublished() ? 'published' : 'draft')}
					</div>
				</div>
				{canEdit && (
					<div className="edit" onClick={this.gotoResource}>
						<span>{t('edit')}</span>
					</div>
				)}
			</div>
		);
	};

	renderPublish = reading => {
		return (
			<div className="published" role="cell">
				{t(this.isPublished() ? 'published' : 'draft')}
			</div>
		);
	};

	renderModified = reading => {
		const lastModified = reading.getLastModified();

		return (
			<div className="modified" role="cell">
				<DateTime date={lastModified} />
			</div>
		);
	};
}
