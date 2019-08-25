import React from 'react';
import { shallow } from 'enzyme';
import App from './App';

import { successResponse } from '../../../test/fixtures/rates-200';

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
              hotels: [{ id: '0' }, { id: '1' }, { id: '2' }],
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
    describe('name filtering', () => {
      test('entering a hotel name', () => {
        wrapper
          .instance()
          .onChangeHotelNameInput({ target: { value: 'a nice hotel' } });

        expect(wrapper.state()).toMatchObject({
          hotelNameInput: 'a nice hotel',
        });
      });
    });
  });
});
