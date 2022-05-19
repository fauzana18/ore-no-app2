import { defineStore } from 'pinia'
import FinanceService from '../service/financeService'
const financeService = new FinanceService()

export const profileStore = defineStore('profiles', {
    state: () => {
        return {
            list: [],
            selected: 0
        }
    },
    actions: {
        async getList() {
            const list = await financeService.getProfileList()
            this.list = list.data.result
        },
        select(i) {
            this.selected = i
        },
        pusher(data) {
            this.list.push(data)
        },
        changer(i, data) {
            this.list[i].name = data
        },
        splicer(i) {
            this.list.splice(i, 1)
        }
    },
})

export const categoryStore= defineStore('category', {
    state: () => {
        return {
            list: [],
            type: []
        }
    },
    actions: {
        async getList() {
            const list = await financeService.getCategoryList()
            this.list = list.data.result
            this.list.forEach(each => {
                if(!this.type.includes(each.type)) {
                    this.type.push(each.type)
                }
            })
            this.type.forEach((each, i) => {
                this.type[i] = { name: each, code: i}
            })
        },
        pushData(data) {
            this.list.push(data)
            this.list.sort(( a, b ) => {
                if ( a.name < b.name ){
                  return -1
                }
                if ( a.name > b.name ){
                  return 1
                }
                return 0
            })
        },
        changeData(data) {
            const i = this.list.findIndex(each => each.id == data.id)
            this.list[i] = data
            this.list.sort(( a, b ) => {
                if ( a.name < b.name ){
                  return -1
                }
                if ( a.name > b.name ){
                  return 1
                }
                return 0
            })
        },
        spliceData(data) {
            const i = this.list.findIndex(each => each.id == data.id)
            this.list.splice(i, 1)
            this.list.sort(( a, b ) => {
                if ( a.name < b.name ){
                  return -1
                }
                if ( a.name > b.name ){
                  return 1
                }
                return 0
            })
        }
    },
})

export const saldoStore = defineStore('saldo', {
    state: () => {
        return {
            in: 0,
            out: 0,
            monthly: {},
            categorized: {}
        }
    },
    actions: {
        async getSaldo(profile) {
            const res = await financeService.getSaldo(profile)
            this.out = res.data.pengeluaran
            this.in = res.data.pemasukan
            this.monthly = res.data.monthly
            this.categorized = res.data.categorized
        },
        add(type, amount) {
            this[type] += amount
        },
        substract(type, amount) {
            this[type] -= amount
        }
    },
})