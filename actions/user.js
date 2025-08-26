"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { success } from "zod";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth(); // auth from clerk
  if (!userId) throw new Error("Unauthorised");

  // checking if user exists in database

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  //   if user wont exists in database

  if (!user) throw new Error("User not found");

  //connecting data to database

  try {
    const result = await db.$transaction(
      async (tx) => {
        // tx is for one single transaction

        // 1. find if industry exists

        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry, // we will get this industry and all other data from data object
          },
        });

        // 2. if industry doesnt exists, create it with default values - will replace it with ai later

        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // after 1 week
            },
          });
        }

        // 3. update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id, //from database
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000,
      }
    ); // if anyone of 3 steps fails then the complete transaction fails

    return { success: true, ...result };
  } catch (error) {
    console.error("Error updating user and industry : ", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth(); // auth from clerk
  if (!userId) throw new Error("Unauthorised");

  // checking if user exists in database

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  //   if user wont exists in database

  if (!user) throw new Error("User not found");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true, // we can also use user.id instead of userId
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status : ", error.message);
    throw new Error("Failed to check onboarding status");
  }
}
