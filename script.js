//https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key};
const apiKey = "7323146f1b783ca4b54b9d886810e027";




const inputSection = document.querySelector('#input-section');
const descSection = document.querySelector('#description-section');
const entete = document.querySelector('.entete');

const backIcon = entete.querySelector('.back-icon');
const cityInput = inputSection.querySelector('.city-input');
const locationInput = inputSection.querySelector('.location-input');

const  weatherIcon = descSection.querySelector('.weather-icon');
const temperature = descSection.querySelector('.temp');
const descrip = descSection.querySelector('.desc');
const cityTown = descSection.querySelector('.city-town');
const feelsLikes = descSection.querySelector('.feeds-likes');
const humi = descSection.querySelector('.humidity');

cityInput.addEventListener('keypress', (e)=>{
    // function pour recuper les valeurs taper par l'utilisateur apres avoir taper sur la touche enter
    if(e.key == 'Enter') {
        const city = e.target.value;   
        const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        // appel de la fonction
        getWeatherInfo(api); 
}
});

// bouton de retour 
backIcon.addEventListener('click',()=>{
            descSection.classList.add('hidden');
            inputSection.classList.remove('hidden');
            backIcon.classList.add('hidden');
});

locationInput.addEventListener('click',()=>{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position)=>{
             const api = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${apiKey}&units=metric`;
             getWeatherInfo(api);
            },
            (error)=>{
                console.log(error.message);
                
            }
        );
    }else{
        alert('your computer does not support geolocation');   
    }
})

// creaton d'un fonction qu'on va apppler plus haut.
const getWeatherInfo =(api)=>{
    
       fetch(api).then(response => response.json())
       .then(data => {
           console.log(data);
           
           const {feels_like, humidity,temp}= data.main;
           const {description, id} = data.weather[0];
           const country = data.sys.country;
           const city = data.name;
        //    appel de fonction
            changeWeatherIcon(id);
           temperature.innerHTML =     `${Math.floor(temp)}<sup>o</sup>C`;
           cityTown.innerText    =     `${city}, ${country}`;
           descrip.innerText     =         description;
           feelsLikes.innerHTML  =     `${Math.round(feels_like)}<sup>o</sup>C`;
           humi.innerText        =     `${humidity}%`;

           // pour vider les input apres chaque retour 
           cityInput.value = '';

           descSection.classList.remove('hidden');
           inputSection.classList.add('hidden');
           backIcon.classList.remove('hidden');
       })
       .catch(error => console.log(error));
}




const changeWeatherIcon = (id) => {
    if (id == 800) {
        weatherIcon.src ='images/day-1'
    }else if (id >= 200 && id < 300) {
      // Orages
      weatherIcon.src = "images/th.png";
    } else if (id >= 300 && id < 500) {
      // Bruines
      weatherIcon.src = "images/drizzle.svg";
    } else if (id >= 500 && id < 600) {
      // Pluie
      weatherIcon.src = "images/rain.svg";
    } else if (id >= 600 && id < 700) {
      // Neige
      weatherIcon.src = "images/snow.svg";
    } else if (id >= 700 && id < 800) {
      // Atmosphère (brouillard, poussière, etc.)
      weatherIcon.src = "images/mist.svg";
    }
  };