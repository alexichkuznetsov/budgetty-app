const StorageController = (function() {
    return {
        getData: function() {
            let data = localStorage.getItem('data');

            if (data === null) {
                data = {
                    items: {
                        inc: [],
                        exp: []
                    },
                    totals: {
                        inc: 0,
                        exp: 0,
                        percentages: 0,
                        records: 0
                    }
                };

                return data;
            }

            // If there is something in local storage
            data = JSON.parse(data);
            return data;
        },

        saveData: function() {
            const data = BudgetController.getData();

            localStorage.setItem('data', JSON.stringify(data));
        }
    }
}());

const BudgetController = (function() {

    const data = StorageController.getData();

    function idGenerator(type) {
        const items = data.items[type];

        if (items.length === 0) return 0;

        let id = 0;

        items.forEach(function(item) {
            if (item.id > id) id = item.id
        })

        return id + 1;
    }

    return {

        addItem: function(item) {
            const id = idGenerator(item.type);
            const newItem = {
                id,
                type: item.type,
                text: item.text,
                value: item.value
            }

            data.items[item.type].push(newItem);
            data.totals.records++;

            return newItem;
        },

        deleteItem: function(type, id) {
            const index = data.items[type].findIndex(function(el) {
                return el.id === id;
            })

            data.items[type].splice(index, 1);
            data.totals.records--;
        },

        countTotals: function(type) {
            const items = data.items[type];

            if (items.length === 0) {
                data.totals[type] = 0;
                return;
            }

            let sum = 0;

            items.forEach(function(item) {
                sum += item.value;
            });

            data.totals[type] = sum;
        },

        countPercentage: function() {
            if (data.totals.inc === 0 && data.totals.exp === 0) {
                data.totals.percentages = 0;
            } else if (data.totals.exp > data.totals.inc) {
                data.totals.percentages = 100;
            } else {
                data.totals.percentages = Math.round(data.totals.exp / data.totals.inc * 100);
            }
        },

        getTotals: function() {
            return data.totals;
        },

        getData: function() {
            return data;
        },

        logData: function() {
            console.log(data);
        }
    }

}());

