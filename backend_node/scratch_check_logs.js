const { getAllBlockchainLogs } = require('./src/utils/blockchain');

async function check() {
    console.log("Fetching all logs from blockchain...");
    const logs = await getAllBlockchainLogs();
    console.log("Total logs found:", logs.length);
    if (logs.length > 0) {
        console.log("Recent logs:", logs.slice(-5));
    }
}

check();
