const expenseForm = document.getElementById("expense-form"); 
const expenseList = document.getElementById("expense-list"); 
const totalAmountElement = document.getElementById("total-amount"); 

const incomeForm = document.getElementById("income-form"); 
const incomeList = document.getElementById("income-list"); 
const totalAmountElement2 = document.getElementById("total-amount-2"); 

const adjustBalance = document.querySelector('.new-balance');
const addCategory = document.querySelector('.new-category');
const adjBalanceNav = document.querySelector('.change-bal');
const addCategoryNav = document.querySelector('.add-category');
const removeCategoryNav = document.querySelector('.remove-category');
const deleteCategoryDropdown = document.querySelector('.remove-category .dropdown-content');

const categoryVal = document.querySelector('.category-val');
const balanceVal = document.querySelector('.balance-val');

const xBtnBalance = document.querySelector('.xBtnBalance');
const xBtnCategories = document.querySelector('.xBtnCategories');

const updateBalanceBtn = document.querySelector('.updateBalBtn');
const addCategoryBtn = document.querySelector('.add-catBtn');

const themes = document.querySelector('.themes');
const dropDownThemes = document.querySelector('.dropdown-themes');

const currentBalanceElement = document.querySelector('.balance-amount');

const budgetForm = document.getElementById("budget-form");
const budgetBtn = document.querySelector(".budgetBtn");
const budgetDropdownContent = document.querySelector(".budget-content");

const savingsForm = document.getElementById("savings-form");
const savingsList = document.getElementById("savings-list");
const totalAmountElement4 = document.getElementById("total-amount-4");
const savingsBtn = document.querySelector(".budgetBtn");
const savingsDropdownContent = document.querySelector(".budget-content");
const billForm = document.getElementById("bill-form");
const billList = document.getElementById("bill-list");
const totalAmountElement3 = document.getElementById("total-amount-3");

// ----------------------------------------------------------------------------------------------------------

const currentVersion = '1.0.0';
let expenses = JSON.parse(localStorage.getItem("expenses")) || []; 
let incomes = JSON.parse(localStorage.getItem("incomes")) || []; 
let currentBalance = parseFloat(localStorage.getItem("currentBalance")) || 0.00;
let categories = JSON.parse(localStorage.getItem("categories")) || ['Rent', 'Food', 'Transportation', 'Entertainment', 'Personal Care', 'Insurance', 'Car Payment', 'Dining Out', 'Gas', 'Utilities', 'Mortgage', 'Water', 'Internet', 'Phone bill'];
let budgets = JSON.parse(localStorage.getItem("budgets")) || [];
let savings = JSON.parse(localStorage.getItem("savings")) || [];
let bills = JSON.parse(localStorage.getItem("bills")) || [];
let currentOpenDropdown = null;


const calculateTotalIncome = function() {
    return incomes.reduce((total, income) => total + income.amount, 0);
};

const calculateTotalExpenses = function() {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
};

const calculateExpensesByCategory = function(category) {
    return expenses
        .filter(expense => expense.category === category)
        .reduce((total, expense) => total + expense.amount, 0);
};

const calculateTotalSavings = function() {
    return savings.reduce((total, saving) => total + saving.amountSaved, 0);
};

const calculateTotalBills = function() {
    return bills.reduce((total, bill) => total + bill.amount, 0);
};

const updateBalance = function() {
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    const newBalance = totalIncome - totalExpenses + currentBalance;

    const oldBalance = parseFloat(currentBalanceElement.textContent);
    const balanceDifference = newBalance - oldBalance;

    if (balanceDifference > 0) {
        currentBalanceElement.classList.add('load-up');
    } else if (balanceDifference < 0) {
        currentBalanceElement.classList.add('load-down');
    }

    setTimeout(() => {
        currentBalanceElement.textContent = newBalance.toFixed(2);
        currentBalanceElement.classList.remove('load-up', 'load-down');
        localStorage.setItem("currentBalance", currentBalance.toFixed(2));
    }, 300);
};


// ----------------------------------------------------------------------------------------------------------

// RENDER FUNCTIONS
const renderBudgetTable = function() {
    const budgetList = document.getElementById("budget-list");
    budgetList.innerHTML = "";

    budgets.forEach((budget, index) => {
        const expensesForCategory = calculateExpensesByCategory(budget.category);
        const amountLeft = budget.limit - expensesForCategory;

        const budgetRow = document.createElement("tr");
        budgetRow.innerHTML = `
            <td>${budget.category}</td>
            <td>$${budget.limit.toFixed(2)}</td>
            <td>$${amountLeft.toFixed(2)}</td>
            <td><span class="delete-budget-btn" data-index="${index}">Delete</span></td>
        `;
        budgetList.appendChild(budgetRow);
    });

    document.querySelectorAll(".delete-budget-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const index = parseInt(event.target.getAttribute("data-index"));
            budgets.splice(index, 1);
            localStorage.setItem("budgets", JSON.stringify(budgets));
            renderBudgetTable();
        });
    });
};

