/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

const getTextElement = (left, top, name, color, fontsize) => {
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
    textElement.setAttribute("x", left)
    textElement.setAttribute("y", top)
    textElement.setAttribute("fill", color)
    textElement.setAttribute("font-size", fontsize)
    textElement.setAttribute("font-family", "Arial")
    textElement.textContent = name

    return textElement
}


const getMonthElement = (left, top) => {
    let monthElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
    monthElement.setAttribute("x", left)
    monthElement.setAttribute("y", top)
    monthElement.setAttribute("transform", `translate(${left} ${top})`)
    return monthElement;
}


const getWeekElement = (left, top) => {
    let weekElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
    weekElement.setAttribute("x", left)
    weekElement.setAttribute("y", top)
    weekElement.setAttribute("transform", `translate(${left} ${top})`)
    return weekElement;
}

const getDayElement = (left, top, width, height, color, rounding) => {
    let dayElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    dayElement.setAttribute("x", left);
    dayElement.setAttribute("y", top);
    dayElement.setAttribute("width", width);
    dayElement.setAttribute("height", height);
    dayElement.setAttribute("fill", color);
    dayElement.setAttribute("rx", rounding);
    dayElement.setAttribute("ry", rounding);

    return dayElement;
}

function getDates() {

    let dates = new Map();
    let today = new Date();
    for (let i = 366; i >= 0; i--) {
    
        let startDay = new Date();
        startDay.setDate(today.getDate() - i)

        const year = startDay.getFullYear();
        const month = startDay.getMonth();
        const dayOfWeek = startDay.getDay();
        const dayOfMonth = startDay.getDate() - 1;
        const startOfMonth = new Date(startDay.getFullYear(), startDay.getMonth(), 1);
        const weekOfMonth = Math.floor((startDay.getDate() - 1 + startOfMonth.getDay()) / 7);
        const monthName = startDay.toLocaleString('default', { month: 'short' });

        let monthKey = year.toString().substring(2) + month.toString().padStart(2, '0');
        
        if (!dates.has(monthKey)) {
            dates.set(monthKey, []);
        } 

        
        const activity = i < 60 ? getRandomActivity() : "none";

        dates.get(monthKey).push({
            year: year,
            monthName: monthName,
            month: month,
            dayOfWeek: dayOfWeek,
            dayOfMonth: dayOfMonth,
            weekOfMonth: weekOfMonth,
            activity: activity
        });
    }

    return dates;
}

const getRandomColor = () => {
    getColor(getRandomActivity());
}

const getColor = (activity) => {
    const colors = {
        "very-high": "#7FE18B",
        "high": "#28C244",
        "medium": "#109932",
        "low": "#016620",
        "none": "#393939"
    }
    
    return colors[activity];
}

const getRandomActivity = () => {
    const activities = ["none", "low", "medium", "high", "very-high"];
    return activities[Math.floor(Math.random() * activities.length)];
}  

const getSVGElement = (id, viewBox, widthl) => {
    let svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElem.setAttribute("id", id);
    svgElem.setAttribute("viewBox", viewBox);
    svgElem.setAttribute("width", widthl);
    return svgElem;
} 


const calendarHeatMap = (dates = getDates()) => {
    // hover effect on day
    const heatMapView = document.createElement("div");
    heatMapView.setAttribute("id", "heatMapView");
    heatMapView.classList.add("flex", "rounded-lg", "flex-col", "bg-[#282828]", "w-[830px]", "text-white");

    const topBar = document.createElement("div");
    topBar.setAttribute("id", "topBar");
    topBar.classList.add("flex", "justify-between", "inset-0");

    const mainVariable = document.createElement("div");
    mainVariable.setAttribute("id", "mainVariable");
    mainVariable.classList.add("left-0", "mx-4", "my-3");

    const mainVariableValue = document.createElement("span");
    mainVariableValue.setAttribute("id", "mainVariableValue");
    mainVariableValue.classList.add("w-40", "font-bold", "text-2xl");
    mainVariableValue.textContent = "0";

    mainVariable.appendChild(mainVariableValue);
    mainVariable.appendChild(document.createTextNode(" Pages read"));

    topBar.appendChild(mainVariable);
    heatMapView.appendChild(topBar);

    const heatMap = document.createElement("div");
    heatMap.setAttribute("id", "heatmap");
    heatMap.classList.add("m-2", "flex", "items-center", "justify-center");

    heatMapView.appendChild(heatMap);
    



    // tracker svg element
    
    // heatMapVew.appendChild(svgContainer);
    heatMap.setAttribute("id", "calendarHeatMap");
    heatMap.className = ""
    heatMap.classList.add("mx-4", "flex", "items-center", "justify-center")
    
    const svgElem = getSVGElement("calendarHeatMap", "0 0 800 104.64", "800");
    heatMap.appendChild(svgElem);

    let rectWidth = 0
    rectWidth = 8.86
    const spaceBetween = 2.66

    const months = [...dates.values()]
    let addedMonths = new Map()
    let monthRight = 0
    for (let i = 0; i < months.length; i++) {
        let month = months[i]
        const monthElem = getMonthElement(monthRight, 0)
        
        let AddedWeeks = new Map()
        let startWeek = month[0].weekOfMonth
        for (let j = 0; j < month.length; j++) {
            const day = month[j]
            
            if (!AddedWeeks.get(day.weekOfMonth)) {
                const weekElem = getWeekElement((day.weekOfMonth-startWeek)*(rectWidth + spaceBetween), 0)
                AddedWeeks.set(day.weekOfMonth, weekElem)
                monthElem.appendChild(weekElem)
            }
            const weekElem = AddedWeeks.get(day.weekOfMonth)
            
            const dayElem = getDayElement(0, (rectWidth + spaceBetween) * day.dayOfWeek, rectWidth, rectWidth, getColor(day.activity), rectWidth/5)
            
            weekElem.appendChild(dayElem)
        }
        
        svgElem.appendChild(monthElem)
        const monthWid = (AddedWeeks.size * rectWidth) + (AddedWeeks.size-1) * spaceBetween
        addedMonths.set(i, [monthRight, monthRight + monthWid])
        addedMonths.set(i, {left : monthRight, width: monthWid, name  : month[0].monthName})
        monthRight += monthWid + 6.58
    }

    //add names of months under
    for (let i = 0; i < months.length; i++) {
        const month = addedMonths.get(i)
        const textElem = getTextElement(month.left + month.width/3, 92.14, month.name, "#ffffff", "10")
        svgElem.appendChild(textElem)
    }

    return heatMapView;
}

export default calendarHeatMap;