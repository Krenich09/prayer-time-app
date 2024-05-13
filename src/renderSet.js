const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    
    if (localStorage.getItem('auto') === null) {
        localStorage.setItem('auto', true);
    }
    if(localStorage.getItem('city') === null)
    {
        localStorage.setItem('city', '');
    }
    if(localStorage.getItem('country') === null)
    {
        localStorage.setItem('country', '');
    }
    if(localStorage.getItem('notifications') === null)
    {
        localStorage.setItem('notifications', true);
    }
    if(localStorage.getItem('adhan') === null)
    {
        localStorage.setItem('adhan', false);
    }   
    if(localStorage.getItem('startUp') === null)
    {
        localStorage.setItem('startUp', true);
    }
    if(localStorage.getItem('updates') === null)
    {
        localStorage.setItem('updates', true);
    }
    if(localStorage.getItem('dark') === null)
    {
        localStorage.setItem('dark', true);
    }

    let savedAuto = localStorage.getItem('auto') === 'true';
    let savedCity = localStorage.getItem('city');
    let savedCountry = localStorage.getItem('country');

    let savedNotifications = localStorage.getItem('notifications') === 'true';
    let savedAdhan = localStorage.getItem('adhan') === 'true';

    let savedStartUp = localStorage.getItem('startUp') === 'true';
    let savedUpdates = localStorage.getItem('updates') === 'true';

    let savedDark = localStorage.getItem('dark') === 'true';
    let isAuto = savedAuto;

    try {
        let autoRadio = document.getElementById('auto');
        let manualRadio = document.getElementById('manual');
        let cityInput = document.getElementById('cityInput');
        let countryInput = document.getElementById('countryInput');

        let notificationCheck = document.getElementById('notifications');
        let adhanCheck = document.getElementById('adhan');

        let startUpCheck = document.getElementById('startUp');
        let updatesCheck = document.getElementById('updates');

        let darkRadio = document.getElementById('dark');
        let lightRadio = document.getElementById('light');

        const htmlElement = document.querySelector('html');

        
        // Add or remove the appropriate class based on the isDark boolean
        if (savedDark) {
            htmlElement.classList.add('theme-dark');
        } else {
            htmlElement.classList.add('theme-light');
        }

        autoRadio.checked = savedAuto;
        manualRadio.checked = !savedAuto;

        cityInput.disabled = isAuto;
        countryInput.disabled = isAuto;

        notificationCheck.checked = savedNotifications;
        adhanCheck.checked = savedAdhan;
        startUpCheck.checked = savedStartUp;
        updatesCheck.checked = savedUpdates;

        darkRadio.checked = savedDark;
        lightRadio.checked = !savedDark;
        
        cityInput.value = savedCity;
        countryInput.value = savedCountry;

        
        autoRadio.addEventListener('change', () => {

            if(isAuto){
                return;
            }

            // disable city and country input
            cityInput.disabled = true;
            countryInput.disabled = true;

            localStorage.setItem('auto', true);
            isAuto = true;
            console.log(isAuto);
        });

        manualRadio.addEventListener('change', () => {
            if(!isAuto){
                return;
            }

            // enable city and country input
            cityInput.disabled = false;
            countryInput.disabled = false;

            localStorage.setItem('auto', false);
            isAuto = false;
            console.log(isAuto);
        });

        cityInput.addEventListener('input', () => {
            localStorage.setItem('city', cityInput.value);
        });

        countryInput.addEventListener('input', () => {
            localStorage.setItem('country', countryInput.value);
        });

        notificationCheck.addEventListener('change', () => {
            localStorage.setItem('notifications', notificationCheck.checked);
        });
        adhanCheck.addEventListener('change', () => {
            localStorage.setItem('adhan', adhanCheck.checked);
        });

        startUpCheck.addEventListener('change', () => {
            let startUp = startUpCheck.checked;

            localStorage.setItem('startUp', startUp);
            ipcRenderer.send('startUpChanged', startUp)
        });

        updatesCheck.addEventListener('change', () => {
            localStorage.setItem('updates', updatesCheck.checked);
        });
        const htmlElement2 = document.querySelector('html');

        
        darkRadio.addEventListener('change', () => {
            localStorage.setItem('dark', true);
            htmlElement2.classList.remove('theme-light');
            htmlElement2.classList.add('theme-dark');
            
        });

        lightRadio.addEventListener('change', () => {
            localStorage.setItem('dark', false);
            htmlElement2.classList.remove('theme-dark');
            htmlElement2.classList.add('theme-light');
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
});