const renderExpenses = function() {
    expenseList.innerHTML = "";

    let totalAmount = 0;
    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];

        let dropdownOptions = `
        <div class="dropdown">
            <button class="dropDownBtn rounded-3">Categories</button>
            <div class="dropdown-content rounded-3 hidden">
        `;

        categories.forEach(category => {
            dropdownOptions += `<a href="#">${category}</a>`;
        });

        dropdownOptions += `
            </div>
        </div>
        `;

        const expenseRow = document.createElement("tr");
        expenseRow.innerHTML = `
            <td>${expense.name}</td>
            <td class="category-cell">${expense.category ? expense.category : dropdownOptions}</td>
            <td>$${expense.amount}</td>
            <td data-id="${i}"><span class="delete-btn">Delete</span> / <span class="dup-btn">Duplicate</span></td>
        `;
        expenseList.appendChild(expenseRow);

        if (!expense.category) {
            const dropDownBtn = expenseRow.querySelector('.dropDownBtn');
            const dropdownContent = expenseRow.querySelector('.dropdown-content');
            dropDownBtn.addEventListener('click', () => {
                hideAll_DD();

                if (currentOpenDropdown && currentOpenDropdown !== dropdownContent) {
                    currentOpenDropdown.classList.add('hidden');
                }

                dropdownContent.classList.toggle('hidden');

                currentOpenDropdown = dropdownContent.classList.contains('hidden') ? null : dropdownContent;
            });


            dropdownContent.querySelectorAll('a').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    const selectedCategory = e.target.textContent;
                    expense.category = selectedCategory;
                    localStorage.setItem("expenses", JSON.stringify(expenses));
                    renderExpenses();
                });
            });
        }

        totalAmount += expense.amount;
    }

    totalAmountElement.textContent = totalAmount.toFixed(2);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    hideAll_DD();
    updateBalance();
    renderBudgetTable();
};

const renderIncomes = function() { 
    incomeList.innerHTML = ""; 

    let totalAmount = 0; 
    for (let i = 0; i < incomes.length; i++) { 
        const income = incomes[i]; 
        const incomeRow = document.createElement("tr"); 

        incomeRow.innerHTML = ` 
            <td>${income.name}</td> 
            <td>$${income.amount}</td> 
            <td data-id="${i}"><span class="delete-btn">Delete</span> / <span class="dup-btn">Duplicate</span></td>
        `; 
        incomeList.appendChild(incomeRow); 

        totalAmount += income.amount; 
    } 

    totalAmountElement2.textContent = totalAmount.toFixed(2); 
 
    localStorage.setItem("incomes", JSON.stringify(incomes)); 

    hideAll_DD();
    updateBalance();
}; 

const renderSavings = function() {
    savingsList.innerHTML = "";

    savings.forEach((saving, index) => {
        const savingsRow = document.createElement("tr");

        let dropdownOptions = `
            <div class="dropdown">
                <button class="dropDownBtn rounded-3">Categories</button>
                <div class="dropdown-content rounded-3 hidden">
        `;

        categories.forEach(category => {
            dropdownOptions += `<a href="#">${category}</a>`;
        });

        dropdownOptions += `
                </div>
            </div>
        `;

        savingsRow.innerHTML = `
            <td>${saving.name}</td>
            <td class="category-cell">${saving.category ? saving.category : dropdownOptions}</td>
            <td>$${saving.goal.toFixed(2)}</td>
            <td>
                <span class="amount-saved-span" data-index="${index}">$${saving.amountSaved.toFixed(2)}</span>
                <input type="number" class="amount-saved-input hidden" data-index="${index}" value="${saving.amountSaved.toFixed(2)}" step="0.01" min="0" max="1000000">
            </td>
            <td data-id="${index}"><span class="delete-savings-btn">Delete</span></td>
        `;

        savingsList.appendChild(savingsRow);

        if (!saving.category) {
            const dropDownBtn = savingsRow.querySelector('.dropDownBtn');
            const dropdownContent = savingsRow.querySelector('.dropdown-content');
            dropDownBtn.addEventListener('click', () => {
                hideAll_DD();

                if (currentOpenDropdown && currentOpenDropdown !== dropdownContent) {
                    currentOpenDropdown.classList.add('hidden');
                }

                dropdownContent.classList.toggle('hidden');

                currentOpenDropdown = dropdownContent.classList.contains('hidden') ? null : dropdownContent;
            });

            dropdownContent.querySelectorAll('a').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    const selectedCategory = e.target.textContent;
                    saving.category = selectedCategory;
                    localStorage.setItem("savings", JSON.stringify(savings));
                    renderSavings();
                });
            });
        }
    });

    totalAmountElement4.textContent = calculateTotalSavings().toFixed(2);
    updateSavingsTotal();
    localStorage.setItem("savings", JSON.stringify(savings));
    hideAll_DD();
};

const renderBills = function() {
    billList.innerHTML = "";

    bills.forEach((bill, index) => {
        const billRow = document.createElement("tr");

        billRow.innerHTML = `
            <td>
                <span class="bill-date-span" data-index="${index}">${bill.date}</span>
                <input type="date" class="bill-date-input hidden" data-index="${index}" value="${bill.date}">
            </td>
            <td>${bill.name}</td>
            <td>$${bill.amount.toFixed(2)}</td>
            <td data-id="${index}"><span class="paid-btn">Paid</span> / <span class="dup-btn">Duplicate</span></td>
        `;

        billList.appendChild(billRow);
    });

    totalAmountElement3.textContent = calculateTotalBills().toFixed(2);
    localStorage.setItem("bills", JSON.stringify(bills));
};

// ----------------------------------------------------------------------------------------------------------

// ADD FUNCTIONS

const addExpense = function(event) {
    event.preventDefault();

    const expenseNameInput = document.getElementById("expense-name"); 
    const expenseAmountInput = document.getElementById("expense-amount"); 

    const expenseName = expenseNameInput.value; 
    const expenseAmount = parseFloat(expenseAmountInput.value); 

    expenseNameInput.value = ""; 
    expenseAmountInput.value = ""; 

    if (expenseName === "" || isNaN(expenseAmount)) { 
        alert("Please enter valid expense details."); 
        return; 
    } 

    const expense = { 
        name: expenseName, 
        amount: expenseAmount,
        category: null, 
    }; 

    expenses.push(expense); 

    renderExpenses();
    updateBalance(); 
};

