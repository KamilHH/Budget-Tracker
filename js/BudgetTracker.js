export default class BudgetTracker {
    constructor(querySelectorString) {
        this.root = document.querySelector(querySelectorString)
        this.root.innerHTML = BudgetTracker.html();
        this.root.querySelector('.new-entry').addEventListener('click', () => {
            this.onNewEntryBtnClick();
        });
        //load initial data from Local Storage
        this.load();
    }

    static html() {
        return `
        <h2>Budget Tracker App</h2>
        <table class="budget-tracker">
        <thead>
        <tr>
            <th>Data</th>
            <th>Opis</th>
            <th>Typ</th>
            <th>Kwota</th>
            <th></th>
        </tr>
        </thead>
        <tbody class="entries">
        </tbody>
        <tbody>
        <tr>
            <td colspan="5" class="controls">
                <button type="button" class="new-entry">Nowa operacja</button>
            </td>
        </tr>
        </tbody>
        <tfoot>
        <tr>
            <td colspan="5" class="summary">
                <strong>SALDO</strong>
                <span class="total"></span>
            </td>
        </tr>
        </tfoot>
    </table>`
    }

    static entryHtml() {
        return `<tr>
    <td>
        <input class="input input-date" type="date">
    </td>
    <td>
        <input class="input input-description" type="text" placeholder="Opis zdarzenia np. zakupy...">
    </td>
    <td>
    <select class="input input-type">
        <option value="income">Przychody</option>
        <option value="expense">Wydatki</option>
    </select>
    </td>
    <td>
        <input type="number" class="input input-amount">
    </td>
    <td>
        <button type="button" class="delete-entry">&#10005;</button>
    </td>
</tr>`
    }

    load() {
        const entries = JSON.parse(localStorage.getItem('budget-tracker-data') || "[]");

        for (let entry of entries){
            this.addEntry(entry);
        }
        this.update();
    }

    update() {
        const total =  this.getEntryRows().reduce((total, row)=>{
            const amount = row.querySelector('.input-amount').value;
            const isExpense = row.querySelector('.input-type').value === 'expense';
            const modifier = isExpense ? -1 : 1;

            return total + (amount * modifier);
        }, 0);
        const totalFormatted = new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(total);

        this.root.querySelector('.total').textContent = totalFormatted;
    };

    save() {
        const data = this.getEntryRows().map(row => {
            return {
                date: row.querySelector('.input-date').value,
                description: row.querySelector('.input-description').value,
                type: row.querySelector('.input-type').value,
                amount: parseFloat(row.querySelector('.input-amount').value),
            };
        });
        localStorage.setItem('budget-tracker-data',JSON.stringify(data));
        this.update();
    }

    addEntry(entry = {}) {
        this.root.querySelector('.entries').insertAdjacentHTML('beforeend', BudgetTracker.entryHtml() )

        const row = this.root.querySelector('.entries tr:last-of-type');

        row.querySelector('.input-date').value = entry.date || new Date().toISOString().replace(/T.*/, "")
        row.querySelector('.input-description').value = entry.description || "";
        row.querySelector('.input-type').value = entry.type || "income";
        row.querySelector('.input-amount').value = entry.amount ||"";
        row.querySelector('.delete-entry').addEventListener('click', e=>{
            this.onDeleteEntryBtnClick(e);
        });

        row.querySelectorAll('.input').forEach(input => {
            input.addEventListener('change', () => this.save());
        });
    }

    getEntryRows() {
        return Array.from(this.root.querySelectorAll('.entries tr'));
    }

    onNewEntryBtnClick() {
        this.addEntry()
    }

    onDeleteEntryBtnClick(e) {
        e.target.closest('tr').remove();
        this.save();
    }

}