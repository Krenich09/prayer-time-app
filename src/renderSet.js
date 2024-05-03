document.addEventListener('DOMContentLoaded', () => {
    let savedAuto = true;
    let savedCity = '';
    let savedCountry = '';

    let savedNotifications = true;

    let savedStartUp = true;
    let savedUpdates = true;

    let savedDark = true;

    let isAuto = savedAuto;
    console.log(isAuto);

    try {
        let autoRadio = document.getElementById('auto');
        let manualRadio = document.getElementById('manual');
        let cityInput = document.getElementById('cityInput');
        let countryInput = document.getElementById('countryInput');

        let notificationCheck = document.getElementById('notifications');

        let startUpCheck = document.getElementById('startUp');
        let updatesCheck = document.getElementById('updates');

        let darkRadio = document.getElementById('dark');
        let lightRadio = document.getElementById('light');

        autoRadio.checked = true;
        manualRadio.checked = !isAuto;
        cityInput.disabled = isAuto;
        countryInput.disabled = isAuto;

        notificationCheck.checked = savedNotifications;
        startUpCheck.checked = savedStartUp;
        updatesCheck.checked = savedUpdates;

        darkRadio.checked = savedDark;
        lightRadio.checked = !savedDark;
        
        if(isAuto == false)
        {
            cityInput.value = savedCity;
            countryInput.value = savedCountry;
        }
        
        autoRadio.addEventListener('change', () => {

            if(isAuto){
                return;
            }

            // disable city and country input
            cityInput.disabled = true;
            countryInput.disabled = true;

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

            isAuto = false;
            console.log(isAuto);
        });


    } catch (error) {
        console.error('Error fetching data:', error);
    }
});