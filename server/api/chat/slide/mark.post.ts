import { getUserInfo } from '../../../utils/auth';
import { getSupabaseClient, getSupabaseAccessToken } from '~~/server/utils/authConfig';
import { markQuestion } from '~~/server/utils/markingApi';

interface MarkSlideRequest {
  messageId: string;
  slideId: string;
  question: {
    id: string;
    question_type: string;
    title: string;
    content: string;
    answer: any[];
    explanation?: string;
  };
  userAnswer: string | string[];
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const userInfo = await getUserInfo(event);
    const { messageId, slideId, question, userAnswer } = await readBody<MarkSlideRequest>(event);

    if (!messageId || !slideId || !question || !userAnswer) {
      throw createError({
        statusCode: 400,
        statusMessage: 'messageId, slideId, question, and userAnswer are required'
      });
    }

    // Fetch current message content
    const { data: message, error: fetchError } = await supabase
      .from('thread_messages')
      .select('content')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      throw createError({
        statusCode: 404,
        statusMessage: `Message not found: ${fetchError?.message || 'Unknown error'}`
      });
    }

    // Parse existing content and find slide
    let parsedContent: any;
    try {
      parsedContent = JSON.parse(message.content);
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid message content format'
      });
    }

    // Handle both array format and object with slides array
    let slides: any[];
    let isWrappedFormat = false;

    if (Array.isArray(parsedContent)) {
      slides = parsedContent;
    } else if (parsedContent.slides && Array.isArray(parsedContent.slides)) {
      slides = parsedContent.slides;
      isWrappedFormat = true;
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message content does not contain slides array'
      });
    }

    const slideIndex = slides.findIndex((s: any) => s.id === slideId);
    if (slideIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Slide not found in message content'
      });
    }

    // Prepare question data for marking API
    const questionForMarking = {
      id: question.id,
      type: question.question_type,
      title: question.title || '',
      question: question.content || '',
      explanation: question.explanation || '',
      question_correct_answers: question.answer?.map((a: any, idx: number) => ({
        option_id: a.option_id,
        order_index: a.order_index ?? idx,
        answer_text: a.answer_text
      })) || [],
      question_options: []
    };

    // Get auth token for Python backend
    const authToken = await getSupabaseAccessToken(event);

    // Call marking API
    const markingResponse = await markQuestion(
      questionForMarking,
      Array.isArray(userAnswer) ? userAnswer : [userAnswer],
      {
        subject: userInfo.syllabus_type || 'general',
        level: userInfo.level_type || 'secondary',
        country: 'singapore',
        authToken: authToken || undefined,
      }
    );

    // Update slide with user answer and marking result
    const now = new Date().toISOString();
    slides[slideIndex].userAnswer = {
      text: typeof userAnswer === 'string' ? userAnswer : undefined,
      texts: Array.isArray(userAnswer) ? userAnswer : undefined,
      submittedAt: now
    };
    slides[slideIndex].markingResult = {
      status: markingResponse.result.status,
      score: markingResponse.result.score,
      feedback: markingResponse.result.feedback,
      key_concepts_assessed: markingResponse.result.key_concepts_assessed,
      marking_rationale: markingResponse.result.marking_rationale,
      markedAt: now
    };

    // Reconstruct content based on original format
    const updatedContent = isWrappedFormat ?
        JSON.stringify({ ...parsedContent, slides }) :
        JSON.stringify(slides);

    // Save updated content back to database
    const { error: updateError } = await supabase
      .from('thread_messages')
      .update({ content: updatedContent })
      .eq('id', messageId);

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to save marking result: ${updateError.message}`
      });
    }

    return {
      success: true,
      result: markingResponse.result
    };
  } catch (err: any) {
    console.error('Mark slide API error:', err);
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to mark slide answer'
    });
  }
});
