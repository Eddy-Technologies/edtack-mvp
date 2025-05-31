// app/components/common/tests/FeedbackForm.spec.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeedbackForm from '../FeedbackForm.vue'; // Adjust path as needed

// Mock global fetch
global.fetch = vi.fn();

describe('FeedbackForm.vue', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.mocked(global.fetch).mockClear();
    // Mock a successful response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
    // Mock alert, as it's used in the component
    global.alert = vi.fn();
  });

  it('renders all form fields and the submit button', () => {
    const wrapper = mount(FeedbackForm);
    expect(wrapper.find('input[name="name"]').exists()).toBe(true);
    expect(wrapper.find('input[name="email"]').exists()).toBe(true);
    expect(wrapper.find('textarea[name="message"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('allows input into form fields', async () => {
    const wrapper = mount(FeedbackForm);
    await wrapper.find('input[name="name"]').setValue('Test Name');
    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('textarea[name="message"]').setValue('Test message');

    expect((wrapper.find('input[name="name"]').element as HTMLInputElement).value).toBe('Test Name');
    expect((wrapper.find('input[name="email"]').element as HTMLInputElement).value).toBe('test@example.com');
    expect((wrapper.find('textarea[name="message"]').element as HTMLTextAreaElement).value).toBe('Test message');
  });

  it('submits the form, emits "close", and resets fields on successful submission', async () => {
    const wrapper = mount(FeedbackForm);

    await wrapper.find('input[name="name"]').setValue('Test Name');
    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('textarea[name="message"]').setValue('Test Feedback');

    await wrapper.find('form').trigger('submit.prevent');

    // Check if fetch was called
    expect(global.fetch).toHaveBeenCalledTimes(1);
    // Check for Formspree URL (optional, but good to ensure it's the right endpoint)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://formspree.io/f/xgvkdgwj',
      expect.any(Object) // Or more specific expectation for options
    );

    // Check for emitted event (needs a tick for promises to resolve)
    await wrapper.vm.$nextTick(); // Allow time for async operations in handleSubmit
    await wrapper.vm.$nextTick(); // Additional tick might be needed

    expect(wrapper.emitted()).toHaveProperty('close');
    expect(wrapper.emitted().close).toHaveLength(1);

    // Check if form fields are reset
    expect((wrapper.find('input[name="name"]').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('input[name="email"]').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('textarea[name="message"]').element as HTMLTextAreaElement).value).toBe('');
  });

  it('handles submission failure', async () => {
    // Mock a failed response
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);
    const alertSpy = vi.spyOn(global, 'alert');

    const wrapper = mount(FeedbackForm);
    await wrapper.find('input[name="name"]').setValue('Test Name');
    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('textarea[name="message"]').setValue('Test Feedback');
    await wrapper.find('form').trigger('submit.prevent');

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith('There was an error submitting your feedback. Please try again.');
    expect(wrapper.emitted().close).toBeUndefined(); // Should not emit close on failure

    alertSpy.mockRestore();
  });
});