const addIncome = function(event) { 
    event.preventDefault(); 
    const incomeNameInput = document.getElementById("income-name"); 
    const incomeAmountInput = document.getElementById("income-amount"); 
    const incomeName = incomeNameInput.value; 
    const incomeAmount = parseFloat(incomeAmountInput.value); 

    incomeNameInput.value = ""; 
    incomeAmountInput.value = ""; 

    if (incomeName === "" || isNaN(incomeAmount)) { 
        alert("Please enter valid income details."); 
        return; 
    } 

    const income = { 
        name: incomeName, 
        amount: incomeAmount, 
    }; 

    incomes.push(income); 
    renderIncomes(); 
};

const addSavings = function(event) {
    event.preventDefault();

    const savingsNameInput = document.getElementById("savings-name");
    const savingsAmountInput = document.getElementById("savings-amount");

    const savingsName = savingsNameInput.value.trim();
    const savingsGoal = parseFloat(savingsAmountInput.value);

    if (savingsName === "" || isNaN(savingsGoal)) {
        alert("Please enter valid savings details.");
        return;
    }

    if (savings.some(saving => saving.name === savingsName)) {
        alert("This saving title already exists.");
        return;
    }

    const saving = {
        name: savingsName,
        goal: savingsGoal,
        amountSaved: 0,
        category: null,
    };

    savings.push(saving);
    renderSavings();

    savingsNameInput.value = "";
    savingsAmountInput.value = "";
};

const addBill = function(event) {
    event.preventDefault();

    const billDateInput = document.getElementById("bill-date");
    const billNameInput = document.getElementById("bill-name");
    const billAmountInput = document.getElementById("bill-amount");

    const billDate = billDateInput.value;
    const billName = billNameInput.value.trim();
    const billAmount = parseFloat(billAmountInput.value);

    if (billDate === "" || billName === "" || isNaN(billAmount)) {
        alert("Please enter valid bill details.");
        return;
    }

    const bill = {
        date: billDate,
        name: billName,
        amount: billAmount,
    };

    bills.push(bill);
    renderBills();

    billDateInput.value = "";
    billNameInput.value = "";
    billAmountInput.value = "";
};

const deleteSavings = function(event) {
    if (event.target.classList.contains("delete-savings-btn")) {
        const savingsIndex = parseInt(event.target.parentElement.getAttribute("data-id"));
        savings.splice(savingsIndex, 1);

        renderSavings();
    }
};

// ----------------------------------------------------------------------------------------------------------

// DELETE BUTTON

const deleteExpense = function(event) {
    if (event.target.classList.contains("delete-btn")) {
        const expenseIndex = parseInt(event.target.parentElement.getAttribute("data-id")); 
        expenses.splice(expenseIndex, 1);

        renderExpenses();
        updateBalance();
    }
};

const deleteIncome = function(event) { 
    if (event.target.classList.contains("delete-btn")) { 
        const incomeIndex = parseInt(event.target.parentElement.getAttribute("data-id")); 
        incomes.splice(incomeIndex, 1); 

        renderIncomes(); 
    } 
};

const deleteBudget = function(event) {
    if (event.target.classList.contains("delete-budget-btn")) {
        const row = event.target.parentElement.parentElement;
        const category = row.children[0].textContent;

        budgets = budgets.filter(budget => budget.category !== category);

        localStorage.setItem("budgets", JSON.stringify(budgets));

        renderBudgetTable();
    }
};
document.getElementById("budget-list").addEventListener("click", deleteBudget);

const deleteBill = function(event) {
    if (event.target.classList.contains("paid-btn")) {
        const billIndex = parseInt(event.target.parentElement.getAttribute("data-id"));
        bills.splice(billIndex, 1);

        renderBills();
    }
};


// ----------------------------------------------------------------------------------------------------------

// DUPLICATE BUTTON

const duplicateExpense = function(event) {
    if (event.target.classList.contains("dup-btn")) {
        const expenseIndex = parseInt(event.target.parentElement.getAttribute("data-id"));
        const expenseToDuplicate = expenses[expenseIndex];
        const duplicatedExpense = {
            name: expenseToDuplicate.name,
            amount: expenseToDuplicate.amount,
            category: expenseToDuplicate.category
        };
        expenses.push(duplicatedExpense);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        renderExpenses();
        updateBalance();
    }
};

const duplicateIncome = function(event) {
    if (event.target.classList.contains("dup-btn")) {
        const incomeIndex = parseInt(event.target.parentElement.getAttribute("data-id"));
        const incomeToDuplicate = incomes[incomeIndex];
        const duplicatedIncome = {
            name: incomeToDuplicate.name,
            amount: incomeToDuplicate.amount
        };
        incomes.push(duplicatedIncome);
        localStorage.setItem("incomes", JSON.stringify(incomes));
        renderIncomes();
        updateBalance(); 
    }
};

const duplicateBill = function(event) {
    if (event.target.classList.contains("dup-btn")) {
        const billIndex = parseInt(event.target.parentElement.getAttribute("data-id"));
        const billToDuplicate = bills[billIndex];
        const duplicatedBill = {
            date: billToDuplicate.date,
            name: billToDuplicate.name,
            amount: billToDuplicate.amount
        };
        bills.push(duplicatedBill);
        localStorage.setItem("bills", JSON.stringify(bills));
        renderBills();
    }
};

