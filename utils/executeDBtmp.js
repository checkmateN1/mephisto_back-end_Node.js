const oracle = require('../oracle');

/////////////////////////////////  TEST Oracle
const oraclePlaySetup = new oracle.oracle();
/////////////////////////////////
setTimeout(async () => {
    const result = await oraclePlaySetup.insertStacks();
}, 3000);
/////////////////////////////////

// oraclePlaySetup.insertStacks();
