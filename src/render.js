const { ipcRenderer} = require('electron');


document.addEventListener('DOMContentLoaded', async () => {
    try {
        let boolDark = localStorage.getItem('dark') === 'true';
        let savedAuto = localStorage.getItem('auto') === 'true';

        const htmlElement = document.querySelector('html');

        
        // Add or remove the appropriate class based on the isDark boolean
        if (boolDark) {
            htmlElement.classList.add('theme-dark');
        } else {
            htmlElement.classList.add('theme-light');
        }

        let city = '';
        let country = '';
        
        if(savedAuto)
        {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            city = data.city;
            country = data.country_name;
        }
        else
        {
            city = localStorage.getItem('city');
            country = localStorage.getItem('country');
        }

        if(city === '' || country === '')
        {  
            document.getElementById('location').textContent = 'Unknown location';
        }
        else
        {
            document.getElementById('location').textContent = `${city}, ${country}`;

        }
        const link = `http://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=4&adjustment=1`;

        console.log(link);
        const response2 = await fetch(link);
        const data2 = await response2.json();

        const timings = data2.data.timings;
        const fajr = timings.Fajr;
        const dhuhr = timings.Dhuhr;
        const asr = timings.Asr;
        const maghrib = timings.Maghrib;
        const isha = timings.Isha;

        // Save to localStorage
        localStorage.setItem('fajr', fajr);
        localStorage.setItem('dhuhr', dhuhr);
        localStorage.setItem('asr', asr);
        localStorage.setItem('maghrib', maghrib);
        localStorage.setItem('isha', isha);

        document.getElementById('fajr').textContent = `[${fajr}]`;
        document.getElementById('dhuhr').textContent = `[${dhuhr}]`;
        document.getElementById('asr').textContent = `[${asr}]`;
        document.getElementById('maghrib').textContent = `[${maghrib}]`;
        document.getElementById('isha').textContent = `[${isha}]`;
                
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
        
        
        let nextPrayer = findNextPrayer();
        ipcRenderer.send('nextPrayer',  prayerTimes[nextPrayer], ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'][nextPrayer]);
        updateTimer();
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

                
            if(nextPrayerIndex == 0)
            {
                nextPrayerDate.setDate(now.getDate() + 1); // Add 1 day if the next prayer is Fajr
            }
                
            let timeDifference = nextPrayerDate - now;

            const hours = Math.floor(timeDifference / (1000 * 60 * 60)).toString().padStart(2, '0');
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000).toString().padStart(2, '0');
            
            if(timeDifference < 0)
            {
                document.getElementById('timer').textContent = `Time to Pray!`;
            }
            else
            {
                console.log('Time difference:', hours, minutes, seconds);
                document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
            }

            


            if(nextPrayer != null)
            {
                if(nextPrayerIndex != nextPrayer)
                {
                    console.log('Prayer changed');
                    ipcRenderer.send('nextPrayer',  prayerTimes[nextPrayerIndex], ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'][nextPrayerIndex]);
                    nextPrayer = nextPrayerIndex;
                }
                else
                {
                    console.log('Prayer not changed');
                }
            }
        }

        // Update the timer every second
        document.getElementById('holder').style.display = 'block';

        ipcRenderer.send('locationChanged');
        setInterval(updateTimer, 1000);
        
    } catch (error) {
        document.getElementById('location').textContent = 'Unknown location';
        console.error('Error fetching data:', error);
    }

});


