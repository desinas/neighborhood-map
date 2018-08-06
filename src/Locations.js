import React, { Component } from 'react';
import escapeRegExp from 'escape-string-regexp';

import * as dataLocations from './locations.json';

class FilterLocations extends Component {
	constructor(props) {
		super(props);
		this.state = {
			query: '',
			locations: dataLocations,
			markers: [],
			currentMarker: {},
			listIsOpen: true
		};
	}

	componentDidMount() {
		/* Set the markers state to the value of the props */
		this.setState({
			markers: this.props.markers
		});
	}

	/* 
	 * Update the visible query
	 * manage the sync of the different state arrays
	 */
	updateQuery = (query) => {
		
		this.setState({
			query,
			listIsOpen: true
		});

		/* Manage list displaying */
		if (query === '') {
			this.setState({
			listIsOpen: false
		});
		}
		this.handleDisplayedLocations(query);
	}

	toggleListVisibility = () => {
		this.setState((prevState) => ({
			listIsOpen: !(prevState.listIsOpen)
		}));
	}

	handleDisplayedLocations = (query) => {
		/* Manage the sync of locations */
		let controlledThis = this;
		let filtLocations;
		let filtMarkers;

		if (query) {
			const match = new RegExp(escapeRegExp(query), 'i');

			/* Add location to the array if its title match the query */
			filtLocations = this.props.locationsList.filter(location =>
				match.test(location.title)
			);

			/* Add marker to the array if its title match the query */
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

		/* Display the markers on the map accordingly to the state */
		this.props.markers.map(marker => marker.setVisible(false));
		setTimeout(function () {
			controlledThis.props.markers.map(marker =>
				controlledThis.handleMarkersVisibility(marker))
		}, 1)
	}

	handleMarkersVisibility = (mark) => {
		/* Make the matching markers visible on the map */
		this.state.markers.map(marker =>
			mark.id === marker.id && marker.setVisible(true)
		)
	}

	/* 
	 * Manage the animation of the markers
	 * when clicking on the list item
	 */
	manageClickedMarker = (location) => {
		
		let controlledThis = this;
		this.removeAnimationMarker();
		this.addAnimationMarker(location);
		setTimeout(function () {
			controlledThis.removeAnimationMarker()
		}, 1250);

		/* 
		 * Get the current marker
		 * Open the Info Winfow accordingly 
		 */
		this.getCurrentMarker(location);

		setTimeout(function () {
			controlledThis.props.openInfoBox(
				controlledThis.state.currentMarker
			);
		}, 1)
	}

	removeAnimationMarker = () => {
		/* Remove all the animations */
		this.state.markers.map(marker =>
			marker.setAnimation(null)
		)
	}

	addAnimationMarker = (location) => {
		/* Add animation to the active marker */
		this.state.markers.map(marker =>
			marker.id === location.short &&
				marker.setAnimation(
					window.google.maps.Animation.BOUNCE)
		);
	}

	getCurrentMarker = (location) => {
		/* 
		 * Get the marker clicked
		 * to give the good info in the InfoBox
		 */
		this.state.markers.map(marker =>
			marker.id === location.short &&
				this.setState({
					currentMarker: marker
				})
		);
	}

	render () {
		const { query, locations, listIsOpen } = this.state;

		return (
			<section className="list-box">
				<form
					className="list-form"
					onSubmit={(event) => event.preventDefault()}
				>
					<button
						className="list-btn"
						onClick={() => this.toggleListVisibility()}
					>
						List
					</button>

					<input
						className="list-input"
						aria-labelledby="filter"
						type="text"
						placeholder="Filter Locations..."
						value={query}
						onChange={(event) => 
							this.updateQuery(event.target.value)}
					/>
				</form>

				{
					listIsOpen &&
					<ul className="locations-list">
					{
						locations.map(location => (
							<li
								tabIndex={0}
								role="button"
								className="location-item"
								short={location.short}
								onClick={() => 
									this.manageClickedMarker(location)}
								onKeyPress={() => 
									this.manageClickedMarker(location)}
							>
								{location.title}
							</li>
						))
					}
				</ul>
				}
			</section>
		);
	}
}

export default FilterLocations;