// ----------------------------------------------------------------------------------------------------------

// CATEGORY SECTION THINGS

const updateBalanceValue = function(){
    const newBalance = parseFloat(balanceVal.value);
    if (!isNaN(newBalance)) {
        currentBalance = newBalance;
        localStorage.setItem("currentBalance", currentBalance.toFixed(2));
        updateBalance();
    } else {
        alert("Please enter a valid number for the balance.");
    }
    hideBalanceDD();
};

const updateSavedAmount = function(event) {
    if (event.target.classList.contains("amount-saved-input")) {
        const savingsIndex = parseInt(event.target.getAttribute("data-index"));
        const newAmountSaved = parseFloat(event.target.value);

        if (!isNaN(newAmountSaved)) {
            savings[savingsIndex].amountSaved = newAmountSaved;
            renderSavings();
        } else {
            alert("Please enter a valid number for the saved amount.");
        }
    }
};

const updateBillDate = function(event) {
    if (event.target.classList.contains("bill-date-input") && event.key === "Enter") {
        const index = event.target.getAttribute("data-index");
        const newDate = event.target.value;
        const spanField = document.querySelector(`.bill-date-span[data-index="${index}"]`);

        bills[index].date = newDate;
        spanField.textContent = newDate;
        localStorage.setItem("bills", JSON.stringify(bills));

        spanField.classList.remove('hidden');
        event.target.classList.add('hidden');
    }
};

const addCategoryToDropDown = function() {
    const dropdownContents = document.querySelectorAll(".dropdown-content");
    dropdownContents.forEach(dropdownContent => {
        dropdownContent.innerHTML = '';

        categories.forEach(category => {
            const optionLink = document.createElement("a");
            optionLink.href = "#";
            optionLink.textContent = category;
            optionLink.addEventListener("click", (e) => {
                e.preventDefault();
                const button = dropdownContent.previousElementSibling;
                button.textContent = category;
            });
            dropdownContent.appendChild(optionLink);
        });
    });
    loadBudgetCategories();
};

const addCategoryToDeleteDropdown = function(){
    deleteCategoryDropdown.innerHTML = '';

    categories.forEach(category => {
        const optionLink = document.createElement("a");
        optionLink.href = "#";
        optionLink.className = 'delete-options';
        optionLink.textContent = category;
        optionLink.addEventListener("click", (e) => {
            e.preventDefault();
            categories = categories.filter(cat => cat !== category);
            saveCategoriesToLocalStorage();
            addCategoryToDropDown();
            renderDeleteCategoryDropdown();
            renderExpenses();
        });
        deleteCategoryDropdown.appendChild(optionLink);
    });
};

const renderDeleteCategoryDropdown = function() {
    deleteCategoryDropdown.innerHTML = '';
    categories.forEach(category => {
        addCategoryToDeleteDropdown(category);
    });
};

const saveCategoriesToLocalStorage = function() {
    localStorage.setItem("categories", JSON.stringify(categories));
};

const loadCategories = function() {
    addCategoryToDropDown();
    renderDeleteCategoryDropdown();
};

const loadSavedBalance = function() {
    const savedBalance = localStorage.getItem("currentBalance");
    if (savedBalance) {
        currentBalance = parseFloat(savedBalance);
        currentBalanceElement.textContent = currentBalance.toFixed(2);
    }
}

const addCategoryToSavingsDropDown = function() {
    savingsDropdownContent.innerHTML = '';

    categories.forEach(category => {
        const optionLink = document.createElement("a");
        optionLink.href = "#";
        optionLink.textContent = category;
        optionLink.addEventListener("click", (e) => {
            e.preventDefault();
            savingsBtn.textContent = category;
            savingsDropdownContent.classList.add('hidden');
        });
        savingsDropdownContent.appendChild(optionLink);
    });
};

const updateSavingsTotal = function() {
    const totalSavings = calculateTotalSavings();
    const savingsAmountElement = document.querySelector('.savings-amount');

    const oldSavings = parseFloat(savingsAmountElement.textContent.replace('$', ''));
    const savingsDifference = totalSavings - oldSavings;

    if (savingsDifference > 0) {
        savingsAmountElement.classList.add('load-up');
    } else if (savingsDifference < 0) {
        savingsAmountElement.classList.add('load-down');
    }

    setTimeout(() => {
        savingsAmountElement.textContent = totalSavings.toFixed(2);
        savingsAmountElement.classList.remove('load-up', 'load-down');
    }, 300);
};

// ----------------------------------------------------------------------------------------------------------

// BUDGET FORM CHECKS & LISTENER

budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedCategory = budgetBtn.textContent;
    const budgetAmountInput = document.getElementById("budget-amount");
    const budgetAmount = parseFloat(budgetAmountInput.value);

    if (selectedCategory === "Categories" || isNaN(budgetAmount)) {
        alert("Please select a category and enter a valid amount.");
        return;
    }

    if (categoryExistsInBudgetTable(selectedCategory)) {
        alert("This category already exists in the budget table.");
        return;
    }

    const newBudget = {
        category: selectedCategory,
        limit: budgetAmount
    };

    budgets.push(newBudget);
    localStorage.setItem("budgets", JSON.stringify(budgets));
    budgetBtn.textContent = "Categories";
    budgetAmountInput.value = "";

    renderBudgetTable();
    renderExpenses();
});

