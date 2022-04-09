<template>
	<div class="grid">
		<div class="col-12 lg:col-6 xl:col-3">
			<div class="card mb-0">
				<div class="flex justify-content-between mb-3">
					<div>
						<span class="block text-500 font-medium mb-3">Saldo</span>
						<div class="text-900 font-medium text-xl" :class="amountNegative ? 'text-red' : 'text-green-500'">{{formatCurrency(saldo.in - saldo.out)}}</div>
					</div>
					<div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
						<i class="pi pi-money-bill text-blue-500 text-xl"></i>
					</div>
				</div>
			</div>
		</div>
		<div class="col-12 lg:col-6 xl:col-3 blm">
			<div class="card mb-0">
				<div class="flex justify-content-between mb-3">
					<div>
						<span class="block text-500 font-medium mb-3">Revenue</span>
						<div class="text-900 font-medium text-xl">$2.100</div>
					</div>
					<div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
						<i class="pi pi-map-marker text-orange-500 text-xl"></i>
					</div>
				</div>
			</div>
		</div>
		<div class="col-12 lg:col-6 xl:col-3 blm">
			<div class="card mb-0">
				<div class="flex justify-content-between mb-3">
					<div>
						<span class="block text-500 font-medium mb-3">Customers</span>
						<div class="text-900 font-medium text-xl">28441</div>
					</div>
					<div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width:2.5rem;height:2.5rem">
						<i class="pi pi-inbox text-cyan-500 text-xl"></i>
					</div>
				</div>
			</div>
		</div>
		<div class="col-12 lg:col-6 xl:col-3 blm">
			<div class="card mb-0">
				<div class="flex justify-content-between mb-3">
					<div>
						<span class="block text-500 font-medium mb-3">Comments</span>
						<div class="text-900 font-medium text-xl">152 Unread</div>
					</div>
					<div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width:2.5rem;height:2.5rem">
						<i class="pi pi-comment text-purple-500 text-xl"></i>
					</div>
				</div>
			</div>
		</div>

        <div class="col-12 xl:col-6">
            <div class="card">
                <div class="header-dashboard">
                    <h5>Transaksi Terbaru</h5>
                    <Button icon="pi pi-search" type="button" class="p-button-text" @click="$router.push({ name: 'finance' })"></Button>
                </div>
                <DataTable :value="transactions" responsiveLayout="stack" :loading="loading">
                    <template #empty>
                        Data kosong.
                    </template>
                    <template #loading>
                        Memuat data. Mohon tunggu.
                    </template>
                    <Column header="Tanggal">
                        <template #body="slotProps">
                            {{dateHandler(slotProps.data.created)}}
							{{slotProps.data.created}}
                        </template>
                    </Column>
                    <Column field="name" header="Judul" style="width:25%"></Column>
                    <Column field="amount" header="Jumlah" style="width:20%">
                        <template #body="slotProps">
                            <span :class="slotProps.data.category.type == 'Pengeluaran' ? 'text-red' : 'text-green-500'">{{formatCurrency(slotProps.data.amount)}}</span>
                        </template>
                    </Column>
                    <Column field="category" header="Kategori" style="width:25%">
                        <template #body="slotProps">
                            {{slotProps.data.category.name}}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Grafik Bulanan</h5>
                <Chart type="line" :data="lineData" :options="lineOptions" />
            </div>
        </div>
	</div>
</template>

<script src="./index.js"></script>

<style scoped lang="scss" src="./style.scss"></style>