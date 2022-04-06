<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<Toast/>
				<Toolbar class="mb-4">
					<template v-slot:start>
						<div class="my-2">
							<Button label="Tambah" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
							<Button label="Hapus" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
						</div>
					</template>

					<template v-slot:end>
						<FileUpload mode="basic" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
						:maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" :customUpload="true" @uploader="fileHandler" />
						<Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)"  />
					</template>
				</Toolbar>

				<DataTable ref="dt" :value="transactions" :lazy="true" v-model:selection="selectedProducts" dataKey="id" :paginator="true" :rows="10" :filters="filters" :loading="loading"
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
								<Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProduct(slotProps.data)" />
								<Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteProduct(slotProps.data)" />
							</div>
						</template>
					</Column>
				</DataTable>

				<Dialog v-model:visible="productDialog" :style="{width: '450px'}" :header="modalHeader" :modal="true" class="p-fluid">
					<div class="field">
						<label for="name">Tanggal</label>
						<Calendar :showIcon="true" :showButtonBar="true" v-model="transaction.created" dateFormat="dd MM yy"></Calendar>
					</div>
					<div class="field">
						<label for="name">Tipe</label>
						<Dropdown v-model="transaction.type" :options="category.type" optionLabel="name" placeholder="Pilih Tipe" required="true" />
						<!-- <InputText id="name" v-model.trim="product.name" required="true" autofocus :class="{'p-invalid': submitted && !product.name}" /> -->
						<small class="p-invalid" v-if="submitted && !product.name">Name is required.</small>
					</div>
					<div class="field">
						<label for="description">Kategori</label>
						<Dropdown v-model="transaction.category" :options="categoryOptions" optionLabel="name" placeholder="Pilih Kategori" required="true" />
						<!-- <Textarea id="description" v-model="product.description" required="true" rows="3" cols="20" /> -->
					</div>
					<div class="field">
						<label for="inventoryStatus">Judul</label>
						<InputText id="name" v-model.trim="transaction.name" required="true" autofocus :class="{'p-invalid': submitted && !transaction.name}" />
						<!-- <Dropdown id="inventoryStatus" v-model="product.inventoryStatus" :options="statuses" optionLabel="label" placeholder="Select a Status">
							<template #value="slotProps">
								<div v-if="slotProps.value && slotProps.value.value">
									<span :class="'product-badge status-' +slotProps.value.value">{{slotProps.value.label}}</span>
								</div>
								<div v-else-if="slotProps.value && !slotProps.value.value">
									<span :class="'product-badge status-' +slotProps.value.toLowerCase()">{{slotProps.value}}</span>
								</div>
								<span v-else>
									{{slotProps.placeholder}}
								</span>
							</template>
						</Dropdown> -->
					</div>
					<div class="field">
						<label for="name">Jumlah</label>
						<InputNumber id="price" v-model="transaction.amount" mode="currency" currency="IDR" locale="id-ID" />
					</div>

					<template #footer>
						<Button label="Batal" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
						<Button label="Simpan" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
					</template>
				</Dialog>

				<Dialog v-model:visible="deleteProductDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span v-if="product">Are you sure you want to delete <b>{{product.name}}</b>?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
					</template>
				</Dialog>

				<Dialog v-model:visible="deleteProductsDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
					<div class="flex align-items-center justify-content-center">
						<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
						<span v-if="product">Are you sure you want to delete the selected products?</span>
					</div>
					<template #footer>
						<Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false"/>
						<Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
					</template>
				</Dialog>
			</div>
		</div>
	</div>

</template>

<script>
import {FilterMatchMode} from 'primevue/api';
import ProductService from '../service/ProductService';
import axios from "axios"
import FinanceService from '../service/FinanceService'
import { profileStore, categoryStore } from '../store/finance.js'

export default {
	data() {
		return {
			products: null,
			productDialog: false,
			deleteProductDialog: false,
			deleteProductsDialog: false,
			product: {},
			selectedProducts: null,
			filters: {},
			submitted: false,
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
			calendarValue: null,
			modalHeader: 'Tambah Transaksi'
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
		this.productService.getProducts().then(data => this.products = data);
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
				return value.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'});
			return;
		},
		openNew() {
			this.product = {};
			this.submitted = false;
			this.modalHeader = 'Tambah Transaksi'
			this.productDialog = true;
		},
		hideDialog() {
			this.productDialog = false;
			this.submitted = false;
		},
		saveProduct() {
			this.submitted = true;
			if (this.product.name.trim()) {
			if (this.product.id) {
				this.product.inventoryStatus = this.product.inventoryStatus.value ? this.product.inventoryStatus.value: this.product.inventoryStatus;
				this.products[this.findIndexById(this.product.id)] = this.product;
				this.$toast.add({severity:'success', summary: 'Successful', detail: 'Product Updated', life: 3000});
				}
				else {
					this.product.id = this.createId();
					this.product.code = this.createId();
					this.product.image = 'product-placeholder.svg';
					this.product.inventoryStatus = this.product.inventoryStatus ? this.product.inventoryStatus.value : 'INSTOCK';
					this.products.push(this.product);
					this.$toast.add({severity:'success', summary: 'Successful', detail: 'Product Created', life: 3000});
				}
				this.productDialog = false;
				this.product = {};
			}
		},
		editProduct(product) {
			this.product = {...product};
			this.modalHeader = 'Ubah Transaksi'
			this.productDialog = true;
		},
		confirmDeleteProduct(product) {
			this.product = product;
			this.deleteProductDialog = true;
		},
		deleteProduct() {
			this.products = this.products.filter(val => val.id !== this.product.id);
			this.deleteProductDialog = false;
			this.product = {};
			this.$toast.add({severity:'success', summary: 'Successful', detail: 'Product Deleted', life: 3000});
		},
		findIndexById(id) {
			let index = -1;
			for (let i = 0; i < this.products.length; i++) {
				if (this.products[i].id === id) {
					index = i;
					break;
				}
			}
			return index;
		},
		createId() {
			let id = '';
			var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			for ( var i = 0; i < 5; i++ ) {
				id += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			return id;
		},
		exportCSV() {
			this.$refs.dt.exportCSV();
		},
		confirmDeleteSelected() {
			this.deleteProductsDialog = true;
		},
		deleteSelectedProducts() {
			this.products = this.products.filter(val => !this.selectedProducts.includes(val));
			this.deleteProductsDialog = false;
			this.selectedProducts = null;
			this.$toast.add({severity:'success', summary: 'Successful', detail: 'Products Deleted', life: 3000});
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
		}
	}
}
</script>

<style scoped lang="scss">
@import '../assets/demo/badges.scss';
</style>
