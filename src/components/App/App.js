import React, { Component } from 'react';
import './App.style.scss';

import hotelResultService from '../../services/hotel-result/hotel-result.service';

export const Hotel = ({
  hotel: { id, hotelStaticContent, lowestAveragePrice, rewards },
}) => (
  <div className="hotel-card" key={id}>
    <div
      className="image"
      style={{
        backgroundImage: `url(${hotelStaticContent.mainImage.url})`,
      }}
    ></div>
    <div className="hotel-details">
      <div className="hotel-name">{hotelStaticContent.name}</div>
      <div className="location">{hotelStaticContent.neighborhoodName}</div>
    </div>
    <div className="price-details">
      <span className="price">
        <span
          dangerouslySetInnerHTML={{
            __html: lowestAveragePrice.symbol,
          }}
        ></span>
        {lowestAveragePrice.amount}
      </span>
      <span className="rewards">{rewards.miles} miles</span>
      <button className="button">Select</button>
    </div>
  </div>
);

export const ErrorUI = () => (
  <div>
    <h1>
      Oh no! There seems to be a techical problem at the moment. Please try
      again in a bit!
    </h1>
  </div>
);

export default class App extends Component {
  state = {
    apiReturnedError: false,
    hotelNameInput: '',
    hotels: [],
  };

  get matchingHotels() {
    const { hotelNameInput, hotels } = this.state;

    const hotelNameRegExp = new RegExp(hotelNameInput.trim() || '.*', 'i');
    return hotels.filter(({ hotelStaticContent: { name } }) =>
      name.match(hotelNameRegExp)
    );
  }

  componentDidMount() {
    hotelResultService
      .get()
      .then(response => {
        this.setState({ hotels: response.results.hotels });
      })
      .catch(err => {
        this.setState({ apiReturnedError: true });
      });
  }

  onChangeHotelNameInput = ({ target: { value: hotelNameInput } }) => {
    this.setState({ hotelNameInput });
  };

  render() {
    const {
      onChangeHotelNameInput,
      matchingHotels,
      state: { apiReturnedError, hotelNameInput },
    } = this;

    return (
      <div className="app-container">
        <div className="content">
          <div>
            <div className="filters">
              Hotel name
              <input
                type="text"
                className="input"
                onChange={this.onChangeHotelNameInput}
                maxLength={50}
                value={hotelNameInput}
              />
              Price
              <select name="" className="select">
                <option value="">Recommended</option>
                <option value="">Price low-to-high</option>
                <option value="">Price high-to-low</option>
              </select>
              <button className="button">Reset</button>
            </div>
          </div>

          {apiReturnedError ? (
            <ErrorUI />
          ) : (
            <div className="hotel-list">
              {matchingHotels.map(hotel => (
                <Hotel {...{ hotel, key: hotel.id }} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
