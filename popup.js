//Removes the un-necessary Info in Date format
function getDateString(nDate){
  let nDateDate=nDate.getDate();
  let nDateMonth=nDate.getMonth()+1;
  let nDateYear=nDate.getFullYear();
  if(nDateDate<10){nDateDate="0"+nDateDate;};
  if(nDateMonth<10){nDateMonth="0"+nDateMonth;};
  let presentDate = ""+nDateYear+"-"+nDateMonth+"-"+nDateDate;
  return presentDate;
}

//Gets the Host by splitting the string at "/"
function getDomain(tablink){
    let url =  tablink[0].url;
    // (https:)/()/(abc.com)/images => 3rd part
    return url.split("/")[2];
};

//We only store the seconds so we converts into proper format by this.
function secondsToString(seconds,compressed=false){
  let hours = parseInt(seconds/3600);
  seconds = seconds%3600;
  let minutes= parseInt(seconds/60);
  seconds = seconds%60;
  let timeString = "";
  if(hours){
    timeString += hours + " hrs ";
  }
  if(minutes){
    timeString += minutes + " min ";
  }
  if(seconds){
    timeString += seconds+ " sec "
  }
  if(!compressed){
    return timeString;
  }
  else{
    if(hours){
      return(`${hours}h`);
    }
    if(minutes){
      return(`${minutes}m`);
    }
    if(seconds){
      return(`${seconds}s`);
    }
  }
};
var allKeys, timeSpent, totalTimeSpent,sortedTimeList,topCount,topDataSet,topLabels,dateChart;
// Colors for the Pie chart
var color = [
  'rgba(255, 99, 132, 0.5)',
  'rgba(54, 162, 235, 0.5)',
  'rgba(255, 206, 86, 0.5)',
  'rgba(75, 192, 192, 0.5)',
  'rgba(153, 102, 255, 0.5)',
  'rgba(255, 0, 0, 0.5)',
  'rgb(25, 51, 0.5)',
  'rgb(255, 102, 0.5)',
  'rgb(255, 153, 0.5)',
  'rgba(255, 159, 64, 0.5)'
];
totalTimeSpent = 0;
var today = getDateString(new Date())

//Format of allKeys
// allkeys={
//   today->[
//     {url:time},
//     {url:time}
//   ],
//   tommorow->[
    // {url:time},
    //  {url:time}
//   ]
// }

//Format of sortedTimeList
// sortedTimeList{
//   Url1:1;
//   url2:2
// }



//For the first tab -> "Todays Stats"
chrome.storage.local.get(today,function(storedItems){
  allKeys = Object.keys(storedItems[today]);
  timeSpent = [];
  sortedTimeList = [];
  for (let i = 0; i<allKeys.length;i++ ){
    let webURL = allKeys[i];
    timeSpent.push(storedItems[today][webURL]);
    totalTimeSpent+= storedItems[today][webURL];
    sortedTimeList.push([webURL,storedItems[today][webURL]]);
  }
  sortedTimeList.sort((a,b)=>b[1]-a[1]);
  console.log(sortedTimeList);

  topCount = allKeys.length>10 ? 10 : allKeys.length;
  console.log(topCount);

  document.getElementById("totalTimeToday").innerText = secondsToString(totalTimeSpent);
  topDataSet= [];
  topLabels= [];
  for(let j=0;j<topCount;j++){
    topDataSet.push(sortedTimeList[j][1]);
    topLabels.push(sortedTimeList[j][0]);
  }
  

  const webTable = document.getElementById('webList');
  for(let i = 0; i<allKeys.length;i++){
      let webURL = sortedTimeList[i][0];
      let row = document.createElement('tr');
      let serialNumber = document.createElement('td');
      serialNumber.innerText = i+1;
      let siteURL = document.createElement('td');
      siteURL.innerText= webURL;
      let siteTime = document.createElement('td');
      siteTime.innerText = secondsToString(sortedTimeList[i][1]);
      row.appendChild(serialNumber);
      row.appendChild(siteURL);
      row.appendChild(siteTime);
      webTable.appendChild(row);
      console.log(row);
  }
  new Chart(document.getElementById("pie-chart"), {
    type: 'doughnut',
    data: {
      //X-axis
      labels: topLabels,
      datasets: [{
        label: "Time Spent",
        backgroundColor: color,
        //Y axis
        data: topDataSet,
      }]
    },
    options: {
      title: {
        display: true,
        text: "Top Visited Sites Today"
      },
      legend:{
          display:true
      },
      circumference : 2*Math.PI,
      rotation: Math.PI,
    },
  });
});

chrome.storage.local.get(null,function(items){
  let datesStored = Object.keys(items);
  datesStored.sort();
  const calendar = document.getElementById("dateValue");
  let minDate = datesStored[0];
  let maxDate = datesStored[datesStored.length-1];
  calendar.min = minDate;
  calendar.max = maxDate;
});

