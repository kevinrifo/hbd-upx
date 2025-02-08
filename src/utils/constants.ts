import { Prisma } from "@prisma/client"

export const cronRule = "* * * * *" 
export type BirthdayMessageWithUser = Prisma.BirthdayMessageGetPayload<{
    include: { user: true }
}>