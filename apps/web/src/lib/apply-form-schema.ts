import { z } from 'zod';

export const applyFormSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().min(1, 'メールアドレスを入力してください').email('有効なメールアドレスを入力してください'),
  message: z.string().optional(),
});

export type ApplyFormValues = z.infer<typeof applyFormSchema>;
