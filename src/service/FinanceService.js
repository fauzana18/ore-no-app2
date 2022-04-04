import axios from "axios"

export default class FinanceService {
    getTransactionList() {
        return axios.get(`${process.env.VUE_APP_BASE_URL}/finance/transaction`)
    }
}