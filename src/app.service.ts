import {CACHE_MANAGER, Inject, Injectable} from "@nestjs/common";
import {ethers, Signer} from "ethers";
import axios from 'axios'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

interface IQuery {
    success: boolean;
    message: string;
}

@Injectable()
export class AppService {

    provider: ethers.providers.Provider;
    signer: Signer;

    constructor() {

        const providerRPC = {
            shardeum: {
                name: process.env.RPC_NAME,
                rpc: process.env.RPC_URL,
                chainId: parseInt(process.env.RPC_CHAIN_ID, 16),
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
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider)
            .connect(this.provider);
    }

    async sendSHM(_address: string): Promise<IQuery> {
        try {
            if (!_address || !ethers.utils.isAddress(_address)) {
                return {success: false, message: "Invalid address"};
            }
            const balance = await this.signer.getBalance()
            if (balance < ethers.utils.parseEther("1")) {
                return {success: false, message: "Faucet is empty. Try again"};
            }

            const res = await this.signer.sendTransaction({
                to: _address,
                value: ethers.utils.parseEther("11"),
            });
            return {success: true, message: res.hash};
        } catch (e) {
            return {success: false, message: "Something went wrong. Try again"};
        }
    }

    async validateCaptcha(token: string) {
        const res = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${token}`
        );
        return  {success: res?.data?.success, message: res?.data?.success ? 'Success': 'Fail'}
    }
}
