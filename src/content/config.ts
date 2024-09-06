import { defineCollection, z } from 'astro:content';

const typCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        author: z.string().optional(),
        desc: z.any().optional(),
        date: z.any(),
    })
});

export const collections = {
    'typ': typCollection,
};
