import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(() => {
  throw createError({
    statusCode: 501,
    message: 'Text-to-speech feature is not implemented.',
  });
});
