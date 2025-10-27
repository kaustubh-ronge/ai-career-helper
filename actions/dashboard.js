// "use server";

// import { db } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash",
// });

// export const generateAIInsights = async (industry) => {
//   const prompt = `
//           Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
//           {
//             "salaryRanges": [
//               { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
//             ],
//             "growthRate": number,
//             "demandLevel": "High" | "Medium" | "Low",
//             "topSkills": ["skill1", "skill2"],
//             "marketOutlook": "Positive" | "Neutral" | "Negative",
//             "keyTrends": ["trend1", "trend2"],
//             "recommendedSkills": ["skill1", "skill2"]
//           }
          
//           IMPORTANT: Return ONnLY the JSON. No additional text, notes, or markdown formatting.
//           Include at least 5 common roles for salary ranges.
//           Growth rate should be a percentage.
//           Include at least 5 skills and trends.
//         `;

//   const result = await model.generateContent(prompt);
//   const response = result.response;
//   const text = response.text();
//   const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
//   return JSON.parse(cleanedText);
// };

// export async function getIndustryInsights() {
//   const { userId } = await auth(); // auth from clerk
//   if (!userId) throw new Error("Unauthorised");

//   // checking if user exists in database

//   const user = await db.user.findUnique({
//     where: {
//       clerkUserId: userId,
//     },
//     include: {
//       industryInsight: true,
//     },
//   });

//   // check if industry insights exits and if not then  ...

//   if (!user.industryInsight) {
//     const insights = await generateAIInsights(user.industry);

//     const industryInsight = await db.industryInsight.create({
//       data: {
//         industry: user.industry,
//         ...insights,
//         nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // after 1 week
//       },
//     });

//     return industryInsight; // if we wont already have industryInsights
//   }

//   return user.industryInsight; // if we already have industryInsights

//   if (!user) throw new Error("User not found");
// }


"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// --- No changes to this function ---
export const generateAIInsights = async (industry) => {
  const prompt = `
         Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
         {
           "salaryRanges": [
             { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
           ],
           "growthRate": number,
           "demandLevel": "High" | "Medium" | "Low",
           "topSkills": ["skill1", "skill2"],
           "marketOutlook": "Positive" | "Neutral" | "Negative",
           "keyTrends": ["trend1", "trend2"],
           "recommendedSkills": ["skill1", "skill2"]
         }
         
         IMPORTANT: Return ONnLY the JSON. No additional text, notes, or markdown formatting.
         Include at least 5 common roles for salary ranges.
         Growth rate should be a percentage.
         Include at least 5 skills and trends.
       `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  // Simple cleaning (your original logic)
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(cleanedText);
};

// --- This function is fixed ---
export async function getIndustryInsights() {
  const { userId } = await auth(); // auth from clerk
  if (!userId) throw new Error("Unauthorised");

  // checking if user exists in database
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      industryInsight: true,
    },
  });

  // 💡 FIX 1: Check for user existence *immediately* after fetching.
  // This prevents the "cannot read properties of null" crash.
  if (!user) {
    throw new Error("User not found");
  }

  // 💡 FIX 2: Check for the 'industry' field *before* using it.
  // This prevents the "Argument `industry` must not be null" error.
  if (!user.industry) {
    console.error(`User ${userId} does not have an industry set.`);
    // Returning null is safer for your component than throwing an error
    return null;
    // Or, if you prefer: throw new Error("User industry is not set.");
  }

  // check if industry insights exits and if not then ...
  // This logic is now safe because we know 'user' and 'user.industry' exist.
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry, // This is now guaranteed to be a valid string
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // after 1 week
      },
    });

    return industryInsight; // if we wont already have industryInsights
  }

  // Your original logic: if we already have industryInsights
  return user.industryInsight;

  // Your original 'if (!user)' check was here, but it was unreachable.
  // It is now correctly placed at the top.
}