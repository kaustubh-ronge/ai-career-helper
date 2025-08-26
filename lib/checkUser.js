import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser(); // from clerk

  if (!user) {
    return null;
  }

  // if user is already stored

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id, //user.id is from user object
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // but if user isnt stored then create the user
    const name = `${user.firstName} ${user.lastName}`; //from clerk

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    }); // Here everything will come from user i.e user = currentUser() object and it will take first email if there are multiple emails

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};
