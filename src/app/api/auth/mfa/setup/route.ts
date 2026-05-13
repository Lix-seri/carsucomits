import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { newSecret, totpUri } from "@/lib/mfa";

// POST /api/auth/mfa/setup — generates a fresh TOTP secret + QR code for the signed-in user.
// The secret is stored only after the user confirms a code via /api/auth/mfa/enable.
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const secret = newSecret();
  const uri = totpUri(secret, session.email);
  const qrDataUrl = await QRCode.toDataURL(uri);

  // Save the pending secret on the user. mfaEnabled stays false until they confirm.
  await prisma.user.update({
    where: { id: session.userId },
    data: { totpSecret: secret, mfaEnabled: false },
  });

  return NextResponse.json({ ok: true, secret, qrDataUrl, uri });
}
