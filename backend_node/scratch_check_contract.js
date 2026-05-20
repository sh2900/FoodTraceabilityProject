const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

async function check() {
    const addresses = [
        "0xd61E60cfc267B8C34C530289Dac3888659B59122",
        "0x1a7Aead41671e7a8de442D7E7e84C43996F75b22",
        "0x4ee5b71e92eC3BF4EFC8c0b26BAE58cC270f305C"
    ];

    for (const addr of addresses) {
        const code = await provider.getCode(addr);
        console.log(`Address ${addr}: ${code !== '0x' ? 'CONTRACT FOUND' : 'NO CONTRACT'}`);
    }
}

check();
