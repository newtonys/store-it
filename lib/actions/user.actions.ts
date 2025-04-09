"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])]
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) {
    throw new Error("Failed to send an OTP");
  }

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKUAAACUCAMAAADF0xngAAAAOVBMVEWVu9////+QuN6Mtt2bv+G30Ong6vWqyOXy9vv4+v2uyuakxOOItNzY5fLt8/nT4vHL3e+/1evo7/jmxjlfAAAE4ElEQVR4nO2c3XqkIAyGNSAooPzc/8WujNt12jozkDihPtv3bPdkvhIIJHzYdb/8ggNAgJRWZ6yU67+gtaSvgBA6zCot45QZl6TmoIX4QUKhk4Pqj1CD7H6GUADjp0ONmcmbnxB5J9NjjTedSbrGGkH6pxI3vGw6nGCWApF9v5iGMiEWaczEZjIhFIvs+9BIZpXIVjIrwr3RIuigK0X2vW4gs2x137Owa4S5WmTfz9yDqZ9vOMdMmlekOD5dvEIJVpUSJbLvJadIh5mVmZnz4GFHpMrR8omsTug7nKkdG/A15HwiJTbga8j51o9Fi+x7tolJmJaME1Pgp+U6MbkSu6s/aOwsXBnTEUT2PZdKIKnkmpfYTXyDKRUBJRGtqYhnMBG1xD1MdcWvyv9N5TXWeNeRVHKJFCSVbPs4SSXbPn6J0wayGN9gK8krW4KfYWsQwkBQObAVkZeoey5SQ3YJrTLxiSQsH8bu+jU6MGAwPdbMxHk9Bdjdh7W1ju4bsPUMMui8zpfTM9hjEe8dtMNlzMSrEhly3oAjN0nO7fHGNe7OMImdNaVviPr1k3hvzjJgqlW2MG9UD2aDoUQkI+409Je6UlI10VjbbWXqrn5DVDl1WszKG1Aec9XOnAW2NLVPreJ9k1maNFv63NapWZaOhmaTcqOonGxnxfsn83XQ24Z7Q+jnR81Ftww3fPz4cz/r7mNtYLgGGfczLehHJ4+035vAHHmNtyBsWDOl3xWIQX1PnZMa9vGDdcCnYNkGFJxR21S88zBBZ+PnAU3R3nnV//qkRmXc+3UCSB32UUv3MQThpInez95HI939qIHc/4IpaPlWC7sAEz4P2GI+L2AAEELAFxXiixU7BQNvWvjrL/vx++QLL8cFDtqd0+i7NwwogHlwAJrM06cS0D2qNtXpbxeEfXJIS8PDFQFueFIeKXtq3F+1qMcovwdw/Q8ZX7RATm1gFzQyVDC2c3nhZITrrAkFh+Tz3Hmu7Eg+jUn5EIdhiMGrdLDSDv+6k9pwouTZCR5/ytwk3eeVcEqdLin3zCUsJ/QL3xzvzAkxp5nayiCHvKozgIXcUSBc35ZD7WS/fYFvUJc5xVxbDnEHkthr0TomWshplrZySE9qSG7qGki3qI4n4GvIKWcOmjuwBsLEJJn86yA0vBj28A8Ie3lFR5oKoaP99kPbDv74hre61IO/SWXaxDfQWznJwVgLvubl2nky+AMH3+Kh+KEYReId4nz7YwaZiliXOHqRsxRmO8gSjWT4rgdpEXcc5ePOiDtiCr79MTPhxpKpMvunErXIiY+N6kE9T2JORMhUxFhObKCKCuZ0iUyYbLX4B6iaHOWwJKlEbZG8Ww/SYibxTzpwJEzCvIhKzpN6BlXsWnaVmGdU11B5jYhfIxOx9gwyuL4B8KYipAUbJGfMFd649cytca5GymNOEF08sIady6Qi2akHnX7wOdNzUIM+56OokM12hTaMGqYx2/VOdMFANo/NZ+b5Zc42stPtWdkeZI8MjPVMarAHBqTzpAonTFAL+ktpiwpGOAYX5jpNOztEr+qkjsrHwXasn2TOvyWljvOL7/DeApx81FJ2b4zxC7HCOZAmBj+rlJZx+0D0NI3jkpKafYhGguOI8GupN2/ouriktVobY7S2dh07uPlFf4DAXy7HH34BQUDyAKKvAAAAAElFTkSuQmCC",

        accountId,
      }
    );
  }

  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};
