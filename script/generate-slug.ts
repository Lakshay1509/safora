import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

function generateSlug(text: string): string {
    let slug = text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')   
        .replace(/\s+/g, '-')       
        .replace(/--+/g, '-');
    
    const maxLength = 60;
    if (slug.length > maxLength) {
        const lastHyphenIndex = slug.substring(0, maxLength).lastIndexOf('-');
        if (lastHyphenIndex !== -1) {
            slug = slug.substring(0, lastHyphenIndex);
        } else {
            slug = slug.substring(0, maxLength);
        }
    }

    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    return `${slug}-${uniqueSuffix}`;
}

async function updateAllPostSlugs() {
    try {
        // Fetch all posts without slugs
        const { data: posts, error } = await supabase
            .from('posts')
            .select('id, heading')
            .is('slug', null);

        if (error) throw error;

        console.log(`Found ${posts.length} posts to update`);

        // Update each post with generated slug
        for (const post of posts) {
            const slug = generateSlug(post.heading);
            
            const { error: updateError } = await supabase
                .from('posts')
                .update({ slug })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Error updating post ${post.id}:`, updateError);
            } else {
                console.log(`✓ Updated post ${post.id} with slug: ${slug}`);
            }
        }

        console.log('All posts updated successfully!');
    } catch (error) {
        console.error('Error:', error);
    }
}

updateAllPostSlugs();
