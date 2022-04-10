import axios from "axios"

export default class FinanceService {
    getTransactionList(params) {
        let query = []
        Object.keys(params).forEach(each => {
            if(params[each] != null) {
                if(typeof params[each] != 'object') query.push(`${each}=${params[each]}`)
                else if(Array.isArray(params[each])) query.push(`${each}=${params[each]}`)
                else {
                    Object.keys(params[each]).forEach(el => {
                        if(params[each][el] != null) query.push(`${each}[${el}]=${params[each][el]}`)
                    })
                }
            }
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

    importTransaction(body) {
        return axios.post(`${process.env.VUE_APP_BASE_URL}/finance/importtransaction`, body)
    }

    getProfileList() {
        return axios.get(`${process.env.VUE_APP_BASE_URL}/finance/profile`)
    }

    createProfile(body) {
        return axios.post(`${process.env.VUE_APP_BASE_URL}/finance/profile`, body)
    }

    updateProfile(body, id) {
        return axios.patch(`${process.env.VUE_APP_BASE_URL}/finance/profile/${id}`, body)
    }

    deleteProfile(id) {
        return axios.delete(`${process.env.VUE_APP_BASE_URL}/finance/profile/${id}`)
    }

    getCategoryList() {
        return axios.get(`${process.env.VUE_APP_BASE_URL}/finance/category`)
    }

    createCategory(body) {
        return axios.post(`${process.env.VUE_APP_BASE_URL}/finance/category`, body)
    }

    updateCategory(body, id) {
        return axios.patch(`${process.env.VUE_APP_BASE_URL}/finance/category/${id}`, body)
    }

    deleteCategory(id) {
        return axios.delete(`${process.env.VUE_APP_BASE_URL}/finance/category/${id}`)
    }

    getSaldo(profile) {
        return axios.get(`${process.env.VUE_APP_BASE_URL}/finance/saldo?profile_id=${profile}`)
    }
}