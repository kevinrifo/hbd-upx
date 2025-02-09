import { Prisma } from "@prisma/client"

export const cronRule = "* * * * *"
export const sendHBDat = "16:51:00"
export type BirthdayMessageWithUser = Prisma.BirthdayMessageGetPayload<{
    include: { user: true }
}>