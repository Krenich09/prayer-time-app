document.addEventListener('DOMContentLoaded', async () => {
    try {

        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        document.getElementById('location').textContent = `${data.city}, ${data.region}`;

        const link = `http://api.aladhan.com/v1/timingsByCity?city=${data.city}&country=${data.country_name}&method=4&adjustment=1`
        console.log(link);
        const response2 = await fetch(link);
        const data2 = await response2.json();
        const fajr = data2.data.timings.Fajr;
        const dhuhr = data2.data.timings.Dhuhr;
        const asr = data2.data.timings.Asr;
        const maghrib = data2.data.timings.Maghrib;
        const isha = data2.data.timings.Isha;

        document.getElementById('fajr').textContent = `[${fajr}]`;
        document.getElementById('dhuhr').textContent = `[${dhuhr}]`;
        document.getElementById('asr').textContent = `[${asr}]`;
        document.getElementById('maghrib').textContent = `[${maghrib}]`;
        document.getElementById('isha').textContent = `[${isha}]`;

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes()

        
    

        
        function updateCurTimer() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const currentTime = `[${hours}:${minutes}:${seconds}]`;
            document.getElementById('curTimer').textContent = currentTime;
        }
        
        // Initial call to update the timer
        updateCurTimer();
        
        // Update the timer every second
        setInterval(updateCurTimer, 1000);
        
        
        
        const prayerTimes = [fajr, dhuhr, asr, maghrib, isha];
        
        // Function to calculate the time difference between two times
        function getTimeDifference(currentTime, targetTime) {
            const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
            const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
            
            let timeDifference = (targetHours - currentHours) * 60 + (targetMinutes - currentMinutes);
            if (timeDifference < 0) {
                timeDifference += 24 * 60; // Add 24 hours if the target time is before the current time
            }
            return timeDifference;
        }
        
        // Function to find the next prayer
        function findNextPrayer(currentTime) {
            const now = new Date();
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentMinute = now.getMinutes().toString().padStart(2, '0');
            currentTime = `${currentHour}:${currentMinute}`;
            
            let minTimeDifference = Infinity;
            let nextPrayerIndex = -1;
            
            for (let i = 0; i < prayerTimes.length; i++) {
                const timeDifference = getTimeDifference(currentTime, prayerTimes[i]);
                if (timeDifference < minTimeDifference) {
                    minTimeDifference = timeDifference;
                    nextPrayerIndex = i;
                }
            }
            
            return nextPrayerIndex;
        }
        
        // Function to update the timer with countdown to the next prayer
        function updateTimer() {
            const now = new Date();
            const nextPrayerIndex = findNextPrayer();
            const nextPrayerTime = prayerTimes[nextPrayerIndex];
            
            const nextPrayerName = ['[Fajr - الفجر]', '[Dhuhr - الظهر]', '[Asr - العصر]', '[Maghrib - المغرب]', '[Isha - العشاء]'][nextPrayerIndex];
            document.getElementById('arabicName').textContent = `Next Prayer: ${nextPrayerName}`;
            
            const [nextPrayerHour, nextPrayerMinute] = nextPrayerTime.split(':').map(Number);
            const nextPrayerDate = new Date();
            nextPrayerDate.setHours(nextPrayerHour, nextPrayerMinute, 0);
            
            let timeDifference = nextPrayerDate - now;
            if (timeDifference < 0) {
                timeDifference += 24 * 60 * 60 * 1000; // Add 24 hours if the next prayer time is before the current time
            }
            
            const hours = Math.floor(timeDifference / (1000 * 60 * 60)).toString().padStart(2, '0');
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000).toString().padStart(2, '0');
            
            document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
        }
        

        // Initial call to update the timer
        updateTimer();
        
        // Update the timer every second
        document.getElementById('holder').style.display = 'block';
        setInterval(updateTimer, 1000);
        
    } catch (error) {
        document.getElementById('location').textContent = 'Unknown location';
        console.error('Error fetching data:', error);
    }

});


