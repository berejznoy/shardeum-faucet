import {Injectable} from "@nestjs/common";
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

            // const balance = await this.signer.getBalance()
            // if (balance < ethers.utils.parseEther("1")) {
            //     return {success: false, message: "Faucet is empty. Try again"};
            // }

            const balance = await this.getFaucetBalance(process.env.FAUCET_ADDRESS)
            if(Number(balance) < 12 ) {
                return {success: false, message: "Faucet is empty. Try again"}
            }
            const transactionCount = await this.signer.getTransactionCount()
            const res = await this.signer.sendTransaction({
                to: _address,
                value: ethers.utils.parseEther("11"),
                nonce: transactionCount,
                gasPrice: 10000000000
            });
            return {success: true, message: res.hash};
        } catch (e) {
            throw new Error(e)
        }
    }

    async validateCaptcha(_token: string) {
        const res = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${_token}`
        );
        return {success: res?.data?.success, message: res?.data?.success ? 'Success' : 'Fail'}
    }


    async getFaucetBalance(_address) {
        const res = await axios.get(
            `https://explorer-sphinx.shardeum.org/api/address?address=${_address}&accountType=0`
        );
        return Number(BigInt(`0x${res?.data?.accounts?.[0]?.account?.balance}`) / BigInt(10 ** 18)).toFixed(2);
    }
}
