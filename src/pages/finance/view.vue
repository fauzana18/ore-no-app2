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
						<Button label="Import" icon="pi pi-plus" class="mr-2 inline-block" @click="openDialog" />
						<Button label="Export" icon="pi pi-upload" class="p-button-help mr-2" @click="exportCSV($event)"  />
					</template>
				</Toolbar>

				<Toolbar class="mb-4" style="border: 0;">
					<template v-slot:start>
						<div class="my-2">
							<Button label="Atur Kategori" class="p-button-info mr-2" @click="manageCategory" />
						</div>
					</template>

					<template v-slot:end>
						<SelectButton v-model="selectedMode" :options="modes" optionLabel="name" @change="changeView">
							<template #option="slotProps">
								<div>
									<i class="pi" :class="slotProps.option.icon"></i>
									<!-- <div>{{slotProps.option.name}}</div> -->
								</div>
							</template>
						</SelectButton>
					</template>
				</Toolbar>

				<DataTable v-if="selectedMode && selectedMode.code == 2" ref="dt" :value="transactions" :lazy="true" v-model:selection="selectedTransactions" dataKey="id" :paginator="true" :rows="10" :loading="loading" @sort="onSort($event)"
							paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25]" :pageLinkSize="3"
							currentPageReportTemplate="Showing {first} to {last} of {totalRecords} transactions" responsiveLayout="stack" :totalRecords="totalRecords" @page="onPage($event)" :key="rerender">
					<template #header>
						<div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
							<div class="left-side">
								<h5 class="m-0">Catatan Keuangan</h5>
								<Button icon="pi pi-refresh" class="p-button-rounded p-button-info ml-2" @click="reload"/>
							</div>
							<div class="filter">
								<Dropdown v-model="filters.c_type" :options="category.type" optionLabel="name" placeholder="Tipe" class="mr-2 filter-width" @change="onFilter"/>
								<Dropdown v-if="filters.c_type" v-model="filters.category_id" :options="categoryOptionsFilter" optionLabel="name" placeholder="Kategori" class="mr-2 mt-2 md:mt-0 filter-width" @change="onFilter"/>
								<Dropdown v-model="filters.created" :options="range" optionLabel="label" placeholder="Tanggal" class="mr-2 mt-2 md:mt-0 filter-width" @change="onFilter"/>
								<span class="block mt-2 md:mt-0 p-input-icon-left">
									<i class="pi pi-search" />
									<InputText v-model="filters.name" placeholder="Pencarian..." class="filter-width" @change="onFilter"/>
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

				<DataTable v-else :value="transactions" rowGroupMode="subheader" groupRowsBy="created" dataKey="id" :key="'table2'+rerender"
					sortMode="single" sortField="created" :sortOrder="-1" responsiveLayout="stack" :loading="loading"
					:expandableRowGroups="true" v-model:expandedRowGroups="expandedRowGroups" @rowgroupExpand="onRowGroupExpand">
					<template #header>
						<div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
							<div class="left-side">
								<h5 class="m-0">Catatan Keuangan</h5>
								<Button icon="pi pi-refresh" class="p-button-rounded p-button-info ml-2" @click="reload"/>
							</div>
							<div class="filter">
								<Dropdown v-model="filters.c_type" :options="category.type" optionLabel="name" placeholder="Tipe" class="mr-2 filter-width" @change="onFilter"/>
								<Dropdown v-if="filters.c_type" v-model="filters.category_id" :options="categoryOptionsFilter" optionLabel="name" placeholder="Kategori" class="mr-2 mt-2 md:mt-0 filter-width" @change="onFilter"/>
								<Dropdown v-model="filters.created" :options="range" optionLabel="label" placeholder="Tanggal" class="mr-2 mt-2 md:mt-0 filter-width" @change="onFilter"/>
								<span class="block mt-2 md:mt-0 p-input-icon-left">
									<i class="pi pi-search" />
									<InputText v-model="filters.name" placeholder="Pencarian..." class="filter-width" @change="onFilter"/>
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
					<Column field="created" header="Representative"></Column>
					<Column field="name" header="Judul"></Column>
					<Column field="amount" header="Jumlah">
						<template #body="slotProps">
							{{formatCurrency(slotProps.data.amount)}}
						</template>
					</Column>
					<Column field="category.type" header="Tipe"></Column>
					<Column field="category_id" header="Kategori">
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
					<template #groupheader="slotProps">
						<span class="image-text">{{dateHandler(slotProps.data.created)}}</span>
					</template>
					<template #groupfooter="slotProps">
						<td colspan="4">
							<div class="table-footer">
								<div>
									Pengeluaran
								</div>
								<div>
									Pemasukan
								</div>
							</div>
						</td>
						<td>
							<div class="table-footer-content">
								<div>
									{{calculateAmount(slotProps.data.created, 'Pengeluaran')}}
								</div>
								<div style="color: green;">
									{{calculateAmount(slotProps.data.created, 'Pemasukan')}}
								</div>
							</div>
						</td>
					</template>
				</DataTable>

				<Dialog header="Import" v-model:visible="importDialog" :breakpoints="{'960px': '75vw'}" :style="{width: '30vw'}" :modal="true" :dismissableMask="true">
					<Button style="width: 100%;" label="Download Template" icon="pi pi-download" class="mt-2 p-button-success" @click="downloadTemplate" />
					<FileUpload style="width: 100%;" mode="basic" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" :disabled="submitting"
						:maxFileSize="1000000" label="Import" chooseLabel="Import" class="mt-2" :customUpload="true" @uploader="fileHandler" />
				</Dialog>

				<Dialog header="Atur Tanggal" v-model:visible="dateDialog" :breakpoints="{'960px': '75vw'}" :style="{width: '30vw'}" :modal="true" :dismissableMask="true">
					<div class="field" style="display: block;">
						<label for="name">Dari Tanggal</label><br>
						<Calendar style="width: 100%;" :showIcon="true" :showButtonBar="true" v-model="dateStart" dateFormat="dd MM yy"></Calendar>
					</div>
					<div class="field">
						<label for="name">Sampai Tanggal</label><br>
						<Calendar style="width: 100%;" :showIcon="true" :showButtonBar="true" v-model="dateEnd" dateFormat="dd MM yy"></Calendar>
					</div>
					<template #footer>
						<Button label="Cari" icon="pi pi-search" class="p-button-text" @click="searchDate" />
					</template>
				</Dialog>

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

				<Dialog v-model:visible="categoryDialog" :style="{width: '450px'}" header="Atur Kategori" :modal="true" class="p-fluid" :dismissableMask="true" :key="'dialog'+rerender">
					<div class="field">
						<label for="name">Tipe</label>
						<Dropdown v-model="cat.type" :options="category.type" optionLabel="name" placeholder="Pilih Tipe" />
					</div>
					<div class="field">
						<label for="description">Kategori</label>
						<Card v-for="(items, i) of categoryOptions" :key="i">
							<template v-slot:content>
								<div style="display: flex; align-items: center; justify-content: space-between;">
									<p v-if="!editCategoryField[i]" class="line-height-3 m-0">{{items.name}}</p>
									<InputText class="input-cat" v-else v-model="cat.name" required="true" :class="{'p-invalid': submitted && !cat.name}" autocomplete="off" />
									<div>
										<Button :icon="editCategoryField[i] ? 'pi pi-times' : 'pi pi-pencil'" class="p-button-rounded mr-2" :class="editCategoryField[i] ? 'p-button-secondary' : 'p-button-success'" @click="toggleEditCategory(i)" />
										<ConfirmPopup style="white-space: pre-line"></ConfirmPopup>
										<Button v-if="!editCategoryField[i]" icon="pi pi-trash" :loading="deletingCategory" class="p-button-rounded p-button-warning" @click="confirmDeleteCategory($event, i)"/>
										<Button v-else icon="pi pi-check" :loading="submittingCategory" class="p-button-rounded p-button-primary" @click="saveCategory(i)"/>
									</div>
								</div>
							</template>
						</Card>
						<Card >
							<template v-slot:content>
								<div>
									<Button v-if="!newCategoryField" icon="pi pi-plus" label="Tambah Baru" class="p-button-success" @click="toggleAddCategory()"/>
									<div v-else style="display: flex; align-items: center; justify-content: space-between;">
										<InputText class="input-cat" v-model="cat.name" required="true" :class="{'p-invalid': submitted && !cat.name}" autocomplete="off" />
										<div>
											<Button icon="pi pi-times" class="p-button-rounded p-button-secondary mr-2" @click="toggleAddCategory()" />
											<Button icon="pi pi-check" :loading="submittingCategory" class="p-button-rounded p-button-primary" @click="saveCategory()"/>
										</div>
									</div>
								</div>
							</template>
						</Card>
					</div>
				</Dialog>
			</div>
		</div>
	</div>

</template>

<script src="./index.js"></script>

<style scoped lang="scss" src="./style.scss"></style>
