import React, { Component } from 'react';
import './App.style.scss';

import hotelResultService from '../../services/hotel-result/hotel-result.service';

export const sortOrders = {
  RECOMMENDED: 'recommended',
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
};

const Hotel = ({
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
    <p>
      Oh no! There seems to be a technical problem at the moment. Please try
      again in a bit!
    </p>
  </div>
);

export const NoResultsUI = () => (
  <div>
    <p>Dang! No results matched your query. Try broadening your search?</p>
  </div>
);

export default class App extends Component {
  state = {
    apiReturnedError: false,
    hotelNameInput: '',
    hotels: [],
    sortOrder: sortOrders.RECOMMENDED,
  };

  get hotelsToDisplay() {
    const { hotelNameInput, hotels, sortOrder } = this.state;

    const hotelNameRegExp = new RegExp(hotelNameInput.trim() || '.*', 'i');
    const filteredHotels = hotels.filter(({ hotelStaticContent: { name } }) =>
      name.match(hotelNameRegExp)
    );

    if (sortOrder === sortOrders.RECOMMENDED) {
      return filteredHotels;
    }

    return filteredHotels.sort((a, b) => {
      if (sortOrder === sortOrders.ASCENDING) {
        return a.lowestAveragePrice.amount - b.lowestAveragePrice.amount;
      } else if (sortOrder === sortOrders.DESCENDING) {
        return b.lowestAveragePrice.amount - a.lowestAveragePrice.amount;
      }
    });
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

  onChangeSortOrder = ({ target: { value: sortOrder } }) => {
    this.setState({ sortOrder });
  };

  onClickReset = () => {
    this.setState({ hotelNameInput: '', sortOrder: sortOrders.RECOMMENDED });
  };

  render() {
    const {
      onChangeHotelNameInput,
      onChangeSortOrder,
      onClickReset,
      hotelsToDisplay,
      state: { apiReturnedError, sortOrder, hotelNameInput },
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
              <select
                className="select"
                name=""
                onChange={onChangeSortOrder}
                value={sortOrder}
              >
                <option value={sortOrders.RECOMMENDED}>Recommended</option>
                <option value={sortOrders.ASCENDING}>Price low-to-high</option>
                <option value={sortOrders.DESCENDING}>Price high-to-low</option>
              </select>
              <button className="button" onClick={onClickReset}>
                Reset
              </button>
            </div>
          </div>

          {apiReturnedError ? (
            <ErrorUI />
          ) : hotelsToDisplay.length ? (
            <div className="hotel-list">
              {hotelsToDisplay.map(hotel => (
                <Hotel {...{ hotel, key: hotel.id }} />
              ))}
            </div>
          ) : (
            <NoResultsUI />
          )}
        </div>
      </div>
    );
  }
}
