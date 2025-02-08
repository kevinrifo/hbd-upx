import axios from "axios";
import moment from 'moment-timezone';
import prisma from "../configs/db";
import { BirthdayMessageWithUser } from "../utils/constants";

async function birthDayMessage() {
    const birthDayMessages: Array<BirthdayMessageWithUser> = [];
    const usersToWishHBD: Array<any> = await findMatchingBirthday();

    //Try to resend unsent messages
    try {
        const unsentMessages = await prisma.birthdayMessage.findMany({
            include: {
                user: true,
            },
            where: { sent_at: null }
        })
        birthDayMessages.push(...unsentMessages)
    } catch (error) {
        console.error('Error getting unsent messages:', error instanceof Error ? error.message : "Unknown error");
    }

    
    for (const user of usersToWishHBD) {

        // Check if message with user and matching birthday exists, if already exists dont make again
        const existingMessage = await prisma.birthdayMessage.findFirst({
            where: { user_id: user.id, send_date: moment(user.sendBirtdayMessageAt).utc().format("YYYY-MM-DD")}
        });

        if (!existingMessage) {
            //Make birthday message records
            const birthdayMessage = await prisma.birthdayMessage.create(
                {
                    data: {
                        user_id: user.id,
                        sent_at: null,
                        send_date: moment(user.sendBirtdayMessageAt).utc().format("YYYY-MM-DD"),
                    },
                    include: {
                        user: true,
                    },
                });
            birthDayMessages.push(birthdayMessage)
        } else {
            console.log('Message already exist, going to send existing message instead if its not sent yet')
        }

    };


    for (const birthdayMessage of birthDayMessages) {
        try {
            const response = await axios.post(`${process.env.API_BASE_URL}/send-email/`, {
                email: birthdayMessage.user.email,
                message: `Hey, ${birthdayMessage.user.first_name} ${birthdayMessage.user.last_name} it’s your birthday`
            });

            if ((response.data.status) as string == "sent") {
                // Update the sent_at so we know its already sent and wont resend at the next attempt
                try {
                    await prisma.birthdayMessage.update({
                        where: { id: birthdayMessage.id },
                        data: { sent_at: moment().utc().format() }
                    })
                }
                catch (error) {
                    console.error('Error:', error instanceof Error ? error.message : "Unknown error");
                }
            }

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

    const mappedUsers = allUsers.map(user => ({
        ...user,
        sendBirtdayMessageAt: moment
            .tz(`${moment().year()}-${user.birth_date.slice(5)} 12:27:00`, user.timezone)
            .utc()
            .format()
    }));

    // If now is their 9am on their birthday, include it to current queue
    const toBeWished = mappedUsers.filter(x => x.sendBirtdayMessageAt == nowUtc)

    return toBeWished
}




export { birthDayMessage }