import type { ReactNode } from "react";
import { ReportWorkflowProvider } from "@/components/report/ReportWorkflowContext";
import { ReportWorkflowShell } from "@/components/report/ReportWorkflowShell";
import LenisProvider from "@/providers/LenisProvider";
export default async function ReportCaseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  return (
    <ReportWorkflowProvider caseId={caseId}>
      <ReportWorkflowShell>
        <LenisProvider>{children}</LenisProvider>
      </ReportWorkflowShell>
    </ReportWorkflowProvider>
  );
}
