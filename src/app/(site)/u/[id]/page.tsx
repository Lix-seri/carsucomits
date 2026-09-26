import { notFound, redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/session";
import { getProfileDetails, getPublicUser } from "@/features/profile/server";
import { ProfileView } from "@/features/profile/profile-view";
import { MessageButton } from "@/features/messages/message-button";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const user = await getPublicUser((await params).id);
  return { title: user && user.role !== "ADMIN" ? user.fullName : "Profile not found" };
}

export default async function PublicProfile({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  // Your own profile is the editable one.
  if (session?.userId === id) redirect("/profile");

  const user = await getPublicUser(id);
  // Admin accounts have no public profile.
  if (!user || user.role === "ADMIN") notFound();
  const { skills, stats, reviews, distribution, activeJobs } = await getProfileDetails(user.id, 8);

  return (
    <ProfileView
      user={{ ...user, verified: !!user.verifiedAt }}
      stats={stats}
      skills={skills}
      reviews={reviews}
      distribution={distribution}
      activeJobs={activeJobs}
      actions={session && user.status !== "BANNED" ? <MessageButton userId={user.id} /> : undefined}
      notice={
        user.status !== "ACTIVE" && (
          <div role="note" className="flex items-start gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              <span className="font-semibold">This account is currently {user.status.toLowerCase()}.</span> Admins may be reviewing reports about it.
            </p>
          </div>
        )
      }
    />
  );
}