//For the second tab => "Daily Report"
document.getElementById("dateSubmit").addEventListener('click',function(){
  const calendar = document.getElementById("dateValue");
  if(calendar.value===""){
    document.getElementById("tryAgain").innerText = "Invalid date! Please try again.";
    document.getElementById("tryAgain").classList.remove("d-none");
  }
  else{
    document.getElementById("tryAgain").classList.add("d-none");
    let givenDate = calendar.value;
    chrome.storage.local.get(givenDate,function(thatDay){
      if(thatDay[givenDate] == null){
        document.getElementById("tryAgain").innerText = "No records exist for this day!";
        document.getElementById("tryAgain").classList.remove("d-none");
      }
      else{
        let sites = Object.keys(thatDay[givenDate]);
        let times=[];
        for(let i=0;i<sites.length;i++){
          times.push([sites[i],thatDay[givenDate][sites[i]]]);
        }
        times.sort(function(a,b){return b[1]-a[1]});
        let topTen = times.length>10? 10:times.length;
        let dataSet = [];
        let thatDayTotal = 0;
        let dataSetLabels = [];
        for(let i=0;i<topTen;i++){
          dataSet.push(times[i][1]);
          dataSetLabels.push(times[i][0]);
          thatDayTotal+= times[i][1];
        }
        let chartTitle = "Top Visited Sites on "+givenDate;
        if(dateChart){
          dateChart.destroy()
        }
         dateChart = new Chart(document.getElementById("differentDayChart"), {
          type: 'doughnut',
          data: {
            labels: dataSetLabels,
            datasets: [{
              label: "Time Spent",
              backgroundColor: color,
              data: dataSet
            }]
          },
          options: {
            title: {
              display: true,
              text: chartTitle
            },
            legend:{
                display:true
            },
            circumference : Math.PI,
            rotation: Math.PI
          }
      });
      document.getElementById("statsRow").classList.remove("d-none");
      document.getElementById("totalTimeThatDay").innerText = secondsToString(thatDayTotal);
      const webList2 = document.getElementById("webList2");
      while (webList2.firstChild) {
        webList2.removeChild(webList2.lastChild);
      }
      for(let i=0;i<times.length;i++){
        let row = document.createElement('tr');
        let col1 = document.createElement('td');
        col1.innerText = i+1;
        row.appendChild(col1);
        let col2 = document.createElement('td');
        col2.innerText = times[i][0];
        row.appendChild(col2);
        let col3 = document.createElement('td');
        col3.innerText = secondsToString(times[i][1]);
        row.appendChild(col3);
        webList2.appendChild(row);
      }   
      }
     
    });
  }
});

function getDateTotalTime(storedObject,date){
  let websiteLinks = Object.keys(storedObject[date]);
  let noOfWebsites = websiteLinks.length;
  let totalTime = 0;
  for(let i = 0 ; i<noOfWebsites;i++){
    totalTime+= storedObject[date][websiteLinks[i]];
  }
  return totalTime;
};

//For third tab => "Recent summary"
var monthNames = ["","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
document.getElementById('weekTab').addEventListener('click',function(){
  chrome.storage.local.get(null,function(storedItems){
    let datesList = Object.keys(storedItems);
    let noOfDays = datesList.length>=7 ? 7 : datesList.length;
    let timeEachDay= [];
    let dateLabels = [];
    let weeksTotalTime= 0;
    datesList.sort();
    for(let i = datesList.length-noOfDays;i<datesList.length;i++){
      let month = parseInt(datesList[i][5]+datesList[i][6]);
      let label = datesList[i][8]+datesList[i][9]+" "+monthNames[month];
      dateLabels.push(label);
      let dayTime = getDateTotalTime(storedItems,datesList[i]);
      timeEachDay.push(dayTime);
      weeksTotalTime += dayTime;
    }
    let weeklyAverage = parseInt(weeksTotalTime/noOfDays);
    weeklyAverage = secondsToString(weeklyAverage);
    let weeklyMax = Math.max.apply(Math,timeEachDay);
    weeklyMax = secondsToString(weeklyMax);
    document.getElementById("weekAvg").innerText = weeklyAverage;
    document.getElementById("weekMax").innerText = weeklyMax;
    const weeklyChart = document.getElementById("pastWeek");
    let weeklyChartDetails = {};
    weeklyChartDetails["type"]= 'bar';
    let dataObj= {};
    dataObj["labels"] = dateLabels;
    dataObj["datasets"] = [{label:"Time Spent",
    fill:true,
    backgroundColor: "rgba(153, 102, 255, 0.5)",
    lineTension:0.2,
    borderColor: "rgba(75,192,192,0.8)",
    pointBackgroundColor:"rgba(75,192,192,1)",
    data: timeEachDay
  }]
    weeklyChartDetails["data"] = dataObj;
    weeklyChartDetails["options"] = {
      legend:{display:false},
      title:{display:true,text:"Time Spent Online in the Recent Past"},
      scales:{yAxes:[{scaleLabel:{display:true,labelString:"Time in Seconds"}}]}
    };
    new Chart(weeklyChart,weeklyChartDetails);
  });
});