import { redirect } from "next/navigation";

export default function StatusPengajuanRedirect() {
  redirect("/dashboard/nasabah/saldo-poin");
}
