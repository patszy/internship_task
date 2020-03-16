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

const drawTableBody = tab => {
    tab.sort(compareIncomes);

    let tBody = document.querySelector('tbody');
    tBody.innerHTML = "";
    let tr, td;

    tab.map((company) => {
        tr = document.createElement('tr');

        let keys = Object.keys(company);

        keys.map((key) => {
            td = document.createElement('td');

            td.innerText = `${company[key]}`;
            tr.appendChild(td);
        });

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

const compareIncomes = (a, b) => {
    if (a.tIncomes < b.tIncomes) return 1;
    if (b.tIncomes < a.tIncomes) return -1;
    return 0;
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

        for(let i=0; i<(values.length-1); i++){
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
    const companiesTab = [];
    const incomesTab = [];

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
            console.log(companiesTab);
            console.log(incomesTab);

            document.getElementsByClassName('loader')[0].style.display = 'none';
            document.getElementsByClassName('table__container')[0].style.display = 'flex';

            drawTableBody(companiesTab);
        });

    document.querySelector('input').addEventListener('keyup', event => {
        document.querySelector('tbody').innerHTML = '';

        drawTableBody( searchCompany(companiesTab, event) );
        console.log(companiesTab);

        console.log(incomesTab);
    });

    document.querySelector('button').addEventListener('click', () => {
        drawTableBody(companiesTab);
    });
};
