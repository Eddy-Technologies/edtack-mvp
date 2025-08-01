import { getSupabaseClient } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    console.log('[Debug] Starting products debug endpoint');
    const supabase = await getSupabaseClient(event);

    // Test 1: Raw count of all products
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log('[Debug] Total products count:', totalCount);
    if (countError) {
      console.error('[Debug] Count error:', countError);
    }

    // Test 2: Get all products with specific fields
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('id, name, is_active, metadata')
      .limit(10);

    console.log('[Debug] Sample products:', allProducts);
    if (allError) {
      console.error('[Debug] All products error:', allError);
    }

    // Test 3: Check is_active filtering
    const { data: activeProducts, error: activeError } = await supabase
      .from('products')
      .select('id, name, is_active')
      .eq('is_active', true);

    console.log('[Debug] Active products:', activeProducts);
    if (activeError) {
      console.error('[Debug] Active products error:', activeError);
    }

    // Test 4: Check sample data products
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('id, name, is_active, metadata')
      .filter('metadata', 'cs', '{"sample_data": "true"}');

    console.log('[Debug] Sample data products:', sampleProducts);
    if (sampleError) {
      console.error('[Debug] Sample data error:', sampleError);
    }

    return {
      totalCount,
      allProducts: allProducts?.length || 0,
      activeProducts: activeProducts?.length || 0,
      sampleProducts: sampleProducts?.length || 0,
      details: {
        allProducts,
        activeProducts,
        sampleProducts
      }
    };
  } catch (error) {
    console.error('[Debug] Exception:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Debug endpoint failed'
    });
  }
});
