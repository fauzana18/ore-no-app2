import axios from "axios"

export default class FinanceService {
    getTransactionList(params) {
        let query = []
        Object.keys(params).forEach(each => {
            if(params[each] != null) query.push(`${each}=${params[each]}`)
        })
        return axios.get(`${process.env.VUE_APP_BASE_URL}/finance/transaction?${query.join('&')}`)
    }

    createTransaction(body) {
        return axios.post(`${process.env.VUE_APP_BASE_URL}/finance/transaction`, body)
    }

    updateTransaction(body, id) {
        return axios.patch(`${process.env.VUE_APP_BASE_URL}/finance/transaction/${id}`, body)
    }

    deleteTransaction(id) {
        return axios.delete(`${process.env.VUE_APP_BASE_URL}/finance/transaction/${id}`)
    }

    getProfileList() {
        return axios.get(`${process.env.VUE_APP_BASE_URL}/finance/profile`)
    }

    getCategoryList() {
        return axios.get(`${process.env.VUE_APP_BASE_URL}/finance/category`)
    }
}