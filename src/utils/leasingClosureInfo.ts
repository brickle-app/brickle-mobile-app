import { createContract } from "@/src/components/wallet/contracts/config/clients/polygon";
import leasingCoreAbi from "@/src/components/wallet/contracts/config/abis/leasing-core.json";

export interface LeasingClosureInfo {
  termMonths: number;
  currentMonth: number;
  lastPaymentMade: boolean;
}

/**
 * Lee estado de cierre del LeasingCore (cuotas vs pago residual final).
 */
export async function getLeasingClosureInfo(
  coreAddress: string | null | undefined
): Promise<LeasingClosureInfo | null> {
  if (!coreAddress?.startsWith("0x")) {
    return null;
  }

  try {
    const c = createContract(coreAddress, leasingCoreAbi);
    const [leasingInfo, currentMonth, lastPaymentMade] = await Promise.all([
      c.leasingInfo(),
      c.currentMonth(),
      c.lastPaymentMade(),
    ]);

    const termMonths = Number(
      leasingInfo?.termMonths ?? leasingInfo?.[2] ?? 0
    );
    const cm = Number(currentMonth ?? 0);
    const lpm = Boolean(lastPaymentMade);

    return {
      termMonths: Number.isFinite(termMonths) ? termMonths : 0,
      currentMonth: Number.isFinite(cm) ? cm : 0,
      lastPaymentMade: lpm,
    };
  } catch (e) {
    console.warn("getLeasingClosureInfo failed", e);
    return null;
  }
}
