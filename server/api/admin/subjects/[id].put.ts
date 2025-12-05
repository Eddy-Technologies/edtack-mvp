import { getSupabaseClient } from '~~/server/utils/authConfig';
import { requireAdmin } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getSupabaseClient(event);
    const subjectName = getRouterParam(event, 'id');
    const body = await readBody(event);

    await requireAdmin(event);

    const { data, error } = await supabase
      .from('subjects')
      .update({
        subject_name: body.subject_name,
        display_name: body.display_name,
        description: body.description,
        country_code: body.country_code,
        is_active: body.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('name', subjectName)
      .select()
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update subject: ${error.message}`
      });
    }

    return {
      success: true,
      data
    };
  } catch (err: any) {
    console.error('Update subject error:', err);
    if (err.statusCode) throw err;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update subject'
    });
  }
});
