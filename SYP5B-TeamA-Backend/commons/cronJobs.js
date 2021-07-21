var cron = require('node-cron');
const categoryController = require('./../category/category-controller');

let cronJobsConfig = undefined;

async function initCronJobs(cronJobConfigData) {
    cronJobsConfig = cronJobConfigData;
    await removeDemandJob();
    console.log('\nSUCCESS: Started cronjobs.'.green);
}

async function removeDemandJob() {
    cron.schedule('*/' + (cronJobsConfig.demandExecuteTime * 60) + ' * * * *', async () => {
        await categoryController.removeExpiredDemands(cronJobsConfig.demandExpireTime);
        console.log('Running remove expired demands cron job.');
    });
}

module.exports = initCronJobs;