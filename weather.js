let url, city, weatherdata, photodata, tarray, tfeelsarray, iconarray, timearray, hoursarray, now

//to do
//break up into days, cards
//days all start at same time, with same minmum and maximum
//

async function getData(url, params) {
    const response = await fetch(url, params);
    return response.json();
};

city = document.getElementById('inputcity').value;
update()

document.getElementById('inputcity').oninput = () => {
    city = document.getElementById('inputcity').value;
    update()
}

async function update() {
    url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city +     '&mode=xmly&appid=48a8b4741cc8cb086ca2bbffc8c983cb'
    tempweatherdata = await getData(url)
    if (tempweatherdata.city != undefined) {
        weatherdata = tempweatherdata
        console.log(weatherdata.list)
        //updatebackground()

        tarray = []; timearray = []; tfeelsarray = []; iconarray = []; hoursarray = [];
        let day;
        for (i = 0; i < weatherdata.list.length; i++) {
            timearray.push(Date(weatherdata.list[i].dt_txt))
            let day = new Date(weatherdata.list[i].dt_txt)
            hoursarray.push(day.getHours())
            tarray.push(0.1 * Math.round((weatherdata.list[i].main.temp - 273.15) * 10))
            tfeelsarray.push(0.1 * Math.round((weatherdata.list[i].main.feels_like - 273.15) * 10))
            iconarray.push("http://openweathermap.org/img/w/"+weatherdata.list[i].weather[0].icon+".png");

        }

        now = new Date(weatherdata.list[0].dt_txt)
        console.log(now.getHours()/3)
        for (i=0; i<now.getHours()/3; i++)
        {timearray.unshift(i)
         hoursarray.unshift(i)
         tarray.unshift(i)
         tfeelsarray.unshift(i)
         iconarray.unshift(i)
        }


        //now the actual table
        new Chart(document.getElementById("mixed-chart"), {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            type: 'bar',
            data: {
                labels: hoursarray,
                datasets: [{
                    label: "Temperature in °C",
                    type: "line",
                    borderColor: "#fa0",
                    borderWidth: 5,
                    data: tarray,
                    pointStyle: 'https://openweathermap.org/img/w/10d.png',
                    lineTension: 0.4,
                    fill: false
                }, {
                    label: "Feels like °C",
                    type: "line",
                    borderColor: "#f20",
                    data: tfeelsarray,
                    fill: false
                }]
            },
            options: {
                title: {
                    display: false,
                    text: 'Weather'
                },
                legend: {
                    display: true
                }
            }
        });

    }
}

update()

async function updatebackground() {

    photodata = await getData('https://api.unsplash.com/photos/random?client_id=p2RsPWAavBwh-hvyW9GzFInfh3S3PC7W7VnLkTG6wVo&query=' + city + '%20sky&orientation=landscape')
    console.log(photodata.urls.full)
    document.getElementById("hero").style = "background-image: url(" + photodata.urls.regular + ");background-position: center;background-size: cover"
}

/*
key: 48a8b4741cc8cb086ca2bbffc8c983cb
*/