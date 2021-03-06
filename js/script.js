const baseUrl = 'https://recruitment.hal.skygate.io/companies/';
const incomesUrl = 'https://recruitment.hal.skygate.io/incomes/';

const getCompaniesData = async () => {
    try {
        const response = await fetch(baseUrl);
        const data = await response.json();

        return data;
    } catch (error) {
        console.log(error);
    }
};

const getIncomesData = async (id) => {
    try {
        const response = await fetch(incomesUrl+id);
        const data = await response.json();

        return data;
    } catch (error) {
        console.log(error);
    }
};

function drawTableHead() {
    let tHead = document.querySelector('thead');
    tHead.innerHTML = "";
    let tr = document.createElement('tr'), th;

    for(let i=0; i<arguments.length; i++){
        th = document.createElement('th');
        th.innerText = arguments[i];

        tr.appendChild(th);
    }

    tHead.appendChild(tr);
};

const drawTableBody = (tab, page = 1, counter = 10) => {
    document.getElementsByClassName('pagination')[0].style.display = "block";
    document.querySelectorAll('.pagination li')[2].innerText = `${page+1} / ${Math.ceil(tab.length/counter)}`;

    tab.sort(compareIncomes);

    let tBody = document.querySelector('tbody');
    tBody.innerHTML = "";
    let tr, td, localPage, localCounter;

    localCounter = (page+1)*counter;
    localPage = page*counter;

    for(localPage; localPage<localCounter; localPage++){
        if(localPage < tab.length){
            tr = document.createElement('tr');

            let keys = Object.keys(tab[0]);

            keys.map((key, index) => {
                if(index < 4){
                    td = document.createElement('td');

                    td.innerText = `${tab[localPage][key]}`;
                    tr.appendChild(td);
                }
            });

            tBody.appendChild(tr);
        }
    }

    drawTableHead("id", "name", "city", "total incomes");
}

const drawDetailedTableBody = tab => {
    document.getElementsByClassName('pagination')[0].style.display = "none";

    let tBody = document.querySelector('tbody'), tr, td;
    tBody.innerHTML = "";
    tr = document.createElement('tr');
    let keys = Object.keys(tab[0]);

    keys.map((key) => {
        td = document.createElement('td');

        td.innerText = `${tab[0][key]}`;
        tr.appendChild(td);
    });

    td = document.createElement('td');
    td.innerText = `${tab[1]}`;

    tr.appendChild(td);
    tBody.appendChild(tr);
}

const getDetailedCompanyData = (tab, rowIndex, incomesTab) => {
    let resultTab = [];

    for(let i=0; i<incomesTab.length; i++){
        if(tab[i].id == tab[rowIndex].id) {
            let company = tab[rowIndex];
            company.avg = (Math.floor(company.tIncomes / incomesTab[i].incomes.length * 100) / 100).toFixed(2);

            resultTab.push(company);

            let maxDate = incomesTab[i].incomes.reduce( (prev, current) => (prev.date > current.date) ? prev : current);

            let date = new Date(maxDate.date);
            let lastMonthTab = [];
            let lastMonthSum = 0;

            incomesTab[i].incomes.map( income => {
                if(new Date(income.date).getFullYear() == date.getFullYear() && new Date(income.date).getMonth() == date.getMonth()){
                    lastMonthTab.push(income);
                }
            });

            lastMonthTab.map( income => {
                lastMonthSum += parseFloat(income.value);
            });

            resultTab.push(lastMonthSum);

            break;
        };
    };

    return resultTab;
};

const getLimitedData = (tab, startDate, endDate) => {
    let resultTab = tab;

    if(startDate != "" && endDate != ""){
        if(startDate < endDate){
            startDate = new Date(startDate);
            endDate = new Date(endDate);

            for(let i=0; i<incomesTab.length; i++){
                if(tab[0].id == incomesTab[i].id){
                    let limitedIncomesTab = [];
                    let limitedIncomesAvg = 0;

                    incomesTab[i].incomes.map( income => {
                        if(new Date(income.date) >= startDate && new Date(income.date) <= endDate){
                            limitedIncomesTab.push(income);
                        }
                    });

                    limitedIncomesTab.map( income => {
                        limitedIncomesAvg += parseFloat(income.value);
                    });

                    if(limitedIncomesTab.length == 0) {
                        alert("No incomes in that time compartment.");
                        resultTab[0].avg = 0;
                    }
                    else resultTab[0].avg = (Math.floor(limitedIncomesAvg / limitedIncomesTab.length *100) / 100).toFixed(2);

                    break;
                }
            };
        } else alert("Start date is after end date.");
    }

    return resultTab;
};

