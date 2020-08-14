//note: code is not optimized yet
    
    let url, city, weatherdata, photodata, tarray, warray, timearray, hoursarray, now, timeblock,
        tarray1 = [],
        tarray2 = [],
        tarray3 = [],
        tarray4 = [],
        tarray5 = [],
        graphmin, graphmax, graphdif

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
        if (document.getElementById("placeholder").innerText.length - 4 < document.getElementById('inputcity').value.length) {
            document.getElementById("placeholder").innerText = ""
        }
        url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&mode=xmly&appid=48a8b4741cc8cb086ca2bbffc8c983cb'
        tempweatherdata = await getData(url)
        if (tempweatherdata.city != undefined) {

            //clear the old symbols
            for (i = 0; i < document.getElementsByClassName('note').length; i++) {
                document.getElementsByClassName('note')[i].remove()
            }


            weatherdata = tempweatherdata
            document.getElementById("placeholder").innerText = weatherdata.city.name + ", " + weatherdata.city.country
            updatebackground()

            //clear arrays of all the needed data points
            tarray = [];
            tarray1 = [];
            tarray2 = [];
            tarray3 = [];
            tarray4 = [];
            tarray5 = [];
            warray = [];
            timearray = [];
            hoursarray = [];
            graphmin = 30;
            graphmax = 0;
            let day;

            //add data to the arrays
            for (i = 0; i < weatherdata.list.length; i++) {
                timearray.push(Date(weatherdata.list[i].dt_txt))
                let day = new Date(weatherdata.list[i].dt_txt)
                hoursarray.push(day.getHours() + "h")
                tarray.push(Math.round(weatherdata.list[i].main.temp - 273.15))
                warray.push(weatherdata.list[i].weather[0].icon)
                //add the standardized minima and maxima which are the same for each day chart
                graphmin = Math.min(graphmin, tarray[i])
                graphmax = Math.max(graphmax, tarray[i])
            }
            graphmin = Math.floor((graphmin - 2) / 5) * 5
            graphmax = Math.ceil((graphmax + 7) / 5) * 5
            graphdif = graphmax - graphmin

            //for the first day, add the missing hours that have already passed to the front
            now = new Date(weatherdata.list[0].dt_txt)
            //divide by 3 and correct for timezone
            timeblock = Math.floor((now.getHours() + weatherdata.city.timezone / 3600) / 3) % 8;

            for (i = 1; i < timeblock; i++) {
                timearray.unshift(null)
                hoursarray.unshift(now.getHours() - i * 3 + "h")
                tarray.unshift(null)
                warray.unshift(null)
            }
            //now break up the array in five arrays of one day each
            tarray1 = tarray.slice(0, 9);
            tarray2 = tarray.slice(8, 17);
            tarray3 = tarray.slice(16, 25);
            tarray4 = tarray.slice(24, 33);
            tarray5 = tarray.slice(32, 41);

            hoursarray1 = hoursarray.slice(0, 9);

            Chart.defaults.global.defaultFontSize = '14';
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
                            data: eval('tarray' + i),
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
                                },
                                pointLabels: {
                                    fontSize: 20,
                                }
                            }],
                            xAxes: {
                                ticks: {
                                    fontSize: 40
                                }
                            },
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
                        }/*,
                        plugins: {
                            datalabels: {
                                color: '#fa0',
                                offset: 'top',
                                clamp: true,
                                backgroundColor: '#000',
                                borderRadius: 10,
                                font: {
                                    weight: 'bold'
                                },
                                pointLabelFontSize: 20
                            }
                        }*/
                    }

                });

                let day = 0
                const weekdays = ['sunday','monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                //add the day and a brief forecast
                switch (i)
                {case 1: day = 'today'; break;
                 case 2: day = 'tomorrow'; break;
                 case 3: case 4: case 5: day = new Date(weatherdata.list[i*8-8].dt_txt);
                 day = weekdays[day.getDay()]
                }
                document.getElementById('day' + i).innerText = day + ": " + weatherdata.list[i*8-8].weather[0].description + " to " + weatherdata.list[i*8-5].weather[0].description 


                //draw symbols on top of the graph
                let daymax = -1000;
                let daymaxtime = null;
                const target = document.getElementById('chart' + i).parentElement;

                for (j = 0; j < 9; j++) {
                    if (warray[(i - 1) * 8 + j] != null) {
                        let html = document.createElement("div");
                        html.classList.add('note');
                        html.classList.add('icon');
                        let img = document.createElement("img");
                        img.style.width = '60px';
                        const bottom = "calc(-4px + " + String(((Number((eval('tarray' + i))[j]) - graphmin) / graphdif) * 85 + 0) + '%)';
                        const left = String(-5 + (100 / 8.3) * j + 2) + '%';
                        img.setAttribute('src', "http://openweathermap.org/img/wn/" + warray[(i - 1) * 8 + j] + "@2x.png")
                        html.appendChild(img);
                        html.style.bottom = bottom;
                        html.style.left = left;
                        target.appendChild(html)
                        if (Number((eval('tarray' + i))[j]) > daymax)
                        {daymax = Number((eval('tarray' + i))[j])
                         daymaxtime = j}                       
                    }
                }
                point(i,daymaxtime,String(daymax)+'°C');
                point(i,8,String((eval('tarray' + i))[8])+'°C');
            }
        }
    }
    update()

    async function updatebackground() {
        photodata = await getData('https://api.unsplash.com/photos/random?client_id=p2RsPWAavBwh-hvyW9GzFInfh3S3PC7W7VnLkTG6wVo&query=' + city + '%20sky&orientation=landscape')
        document.getElementById("background").style = "background-image: url(" + photodata.urls.regular + ");background-position: center;background-size: cover"
    }


    function point(day, time, label) {
        let html = document.createElement("div");
        html.classList.add('note');
        let img = document.createElement("img");
        let lbl = document.createTextNode(label);
        const bottom = String(-20 + ((Number((eval('tarray' + day))[time]) - graphmin) / graphdif) * 80) + '%';
        const left = String(-0 +(100 / 9) * time + 2) + '%';
        const top = String(55 - ((Number((eval('tarray' + day))[time]) - graphmin) / graphdif) * 80) + '%';
        const right = String(100 - ((100 / 8) * time + 2)) + '%';
        switch (time) {
                case 0: case 1: 
                img.setAttribute('src', "arrow0.svg");
                html.appendChild(lbl);
                html.appendChild(document.createElement("br"));
                html.appendChild(img);
                html.style.top = top;
                html.style.right = right;
                break;
                case 2: case 3: 
                img.setAttribute('src', "arrow1.svg");
                html.appendChild(img);
                html.appendChild(document.createElement("br"));
                html.appendChild(lbl);
                html.style.bottom = bottom;
                html.style.left = left;
                break;
                case 4:  case 5: case 6: 
                img.setAttribute('src', "arrow2.svg");
                html.appendChild(img);
                html.appendChild(document.createElement("br"));
                html.appendChild(lbl);
                html.style.bottom = bottom;
                html.style.right = right;
                break;
                case 7: case 8: case 9:
                img.setAttribute('src', "arrow3.svg");
                html.appendChild(lbl);
                html.appendChild(document.createElement("br"));
                html.appendChild(img);
                html.style.top = top;
                html.style.left = left;
                break;

        }
        const target = document.getElementById('chart' + day).parentElement;
        target.appendChild(html)
    }