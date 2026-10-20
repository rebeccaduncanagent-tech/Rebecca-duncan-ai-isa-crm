import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http";
import { getLeadRepository } from "@/lib/repository";
import { statusUpdateSchema } from "@/lib/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = statusUpdateSchema.parse(await request.json());
    const lead = await getLeadRepository().updateStatus(id, status);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ lead });
  } catch (error) {
    return errorResponse(error);
  }
}