const loadBudgetCategories = function() {
    const budgetDropdownContent = document.querySelector("#budget-form .dropdown-content");
    budgetDropdownContent.innerHTML = '';

    categories.forEach(category => {
        const optionLink = document.createElement("a");
        optionLink.href = "#";
        optionLink.textContent = category;
        optionLink.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelector(".budgetBtn").textContent = category;
            budgetDropdownContent.classList.add('hidden');
        });
        budgetDropdownContent.appendChild(optionLink);
    });
};

const categoryExistsInBudgetTable = function(category) {
    const budgetList = document.getElementById("budget-list");
    const rows = budgetList.getElementsByTagName("tr");

    for (let row of rows) {
        if (row.querySelector("td:first-child").textContent === category) {
            return true;
        }
    }
    return false;
};

// ----------------------------------------------------------------------------------------------------------

// THEME VARIABLES
const body = document.querySelector('body');
const deleteBtns = document.querySelectorAll('.delete-btn');
const duplicateBtns = document.querySelectorAll('.dup-btn');
const budgetDeleteBtns = document.querySelectorAll('.delete-budget-btn');
const dropDownBtns = document.querySelectorAll('.dropDownBtn');
const header = document.querySelector('.header');
const navText = document.querySelectorAll('.nav-text');

// THEME COLORS
const white = document.querySelector('.light');
const black = document.querySelector('.black');
const pink = document.querySelector('.pink');
const blue = document.querySelector('.blue');
const red = document.querySelector('.red');


// THEMES
const whiteTheme = function(){
    changeTheme('var(--white-bg)','var(--light-pri)', 'var(--light-sec)', 'var(--light-text)');
    changeButton('var(--light-text)', 'var(--light-sec)');
    changeNav('var(--light-text)', '#ccc');
    saveTheme('white');
}
const blackTheme = function(){
    changeTheme('var(--black-bg)','var(--black-pri)', 'var(--black-sec)', 'var(--white-text)');
    changeNav('var(--white-text)', '#ccc');
    saveTheme('black');
}
const pinkTheme = function(){
    changeTheme('var(--pink-bg)','var(--pink-pri)', 'var(--pink-sec)', 'var(--white-text)');
    changeNav('var(--white-text)', '#ccc');
    saveTheme('pink');
}
const blueTheme = function(){
    changeTheme('var(--blue-bg)','var(--blue-pri)', 'var(--blue-sec)', 'var(--white-text)');
    changeNav('var(--white-text)', '#ccc');
    saveTheme('blue');
}
const redTheme = function(){
    changeTheme('var(--red-bg)','var(--red-pri)', 'var(--red-sec)', 'var(--white-text)');
    changeButton('#D80032', 'var(--red-sec)');
    changeNav('var(--white-text)', '#ccc');
    saveTheme('red');
}

// THEME FUNCTIONS
const saveTheme = function(themeName) {
    localStorage.setItem('selectedTheme', themeName);
}

const changeTheme = function(background, primary, secondary, text){
    document.documentElement.style.setProperty('--current-bg', background);
    header.style.color = text;
    deleteBtns.forEach(btn => btn.style.color = secondary);
    duplicateBtns.forEach(btn => btn.style.color = secondary);
    budgetDeleteBtns.forEach(btn => btn.style.color = secondary);
    dropDownBtns.forEach(btn => btn.style.color = secondary);
    changeButton(secondary, primary);
    hideAll_DD();
};

const changeButton = function(background, hover) {
    document.documentElement.style.setProperty('--button-bg', background);
    document.documentElement.style.setProperty('--button-hover-bg', hover);
};

const changeNav = function(main, hover) {
    document.documentElement.style.setProperty('--light-nav-text', main);
    document.documentElement.style.setProperty('--light-nav-hover', hover);
};

const loadSavedTheme = function() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        switch(savedTheme) {
            case 'white':
                whiteTheme();
                break;
            case 'black':
                blackTheme();
                break;
            case 'pink':
                pinkTheme();
                break;
            case 'blue':
                blueTheme();
                break;
            case 'red':
                redTheme();
                break;
            default:
                blackTheme();
        }
    } else {
        blackTheme();
    }
}

// DARK THEME TOGGLE
const modeToggle = document.getElementById('mode');
const budgetContainer = document.getElementById('budgetContainer');
const incomeContainer = document.getElementById('incomeContainer');
const expenseContainer = document.getElementById('expenseContainer');
const balanceContainer = document.getElementById('balanceContainer');
const savingsContainer = document.getElementById('savingsContainer');
const savingsContainer2 = document.getElementById('savingsContainer2');
const billContainer = document.getElementById('billContainer');
const inputContainer = document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]');
const expenseTable = document.querySelector('.expense-table');
const incomeTable = document.querySelector('.income-table');
const budgetTable = document.querySelector('.budget-table');
const billTable = document.querySelector('.bill-table');
const savingsTable = document.querySelector('.savings-table');
const tableHeaders = document.querySelectorAll('thead th');
const rowDividers = document.querySelectorAll('tbody td');

