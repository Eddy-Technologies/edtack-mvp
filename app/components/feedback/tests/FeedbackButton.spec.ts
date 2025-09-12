// app/components/common/tests/FeedbackButton.spec.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import FeedbackButton from '../FeedbackButton.vue'; // Adjust path as needed

describe('FeedbackButton.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(FeedbackButton);
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.text()).toContain('Feedback');
  });

  it('emits openFeedback event when clicked', async () => {
    const wrapper = mount(FeedbackButton);
    const button = wrapper.find('button');

    await button.trigger('click');

    expect(wrapper.emitted()).toHaveProperty('openFeedback');
    expect(wrapper.emitted().openFeedback).toHaveLength(1);
  });
});
