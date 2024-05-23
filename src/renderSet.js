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
        localStorage.setItem('adhan', true);
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
    
    let method = localStorage.getItem('method');

    let savedDark = localStorage.getItem('dark') === 'true';
    let isAuto = savedAuto;

    try {
        let methodDropDownBtn = document.getElementById('dropdownBtn');
        let algeria = document.getElementById('algeria');
        let egypt = document.getElementById('egypt');
        let isna = document.getElementById('isna');
        let jakim = document.getElementById('jakim');
        let indonesia = document.getElementById('indonesia');
        let mwl = document.getElementById('mwl');
        let makkah = document.getElementById('makkah');
        let karachi = document.getElementById('karachi');
        
        let methodDropDown = document.getElementById('methodDrop');

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

        let discordBtb = document.getElementById('discord');
        let githubBtn = document.getElementById('github');

        let dropDowns = [algeria, egypt, isna, jakim, indonesia, mwl, makkah, karachi];

        switch(method){
            case '19':
                algeria.classList.add('is-active');
                break;
            case '5':
                egypt.classList.add('is-active');
                break;
            case '2':
                isna.classList.add('is-active');
                break;
            case '17':
                jakim.classList.add('is-active');
                break;
            case '20':
                indonesia.classList.add('is-active');
                break;
            case '3':
                mwl.classList.add('is-active');
                break;
            case '4':
                makkah.classList.add('is-active');
                break;
            case '1':
                karachi.classList.add('is-active');
                break;
            default:
                mwl.classList.add('is-active');
                break;
        }        
        algeria.addEventListener('click', () => {
            localStorage.setItem('method', '19'); 
            for (let i = 0; i < dropDowns.length; i++) {
                let element = dropDowns[i];
                element.classList.remove('is-active');
            } 
            algeria.classList.add('is-active');
            methodDropDown.classList.toggle('is-active');
        });
        egypt.addEventListener('click', () => {
            localStorage.setItem('method', '5');
            for (let i = 0; i < dropDowns.length; i++) {
                let element = dropDowns[i];
                element.classList.remove('is-active');
            } 
            egypt.classList.add('is-active');
            methodDropDown.classList.toggle('is-active');

        });
        isna.addEventListener('click', () => {
            localStorage.setItem('method', '2');
            for (let i = 0; i < dropDowns.length; i++) {
                let element = dropDowns[i];
                element.classList.remove('is-active');
            } 
            isna.classList.add('is-active');
            methodDropDown.classList.toggle('is-active');

        });
        jakim.addEventListener('click', () => {
            localStorage.setItem('method', '17');
            for (let i = 0; i < dropDowns.length; i++) {
                let element = dropDowns[i];
                element.classList.remove('is-active');
            } 
            jakim.classList.add('is-active');
            methodDropDown.classList.toggle('is-active');

        });
        indonesia.addEventListener('click', () => {
            localStorage.setItem('method', '20');
            for (let i = 0; i < dropDowns.length; i++) {
                let element = dropDowns[i];
                element.classList.remove('is-active');
            } 
            indonesia.classList.add('is-active');
            methodDropDown.classList.toggle('is-active');

        });
        mwl.addEventListener('click', () => {
            localStorage.setItem('method', '3');
            for (let i = 0; i < dropDowns.length; i++) {
                let element = dropDowns[i];
                element.classList.remove('is-active');
            } 
            mwl.classList.add('is-active');
            methodDropDown.classList.toggle('is-active');

        });
        makkah.addEventListener('click', () => {
            localStorage.setItem('method', '4');
            for (let i = 0; i < dropDowns.length; i++) {
                let element = dropDowns[i];
                element.classList.remove('is-active');
            } 
            makkah.classList.add('is-active');
            methodDropDown.classList.toggle('is-active');

        });
        karachi.addEventListener('click', () => {
            localStorage.setItem('method', '1');
            for (let i = 0; i < dropDowns.length; i++) {
                let element = dropDowns[i];
                element.classList.remove('is-active');
            } 
            karachi.classList.add('is-active');
            methodDropDown.classList.toggle('is-active');
        });


        
        methodDropDownBtn.addEventListener('click', () => {
            methodDropDown.classList.toggle('is-active');
        });
        discordBtb.addEventListener('click', () => {
            ipcRenderer.send('openDiscord');
        });
        githubBtn.addEventListener('click', () => {
            ipcRenderer.send('openGithub');
        });

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