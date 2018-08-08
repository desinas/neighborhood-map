import React, { Component } from 'react';
import escapeRegExp from 'escape-string-regexp';

import * as data from './locations.json';

/**
 * @description Implement of locations component
 * for places to show in the list and markers.
 * @prop {string} query - search input to find places
 * @prop {object} locations - all places data
 * @prop {object} markers - array of markers
 * @prop {object} currentMarker - marker of choice
 * @prop {bool} isListEnable - value true for list enable
 */
class Locations extends Component {
	constructor(props) {
		super(props);
		this.state = {
			query: '',
			locations: data,
			markers: [],
			currentMarker: {},
			isListEnable: true
		};
	}

	componentDidMount() {

		this.setState({
			markers: this.props.markers
		});
	}

	updateQuery = (query) => {
		
		this.setState({
			query: query,
			isListEnable: true
		});

		if (query === '') {
			this.setState({
			isListEnable: false
		});
		}
		this.handleDisplayedLocations(query);
	}

	toggleListVisibility = () => {
		this.setState((prevState) => ({
			isListEnable: !(prevState.isListEnable)
		}));
	}

	/**
	 * Add location to the array if its title match the query,
	 * add marker to the array if its title match the query,
	 * display the markers on the map accordingly to the state.
	 */
	handleDisplayedLocations = (query) => {
		
		let that = this;
		let filtLocations;
		let filtMarkers;

		if (query) {
			const match = new RegExp(escapeRegExp(query), 'i');

			filtLocations = this.props.locationsList.filter(location =>
				match.test(location.title)
			);

			filtMarkers = this.props.markers.filter(marker =>
				match.test(marker.title)
			);

			this.setState({
				locations: filtLocations,
				markers: filtMarkers
			});
		} else {
			this.setState({
				locations: this.props.locationsList,
				markers: this.props.markers
			});
		}

		this.props.markers.map(marker => marker.setVisible(false));
		setTimeout(function () {
			that.props.markers.map(marker =>
				that.handleMarkersVisibility(marker))
		}, 1)
	}

	/* Make the matching markers visible on the map */
	handleMarkersVisibility = (mark) => {
		
		this.state.markers.map(marker =>
			mark.id === marker.id && marker.setVisible(true))
	}

	/**
	 * When clicking on the list item get the current 
	 * marker animated, Open the Info Winfow accordingly.
	 * Remove all the animations, add animation to the active marker
	 */
	manageClickedMarker = (location) => {
		
		let that = this;
		this.removeAnimationMarker();
		this.addAnimationMarker(location);
		setTimeout(function () {
			that.removeAnimationMarker()
		}, 1500);

		this.getCurrentMarker(location);

		setTimeout(function () {
			that.props.openInfoBox(
				that.state.currentMarker
			);
		}, 1)
	}

	removeAnimationMarker = () => {

		this.state.markers.map(marker =>
			marker.setAnimation(null)
		)
	}

	addAnimationMarker = (location) => {

		this.state.markers.map(marker =>
			marker.id === location.key &&
				marker.setAnimation(
					window.google.maps.Animation.BOUNCE)
		);
	}

	/** 
	 * Get the marker clicked
	 * to give the details info in the InfoBox
	 */
	getCurrentMarker = (location) => {
		
		this.state.markers.map(marker =>
			marker.id === location.key &&
				this.setState({
					currentMarker: marker
				})
		);
	}

	render () {
		const { query, locations, isListEnable } = this.state;

		return (
			<section className="list-box">
				<form
					className="list-form"
					onSubmit={(event) => event.preventDefault()}>
					<button
						className="list-btn"
						onClick={() => this.toggleListVisibility()}>Places</button>

					<input
						className="list-input"
						aria-labelledby="filter"
						type="text"
						placeholder="Search for places"
						value={query}
						onChange={(event) => 
							this.updateQuery(event.target.value)}/>
				</form>

				{isListEnable &&
					<ul className="place-list">
					{locations.map(location => ( <li
								tabIndex={0}
								role="button"
								className="place-item"
								key={location.key}
								onClick={() => 
									this.manageClickedMarker(location)}
								onKeyPress={() => 
									this.manageClickedMarker(location)}>

								{location.title}
						</li> ))
					}
				</ul>
				}
			</section>
		);
	}
}

export default Locations;
