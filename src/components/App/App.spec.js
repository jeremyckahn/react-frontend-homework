import React from 'react';
import { shallow } from 'enzyme';
import App, { Hotel } from './App';

import { successResponse } from '../../../test/fixtures/rates-200';

describe('App', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<App />);
  });

  test('renders the component', () => {
    expect(wrapper.find('.app-container').exists()).toBe(true);
  });

  describe('hotel rendering', () => {
    test('renders all hotels provided', () => {
      wrapper.setState({ hotels: successResponse.results.hotels });
      expect(wrapper.find(Hotel)).toHaveLength(successResponse.results.total);
    });
  });
});
