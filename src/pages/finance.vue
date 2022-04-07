<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<Toast/>
				<Dialog header="Import" v-model:visible="importDialog" :breakpoints="{'960px': '75vw'}" :style="{width: '30vw'}" :modal="true" :dismissableMask="true">
					<Button style="width: 100%;" label="Download Template" icon="pi pi-download" class="mt-2 p-button-success" @click="downloadTemplate" />
					<FileUpload style="width: 100%;" mode="basic" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" :disabled="submitting"
						:maxFileSize="1000000" label="Import" chooseLabel="Import" class="mt-2" :customUpload="true" @uploader="fileHandler" />
				</Dialog>
				<Toolbar class="mb-4">
					<template v-slot:start>
						<div class="my-2">
							<Button label="Tambah" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
							<Button label="Hapus" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedTransactions || !selectedTransactions.length" />
						</div>
					</template>

					<template v-slot:end>
						<Button label="Import" icon="pi pi-plus" class="mr-2 inline-block" @click="openDialog" />
						<Button label="Export" icon="pi pi-upload" class="p-button-help mr-2" @click="exportCSV($event)"  />
					</template>
				</Toolbar>

				<DataTable ref="dt" :value="transactions" :lazy="true" v-model:selection="selectedTransactions" dataKey="id" :paginator="true" :rows="10" :loading="loading" @sort="onSort($event)"
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25]" :pageLinkSize="3"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} transactions" responsiveLayout="stack" :totalRecords="totalRecords" @page="onPage($event)" :key="rerender">
					<template #header>
						<div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
							<div class="left-side">
								<h5 class="m-0">Catatan Keuangan</h5>
								<Button icon="pi pi-refresh" class="p-button-rounded p-button-info ml-2" @click="reload"/>
							</div>
							<div class="filter">
								<Dropdown v-model="filters.c_type" :options="category.type" optionLabel="name" placeholder="Tipe" class="mr-2 filter-width" />
								<Dropdown v-if="filters.c_type" v-model="filters.category_id" :options="categoryOptionsFilter" optionLabel="name" placeholder="Kategori" class="mr-2 mt-2 md:mt-0 filter-width" />
								<Dropdown v-model="filters.created" :options="range" optionLabel="label" placeholder="Tanggal" class="mr-2 mt-2 md:mt-0 filter-width" />
								<span class="block mt-2 md:mt-0 p-input-icon-left">
									<i class="pi pi-search" />
									<InputText v-model="filters.name" placeholder="Pencarian..." class="filter-width"/>
								</span>
							</div>
						</div>
					</template>
					<template #empty>
                        Data kosong.
                    </template>
                    <template #loading>
                        Memuat data. Mohon tunggu.
                    </template>

					<Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
					<Column field="created" header="Tanggal" :sortable="true" headerStyle="width:14%; min-width:10rem;">
						<template #body="slotProps">
							{{dateHandler(slotProps.data.created)}}
						</template>
					</Column>
					<Column field="name" header="Judul" :sortable="true" headerStyle="width:30%; min-width:10rem;">
						<template #body="slotProps">
							{{slotProps.data.name}}
						</template>
					</Column>
					<Column field="amount" header="Jumlah" :sortable="true" headerStyle="width:14%; min-width:10rem;">
						<template #body="slotProps">
							{{formatCurrency(slotProps.data.amount)}}
						</template>
					</Column>
					<Column field="category.type" header="Tipe" headerStyle="width:14%; min-width:8rem;">
						<template #body="slotProps">
							{{slotProps.data.category.type}}
						</template>
					</Column>
					<Column field="category_id" header="Kategori" :sortable="true" headerStyle="width:14%; min-width:10rem;">
						<template #body="slotProps">
							{{slotProps.data.category.name}}
						</template>
					</Column>
					<Column headerStyle="min-width:10rem;">
						<template #body="slotProps">
							<div>
								<Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editTransaction(slotProps.data)" />
								<Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteTransaction(slotProps.data)" />
							</div>
						</template>
					</Column>
				</DataTable>

				<Dialog v-model:visible="transactionDialog" :style="{width: '450px'}" :header="modalHeader" :modal="true" class="p-fluid" @hide="refresh">
					<div class="field">
						<label for="name">Tanggal</label>
						<Calendar :showIcon="true" :showButtonBar="true" v-model="transaction.created" dateFormat="dd MM yy"></Calendar>
					</div>
					<div class="field">
						<label for="name">Tipe</label>
						<Dropdown v-model="transaction.type" :options="category.type" optionLabel="name" placeholder="Pilih Tipe" />
					</div>
					<div class="field">
						<label for="description">Kategori</label>
						<Dropdown v-model="transaction.category" :options="categoryOptions" optionLabel="name" placeholder="Pilih Kategori" />
					</div>
					<div class="field">
						<label for="inventoryStatus">Judul</label>
						<InputText id="name" v-model="transaction.name" required="true" autofocus :class="{'p-invalid': submitted && !transaction.name}" autocomplete="off" />
						<small class="p-invalid" v-if="submitted && !transaction.name">Judul harus diisi.</small>
					</div>
					<div class="field">
						<label for="name">Jumlah</label>
						<InputNumber autocomplete="off" id="price" v-model="transaction.amount" mode="currency" currency="IDR" locale="id-ID" required="true" autofocus :class="{'p-invalid': submitted && !transaction.amount}" />
						<small class="p-invalid" v-if="submitted && !transaction.amount">Jumlah harus diisi.</small>
					</div>
					<Message v-if="submitStatus" :severity="submitStatus" :closable="false">{{submitMessage}}</Message>

					<template #footer>
						<Button label="Batal" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="Simpan" icon="pi pi-check" class="p-button-text" :loading="submitting" @click="saveTransaction" :disabled="submitStatus == 'success'" />
					</template>
				</Dialog>

				<Dialog v-model:visible="deleteTransactionDialog" :style="{width: '450px'}" header="Konfirmasi" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span>Apakah anda yakin ingin menghapus <b>{{toDelete.name}}</b>?</span>
					</div>
					<template #footer>
						<Button label="Tidak" icon="pi pi-times" class="p-button-text" @click="deleteTransactionDialog = false"/>
						<Button label="Ya" icon="pi pi-check" :loading="submitting" class="p-button-text" @click="deleteTransaction" />
					</template>
				</Dialog>

				<Dialog v-model:visible="deleteTransactionsDialog" :style="{width: '450px'}" header="Konfirmasi" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span>Apakah anda yakin ingin menghapus transaksi yang dipilih?</span>
					</div>
					<template #footer>
						<Button label="Tidak" icon="pi pi-times" class="p-button-text" @click="deleteTransactionsDialog = false"/>
						<Button label="Ya" icon="pi pi-check" :loading="submitting" class="p-button-text" @click="deleteSelectedTransactions" />
					</template>
				</Dialog>
			</div>
		</div>
	</div>

