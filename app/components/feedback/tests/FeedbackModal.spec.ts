// app/components/common/tests/FeedbackModal.spec.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import FeedbackModal from '../FeedbackModal.vue'; // Adjust path as needed

// Mock child components
const MockModal = {
  template: '<div v-if="show" class="mock-modal"><slot /><slot name="footer" /></div>',
  props: ['show'],
  emits: ['close'], // Important: ensure mock emits events the parent listens to
};

const MockFeedbackForm = {
  template: '<form class="mock-feedback-form"></form>',
  emits: ['close'], // Important: ensure mock emits events the parent listens to
};

describe('FeedbackModal.vue', () => {
  it('renders Modal and FeedbackForm when show is true', () => {
    const wrapper = mount(FeedbackModal, {
      props: { show: true },
      global: {
        stubs: {
          Modal: MockModal,
          FeedbackForm: MockFeedbackForm,
        },
      },
    });

    expect(wrapper.findComponent(MockModal).exists()).toBe(true);
    expect(wrapper.findComponent(MockFeedbackForm).exists()).toBe(true);
    expect(wrapper.find('.mock-modal').isVisible()).toBe(true); // Check based on MockModal's structure
  });

  it('does not render Modal content when show is false', () => {
    const wrapper = mount(FeedbackModal, {
      props: { show: false },
      global: {
        stubs: {
          Modal: MockModal,
          FeedbackForm: MockFeedbackForm,
        },
      },
    });
    // Depending on Modal.vue's actual behavior, it might still render the root element of Modal
    // but hide it. We check if the *content* we expect is not there or not visible.
    // If MockModal itself conditionally renders its slot based on `show`, this is simpler.
    // Our MockModal uses v-if, so the .mock-modal div itself won't be in the DOM if show is false.
    expect(wrapper.find('.mock-modal').exists()).toBe(false);
  });

  it('emits "close" when Modal emits "close"', async () => {
    const wrapper = mount(FeedbackModal, {
      props: { show: true },
      global: {
        stubs: {
          Modal: MockModal,
          FeedbackForm: MockFeedbackForm,
        },
      },
    });

    const modalComponent = wrapper.findComponent(MockModal);
    await modalComponent.vm.$emit('close'); // Simulate Modal emitting close

    expect(wrapper.emitted()).toHaveProperty('close');
    expect(wrapper.emitted().close).toHaveLength(1);
  });

  it('emits "close" when FeedbackForm emits "close"', async () => {
    const wrapper = mount(FeedbackModal, {
      props: { show: true },
      global: {
        stubs: {
          Modal: MockModal,
          FeedbackForm: MockFeedbackForm,
        },
      },
    });

    const formComponent = wrapper.findComponent(MockFeedbackForm);
    await formComponent.vm.$emit('close'); // Simulate FeedbackForm emitting close

    expect(wrapper.emitted()).toHaveProperty('close');
    expect(wrapper.emitted().close).toHaveLength(1);
  });
});
