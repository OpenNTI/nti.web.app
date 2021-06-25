import './View.scss';
import React, { Suspense } from 'react';

import { Widgets } from '@nti/web-reports';
import { View as RouterView } from '@nti/web-routing';
import { Layouts } from '@nti/web-commons';

import Users from './widgets/Users';
import ActiveTimes from './widgets/ActiveTimes';
import PopularCourses from './widgets/PopularCourses';
import RecentlyCreatedUsers from './widgets/RecentlyCreatedUsers';
import RecentSessions from './widgets/RecentSessions';

const { ActiveDays, ActiveUsers } = Widgets;

const WidgetsContainer = styled(Layouts.grid(28, 15.30434783))`
	margin-top: 15px;
	grid-template-rows: 300px 266px 368px;
	grid-template-areas:
		'a a a a a   b b b b b b b b b   c c c c c c c c c c'
		'd d d d d d d d d d d d     e e e e e e e e e e e e'
		'd d d d d d d d d d d d     f f f f f f f f f f f f'
		'g g g g g g g g g g g g g g g g g g g g g g g g';

	> * {
		max-width: 100%;
	}

	> :nth-child(1) {
		grid-area: a;
	}

	> :nth-child(2) {
		grid-area: b;
	}

	> :nth-child(3) {
		grid-area: c;
	}

	> :nth-child(4) {
		grid-area: d;
	}

	> :nth-child(5) {
		grid-area: e;
	}

	> :nth-child(6) {
		grid-area: f;
	}

	> :nth-child(7) {
		grid-area: g;
	}

	/* .active-users.dashboard-list-widget .items-container .item .info .name {
		max-width: 300px;
	}

	.recently-created-users.dashboard-list-widget
		.items-container
		.item
		.info
		.name {
		max-width: 350px;
	}

	.admin-active-days {
		width: 100%;
		margin: 0 5px 100px;
		height: auto;

		.no-data {
			margin-left: 17px;
		}

		.daily-activity-body .activity-day-row {
			.activity-day-wrapper.first-of-week::before {
				font-size: 12px;
			}

			.weekday {
				width: 32px;
				font-size: 10px;
			}

			.activity-day-wrapper .activity-day {
				height: 15px;
				width: 15px;
			}
		}

		.activity-day-row .activity-day-wrapper.first-of-week::before {
			font-size: 12px;
		}
	} */
`;

// const Tile = ({ cols = 24, rows = 1, ...props }) => (
// 	<div
// 		{...props}
// 		style={{ gridColumn: `span ${cols}`, gridRow: `span ${rows}` }}
// 	/>
// );

export const View = () => (
	<RouterView.WithTitle title="Dashboard">
		<Suspense fallback={<div />}>
			<WidgetsContainer className="test">
				<Users />
				<PopularCourses />
				<ActiveUsers />
				<ActiveTimes />
				<RecentlyCreatedUsers />
				<RecentSessions />
				<ActiveDays />
			</WidgetsContainer>
		</Suspense>
	</RouterView.WithTitle>
);