const modeToggleFunction = function() {
    // DARK MODE
    if (this.checked) {
        localStorage.setItem('darkMode', 'enabled');
        if (budgetContainer) budgetContainer.style.backgroundColor = 'var(--dark-pri)';
        if (budgetContainer) budgetContainer.style.color = 'var(--white-text)';
        if (incomeContainer) incomeContainer.style.backgroundColor = 'var(--dark-pri)';
        if (incomeContainer) incomeContainer.style.color = 'var(--white-text)';
        if (expenseContainer) expenseContainer.style.backgroundColor = 'var(--dark-pri)';
        if (expenseContainer) expenseContainer.style.color = 'var(--white-text)';
        if (balanceContainer) balanceContainer.style.backgroundColor = 'var(--dark-pri)';
        if (balanceContainer) balanceContainer.style.color = 'var(--white-text)';
        if (savingsContainer2) savingsContainer2.style.backgroundColor = 'var(--dark-pri)';
        if (savingsContainer2) savingsContainer2.style.color = 'var(--white-text)';
        if (savingsContainer) savingsContainer.style.backgroundColor = 'var(--dark-pri)';
        if (savingsContainer) savingsContainer.style.color = 'var(--white-text)';
        if (billContainer) billContainer.style.backgroundColor = 'var(--dark-pri)';
        if (billContainer) billContainer.style.color = 'var(--white-text)';
        
        if (expenseTable) expenseTable.style.backgroundColor = 'var(--dark-pri)';
        if (expenseTable) expenseTable.style.border = '1px solid var(--black-pri)';
        if (incomeTable) incomeTable.style.backgroundColor = 'var(--dark-pri)';
        if (incomeTable) incomeTable.style.border = '1px solid var(--black-pri)';
        if (budgetTable) budgetTable.style.backgroundColor = 'var(--dark-pri)';
        if (budgetTable) budgetTable.style.border = '1px solid var(--black-pri)';
        if (savingsTable) savingsTable.style.backgroundColor = 'var(--dark-pri)';
        if (savingsTable) savingsTable.style.border = '1px solid var(--black-pri)';
        if (billTable) billTable.style.backgroundColor = 'var(--dark-pri)';
        if (billTable) billTable.style.border = '1px solid var(--black-pri)';
        inputContainer.forEach(input => {
            if (input) input.style.backgroundColor = 'var(--black-sec)';
            if (input) input.style.color = 'var(--white-text)';
        });
        tableHeaders.forEach(input => {
            if (input) input.style.backgroundColor = 'var(--black-sec)';
        });

        const dropDownBtn = document.querySelectorAll('.dropDownBtn');
        dropDownBtn.forEach(input => {
            if (input) input.style.color = 'var(--white-text)';
        });

        changeBorders('var(--black-pri)', 'var(--black-sec)');
        changeDuplicateDeleteColor('var(--white-text)');
        bottomTableContainer('var(--black-sec)');
        changeDropDownColors('var(--black-pri)', 'var(--white-text)');
    } 
    // LIGHT MODE
    else {
        localStorage.setItem('darkMode', 'disabled');
        if (budgetContainer) budgetContainer.style.backgroundColor = 'var(--light-pri)';
        if (budgetContainer) budgetContainer.style.color = 'var(--black-text)';
        if (incomeContainer) incomeContainer.style.backgroundColor = 'var(--light-pri)';
        if (incomeContainer) incomeContainer.style.color = 'var(--black-text)';
        if (expenseContainer) expenseContainer.style.backgroundColor = 'var(--light-pri)';
        if (expenseContainer) expenseContainer.style.color = 'var(--black-text)';
        if (balanceContainer) balanceContainer.style.backgroundColor = 'var(--light-pri)';
        if (balanceContainer) balanceContainer.style.color = 'var(--black-text)';
        if (savingsContainer2) savingsContainer2.style.backgroundColor = 'var(--light-pri)';
        if (savingsContainer2) savingsContainer2.style.color = 'var(--black-text)';
        if (savingsContainer) savingsContainer.style.backgroundColor = 'var(--light-pri)';
        if (savingsContainer) savingsContainer.style.color = 'var(--black-text)';
        if (billContainer) billContainer.style.backgroundColor = 'var(--light-pri)';
        if (billContainer) billContainer.style.color = 'var(--black-text)';
        
        if (expenseTable) expenseTable.style.backgroundColor = 'var(--light-pri)';
        if (expenseTable) expenseTable.style.border = '1px solid var(--light-tb-border)';
        if (incomeTable) incomeTable.style.backgroundColor = 'var(--light-pri)';
        if (incomeTable) incomeTable.style.border = '1px solid var(--light-tb-border)';
        if (budgetTable) budgetTable.style.backgroundColor = 'var(--light-pri)';
        if (budgetTable) budgetTable.style.border = '1px solid var(--light-tb-border)';
        if (savingsTable) savingsTable.style.backgroundColor = 'var(--light-pri)';
        if (savingsTable) savingsTable.style.border = '1px solid var(--light-tb-border)';
        if (billTable) billTable.style.backgroundColor = 'var(--light-pri)';
        if (billTable) billTable.style.border = '1px solid var(--light-tb-border)';
        inputContainer.forEach(input => {
            if (input) input.style.backgroundColor = 'var(--light-sec)';
            if (input) input.style.color = 'var(--black-text)';
        });
        tableHeaders.forEach(input => {
            if (input) input.style.backgroundColor = 'var(--light-sec)';
        });

        const dropDownBtn = document.querySelectorAll('.dropDownBtn');
        dropDownBtn.forEach(input => {
            if (input) input.style.color = 'var(--black-text)';
        });
        
        changeBorders('var(--light-tb-border)', 'var(--light-tb-border)');
        changeDuplicateDeleteColor('var(--black-text)');
        bottomTableContainer('var(--light-sec)');
        changeDropDownColors('var(--light-pri)', 'var(--black-text)');
    }
};


const changeBorders = function(btnOutline, rowColor) {
    document.documentElement.style.setProperty('--btn-outline', btnOutline);
    document.documentElement.style.setProperty('--rows', rowColor);
};

const changeDuplicateDeleteColor = function(color) {
    document.documentElement.style.setProperty('--delete-dup', color);
};

