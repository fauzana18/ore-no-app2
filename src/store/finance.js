import { defineStore } from 'pinia'
import FinanceService from '../service/FinanceService'
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
    },
})