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

// const drawTableHead = tab => {
//     let tHead = document.querySelector('thead');
//     let tr = document.createElement('tr'), th;
//     let keysTab = Object.keys(tab[0]);
//     let gradesTab = Object.keys(tab[0].grades);

//     th = document.createElement('th');
//     th.innerText = `${keysTab[0]}`.toUpperCase();
//     tr.appendChild(th);

//     gradesTab.map(item => {
//         th = document.createElement('th');
//         th.innerText = `${item}`.toUpperCase();
//         tr.appendChild(th);
//     });

//     tHead.appendChild(tr);
// }

const drawTableBody = tab => {
    let tBody = document.querySelector('tbody');
    let tr, td;

    tab.map((company) => {
        tr = document.createElement('tr');

        let keys = Object.keys(company);

        keys.map((key) => {
            td = document.createElement('td');

            td.innerText = `${company[key]}`;
            tr.appendChild(td);
        });

        // for(let i=0; i<keys.length-1; i++){
        //     td = document.createElement('td');

        //     td.innerText = `${company[keys[i]]}`;
        //     tr.appendChild(td);
        // }

        // let {id, grades} = item;

        // td.innerText = `${id}`;
        // tr.appendChild(td);

        // for (let key in grades) {
        //     td = document.createElement('td');
        //     td.innerText = `${grades[key]}`;
        //     tr.appendChild(td);
        // }

        // (grades['avg'] < 2) ? tr.classList.add('wrong') : false;
        // (grades['avg'] > 4.75) ? tr.classList.add('good') : false;

        tBody.appendChild(tr);
    });
}

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

class Incomes{
    constructor(id, incomes){
        this.id = id;
        this.incomes = incomes;
        this.sum = 0;
    }

    sumIncomes({incomes}){
        let values = Object.values(incomes);
        this.sum = 0;

        for(let i=0; i<(values.length-1); i++){
            this.sum += parseFloat(values[i].value);
        }
        console.log(this.sum);
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
    const companiesTab = [];
    const incomesTab = [];

    // getIncomesData(39).then(incomData => {
    //     let incomes = new Incomes(incomData.id, incomData.incomes);
    //     incomes.sumIncomes(incomes);

    //     incomesTab.push(incomes);
    //     console.log(incomesTab[0].sum);
    // });

    getIncomesData(82).then(incomData => {
        let incomes = new Incomes(incomData.id, incomData.incomes);
        incomes.sumIncomes(incomes);
        incomesTab.push(incomes);
    });

    getCompaniesData().then(compData => {
        compData.map((item, index) => {

            let company = new Company(item.id, item.name, item.city, incomesTab[0].sum);
            companiesTab.push(company);
        });

        document.getElementsByClassName('loader')[0].style.display = 'none';
        document.getElementsByClassName('table')[0].style.display = 'flex';

        // drawTableHead(companiesTab);
        drawTableBody(companiesTab);

        document.querySelector('input').addEventListener('keyup', (event) => {
            document.querySelector('tbody').innerHTML = '';
            drawTableBody( searchCompany(companiesTab, event) );
        });
    });
};