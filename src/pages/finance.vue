<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<Toast/>
				<Toolbar class="mb-4">
					<template v-slot:start>
						<div class="my-2">
							<Button label="Tambah" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
							<Button label="Hapus" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedTransactions || !selectedTransactions.length" />
						</div>
					</template>

					<template v-slot:end>
						<FileUpload mode="basic" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
						:maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" :customUpload="true" @uploader="fileHandler" />
						<Button label="Export" icon="pi pi-upload" class="p-button-help mr-2" @click="exportCSV($event)"  />
						<Button icon="pi pi-refresh" class="p-button-rounded p-button-info" @click="getList()"/>
					</template>
				</Toolbar>

				<DataTable ref="dt" :value="transactions" :lazy="true" v-model:selection="selectedTransactions" dataKey="id" :paginator="true" :rows="10" :filters="filters" :loading="loading"
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25]"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products" responsiveLayout="stack" :totalRecords="totalRecords" @page="onPage($event)">
					<template #header>
						<div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
							<h5 class="m-0">Catatan Keuangan</h5>
							<span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
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
					<Column field="amount" header="Jumlah" headerStyle="width:14%; min-width:10rem;">
						<template #body="slotProps">
							{{formatCurrency(slotProps.data.amount)}}
						</template>
					</Column>
					<Column field="category" header="Tipe" :sortable="true" headerStyle="width:14%; min-width:8rem;">
						<template #body="slotProps">
							{{slotProps.data.category.type}}
						</template>
					</Column>
					<Column field="category" header="Kategori" :sortable="true" headerStyle="width:14%; min-width:10rem;">
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
						<span v-if="product">Apakah anda yakin ingin menghapus <b>{{toDelete.name}}</b>?</span>
					</div>
					<template #footer>
						<Button label="Tidak" icon="pi pi-times" class="p-button-text" @click="deleteTransactionDialog = false"/>
						<Button label="Ya" icon="pi pi-check" :loading="submitting" class="p-button-text" @click="deleteTransaction" />
					</template>
				</Dialog>

				<Dialog v-model:visible="deleteTransactionsDialog" :style="{width: '450px'}" header="Konfirmasi" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span v-if="product">Apakah anda yakin ingin menghapus transaksi yang dipilih?</span>
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
import {FilterMatchMode} from 'primevue/api'
import ProductService from '../service/ProductService'
import axios from "axios"
import FinanceService from '../service/FinanceService'
import { profileStore, categoryStore } from '../store/finance.js'

export default {
	data() {
		return {
			products: null,
			transactionDialog: false,
			deleteTransactionDialog: false,
			deleteTransactionsDialog: false,
			product: {},
			selectedTransactions: null,
			filters: {},
			submitted: false,
			submitting: false,
			statuses: [
				{label: 'INSTOCK', value: 'instock'},
				{label: 'LOWSTOCK', value: 'lowstock'},
				{label: 'OUTOFSTOCK', value: 'outofstock'}
			],
			transactions: [],
			transaction: {},
			loading: true,
			totalRecords: 0,
			lazyParams: {},
			profiles: profileStore(),
			category: categoryStore(),
			categoryOptions: [],
			modalHeader: 'Tambah Transaksi',
			submitStatus: '',
			submitMessage: '',
			toDelete: {}
		}
	},
	productService: null,
    FinanceService: null,
	created() {
		this.productService = new ProductService()
		this.FinanceService = new FinanceService()
		this.initFilters();
	},
	async mounted() {
		this.productService.getProducts().then(data => this.products = data)
		this.lazyParams = {
            offset: 0,
            limit: this.$refs.dt.rows,
            sortField: null,
            sortOrder: null,
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
					sortField: null,
					sortOrder: null,
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
		}
	},
	methods: {
		formatCurrency(value) {
			if(value)
				return value.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})
			return;
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
				this.submitMessage = err.response.data.message
			}

			this.submitting = false
		},
		editTransaction(transaction) {
			this.submitStatus = ''
			transaction.created = new Date(transaction.created)
			transaction.type = this.category.type.find(each => each.name == transaction.category.type)
			this.transaction = {...transaction};
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
				message = err.response.data.message
				summary = 'Gagal'
			}

			this.deleteTransactionDialog = false
			this.$toast.add({severity: stat, summary, detail: message, life: 3000})
			this.submitting = false
			await this.getList()
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
				message = err.response.data.message
				summary = 'Gagal'
			}

			this.deleteTransactionsDialog = false
			this.submitting = false
			this.selectedTransactions = null
			this.$toast.add({severity: stat, summary, detail: message, life: 3000})
			await this.getList()
		},
		initFilters() {
            this.filters = {
                'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
            }
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
		fileHandler(e) {
			console.log(e.files[0])
		},
		async refresh() {
			if(this.submitStatus == 'success') {
				await this.getList()
			}
		}
	}
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';
</style>