const bottomTableContainer = function(color) {
    document.documentElement.style.setProperty('--table-bottom', color);
};

const changeDropDownColors = function(background, text) {
    document.documentElement.style.setProperty('--dd-bg', background);
    document.documentElement.style.setProperty('--dd-text', text);
};

const loadToggleState = function() {
    const darkModeState = localStorage.getItem('darkMode');
    if (darkModeState === 'enabled') {
        modeToggle.checked = true;
        modeToggleFunction.call(modeToggle);
    } else {
        modeToggle.checked = false;
        modeToggleFunction.call(modeToggle);
    }
};

// ----------------------------------------------------------------------------------------------------------

const hideBalanceDD = function(){
    adjustBalance.classList.add('hidden');
};

const showBalanceDD = function(){
    balanceVal.value = '';
    adjustBalance.classList.toggle('hidden');
    if(!addCategory.classList.contains('hidden')){
        hideCategoryDD();
    }
    if(!deleteCategoryDropdown.classList.contains('hidden')){
        hideDeleteCategoryDD();
    }
    if(!dropDownThemes.classList.contains('hidden')){
        hideThemeDD();
    }
    if(!budgetDropdownContent.classList.contains('hidden')){
        hideBudgetDD();
    }
};

const hideCategoryDD = function(){
    addCategory.classList.add('hidden');
};

const showCategoryDD = function(){
    addCategory.classList.toggle('hidden');
    if(!adjustBalance.classList.contains('hidden')){
        hideBalanceDD();
    }
    if(!deleteCategoryDropdown.classList.contains('hidden')){
        hideDeleteCategoryDD();
    }
    if(!dropDownThemes.classList.contains('hidden')){
        hideThemeDD();
    }
    if(!budgetDropdownContent.classList.contains('hidden')){
        hideBudgetDD();
    }
};

const hideDeleteCategoryDD = function(){
    deleteCategoryDropdown.classList.add('hidden');
};

const showDeleteCategoryDD = function(e){
    e.preventDefault();
    deleteCategoryDropdown.classList.toggle('hidden');
    if(!adjustBalance.classList.contains('hidden')){
        hideBalanceDD();
    }
    if(!addCategory.classList.contains('hidden')){
        hideCategoryDD();
    }
    if(!dropDownThemes.classList.contains('hidden')){
        hideThemeDD();
    }
    if(!budgetDropdownContent.classList.contains('hidden')){
        hideBudgetDD();
    }
};

const showBudgetDD = function(){
    budgetDropdownContent.classList.toggle('hidden');
    if(!adjustBalance.classList.contains('hidden')){
        hideBalanceDD();
    }
    if(!addCategory.classList.contains('hidden')){
        hideCategoryDD();
    }
    if(!deleteCategoryDropdown.classList.contains('hidden')){
        hideDeleteCategoryDD();
    }
    if(!dropDownThemes.classList.contains('hidden')){
        hideThemeDD();
    }
};

const hideBudgetDD = function(){
    budgetDropdownContent.classList.add('hidden');
}

const hideThemeDD = function(){
    dropDownThemes.classList.add('hidden');
};

const showThemeDD = function(){
    dropDownThemes.classList.toggle('hidden');
    if(!adjustBalance.classList.contains('hidden')){
        hideBalanceDD();
    }
    if(!addCategory.classList.contains('hidden')){
        hideCategoryDD();
    }
    if(!deleteCategoryDropdown.classList.contains('hidden')){
        hideDeleteCategoryDD();
    }
    if(!budgetDropdownContent.classList.contains('hidden')){
        showBudgetDD();
    }
};
const hideAll_DD = function(){
    if(!adjustBalance.classList.contains('hidden')){
        hideBalanceDD();
    }
    if(!addCategory.classList.contains('hidden')){
        hideCategoryDD();
    }
    if(!deleteCategoryDropdown.classList.contains('hidden')){
        hideDeleteCategoryDD();
    }
    if(!dropDownThemes.classList.contains('hidden')){
        hideThemeDD();
    }
    if(!budgetDropdownContent.classList.contains('hidden')){
        hideBudgetDD();
    }
};

// ----------------------------------------------------------------------------------------------------------

// EVENT LISTENERS

expenseForm.addEventListener("submit", addExpense); 
expenseList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {
        deleteExpense(event);
    } else if (event.target.classList.contains("dup-btn")) {
        duplicateExpense(event);
    }
}); 
incomeForm.addEventListener("submit", addIncome); 
incomeList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {
        deleteIncome(event);
    } else if (event.target.classList.contains("dup-btn")) {
        duplicateIncome(event);
    }
});
document.getElementById("budget-list").addEventListener("click", deleteBudget);

adjBalanceNav.addEventListener('click', showBalanceDD);
addCategoryNav.addEventListener('click', showCategoryDD);
removeCategoryNav.addEventListener('click', showDeleteCategoryDD);
themes.addEventListener('click', showThemeDD);
budgetBtn.addEventListener('click', showBudgetDD);

xBtnBalance.addEventListener('click', hideBalanceDD);
xBtnCategories.addEventListener('click', hideCategoryDD);

updateBalanceBtn.addEventListener('click', updateBalanceValue);

addCategoryBtn.addEventListener("click", () => {
    const newOption = categoryVal.value.trim();
    if (newOption && !categories.includes(newOption)) {
        categories.push(newOption);
        saveCategoriesToLocalStorage();
        addCategoryToDropDown();
        renderDeleteCategoryDropdown();
        categoryVal.value = "";
    }
    hideCategoryDD();
});

