import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { removeAvatar, uploadAvatar } from "@/features/profile/server";

// POST /api/profile/avatar — multipart "file"
export const POST = jsonRoute(async (req) => uploadAvatar(await requireSession(), (await req.formData()).get("file")));

// DELETE /api/profile/avatar
export const DELETE = jsonRoute(async () => removeAvatar(await requireSession()));
