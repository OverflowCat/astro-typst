import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const typCollection = defineCollection({
    loader: glob({ pattern: '**/*.typ', base: './src/content/typ' }),
    schema: z.object({
        title: z.string(),
        author: z.string().optional(),
        desc: z.any().optional(),
        date: z.any(),
    })
});

export const collections: Record<string, ReturnType<typeof defineCollection>> = {
    'typ': typCollection,
};