const searchCompany = (tab, event) => {
    let filteredTab = [];
    let inputValue = event.target.value;

    if(inputValue == "") return tab;

    tab.map(company => {
        if(isNaN(inputValue)) {
            if(company.name.toLowerCase().includes(inputValue.toLowerCase())) filteredTab.push(company);
        } else {
            console.log('Wrong data.');
        }
    });

    return filteredTab;
}

const compareIncomes = (a, b) => {
    if (a.tIncomes < b.tIncomes) return 1;
    if (b.tIncomes < a.tIncomes) return -1;
    return 0;
}

const setMaxDataAttr = () => {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();

    if(dd<10) dd = '0' + dd;
    if(mm<10) mm = '0' + mm;

    today = yyyy+'-'+mm+'-'+dd;
    document.getElementsByTagName("input")[0].setAttribute("max", today);
    document.getElementsByTagName("input")[1].setAttribute("max", today);
}

class Incomes{
    constructor(id, incomes){
        this.id = id;
        this.incomes = incomes;
        this.sum;
    }

    sumIncomes({incomes}){
        let values = Object.values(incomes);
        this.sum = 0;

        for(let i=0; i<values.length; i++){
            this.sum += parseFloat(values[i].value);
        }
    }
}

class Company{
    constructor(id, name, city, tIncomes){
        this.id = id;
        this.name = name;
        this.city = city;
        this.tIncomes = tIncomes;
    }
}

window.onload = () => {
    let media = window.matchMedia('(max-width: 760px)'), currentTab = [], page = 0, counter = 10;
    const companiesTab = [], incomesTab = [];

    (media.matches) ? counter = 1 : counter = 10;
    document.getElementById('counter').value = counter;

    media.addEventListener("change", e => {
        (e.matches) ? counter = 1 : counter = 10;
        document.getElementById('counter').value = counter;

        drawTableBody(currentTab, page, counter);
    });

    setMaxDataAttr();

    getCompaniesData()
        .then(compData => {
            compData.map(item => {
                let company = new Company(item.id, item.name, item.city, 0);
                companiesTab.push(company);
            });

            companiesTab.map( company => {
                getIncomesData(company.id).then(incomData => {
                    let incomes = new Incomes(incomData.id, incomData.incomes);
                    incomes.sumIncomes(incomes);
                    incomesTab.push(incomes);

                    company.tIncomes = (Math.round(incomes.sum * 100) / 100).toFixed(2);
                });
            });
        })

        .then( () => {
            document.getElementsByClassName('loader')[0].style.display = 'none';
            document.getElementsByClassName('table__container')[0].style.display = 'flex';

            currentTab = companiesTab;

            drawTableBody(currentTab, page, counter);
        });

    document.getElementsByTagName('input')[2].addEventListener('keyup', event => {
        currentTab = searchCompany(companiesTab, event);
        page = 0;

        drawTableBody(currentTab, page, counter);
    });

    document.querySelectorAll('button')[1].addEventListener('click', () => {
        page = 0;
        currentTab = companiesTab;

        document.getElementsByTagName('input')[2].value = "";
        document.querySelector('.date-selection').style.display = "none";
        document.getElementById('counter').parentElement.style.display = "block";

        drawTableBody(currentTab, page, counter);
    });

    document.querySelector('.pagination').addEventListener('click', (event) => {
        switch (event.target) {
            case document.querySelectorAll('.pagination li i')[0]:
                page = 0;
            break;

            case document.querySelectorAll('.pagination li i')[1]:
                if(page > 0) page--;
            break;

            case document.querySelectorAll('.pagination li i')[2]:
                if(page < Math.ceil(currentTab.length / counter) -1) page++;
            break;

            case document.querySelectorAll('.pagination li i')[3]:
                page = Math.ceil(currentTab.length / counter) -1;
            break;

            default: ;
        }

        drawTableBody(currentTab, page, counter);
    });

    document.querySelector('table tbody').addEventListener('click', event => {
        document.querySelector('.date-selection').style.display = "flex";
        document.getElementById('counter').parentElement.style.display = "none";

        let rowIndex = event.target.parentElement.rowIndex+((page)*10)-1;

        currentTab = getDetailedCompanyData(currentTab, rowIndex, incomesTab);

        drawTableHead("id", "name", "city", "total incomes", "total incomes avg", "last month incomes");
        drawDetailedTableBody(currentTab, 0);
    });

    document.querySelector('.date-selection button').addEventListener('click', () => {
        let startDate = document.getElementsByTagName('input')[0].value;
        let endDate = document.getElementsByTagName('input')[1].value;

        getLimitedData(currentTab, startDate, endDate);

        drawDetailedTableBody(currentTab, 0);
    });

    document.getElementById('counter').addEventListener('change', e => {
        counter = e.target.value;
        drawTableBody(currentTab, 0, counter);
    });

};
