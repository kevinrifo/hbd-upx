# Prisma API Project

This is a simple Node.js API using **Express.js** and **Prisma ORM** to manage users.

## Prerequisites

Make sure you have the following installed:
- **Node.js** (LTS recommended)
- **MySQL**

---

## Setup Instructions

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file and configure your database connection:

_Please look at .env.example_

### 4. Initialize Prisma
Run the following command to initialize Prisma and apply migrations:
```sh
npx prisma migrate dev --name init
```

### 5. Start the Server (Development)
```sh
npm run dev  
```

---

## API Routes

### Create User
**POST** `/user`
```json
{
    "firstName": "Kevin",
    "lastName": "Rifo Buana",
    "email": "kevin@gmail.com",
    "location": "Indonesia",
    "birthDate": "1999-04-02",
    "timezone": "Australia/Melbourne" // Must be correct UTC timezone
}
```

### Get All Users
**GET** `/user`

### Update User
**PUT** `/user/:id`
```json
{
    "firstName": "Kevin",
    "lastName": "Rifo Buana",
    "email": "kevin@gmail.com",
    "location": "Indonesia",
    "birthDate": "1999-04-02",
    "timezone": "Asia/Jakarta" // Must be correct UTC timezone
}
```

### Delete User
**DELETE** `/user/:id`

---

## Additional Features
- **Prisma ORM** for database interaction.
- **Express.js** for handling API requests.
- **Moment.js** for date and timezone handling.
- **Cron Job** to automate sending birthday messages.

### Running Prisma Studio (Visual Database UI)
```sh
npx prisma studio
```

### Generate Prisma Client (if needed)
```sh
npx prisma generate
```

---

## License
MIT License

---

## Author
Kevin Rifo Buana

