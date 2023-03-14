import { Injectable } from "@nestjs/common";
import { ethers, Signer } from "ethers";
import NodeCache from "node-cache";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

interface IQuery {
  success: boolean;
  message: string;
}
@Injectable()
export class AppService {
  // init
  provider: ethers.providers.Provider;
  signer: Signer;
  cache: NodeCache;

  constructor() {
    // 1. Import cache
    this.cache = new NodeCache({ stdTTL: 43200 });
    // 2. Define network configurations
    const providerRPC = {
      shardeum: {
        name: process.env.RPC_NAME,
        rpc: process.env.RPC_URL, // Insert your RPC URL here
        chainId: parseInt(process.env.RPC_CHAIN_ID, 16), // 0x504 in hex,
      },
    };

    // 3. Create ethers provider
    this.provider = new ethers.providers.StaticJsonRpcProvider(
      providerRPC.shardeum.rpc,
      {
        chainId: providerRPC.shardeum.chainId,
        name: providerRPC.shardeum.name,
      }
    );

    const pkey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(pkey, this.provider);
    this.signer = wallet.connect(this.provider);
  }

  async sendSHM(_address: string): Promise<IQuery> {
    if (!_address) {
      return { success: false, message: "Invalid address" };
    }

    if (!ethers.utils.isAddress(_address)) {
      return { success: false, message: "Invalid address" };
    }

    if (this.cache.get(_address)) {
      return {
        success: false,
        message: "Please wait for 12 hours to claim again",
      };
    }

    const balance = await this.signer.getBalance().catch((err) => {
      return { success: false, message: "RPC Error. Try again" };
      throw new Error(err);
    });

    if (balance < ethers.utils.parseEther("1")) {
      return { success: false, message: "Faucet is empty. Try again" };
      throw new Error("Faucet is empty. Try again");
    }

    try {
      const res = await this.signer.sendTransaction({
        to: _address,
        value: ethers.utils.parseEther("1"),
      });
      this.cache.set(_address, "active");
      return { success: true, message: res.hash };
    } catch (e) {
      return { success: false, message: "RPC Error. Try again" };
      throw new Error(e);
    }
  }
}
