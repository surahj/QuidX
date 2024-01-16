export function minutesFromNow(minutes: number): Date {
    const currentTime = new Date();
    const newDate = new Date();
    newDate.setTime(currentTime.getTime() + minutes * 60 * 1000);
    return newDate;
}
