// app/components/common/tests/FeedbackForm.spec.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeedbackForm from '../FeedbackForm.vue'; // Adjust path as needed

// Mock global fetch
global.fetch = vi.fn();
// Mock alert
global.alert = vi.fn();

describe('FeedbackForm.vue', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.mocked(global.fetch).mockClear();
    vi.mocked(global.alert).mockClear();
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

  it('submits the form to /api/feedback, emits "close", and resets fields on successful submission', async () => {
    // Mock a successful API response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const wrapper = mount(FeedbackForm);
    const testData = { name: 'Test User', email: 'test@example.com', message: 'Test feedback message' };

    await wrapper.find('input[name="name"]').setValue(testData.name);
    await wrapper.find('input[name="email"]').setValue(testData.email);
    await wrapper.find('textarea[name="message"]').setValue(testData.message);

    await wrapper.find('form').trigger('submit.prevent');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/feedback', // Check for the new API endpoint
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData), // Check for JSON body
      })
    );

    // Allow time for async operations in handleSubmit
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()).toHaveProperty('close');
    expect(wrapper.emitted().close).toHaveLength(1);
    expect(global.alert).toHaveBeenCalledWith('Feedback submitted successfully!');

    expect((wrapper.find('input[name="name"]').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('input[name="email"]').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('textarea[name="message"]').element as HTMLTextAreaElement).value).toBe('');
  });

  it('handles API error when submitting feedback (response.ok true, success false)', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, statusMessage: 'API rejected feedback' }),
    } as Response);
    const alertSpy = vi.spyOn(global, 'alert'); // Use spyOn to not interfere with other alert mocks if any
    const wrapper = mount(FeedbackForm);

    await wrapper.find('input[name="name"]').setValue('Test');
    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('textarea[name="message"]').setValue('Test msg');
    await wrapper.find('form').trigger('submit.prevent');

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith('API rejected feedback');
    expect(wrapper.emitted().close).toBeUndefined();
    alertSpy.mockRestore(); // Restore original alert function
  });

  it('handles HTTP error (e.g., 400, 500) when submitting feedback', async () => {
    // Mock a failed HTTP response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ statusMessage: 'Invalid input data' }),
    } as Response);
    const alertSpy = vi.spyOn(global, 'alert');
    const wrapper = mount(FeedbackForm);

    // Minimal data to trigger submission
    await wrapper.find('input[name="name"]').setValue('Test Name');
    await wrapper.find('input[name="email"]').setValue('test@example.com');
    await wrapper.find('textarea[name="message"]').setValue('Test Message');
    await wrapper.find('form').trigger('submit.prevent');

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith('Error: 400 - Invalid input data');
    expect(wrapper.emitted().close).toBeUndefined(); // Should not emit close on failure
    alertSpy.mockRestore();
  });
});
