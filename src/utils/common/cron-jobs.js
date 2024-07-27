const cron = require("node-cron");
const { BookingService } = require("../../services");
function sheduleCrons() {
  cron.schedule("*/30 * * * *", async () => {
    // your code here
    console.log("running a task every 30 minute");
    const response = await BookingService.cancelOldBookings();
    console.log(response);
  });
}

module.exports = sheduleCrons;
