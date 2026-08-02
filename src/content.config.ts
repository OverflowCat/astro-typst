import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const typCollection = defineCollection({
    loader: glob({ pattern: '**/*.typ', base: './src/content/typ' }),
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
