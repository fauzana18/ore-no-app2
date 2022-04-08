import FinanceService from '../../service/FinanceService'
import { profileStore, categoryStore } from '../../store/finance.js'
import * as XLSX from 'xlsx'

export default {
	data() {
		return {
			transactionDialog: false,
			deleteTransactionDialog: false,
			deleteTransactionsDialog: false,
			selectedTransactions: null,
			filters: {},
			submitted: false,
			submitting: false,
			transactions: [],
			transaction: {},
			loading: true,
			totalRecords: 0,
			lazyParams: {},
			profiles: profileStore(),
			category: categoryStore(),
			categoryOptions: [],
			categoryOptionsFilter: [],
			modalHeader: 'Tambah Transaksi',
			submitStatus: '',
			submitMessage: '',
			toDelete: {},
			range: [
				{ label: '7 Hari Terakhir', code: 2 },
				{ label: '30 Hari Terakhir', code: 3 },
				{ label: 'Bulan Ini', code: 4 },
				{ label: 'Bulan Lalu', code: 5 },
				{ label: 'Atur Sendiri', code: 6 },
			],
			rerender: 0,
			importDialog: false,
			dateDialog: false,
			dateStart: null,
			dateEnd: null,
			modes: [
				{name: 'Per Hari', icon: 'pi-calendar', code: 1},
				{name: 'Per Transaksi', icon: 'pi-list', code: 2}
			],
			selectedMode: null,
			expandedRowGroups: null,
			categoryDialog: false,
			cat: {},
			editCategoryField: [],
			newCategoryField: false,
			submittingCategory: false,
			deletingCategory: false
		}
	},
    FinanceService: null,
	created() {
		this.FinanceService = new FinanceService()
		this.initFilters()
	},
	async mounted() {
		let cleansedQuery = this.cleansingQuery(this.filters)
		this.lazyParams = {
			...cleansedQuery,
            order: ['created', 'DESC'],
			profile_id: this.profiles.list[this.profiles.selected] ? this.profiles.list[this.profiles.selected].id : 1
        }
		this.selectedMode = this.modes[0]
        await this.getList()
		this.transaction.created = new Date()
	},
	watch: {
		'profiles.selected': {
			async handler() {
				await this.reload()
			}
		},
		'category.list': {
			handler() {
				this.transaction.type = this.category.type[0]
				this.categoryOptions = this.category.list.filter(each => each.type == this.transaction.type.name)
				this.transaction.category = this.categoryOptions[0]
			}
		},
		'transaction.type': {
			handler() {
				this.categoryOptions = this.category.list.filter(each => each.type == this.transaction.type.name)
				this.transaction.category = this.categoryOptions[0]
			}
		},
		'filters.c_type': {
			handler() {
				if(this.filters.c_type) {
					this.categoryOptionsFilter = this.category.list.filter(each => each.type == this.filters.c_type.name)
				}
			}
		},
		'cat.type': {
			handler() {
				this.categoryOptions = this.category.list.filter(each => each.type == this.cat.type.name)
				this.editCategoryField = []
				this.newCategoryField = false
			}
		}
	},
	methods: {
		async changeView(e) {
			switch (e.value.code) {
				case 1:
					this.range.splice(0, 1)
					break
				case 2:
					this.range.unshift({ label: 'Semua', code: 1 })
					break
			}
			this.filters.created = this.range[0]
			await this.reload()
		},
        initFilters() {
			this.filters = {
                name: '',
                created: this.range[0],
				c_type: null,
                category_id: null,
                amount: 0,
            }
		},
		formatCurrency(value) {
			return value.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})
		},
        dateHandler(date) {
			const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
			const d = new Date(date)
			const dateNow = new Date()
			const dateString = d.toLocaleDateString('id-ID', options)
			const dateNowString = dateNow.toLocaleDateString('id-ID', options)
			const res = dateNowString == dateString ? `Hari ini, ${dateString.split(', ')[1]}` : dateString
			return res
		},
		scrollTop() {
			let scrollToTop = window.setInterval(() => {
				let pos = window.scrollY
				if (pos > 0) {
					window.scrollTo(0, pos - 500)
				} else {
					window.clearInterval(scrollToTop)
				}
			}, 16)
		},
        openDialog() {
			this.importDialog = true
		},
		calculateAmount(created, type) {
            let total = 0

            for (let transaction of this.transactions) {
				if (transaction.created == created) {
					if(transaction.category.type == type) total += transaction.amount
				}
			}
			total = this.formatCurrency(total)

            return total
        },
        async getList() {
			this.loading = true
            const list = await this.FinanceService.getTransactionList(this.lazyParams)
            this.transactions = list.data.result
			this.totalRecords = list.data.total
			this.transactions.forEach(each => {
				const date =  new Date(each.created)
				date.setHours(0, 0, 0, 0)
				each.created = date.toLocaleDateString()
			})
			this.loading = false
        },
		openNew() {
			this.transaction = {
				type: this.category.type[0],
				category: this.categoryOptions[0],
				created: new Date()
			}
			this.submitStatus = ''
			this.submitted = false
			this.modalHeader = 'Tambah Transaksi'
			this.transactionDialog = true
		},
		hideDialog() {
			this.transactionDialog = false
			this.submitted = false
		},
		onRowGroupExpand(e) {
			this.expandedRowGroups = [e.data]
		},
		async saveTransaction() {
			let res
			this.submitted = true
			this.submitting = true

			if(!this.transaction.name || !this.transaction.amount) {
				this.submitting = false
				return
			}

			const body = {
				name: this.transaction.name,
				amount: this.transaction.amount,
				category_id: this.transaction.category.id,
				created: this.transaction.created,
				profile_id: this.profiles.list[this.profiles.selected].id
			}
			
			try {
				if(!this.transaction.id) res = await this.FinanceService.createTransaction(body)
				else res = await this.FinanceService.updateTransaction(body, this.transaction.id)

				if(res.status == 200) {
					this.submitStatus = 'success'
					this.submitMessage = res.data.message
				}
				else {
					this.submitStatus = 'error'
					this.submitMessage = res.data.message
				}
			}
			catch(err) {
				this.submitStatus = 'error'
				this.submitMessage = err.response ? err.response.data.message : 'Data gagal dibuat.'
			}

			this.submitting = false
		},
		editTransaction(transaction) {
			this.submitStatus = ''
			transaction.created = new Date(transaction.created)
			transaction.type = this.category.type.find(each => each.name == transaction.category.type)
			this.transaction = {...transaction}
			this.modalHeader = 'Ubah Transaksi'
			this.transactionDialog = true
		},
		confirmDeleteTransaction(transaction) {
			this.toDelete = transaction
			this.deleteTransactionDialog = true
		},
		async deleteTransaction() {
			let stat, message, summary
			this.submitting = true

			try {
				const res = await this.FinanceService.deleteTransaction(this.toDelete.id)

				if(res.status == 200) {
					stat = 'success'
					message = res.data.message
					summary = 'Sukses'
				}
				else {
					stat = 'error'
					message = res.data.message
					summary = 'Gagal'
				}
			}
			catch(err) {
				stat = 'error'
				message = err.response ? err.response.data.message : 'Data gagal dihapus.'
				summary = 'Gagal'
			}

			this.deleteTransactionDialog = false
			this.$toast.add({severity: stat, summary, detail: message, life: 3000})
			this.submitting = false
			if(stat == 'success') await this.getList()
		},
		confirmDeleteSelected() {
			this.deleteTransactionsDialog = true
		},
		async deleteSelectedTransactions() {
			let stat, message, summary, responses = []
			this.submitting = true

			try {
				await Promise.all(
					this.selectedTransactions.map(async (element) => {
						const res = await this.FinanceService.deleteTransaction(element.id)
						
						if(res.status == 200) {
							responses.push('success')
							message = res.data.message
						}
						else {
							responses.push('error')
							message = res.data.message
						}
					})
				)

				if(responses.includes('success')) {
					stat = 'success'
					summary = 'Sukses'
				}
				else {
					stat = 'error'
					summary = 'Gagal'
				}
			}
			catch(err) {
				stat = 'error'
				message = err.response ? err.response.data.message : 'Data gagal dihapus.'
				summary = 'Gagal'
			}

			this.deleteTransactionsDialog = false
			this.submitting = false
			this.selectedTransactions = null
			this.$toast.add({severity: stat, summary, detail: message, life: 3000})
			if(stat == 'success') await this.getList()
		},
		async refresh() {
			if(this.submitStatus == 'success') {
				await this.getList()
			}
		},
		async reload() {
			this.dateStart = null
			this.dateEnd = null
			this.initFilters()
			let cleansedQuery = this.cleansingQuery(this.filters)
			this.lazyParams = {
				offset: this.selectedMode.code == 2 ? 0 : null,
				limit: this.selectedMode.code == 2 ? 10 : null,
				order: ['created', 'DESC'],
				profile_id: this.profiles.list[this.profiles.selected] ? this.profiles.list[this.profiles.selected].id : 1,
				...cleansedQuery
			}
			this.rerender++
			await this.getList()
		},
		async onPage(e) {
			let cleansedQuery = this.cleansingQuery(this.filters)
			this.lazyParams = {
				offset: this.selectedMode.code == 2 ? e.first : null,
				limit: this.selectedMode.code == 2 ? e.rows : null,
				order: this.selectedMode.code == 2 ? e.sortField ? [e.sortField, e.sortOrder == 1 ? 'ASC' : 'DESC'] : ['created', 'DESC'] : ['created', 'DESC'],
				profile_id: this.profiles.list[this.profiles.selected] ? this.profiles.list[this.profiles.selected].id : 1,
				...cleansedQuery
			}
			await this.getList()
			this.scrollTop()
		},
		async onSort(e) {
			let cleansedQuery = this.cleansingQuery(this.filters)
			this.lazyParams = {
				offset: this.selectedMode.code == 2 ? e.first : null,
				limit: this.selectedMode.code == 2 ? e.rows : null,
				order: this.selectedMode.code == 2 ? [e.sortField, e.sortOrder == 1 ? 'ASC' : 'DESC'] : ['created', 'DESC'],
				profile_id: this.profiles.list[this.profiles.selected] ? this.profiles.list[this.profiles.selected].id : 1,
				...cleansedQuery
			}
			await this.getList()
		},
		async onFilter(e) {
			if(this.filters.created.code == 6) {
				this.dateDialog = true
				return
			}

			let cleansedQuery = this.cleansingQuery(this.filters)

			this.lazyParams = {
				...this.lazyParams,
				...cleansedQuery
			}
			await this.getList()
		},
        async searchDate() {
			this.dateDialog = false
			let cleansedQuery = this.cleansingQuery(this.filters)

			this.lazyParams = {
				...this.lazyParams,
				...cleansedQuery
			}
			await this.getList()
		},
		cleansingQuery(filters) {
			let obj = {}
			const date = new Date(), y = date.getFullYear(), m = date.getMonth()
			Object.keys(filters).forEach(each => {
				switch (each) {
					case 'name':
						obj[each] = filters[each] ? { like: `%${filters[each].toLowerCase()}%` } : undefined
						break
					case 'c_type':
						obj[each] = filters[each] ? filters[each].name : undefined
						break
					case 'category_id':
						obj[each] = filters[each] ? filters[each].id : undefined
						break
					case 'created':
						switch (filters[each].code) {
							case 1:
								obj[each] = undefined
								break
							case 2:
								date.setDate(date.getDate() - 7)
                                date.setHours(0, 0, 0, 0)
								obj[each] = { gte: date }
								break
							case 3:
								date.setDate(date.getDate() - 30)
                                date.setHours(0, 0, 0, 0)
								obj[each] = { gte: date }
								break
							case 4:
								obj[each] = { gte: new Date(y, m, 0), lte: new Date(y, m + 1, 0) }
								break
							case 5:
								obj[each] = { gte: new Date(y, m - 1, 0), lte: new Date(y, m, 0) }
								break
							case 6:
                                const start = new Date(this.dateStart)
                                start.setDate(start.getDate() - 1)
								obj[each] = { gte: start, lte: this.dateEnd }
								break
						}
						break
					default:
						break
				}
			})
			return obj
		},
        async fileHandler(e) {
			let hasil = await this.getDataExcel(e.files[0])
			let ready = []
			try {
				hasil.forEach((each, i) => {
					if(each.Tanggal) {
						const findCategory = this.category.list.find(el => el.name == each.Kategori)
						const splitDate = typeof each.Tanggal == 'string' ? each.Tanggal.split('-') : undefined

						if(!findCategory) throw { message: 'Kategori tidak sesuai dengan pilihan yang tersedia.' }
						if(isNaN(each.Jumlah)) throw { message: 'Jumlah harus berupa angka.' }
						if(splitDate == undefined) throw { message: 'Tanggal tidak sesuai format.' }
						else if (splitDate.length < 3) throw { message: 'Tanggal tidak sesuai format.' }
						else {
							if (parseInt(splitDate[0]) > 31) throw { message: 'Tanggal tidak sesuai format.' }
							if (parseInt(splitDate[1]) > 12) throw { message: 'Tanggal tidak sesuai format.' }
							if (splitDate[2].length != 4) throw { message: 'Tanggal tidak sesuai format.' }
						}

						let obj = {
							name: each.Judul,
							category_id: findCategory.id,
							created: new Date(splitDate[2], parseInt(splitDate[1]) - 1, splitDate[0]),
							amount: each.Jumlah,
							profile_id: this.profiles.list[this.profiles.selected].id
						}
						ready.push(obj)
					}
				})
				await this.importTransaction(ready)
			} catch (err) {
				this.$toast.add({severity: 'error', summary: 'Gagal', detail: err.message || 'Data tidak sesuai format.', life: 3000})
			}
		},
		getDataExcel(file) {
            return new Promise(resolve=>{
                let reader = new FileReader()

                reader.onload = function(e) {
                    let data = e.target.result
                    let workbook = XLSX.read(data, {
                      type: 'binary'
                    })
                    workbook.SheetNames.forEach(function(sheetName) {
                        let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName])
                        resolve(rowObject)
                    })
              
                }
    
                reader.onerror = function() {
                }
              
                reader.readAsBinaryString(file)
            })
        },
		async importTransaction(body) {
			let stat, message, summary
			this.submitting = true

			try {
				const res = await this.FinanceService.importTransaction(body)

				if(res.status == 200) {
					stat = 'success'
					message = res.data.message
					summary = 'Sukses'
				}
				else {
					stat = 'error'
					message = res.data.message
					summary = 'Gagal'
				}
			}
			catch(err) {
				stat = 'error'
				message = err.response ? err.response.data.message : 'Data gagal disimpan.'
				summary = 'Gagal'
			}

			this.$toast.add({severity: stat, summary, detail: message, life: 3000})
			this.submitting = false
			if(stat == 'success') await this.getList()
		},
		downloadTemplate() {
            let wb = {}
            wb.Sheets = {}
            wb.SheetNames = []

            let wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' }
            let ws = { '!ref': "A1:Z220" }
			let wscols = [
				{wch: 5},
				{wch: 15},
				{wch: 50},
				{wch: 15},
				{wch: 30},
			]
            ws['A1'] = { v: "No", t: "s" }
            ws['B1'] = { v: "Tanggal", t: "s" }
            ws['C1'] = { v: "Judul", t: "s" }
            ws['D1'] = { v: "Jumlah", t: "s" }
            ws['E1'] = { v: "Kategori", t: "s" }
            ws['J1'] = { v: "Catatan", t: "s" }

            ws['A2'] = { v: "1", t: "n" }
            ws['B2'] = { v: "18-07-1997", w: "18-07-1997", t: "s" }
            ws['C2'] = { v: "Nasi Uduk", t: "s" }
            ws['D2'] = { v: "10000", t: "n" }
            ws['E2'] = { v: "Makanan dan Minuman", t: "s" }
            ws['J2'] = { v: "Kategori harus sesuai dengan pilihan yang tersedia", t: "s" }
            ws['J3'] = { v: "Pastikan kolom tanggal memiliki format text", t: "s" }
            ws['J4'] = { v: "Maksimum 500 baris untuk satu kali import", t: "s" }

			ws['!cols'] = wscols
            
            wb.SheetNames.push('Sheets')
            wb.Sheets['Sheets'] = ws

            XLSX.write(wb, wopts)
            XLSX.writeFile(wb, 'Template Import.xlsx')
        },
        exportCSV() {
			this.$refs.dt.exportCSV()
		},
		manageCategory() {
			this.cat.type = this.category.type[0]
			this.categoryDialog = true
		},
		toggleAddCategory() {
			this.submitted = false
			this.newCategoryField = !this.newCategoryField
			this.cat.name = ''
			this.cat.id = null
			this.editCategoryField.forEach((each, i) => { this.editCategoryField[i] = false })
		},
		toggleEditCategory(i) {
			this.submitted = false
			this.newCategoryField = false
			this.editCategoryField[i] = !this.editCategoryField[i]
			this.editCategoryField.forEach((each, index) => { if(i != index) this.editCategoryField[index] = false })
			this.cat.name = this.categoryOptions[i].name
			this.cat.id = this.categoryOptions[i].id
		},
		async saveCategory(i) {
			let res, stat, message, summary
			this.submitted = true
			this.submittingCategory = true

			if(!this.cat.name) {
				this.submittingCategory = false
				return
			}

			const body = {
				name: this.cat.name,
				type: this.cat.type.name
			}
			
			try {
				if(!this.cat.id) res = await this.FinanceService.createCategory(body)
				else res = await this.FinanceService.updateCategory(body, this.cat.id)

				if(res.status == 200) {
					stat = 'success'
					message = res.data.message
					summary = 'Sukses'
					if(i) this.category.changeData({...body, id: this.cat.id})
					else this.category.pushData(res.data.result)
					this.categoryOptions = this.category.list.filter(each => each.type == this.cat.type.name)
				}
				else {
					stat = 'error'
					message = res.data.message
					summary = 'Gagal'
				}
			}
			catch(err) {
				stat = 'error'
				message = err.response ? err.response.data.message : 'Data gagal disimpan.'
				summary = 'Gagal'
			}
			if(i) this.editCategoryField[i] = false
			else this.newCategoryField = false
			this.rerender++
			this.$toast.add({severity: stat, summary, detail: message, life: 3000})
			this.submittingCategory = false
		},
		confirmDeleteCategory(e, i) {
			this.$confirm.require({
                target: e.currentTarget,
                message: `Apakah anda yakin ingin menghapus ${this.categoryOptions[i].name}? \nData transaksi dengan kategori ini juga akan ikut terhapus.`,
                icon: 'pi pi-exclamation-triangle',
                accept: async () => {
					await this.deleteCategory(this.categoryOptions[i])
                },
                reject: () => {
                    this.$confirm.close()
                }
            })
		},
		async deleteCategory(data) {
			let stat, message, summary
			this.deletingCategory = true
			
			try {
				const res = await this.FinanceService.deleteCategory(data.id)

				if(res.status == 200) {
					stat = 'success'
					message = res.data.message
					summary = 'Sukses'
					this.category.spliceData(data)
					this.categoryOptions = this.category.list.filter(each => each.type == this.cat.type.name)
				}
				else {
					stat = 'error'
					message = res.data.message
					summary = 'Gagal'
				}
			}
			catch(err) {
				stat = 'error'
				message = err.response ? err.response.data.message : 'Data gagal dihapus.'
				summary = 'Gagal'
			}
			this.rerender++
			this.$toast.add({severity: stat, summary, detail: message, life: 3000})
			this.deletingCategory = false
		},
	}
}