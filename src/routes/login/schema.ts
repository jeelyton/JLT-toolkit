import { z } from "zod";
 
export const formSchema = z.object({
  username: z.string()
    .min(2, "用户名至少需要2个字符")
    .max(50, "用户名不能超过50个字符"),
  password: z.string()
    .min(8, "密码至少需要8个字符")
    .max(50, "密码不能超过50个字符"),
});
 
export type FormSchema = typeof formSchema;