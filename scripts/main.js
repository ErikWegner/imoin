browser.alarms.create("imoin", {delayInMinutesOptional: 0.1})
browser.alarms.onAlarm.addListener((alarm) => {
    console.log("Alarm")
    console.log(alarm)
})