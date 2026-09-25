import { pageSession } from "@/lib/session";
import { getProfileDetails } from "@/features/profile/server";
import { ProfileView } from "@/features/profile/profile-view";
import { SkillsManager } from "@/features/profile/skills-manager";
import { AvatarUploader } from "@/features/profile/avatar-uploader";

export const metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const session = await pageSession();
  const { skills, stats, reviews, distribution } = await getProfileDetails(session.userId, 5);
  return (
    <ProfileView
      isSelf
      user={{ fullName: session.fullName, avatarUrl: session.avatarUrl, role: session.role, email: session.email }}
      stats={stats}
      skills={skills}
      reviews={reviews}
      distribution={distribution}
      avatar={<AvatarUploader fullName={session.fullName} initialUrl={session.avatarUrl} />}
      skillsEditor={<SkillsManager initialSkills={skills} />}
    />
  );
}
