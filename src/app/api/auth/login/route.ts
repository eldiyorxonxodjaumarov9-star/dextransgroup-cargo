import { NextResponse } from "next/server";
import { attachAdminSessionCookie, loginAdmin } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Noto‘g‘ri ma’lumot" },
        { status: 400 }
      );
    }

    const user = await loginAdmin(
      parsed.data.username,
      parsed.data.password
    );

    if (!user) {
      return NextResponse.json(
        { error: "Login yoki parol noto‘g‘ri" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true, username: user.username });
    attachAdminSessionCookie(response, user.id, user.username);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Kirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
