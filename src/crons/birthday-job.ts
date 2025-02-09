import axios from "axios";
import moment from 'moment-timezone';
import prisma from "../configs/db";
import { BirthdayMessageWithUser, sendHBDat } from "../utils/constants";
import { delay } from "../utils/helper";

async function birthDayMessage() {
    console.log('Executing job')
    //Get users and unsent messages
    const [usersToWishHBD, unsentMessages] = await Promise.all([
        findMatchingBirthday(),
        prisma.birthdayMessage.findMany({
            include: { user: true },
            where: { sent_at: null }
        })
    ]);

    const birthDayMessages: Array<BirthdayMessageWithUser> = [...unsentMessages];

    const usersWithSendDate = usersToWishHBD.map(user => ({
        user,
        send_date: moment(user.sendBirtdayMessageAt).utc().format("YYYY-MM-DD")
    }));

    // Fetch all existing messages if exists
    const existingMessages = await prisma.birthdayMessage.findMany({
        where: {
            OR: usersWithSendDate.map(({ user, send_date }) => ({
                user_id: user.id,
                send_date
            }))
        },
        select: { user_id: true, send_date: true }
    });

    // Convert existing messages into a set for faster comparing
    const existingUserMessages = new Set(existingMessages.map(({ user_id, send_date }) => `${user_id}-${send_date}`));

    // Only makes message if theres no previous identical message
    const messagesToBeCreated = usersWithSendDate
        .filter(({ user, send_date }) => !existingUserMessages.has(`${user.id}-${send_date}`))
        .map(({ user, send_date }) => ({
            user_id: user.id,
            sent_at: null,
            send_date
        }));

    //Insert multiple new messages with single query
    if (messagesToBeCreated.length > 0) {
        await prisma.birthdayMessage.createMany({ data: messagesToBeCreated, skipDuplicates: true });

        // Fetch inserted messages with user data
        const createdMessages: Array<BirthdayMessageWithUser> = await prisma.birthdayMessage.findMany({
            where: {
                OR: messagesToBeCreated.map(({ user_id, send_date }) => ({
                    user_id,
                    send_date
                }))
            },
            include: { user: true }
        });

        //Push created messages to existing queue, ready to send
        birthDayMessages.push(...createdMessages)
    }

    for (const birthdayMessage of birthDayMessages) {
        try {
            const response = await axios.post(`${process.env.API_BASE_URL}/send-email/`, {
                email: birthdayMessage.user.email,
                message: `Hey, ${birthdayMessage.user.first_name} ${birthdayMessage.user.last_name} it’s your birthday`
            });

            if ((response.data.status) as string == "sent") {
                // Update the sent_at so we know its already sent and wont be sent again at the next attempt
                await prisma.birthdayMessage.update({
                    where: { id: birthdayMessage.id },
                    data: { sent_at: moment().utc().format() }
                })
            }

            //3 secs delay for each message
            await delay(3)
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : "Unknown error");
        }
    }
};

const findMatchingBirthday = async (): Promise<Array<any>> => {

    // Our server time in UTC
    const nowUtc = moment()
        .utc()
        .set({ second: 0, millisecond: 0 })
        .format()

    const allUsers = await prisma.user.findMany();

    /** 
      Add sendBirtdayMessageAt field
      But, we need to convert their 9am to UTC first
     **/

    const mappedUsers = allUsers.map(user => {

        // Edge case: get the user's current local time (which may still be in the previous year)
        const userYear = moment().tz(user.timezone).year();

        return {
            ...user,
            sendBirtdayMessageAt: moment
                .tz(`${userYear}-${user.birth_date.slice(5)} ${sendHBDat}`, user.timezone) // User's 9 AM
                .utc()
                .format()
        };
    });

    // If now is their 9am on their birthday, include it to current queue
    const toBeWished = mappedUsers.filter(x => x.sendBirtdayMessageAt == nowUtc)

    return toBeWished
}




export { birthDayMessage }