const UIController = (function() {

    const UISelectors = {
        form: 'form',
        inputType: 'form__type-selection',
        inputText: 'form__text-content',
        inputValue: 'form__amount',
        formButton: 'form__submit-button',
        incomesList: 'incomes__list',
        incomesCheckbox: 'checkbox-incomes',
        expensesList: 'expenses__list',
        expensesCheckbox: 'checkbox-expenses',
        totalIncome: 'total-income',
        totalRatio: 'total-ratio',
        totalExpense: 'total-expense',
        headerCount: 'main-header__number'
    }

    return {
        getInput: function() {
            let type, text, value;

            type = document.querySelector(`.${UISelectors.inputType}`).value;
            text = document.querySelector(`.${UISelectors.inputText}`).value;
            value = document.querySelector(`.${UISelectors.inputValue}`).value;

            type = type === 'Income' ? 'inc' : 'exp';
            text = text.trim();
            value = parseInt(value, 10);

            return {
                type,
                text,
                value
            }
        },

        clearInputFields: function() {
            const text = document.querySelector(`.${UISelectors.inputText}`);
            document.querySelector(`.${UISelectors.inputValue}`).value = '';

            text.value = '';
            text.focus();
        },

        renderItem: function(item) {
            if (item.type === 'inc') {
                const list = document.querySelector(`.${UISelectors.incomesList}`);

                const listItem = document.createElement('li');

                listItem.classList.add('incomes__list-item', 'appear-left', 'item');
                listItem.dataset.type = item.type;
                listItem.dataset.id = item.id;
                
                listItem.innerHTML = `
                    <div class = 'incomes__list-item-value'>
                        <span class = 'value-type'>
                            +
                        </span>
                        <span class = 'value-amount'>
                            ${item.value}
                        </span>
                    </div>
                    <span class = 'incomes__list-item-title'>${item.text}</span>
                    <svg class = 'incomes__list-item-delete-icon delete-icon'>
                        <use href = 'images/delete-icon.svg#icon-delete' class = 'delete-icon'></use>
                    </svg>
                `;

                list.insertAdjacentElement('beforeend', listItem);
                setTimeout(function() {
                    listItem.classList.remove('appear-left');
                }, 1000);
            } else {
                const list = document.querySelector(`.${UISelectors.expensesList}`);

                const listItem = document.createElement('li');

                listItem.classList.add('expenses__list-item', 'appear-left', 'item');
                listItem.dataset.type = item.type;
                listItem.dataset.id = item.id;
                
                listItem.innerHTML = `
                    <div class = 'expenses__list-item-value'>
                        <span class = 'value-type'>
                            –
                        </span>
                        <span class = 'value-amount'>
                            ${item.value}
                        </span>
                    </div>
                    <span class = 'expenses__list-item-title'>${item.text}</span>
                    <svg class = 'expenses__list-item-delete-icon delete-icon'>
                        <use href = 'images/delete-icon.svg#icon-delete' class = 'delete-icon'></use>
                    </svg>
                `;

                list.insertAdjacentElement('beforeend', listItem);
                setTimeout(function() {
                    listItem.classList.remove('appear-left');
                }, 1000);
            }
        },

        updateRecordsCount: function() {
            const el = document.querySelector(`.${UISelectors.headerCount}`);
            const totals = BudgetController.getTotals();

            el.textContent = totals.records;
        },

        deleteItem: function(el) {
            el.classList.add('dissappear-right');
            
            setTimeout(function() {
                el.remove();
            }, 800);
        },

        toggleList: function(type) {
            if (type === 'inc') {
                const checkbox = document.querySelector(`#${UISelectors.incomesCheckbox}`);
                checkbox.checked = true;
            } else {
                const checkbox = document.querySelector(`#${UISelectors.expensesCheckbox}`);
                checkbox.checked = true;
            }
        },

        displayTotals: function() {
            const totals = BudgetController.getTotals();

            let totalIncome, totalRatio, totalExpense;
            totalIncome = document.querySelector(`#${UISelectors.totalIncome}`);
            totalRatio = document.querySelector(`#${UISelectors.totalRatio}`);
            totalExpense = document.querySelector(`#${UISelectors.totalExpense}`);

            if (totals.inc === 0 && totals.exp === 0) {
                totalIncome.textContent = 0;
                totalRatio.textContent = '0%';
                totalExpense.textContent = 0;
            }

            totalIncome.textContent = totals.inc;
            totalRatio.textContent = totals.percentages + '%';
            totalExpense.textContent = totals.exp;
        },

        getSelectors: function() {
            return UISelectors;
        }
    }

}());

const App = (function() {

    function submitButtonHandler(e) {
        const userInput = UIController.getInput();
        
        const item = BudgetController.addItem(userInput);
        BudgetController.countTotals(userInput.type);
        BudgetController.countPercentage();
        UIController.clearInputFields();

        UIController.toggleList(item.type);
        UIController.renderItem(item);
        UIController.displayTotals();
        UIController.updateRecordsCount();

        StorageController.saveData();

        e.preventDefault();
    }

    function deleteButtonHandler(e) {
        if (e.target.classList.contains('delete-icon')) {
            const el = e.target.closest('.item');
            const type = el.dataset.type;
            const id = parseInt(el.dataset.id, 10);

            BudgetController.deleteItem(type, id);
            BudgetController.countTotals(type);
            BudgetController.countPercentage();

            UIController.displayTotals();
            UIController.updateRecordsCount();

            UIController.deleteItem(el);

            StorageController.saveData();
        }
    }

    function loadEventListeners() {
        const selectors = UIController.getSelectors();

        const form = document.querySelector(`.${selectors.form}`);
        form.addEventListener('submit', submitButtonHandler);

        const lists = document.querySelectorAll(`.${selectors.incomesList}, .${selectors.expensesList}`);
        lists.forEach(function(item) {
            item.addEventListener('click', deleteButtonHandler);
        })
    };

    return {
        init: function() {
            console.log('App initialized..');

            loadEventListeners();

            const data = BudgetController.getData();

            if (data.items.inc.length !== 0) {
                data.items.inc.forEach(function(item) { UIController.renderItem(item) });
                UIController.toggleList('inc');
            }

            if (data.items.exp.length !== 0) {
                data.items.exp.forEach(function(item) { UIController.renderItem(item) });
                UIController.toggleList('exp');
            }

            UIController.displayTotals();
            UIController.updateRecordsCount();
        }
    }

}());

// Initialize app
App.init();