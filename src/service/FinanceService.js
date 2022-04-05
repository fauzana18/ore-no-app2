import axios from "axios"

export default class FinanceService {
    getTransactionList(params) {
        let query = []
        Object.keys(params).forEach(each => {
            if(params[each] != null) query.push(`${each}=${params[each]}`)
        })
        return axios.get(`${process.env.VUE_APP_BASE_URL}/finance/transaction?${query.join('&')}`)
    }

    getProfileList() {
        return axios.get(`${process.env.VUE_APP_BASE_URL}/finance/profile`)
    }

    getCategoryList() {
        return axios.get(`${process.env.VUE_APP_BASE_URL}/finance/category`)
    }
}