</template>

<script>
import FinanceService from '../service/FinanceService'
import { profileStore, categoryStore } from '../store/finance.js'
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
				{ label: 'Semua' }
			],
			rerender: 0,
			importDialog: false
		}
	},
    FinanceService: null,
	created() {
		this.FinanceService = new FinanceService()
		this.initFilters()
	},
	async mounted() {
		this.lazyParams = {
            offset: 0,
            limit: this.$refs.dt.rows,
            order: null,
			profile_id: this.profiles.list[this.profiles.selected] ? this.profiles.list[this.profiles.selected].id : 1
        }
        await this.getList()
		this.transaction.created = new Date()
	},
	watch: {
		'profiles.selected': {
			async handler() {
				this.lazyParams = {
					offset: 0,
					limit: this.$refs.dt.rows,
					order: null,
					profile_id: this.profiles.list[this.profiles.selected].id || 1
				}
				await this.getList()
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
		}
	},
	methods: {
		formatCurrency(value) {
			if(value)
				return value.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})
			return
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
		exportCSV() {
			this.$refs.dt.exportCSV()
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
        async getList() {
			this.loading = true
            const list = await this.FinanceService.getTransactionList(this.lazyParams)
            this.transactions = list.data.result
			this.totalRecords = list.data.total
			this.loading = false
        },
		dateHandler(date) {
			const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
			const d = new Date(date)
			const dateString = d.toLocaleDateString('id-ID', options)
			return dateString
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
		async refresh() {
			if(this.submitStatus == 'success') {
				await this.getList()
			}
		},
		async reload() {
			this.initFilters()
			this.lazyParams = {
				offset: 0,
				limit: this.$refs.dt.rows,
				order: null,
				profile_id: this.profiles.list[this.profiles.selected] ? this.profiles.list[this.profiles.selected].id : 1
			}
			this.rerender++
			await this.getList()
		},
		async onPage(e) {
			this.lazyParams = {
				offset: e.first,
				limit: this.$refs.dt.rows,
				order: e.sortField ? [e.sortField, e.sortOrder == 1 ? 'ASC' : 'DESC'] : ['created', 'DESC'],
				profile_id: this.profiles.list[this.profiles.selected] ? this.profiles.list[this.profiles.selected].id : 1
			}
			await this.getList()
			this.scrollTop()
		},
		async onSort(e) {
			this.lazyParams = {
				offset: e.first,
				limit: this.$refs.dt.rows,
				order: [e.sortField, e.sortOrder == 1 ? 'ASC' : 'DESC'],
				profile_id: this.profiles.list[this.profiles.selected] ? this.profiles.list[this.profiles.selected].id : 1
			}
			await this.getList()
		},
		async onFilter(e) {
			console.log(e)
			this.lazyParams = {
				offset: e.first,
				limit: this.$refs.dt.rows,
				order: e.sortField ? [e.sortField, e.sortOrder == 1 ? 'ASC' : 'DESC'] : ['created', 'DESC'],
				profile_id: this.profiles.list[this.profiles.selected] ? this.profiles.list[this.profiles.selected].id : 1
			}
			// await this.getList()
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
        }
	}
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';

.filter {
	display: flex;
}

.left-side {
	display: flex;
	align-items: center;
}

@media screen and (max-width: 575px) {
	.filter {
		display: block;
		margin-top: 20px;
	}

	.filter-width {
		width: 100%;
	}

	.left-side {
		justify-content: space-between;
	}
}
</style>
