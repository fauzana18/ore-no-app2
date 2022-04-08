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