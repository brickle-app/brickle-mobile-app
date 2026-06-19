import { authStore } from "../store/auth.store";
import { provider } from "../components/wallet/contracts/config/clients/polygon";
const { ethers } = require("ethers");

export async function generatePermit(
  tokenAddress,
  paymasterAddress,
  userAddress,
  amount
) {
  const privateKey = authStore.getState().privateKey;

  if (!privateKey) {
    throw new Error("Private key not found in auth store");
  }

  try {
    const signer = new ethers.Wallet(privateKey, provider);

    const token = new ethers.Contract(
      tokenAddress,
      [
        "function nonces(address) view returns (uint256)",
        "function name() view returns (string)",
        "function version() view returns (string)",
        "function DOMAIN_SEPARATOR() view returns (bytes32)",
      ],
      provider
    );

    let name;
    try {
      name = await token.name();
    } catch (nameError) {
      name = "COP Coin";
    }

    const version = "1";

    const network = await provider.getNetwork();
    const chainId = network.chainId;

    let nonce;
    try {
      nonce = await token.nonces(userAddress);
    } catch (nonceError) {
      nonce = 0; // Start with nonce 0 as fallback
    }

    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const campaignCommitment = ethers.parseUnits(amount.toString(), 6);
    const relayerFee = ethers.parseUnits("0.1", 6);
    const totalPermitAmount = campaignCommitment + relayerFee;

    const domain = {
      name,
      version,
      chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const message = {
      owner: userAddress,
      spender: paymasterAddress,
      value: totalPermitAmount,
      nonce: nonce,
      deadline,
    };

    const signature = await signer.signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(signature);

    return {
      v,
      r,
      s,
      deadline,
    };
  } catch (networkError) {
    throw new Error(
      `Network error during permit generation: ${networkError.message}`
    );
  }
}
