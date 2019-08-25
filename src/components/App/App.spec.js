import React from 'react';
import { shallow } from 'enzyme';
import App, { sortOrders } from './App';

const mockHotel = ({ name = '', price = 0, id }) => ({
  id,
  hotelStaticContent: {
    name,
  },
  lowestAveragePrice: {
    amount: price,
  },
});

describe('App', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<App />);
  });

  test('renders the component', () => {
    expect(wrapper.find('.app-container').exists()).toBe(true);
  });

  describe('unsuccessful response', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.mock('../../services/hotel-result/hotel-result.service', () => ({
        get: () =>
          Promise.reject({
            success: false,
            results: [],
            message: "It's not you, it's me. Try it again.",
          }),
      }));

      const ReloadedApp = jest.requireActual('./App').default;
      wrapper = shallow(<ReloadedApp />);
    });

    describe('error rendering', () => {
      test('renders error UI', () => {
        expect(wrapper.find('ErrorUI')).toHaveLength(1);
      });
    });
  });

  describe('successful response', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.mock('../../services/hotel-result/hotel-result.service', () => ({
        get: () =>
          Promise.resolve({
            success: true,
            results: {
              total: 3,
              hotels: [
                mockHotel({ id: '0' }),
                mockHotel({ id: '1' }),
                mockHotel({ id: '2' }),
              ],
            },
          }),
      }));

      const ReloadedApp = jest.requireActual('./App').default;
      wrapper = shallow(<ReloadedApp />);
    });

    describe('hotel rendering', () => {
      test('renders all hotels provided', () => {
        expect(wrapper.find('Hotel')).toHaveLength(3);
      });
    });
  });

  describe('filtering', () => {
    test('captures hotel name input', () => {
      wrapper
        .instance()
        .onChangeHotelNameInput({ target: { value: 'a nice hotel' } });

      expect(wrapper.state()).toMatchObject({
        hotelNameInput: 'a nice hotel',
      });
    });

    test('captures sort order change', () => {
      wrapper
        .instance()
        .onChangeSortOrder({ target: { value: sortOrders.DESCENDING } });

      expect(wrapper.state()).toMatchObject({
        sortOrder: sortOrders.DESCENDING,
      });
    });

    test('only renders matching hotels', () => {
      const hotels = [
        mockHotel({ id: '0', name: 'foo' }),
        mockHotel({ id: '1', name: 'bar' }),
      ];

      wrapper.setState({
        hotels,
        hotelNameInput: '  oo  ',
      });

      const Hotels = wrapper.find('Hotel');
      expect(Hotels).toHaveLength(1);
      expect(Hotels.at(0).props().hotel.hotelStaticContent.name).toEqual('foo');
    });

    describe('sorting', () => {
      beforeEach(() => {
        const hotels = [
          mockHotel({ id: '0', name: 'average', price: 200 }),
          mockHotel({ id: '1', name: 'high', price: 300 }),
          mockHotel({ id: '2', name: 'low', price: 100 }),
        ];

        wrapper.setState({
          hotels,
        });
      });

      test('sorts from low to high', () => {
        wrapper.setState({ sortOrder: sortOrders.ASCENDING });
        expect(
          wrapper
            .instance()
            .hotelsToDisplay.map(({ lowestAveragePrice: { amount } }) => amount)
        ).toEqual([100, 200, 300]);
      });

      test('sorts from high to low', () => {
        wrapper.setState({ sortOrder: sortOrders.DESCENDING });
        expect(
          wrapper
            .instance()
            .hotelsToDisplay.map(({ lowestAveragePrice: { amount } }) => amount)
        ).toEqual([300, 200, 100]);
      });
    });
  });
});
