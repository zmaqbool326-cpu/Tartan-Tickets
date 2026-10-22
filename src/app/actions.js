"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWaitlistService, WaitlistError } from "../lib/waitlist.js";

function formValue(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function redirectWithMessage(message, identity = "") {
  const params = new URLSearchParams({ notice: message });
  if (identity) {
    params.set("identity", identity);
  }
  redirect(`/?${params.toString()}`);
}

export async function joinWaitlistAction(formData) {
  const eventId = formValue(formData, "eventId");
  const demoName = formValue(formData, "demoName");
  try {
    getWaitlistService().joinWaitlist({ eventId, demoName });
  } catch (error) {
    if (error instanceof WaitlistError) {
      redirectWithMessage(error.message, demoName.trim());
    }
    throw error;
  }
  revalidatePath("/");
  const eventTitle = getWaitlistService().getEventState(eventId).event.title;
  redirectWithMessage(`You joined the waitlist for ${eventTitle}.`, demoName.trim());
}

export async function simulateSeatReleaseAction(formData) {
  const eventId = formValue(formData, "eventId");
  const demoName = formValue(formData, "demoName");
  try {
    getWaitlistService().simulateSeatRelease(eventId);
  } catch (error) {
    if (error instanceof WaitlistError) {
      redirectWithMessage(error.message, demoName.trim());
    }
    throw error;
  }
  revalidatePath("/");
  redirectWithMessage("Seat release simulated.", demoName.trim());
}
