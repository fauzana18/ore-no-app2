<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<Toast/>
                <h5>Catatan Olahraga</h5>
				
				<DataTable :value="workouts" rowGroupMode="subheader" groupRowsBy="date" dataKey="id" :key="'table'+rerender"
					sortMode="single" sortField="date" :sortOrder="-1" responsiveLayout="scroll" :loading="loading"
					:expandableRowGroups="true" v-model:expandedRowGroups="expandedRowGroups" @rowgroupExpand="onRowGroupExpand">
					<template #header>
						<div class="flex flex-row md:flex-row justify-content-between md:align-items-center">
							<div>
								<Button icon="pi pi-plus" class="p-button-rounded p-button-success ml-2" @click="openCreateDialog" :disabled="createDisabled"/>
							</div>
							<div>
								<Button icon="pi pi-refresh" class="p-button-rounded p-button-info ml-2" @click="reload"/>
							</div>
						</div>
					</template>
					<template #empty>
                        Data kosong.
                    </template>
                    <template #loading>
                        Memuat data. Mohon tunggu.
                    </template>
					<Column field="date" header="Representative"></Column>
					<Column field="movement.name" header="Gerakan"></Column>
					<Column field="set1" header="Set 1">
						<template #body="slotProps">
							<div>
								<Button :label="slotProps.data.set1.toString()" class="p-button-rounded mr-2" @click="editReps(slotProps.data.id, slotProps.data.set1, 'set1')" />
							</div>
						</template>
					</Column>
					<Column field="set2" header="Set 2">
						<template #body="slotProps">
							<div>
								<Button :label="slotProps.data.set2.toString()" class="p-button-rounded mr-2" @click="editReps(slotProps.data.id, slotProps.data.set2, 'set2')" />
							</div>
						</template>
					</Column>
					<Column field="set3" header="Set 3">
						<template #body="slotProps">
							<div>
								<Button :label="slotProps.data.set3.toString()" class="p-button-rounded mr-2" @click="editReps(slotProps.data.id, slotProps.data.set3, 'set3')" />
							</div>
						</template>
					</Column>
					<template #groupheader="slotProps">
						<span>{{dateHandler(slotProps.data.date)}}</span>
					</template>
					<template #groupfooter="slotProps">
						<td colspan="4">
							<div class="table-footer">
								<ConfirmPopup></ConfirmPopup>
								<Button label="Hapus" icon="pi pi-trash" class="p-button-danger" @click="confirmDelete($event, slotProps.data.date)" :loading="submitting" />
							</div>
						</td>
					</template>
				</DataTable>

				<Dialog v-model:visible="editDialog" header="Update Repetisi" :modal="true" class="p-fluid">
					<div class="field">
						<InputNumber autocomplete="off" v-model="reps" required="true" showButtons buttonLayout="horizontal" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" autofocus />
					</div>

					<template #footer>
						<Button label="Simpan" icon="pi pi-check" class="p-button-text" :loading="submitting" @click="updateReps" />
					</template>
				</Dialog>

				<Dialog v-model:visible="createDialog" header="Tambah Catatan" :modal="true" class="p-fluid">
					<div class="field">
						<Dropdown v-model="workset" :options="worksets" optionLabel="label" placeholder="Pilih Set Gerakan" />
					</div>

					<template #footer>
						<Button label="Simpan" icon="pi pi-check" class="p-button-text" :loading="submitting" @click="createNew" />
					</template>
				</Dialog>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>

<style scoped lang="scss" src="./style.scss"></style>