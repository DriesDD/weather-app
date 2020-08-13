let url, city, weatherdata, photodata, tarray, tfeelsarray, iconarray, timearray, hoursarray, now, timeblock,
    tarray1, tarray2, tarray3, tarray4, tarray5

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
    if (document.getElementById("placeholder").innerText.length -4 < document.getElementById('inputcity').value.length)
    {document.getElementById("placeholder").innerText = ""}
    url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&mode=xmly&appid=48a8b4741cc8cb086ca2bbffc8c983cb'
    tempweatherdata = await getData(url)
    if (tempweatherdata.city != undefined) {
        weatherdata = tempweatherdata
        document.getElementById("placeholder").innerText = weatherdata.city.name + ", "+weatherdata.city.country
        console.log(weatherdata.list)
        //updatebackground()

        //make arrays of all the needed data points
        tarray = [];
        timearray = [];
        tfeelsarray = [];
        iconarray = [];
        hoursarray = [];
        graphmin = 30;
        graphmax = 0;
        let day;
        for (i = 0; i < weatherdata.list.length; i++) {
            timearray.push(Date(weatherdata.list[i].dt_txt))
            let day = new Date(weatherdata.list[i].dt_txt)
            hoursarray.push(day.getHours() + "h")
            tarray.push(Math.round(weatherdata.list[i].main.temp - 273.15))
            tfeelsarray.push(Math.round(weatherdata.list[i].main.feels_like - 273.15))
            iconarray.push("http://openweathermap.org/img/w/" + weatherdata.list[i].weather[0].icon + ".png");
            //add the standardized minima and maxima which are the same for each day chart
            graphmin = Math.min(graphmin, tarray[i])
            graphmax = Math.max(graphmax, tarray[i])
        }
        graphmin = Math.floor((graphmin - 1) / 5) * 5
        graphmax = Math.ceil((graphmax + 1) / 5) * 5
        console.log(graphmin, graphmax)

        //for the first day, add the missing hours that have already passed to the front
        now = new Date(weatherdata.list[0].dt_txt)
        //divide by 3 and correct for timezone
        timeblock = Math.floor((now.getHours() + weatherdata.city.timezone/3600)/3 ) % 8;
        for (i = 1; i < timeblock; i++) {
            timearray.unshift(null)
            hoursarray.unshift(now.getHours() - i * 3 + "h")
            tarray.unshift(null)
            tfeelsarray.unshift(null)
            iconarray.unshift(null)
        }
        //now break up the array in five arrays of one day each
        tarray1 = tarray.slice(0, 9);
        tarray2 = tarray.slice(8, 17);
        tarray3 = tarray.slice(16, 25);
        tarray4 = tarray.slice(24, 33);
        tarray5 = tarray.slice(32, 41);
        hoursarray1 = hoursarray.slice(0, 9);

        Chart.defaults.global.defaultFontSize = '20';
        Chart.defaults.global.defaultFontFamily = "'Pangolin',  cursive;";

        //now the tables
        for (i = 1; i <= 5; i++) {
            new Chart(document.getElementById("chart" + i), {
                type: 'line',
                data: {
                    labels: hoursarray1,
                    datasets: [{
                        label: "Temperature in °C",
                        type: "line",
                        borderColor: "#fa0",
                        borderWidth: 5,
                        data: eval('tarray'+i),
                        pointStyle: 'https://openweathermap.org/img/w/10d.png',
                        lineTension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            display: false,
                            ticks: {
                                min: graphmin,
                                max: graphmax
                            }
                        }],
                        xAxes: [{
                            drawBorder: false
                        }],
                    },
                    tooltips: {
                        enabled: false
                    },
                    title: {
                        display: false,
                        text: 'Weather'
                    },
                    legend: {
                        display: false
                    },
                    plugins: {
                        datalabels: {
                            color: '#fa0',
                            offset: 'top',
                            clamp: true,
                            backgroundColor: '#000'
                        }
                    }
                }

            });
        }

    }
}

update()

async function updatebackground() {

    photodata = await getData('https://api.unsplash.com/photos/random?client_id=p2RsPWAavBwh-hvyW9GzFInfh3S3PC7W7VnLkTG6wVo&query=' + city + '%20sky&orientation=landscape')
    console.log(photodata.urls.full)
    document.getElementById("background").style = "background-image: url(" + photodata.urls.regular + ");background-position: center;background-size: cover"
}

/*
key: 48a8b4741cc8cb086ca2bbffc8c983cb
*/