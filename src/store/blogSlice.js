import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [
    {
      id: 1,
      slug: 'art-of-rare-oudh',
      title: 'THE ART OF RARE OUDH',
      excerpt: 'Discover the ancient trade of extraction and the soul of Arabian luxury.',
      description: 'The extraction of Oudh is a traditional art that dates back centuries. It is not just about the scent, but the legacy of the earth itself.',
      author: 'KIKS EDITORIAL',
      date: 'April 4, 2026',
      image: 'https://images.unsplash.com/photo-1616604847470-a3c3fdfded8b?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 2,
      slug: 'spring-season-fragrance-trends',
      title: 'SPRING SEASON FRAGRANCE TRENDS',
      excerpt: 'Fresh, floral, and vibrant notes are taking center stage this 2026.',
      description: 'This spring, we are seeing a shift towards more sustainable and organic floral extracts. Notes of jasmine and sandalwood are leading the way.',
      author: 'ARAMBH TEAM',
      date: 'April 2, 2026',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200'
    }
  ],
};

export const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    addPost: (state, action) => {
      // Create a slug from title if not provided
      const slug = action.payload.slug || action.payload.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      state.posts.unshift({
        id: state.posts.length + 1,
        slug,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        ...action.payload,
      });
    }
  },
});

export const { addPost } = blogSlice.actions;
export default blogSlice.reducer;
