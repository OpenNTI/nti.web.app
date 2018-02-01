import React from 'react';
import PropTypes from 'prop-types';
import {Avatar} from 'nti-web-commons';
import Ext from 'extjs';

import GroupsActions from '../../legacy/app/groups/Actions';
import GroupsStateStore from '../../legacy/app/groups/StateStore';

const info = 'Visible because your search contained someone\'s name.';
const groupStore = GroupsStateStore.getInstance();
export default class UserList extends React.Component {
	static propTypes = {
		userList: PropTypes.array,
		currentTab: PropTypes.string
	}

	constructor (props) {
		super(props);

		this.state = {
			showNext: false,
			showPre: false,
			isFollow: []
		};
	}

	componentDidMount () {
		const {userList} = this.props;
		let isFollow = [];
		userList.map((user, index) =>{
			const isContact = groupStore.isContact(user.Username);
			isFollow[index] = isContact;
		});

		this.setState({isFollow: isFollow});
		if (userList.length < 4) {
			this.setState({showNext: false, showPre: false});
		}
		else {
			this.setState({showNext: true, showPre: false});
		}
	}

	componentWillReceiveProps (prevProps) {
		if (prevProps.userList !== this.props.userList) {
			let isFollow = [];
			prevProps.userList.map((user, index) =>{
				const isContact = groupStore.isContact(user.Username);
				isFollow[index] = isContact;
			});

			this.setState({isFollow: isFollow});
			if (prevProps.userList.length < 4) {
				this.setState({showNext: false, showPre: false});
			}
			else {
				this.setState({showNext: true, showPre: false});
			}
		}
	}

	attachRef = el => this.el = el

	nextItems = () => {
		if (!this.state.showPre) {
			this.setState({showPre: true});
		}

		if (this.el.scrollLeft > this.el.scrollLeftMax - (215 * 3)) {
			this.setState({showNext: false});
			this.el.scrollLeft = this.el.scrollLeftMax;
			return;
		}
		const currentPos = parseInt((this.el.scrollLeft / 215), 10);
		this.el.scrollLeft = (currentPos * 215) + (215 * 3);
	}

	preItems = () => {
		if (this.el.scrollLeft < (215 * 3)) {
			this.setState({showPre: false});
			this.el.scrollLeft = 0;
			return;
		}

		if (!this.state.showNext) {
			this.setState({showNext: true});
		}
		const currentPos = parseInt((this.el.scrollLeft / 215), 10);
		this.el.scrollLeft = (currentPos * 215) - (215 * 3);
	}

	scrollItems = () => {
		if (this.el.scrollLeft === 0) {
			this.setState({showPre: false});
		}
		else if (this.el.scrollLeft === this.el.scrollLeftMax) {
			this.setState({showNext: false});
		}
		else {
			this.setState({showNext: true, showPre: true});
		}
	}


	followUser = (userName, index) => () => {
		const actions = GroupsActions.create();
		actions.addContact(userName)
			.then((something) =>{
				let isFollow = this.state.isFollow;
				isFollow[index] = true;
				this.setState({isFollow: isFollow});
			})
			.catch(function () {
				alert('There was trouble adding your contact.');
			});
	}

	unFollowUser = (userName, index) => () => {
		const actions = GroupsActions.create();
		const me = this;

		Ext.Msg.show({
			title: 'Are you sure?',
			msg: 'The following action will remove this contact',
			icon: 'warning-red',
			buttons: {
				primary: {
					text: 'Remove',
					cls: 'caution',
					handler: function () {
						actions.deleteContact(userName)
							.then((something) =>{
								let isFollow = me.state.isFollow;
								isFollow[index] = false;
								me.setState({isFollow: isFollow});
							})
							.catch(function () {
								alert('There was trouble remove your contact.');
							});
					}
				},
				secondary: {
					text: 'Cancel'
				}
			}
		});
	}

	render () {
		const {currentTab, userList} = this.props;
		const {showNext, showPre, isFollow} = this.state;
		if (userList.length === 0) {
			return null;
		}
		if (currentTab === 'all' || currentTab === 'people') {
			const userClass = currentTab === 'all' ? 'user-lookup-search all-user clearfix' : 'user-lookup-search people clearfix';
			return (
				<div className="container">
					<section className={userClass}>
						<div className="title-block-lookup">
							<p>People</p>
							<a className="view-all">View All</a>
						</div>
						<div className="result-block">
							<ul ref={this.attachRef} onScroll={this.scrollItems}>
								{userList.map((user, index) => {
									return (
										<li className="block-info" key={index}>
											<div className="user-info">
												<div className="img-user">
													<Avatar className="img-user" entityId={user.Username}/>
												</div>
												<h3 className="user-name">{user.realname}</h3>
											</div>
											{!isFollow[index] && (
												<a className="follow-btn" onClick={this.followUser(user.Username, index)}>
													<span className="icon-remove-user"/>
													Follow</a>
											)}
											{isFollow[index] && (
												<a className="follow-btn incorrect" onClick={this.unFollowUser(user.Username, index)}>
													<span className="icon-remove-user"/>
													Unfollow</a>
											)}
										</li>
									);
								})}

							</ul>
						</div>
						<div className="bottom-info">
							<p>{info}</p>
						</div>
						{showPre && (
							<div>
								<div className="bg-control left"/>
								<a className="left carousel-control" role="button" data-slide="prev" onClick={this.preItems}>
									<i className="icon-chevron-left" aria-hidden="true"/>
								</a>
							</div>
						)}

						{showNext && (
							<div>
								<div className="bg-control right"/>
								<a className="right carousel-control" role="button" data-slide="next" onClick={this.nextItems}>
									<i className="icon-chevron-right" aria-hidden="true"/>
								</a>
							</div>
						)}
					</section>
				</div>
			);
		}

		return null;
	}
}