white.addEventListener('click', whiteTheme);
black.addEventListener('click', blackTheme);
pink.addEventListener('click', pinkTheme);
blue.addEventListener('click', blueTheme);
red.addEventListener('click', redTheme);
modeToggle.addEventListener('change', modeToggleFunction);

savingsForm.addEventListener("submit", addSavings);
savingsList.addEventListener("click", deleteSavings);
savingsList.addEventListener("click", (event) => {
    if (event.target.classList.contains("amount-saved-span")) {
        const index = event.target.getAttribute("data-index");
        const inputField = document.querySelector(`.amount-saved-input[data-index="${index}"]`);
        const spanField = event.target;

        spanField.classList.add('hidden');
        inputField.classList.remove('hidden');
        inputField.focus();
    }
});
savingsList.addEventListener("keydown", (event) => {
    if (event.target.classList.contains("amount-saved-input") && event.key === "Enter") {
        const index = event.target.getAttribute("data-index");
        const newAmountSaved = parseFloat(event.target.value);
        const spanField = document.querySelector(`.amount-saved-span[data-index="${index}"]`);

        if (!isNaN(newAmountSaved) && newAmountSaved <= 1000000) {
            savings[index].amountSaved = newAmountSaved;
            spanField.textContent = `$${newAmountSaved.toFixed(2)}`;
            localStorage.setItem("savings", JSON.stringify(savings));
            totalAmountElement4.textContent = calculateTotalSavings().toFixed(2);
            updateSavingsTotal();
        } else {
            alert("Please enter a valid number for the saved amount (up to 1,000,000).");
        }

        spanField.classList.remove('hidden');
        event.target.classList.add('hidden');
    }
});
document.addEventListener("click", (event) => {
    const inputFields = document.querySelectorAll('.amount-saved-input');
    inputFields.forEach(inputField => {
        if (!inputField.contains(event.target) && !inputField.classList.contains('hidden') && !event.target.classList.contains("amount-saved-span")) {
            const index = inputField.getAttribute("data-index");
            const newAmountSaved = parseFloat(inputField.value);
            const spanField = document.querySelector(`.amount-saved-span[data-index="${index}"]`);

            if (!isNaN(newAmountSaved) && newAmountSaved <= 1000000) {
                savings[index].amountSaved = newAmountSaved;
                spanField.textContent = `$${newAmountSaved.toFixed(2)}`;
                localStorage.setItem("savings", JSON.stringify(savings));
                totalAmountElement4.textContent = calculateTotalSavings().toFixed(2);
                updateSavingsTotal();
            } else {
                alert("Please enter a valid number for the saved amount (up to 1,000,000).");
            }

            spanField.classList.remove('hidden');
            inputField.classList.add('hidden');
        }
    });
}, true);

billList.addEventListener("click", (event) => {
    if (event.target.classList.contains("bill-date-span")) {
        const index = event.target.getAttribute("data-index");
        const inputField = document.querySelector(`.bill-date-input[data-index="${index}"]`);
        const spanField = event.target;

        spanField.classList.add('hidden');
        inputField.classList.remove('hidden');
        inputField.focus();
    }
});
billList.addEventListener("keydown", updateBillDate);
document.addEventListener("click", (event) => {
    const inputFields = document.querySelectorAll('.bill-date-input');
    inputFields.forEach(inputField => {
        if (!inputField.contains(event.target) && !inputField.classList.contains('hidden') && !event.target.classList.contains("bill-date-span")) {
            const index = inputField.getAttribute("data-index");
            const newDate = inputField.value;
            const spanField = document.querySelector(`.bill-date-span[data-index="${index}"]`);

            bills[index].date = newDate;
            spanField.textContent = newDate;
            localStorage.setItem("bills", JSON.stringify(bills));

            spanField.classList.remove('hidden');
            inputField.classList.add('hidden');
        }
    });
}, true);
billForm.addEventListener("submit", addBill);
billList.addEventListener("click", deleteBill);
billList.addEventListener("click", duplicateBill);

// RENDER ON PAGE LOAD
window.addEventListener('load', () => {
    const storedVersion = localStorage.getItem('version');
    if (storedVersion !== currentVersion) {
        localStorage.clear();
        localStorage.setItem('version', currentVersion);
        const initialCategories = ['Rent', 'Food', 'Transportation', 'Entertainment', 'Personal Care', 'Insurance', 'Car Payment', 'Dining Out', 'Gas', 'Utilities', 'Mortgage', 'Water', 'Internet', 'Phone bill'];
        localStorage.setItem('categories', JSON.stringify(initialCategories));
        localStorage.setItem('expenses', JSON.stringify([]));
        localStorage.setItem('incomes', JSON.stringify([]));
        localStorage.setItem('budgets', JSON.stringify([]));
        localStorage.setItem('currentBalance', '0.00');
        window.location.reload();
    }
    loadSavedTheme();
    loadSavedBalance();
    renderExpenses(); 
    renderIncomes();
    updateBalance();
    loadCategories();
    renderBudgetTable();
    addCategoryToDropDown();
    loadToggleState();
    addCategoryToSavingsDropDown();
    renderSavings();
    renderBills();
});



// STORAGE USAGE
let t = 0; 
for (let x in localStorage) { 
    if (localStorage.hasOwnProperty(x)) {
        var keyLength = x.length || 0;
        var valueLength = localStorage[x] ? localStorage[x].length : 0;
        t += (keyLength + valueLength) * 2; 
    }
} 
console.log((t / 1024) + " KB");