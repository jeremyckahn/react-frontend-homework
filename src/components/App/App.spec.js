import React from 'react';
import { shallow } from 'enzyme';
import App from './App';

import { successResponse } from '../../../test/fixtures/rates-200';

const mockHotel = ({ name = '', id }) => ({
  id,
  hotelStaticContent: {
    name,
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
  });
});
